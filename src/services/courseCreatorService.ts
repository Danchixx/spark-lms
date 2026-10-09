import { supabase } from '../lib/supabase';
import { logAuditEvent } from './auditService';

// ─── Types ──────────────────────────────────────────────────
export type CourseCreatePayload = {
  company_id: number;
  title: string;
  description?: string | null;
  icon_emoji?: string | null;
  thumbnail_url?: string | null;
  status?: 'draft' | 'published';
  created_by?: string;
};

export type CourseUpdatePayload = {
  title?: string;
  description?: string | null;
  icon_emoji?: string | null;
  thumbnail_url?: string | null;
  status?: 'draft' | 'published';
};

export type ModulePayload = {
  title: string;
  description?: string | null;
  order: number;
  status?: 'draft' | 'published';
};

export type LessonPayload = {
  title: string;
  type: 'video' | 'reading' | 'assessment' | 'hybrid';
  content?: string | null;
  video_url?: string | null;
  position: number;
};

export type QuestionPayload = {
  question_text: string;
  position: number;
  question_type: 'multiple_choice' | 'true_false' | 'identification' | 'enumeration' | 'essay';
  correct_answers: string[];
  choices: { choice_text: string; is_correct: boolean }[];
};

export type AssessmentPayload = {
  passing_score: number;
  time_limit: number; // in seconds
  questions: QuestionPayload[];
};

// ─── Course CRUD ────────────────────────────────────────────

/** Create a new course and return the inserted row */
export async function createCourse(data: CourseCreatePayload) {
  const { data: course, error } = await supabase
    .from('courses')
    .insert({
      company_id: data.company_id,
      title: data.title,
      description: data.description || null,
      icon_emoji: data.icon_emoji || null,
      thumbnail_url: data.thumbnail_url || null,
      status: data.status || 'draft',
      created_by: data.created_by || null,
    })
    .select()
    .single();

  if (error) throw error;

  if (course) {
    await logAuditEvent({
      action: 'CREATE_COURSE',
      tableName: 'courses',
      recordId: course.id,
      userId: data.created_by || null,
      newValue: {
        title: course.title,
        company_id: course.company_id,
        status: course.status,
      },
    });
  }

  return course;
}

/** Update an existing course */
export async function updateCourse(courseId: number, data: CourseUpdatePayload) {
  const { data: course, error } = await supabase
    .from('courses')
    .update(data)
    .eq('id', courseId)
    .select()
    .single();

  if (error) throw error;

  if (course) {
    const isPublishing = data.status === 'published';
    await logAuditEvent({
      action: isPublishing ? 'PUBLISH_COURSE' : 'UPDATE_COURSE',
      tableName: 'courses',
      recordId: course.id,
      newValue: {
        title: course.title,
        status: course.status,
      },
    });
  }

  return course;
}

/** Hard-delete a course and all related data (cascades automatically) */
export async function deleteCourse(courseId: number) {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);

  if (error) throw error;

  await logAuditEvent({
    action: 'DELETE_COURSE',
    tableName: 'courses',
    recordId: courseId,
  });
}

/** Fetch a course with all its modules and lessons (for CourseBuilder) */
export async function fetchCourseWithModules(courseId: number) {
  // 1. Fetch the course
  const { data: course, error: courseErr } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .eq('is_archived', false)
    .single();

  if (courseErr) throw courseErr;

  // 2. Fetch modules
  const { data: modules, error: modErr } = await supabase
    .from('course_modules')
    .select('*')
    .eq('course_id', courseId)
    .eq('is_archived', false)
    .order('order', { ascending: true });

  if (modErr) throw modErr;

  // 3. Fetch lessons for all modules
  const moduleIds = (modules || []).map((m: any) => m.id);
  let lessons: any[] = [];

  if (moduleIds.length > 0) {
    const { data: lessonData, error: lesErr } = await supabase
      .from('course_lessons')
      .select('*')
      .in('module_id', moduleIds)
      .eq('is_archived', false)
      .order('position', { ascending: true });

    if (lesErr) throw lesErr;
    lessons = lessonData || [];
  }

  // 4. Nest lessons under modules
  const modulesWithLessons = (modules || []).map((m: any) => ({
    ...m,
    lessons: lessons.filter((l: any) => l.module_id === m.id),
  }));

  return { course, modules: modulesWithLessons };
}

// ─── Module CRUD ────────────────────────────────────────────

/** Create a new module under a course */
export async function createModule(courseId: number, data: ModulePayload) {
  const { data: mod, error } = await supabase
    .from('course_modules')
    .insert({
      course_id: courseId,
      title: data.title,
      description: data.description || null,
      order: data.order,
      status: data.status || 'published',
    })
    .select()
    .single();

  if (error) throw error;
  return mod;
}

/** Update a module's title, description, or order */
export async function updateModule(moduleId: number, data: Partial<ModulePayload>) {
  const { data: mod, error } = await supabase
    .from('course_modules')
    .update(data)
    .eq('id', moduleId)
    .select()
    .single();

  if (error) throw error;
  return mod;
}

/** Hard-delete a module and all related data (cascades automatically) */
export async function deleteModule(moduleId: number, _userId?: string) {
  const { error } = await supabase
    .from('course_modules')
    .delete()
    .eq('id', moduleId);

  if (error) throw error;
}

/** Batch reorder modules */
export async function reorderModules(modules: { id: number; order: number }[]) {
  // Use individual updates since Supabase doesn't support batch upsert by different values easily
  const promises = modules.map((m) =>
    supabase.from('course_modules').update({ order: m.order }).eq('id', m.id)
  );
  const results = await Promise.all(promises);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}

// ─── Lesson CRUD ────────────────────────────────────────────

/** Batch reorder lessons */
export async function reorderLessons(lessons: { id: number; position: number }[]) {
  const promises = lessons.map((l) =>
    supabase.from('course_lessons').update({ position: l.position }).eq('id', l.id)
  );
  const results = await Promise.all(promises);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}

/** Create a new lesson under a module */
export async function createLesson(moduleId: number, data: LessonPayload) {
  const { data: lesson, error } = await supabase
    .from('course_lessons')
    .insert({
      module_id: moduleId,
      title: data.title,
      type: data.type,
      content: data.content || null,
      video_url: data.video_url || null,
      position: data.position,
    })
    .select()
    .single();

  if (error) throw error;
  return lesson;
}

export async function updateLesson(lessonId: number, data: Partial<LessonPayload>) {
  const { data: lesson, error } = await supabase
    .from('course_lessons')
    .update(data)
    .eq('id', lessonId)
    .select()
    .single();

  if (error) throw error;
  
  // Clean up orphaned hybrid responses if questions were deleted
  if (data.type === 'hybrid' && data.content) {
    try {
      const blocks = JSON.parse(data.content);
      const questionIds = blocks.filter((b: any) => b.type === 'question').map((b: any) => String(b.id));
      
      if (questionIds.length > 0) {
        const { data: responses } = await supabase
          .from('hybrid_lesson_responses')
          .select('question_id')
          .eq('lesson_id', lessonId);
          
        if (responses) {
          const toDelete = Array.from(new Set(
            responses
              .map((r: any) => r.question_id)
              .filter((id: string) => !questionIds.includes(id))
          ));
            
          if (toDelete.length > 0) {
            await supabase
              .from('hybrid_lesson_responses')
              .delete()
              .eq('lesson_id', lessonId)
              .in('question_id', toDelete);
          }
        }
      } else {
        // If there are no questions left in the lesson, delete all responses for this lesson
        await supabase
          .from('hybrid_lesson_responses')
          .delete()
          .eq('lesson_id', lessonId);
      }
    } catch (e) {
      console.error("Failed to parse hybrid blocks for cleanup:", e);
    }
  }

  return lesson;
}

/** Hard-delete a lesson and all related data (cascades automatically) */
export async function deleteLesson(lessonId: number, _userId?: string) {
  const { error } = await supabase
    .from('course_lessons')
    .delete()
    .eq('id', lessonId);

  if (error) throw error;
}

// ─── Assessment CRUD ────────────────────────────────────────

/** Fetch a lesson with its assessment, questions, and choices (for LessonEditor) */
export async function fetchLessonWithAssessment(lessonId: number) {
  // 1. Fetch lesson
  const { data: lesson, error: lErr } = await supabase
    .from('course_lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (lErr) throw lErr;

  // 2. Fetch assessment (if exists)
  const { data: assessments, error: aErr } = await supabase
    .from('assessments')
    .select('*')
    .eq('lesson_id', lessonId)
    .eq('is_archived', false);

  if (aErr) throw aErr;

  const assessment = assessments && assessments.length > 0 ? assessments[0] : null;

  if (!assessment) {
    return { lesson, assessment: null, questions: [] };
  }

  // 3. Fetch questions
  const { data: questions, error: qErr } = await supabase
    .from('assessment_questions')
    .select('*')
    .eq('assessment_id', assessment.id)
    .order('position', { ascending: true });

  if (qErr) throw qErr;

  // 4. Fetch choices for all questions
  const questionIds = (questions || []).map((q: any) => q.id);
  let choices: any[] = [];

  if (questionIds.length > 0) {
    const { data: choiceData, error: cErr } = await supabase
      .from('assessment_choices')
      .select('*')
      .in('question_id', questionIds);

    if (cErr) throw cErr;
    choices = choiceData || [];
  }

  // 5. Nest choices under questions
  const questionsWithChoices = (questions || []).map((q: any) => ({
    ...q,
    choices: choices.filter((c: any) => c.question_id === q.id),
    correct_answers: q.correct_answers || [],
  }));

  return { lesson, assessment, questions: questionsWithChoices };
}

/** Save/upsert an assessment with all its questions and choices */
export async function saveAssessment(lessonId: number, lessonTitle: string, data: AssessmentPayload) {
  // 1. Upsert assessment
  // Check if one already exists
  const { data: existing } = await supabase
    .from('assessments')
    .select('id')
    .eq('lesson_id', lessonId)
    .eq('is_archived', false)
    .maybeSingle();

  let assessmentId: number;

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('assessments')
      .update({
        title: lessonTitle,
        passing_score: data.passing_score,
        time_limit: data.time_limit,
      })
      .eq('id', existing.id);

    if (error) throw error;
    assessmentId = existing.id;
  } else {
    // Insert new
    const { data: newAssessment, error } = await supabase
      .from('assessments')
      .insert({
        lesson_id: lessonId,
        title: lessonTitle,
        passing_score: data.passing_score,
        time_limit: data.time_limit,
      })
      .select()
      .single();

    if (error) throw error;
    assessmentId = newAssessment.id;
  }

  // 2. Delete old questions and choices (replace strategy)
  // First get existing question IDs to delete their choices
  const { data: oldQuestions } = await supabase
    .from('assessment_questions')
    .select('id')
    .eq('assessment_id', assessmentId);

  if (oldQuestions && oldQuestions.length > 0) {
    const oldQIds = oldQuestions.map((q: any) => q.id);

    // Delete old choices
    await supabase
      .from('assessment_choices')
      .delete()
      .in('question_id', oldQIds);

    // Delete old questions
    await supabase
      .from('assessment_questions')
      .delete()
      .eq('assessment_id', assessmentId);
  }

  // 3. Insert new questions
  for (const q of data.questions) {
    const { data: newQuestion, error: qErr } = await supabase
      .from('assessment_questions')
      .insert({
        assessment_id: assessmentId,
        question_text: q.question_text,
        position: q.position,
        question_type: q.question_type,
        correct_answers: q.correct_answers || [],
      })
      .select()
      .single();

    if (qErr) throw qErr;

    // 4. Insert choices (for multiple_choice and true_false)
    if (q.choices && q.choices.length > 0) {
      const choiceRows = q.choices.map((c) => ({
        question_id: newQuestion.id,
        choice_text: c.choice_text,
        is_correct: c.is_correct,
      }));

      const { error: cErr } = await supabase
        .from('assessment_choices')
        .insert(choiceRows);

      if (cErr) throw cErr;
    }
  }

  return assessmentId;
}

// ─── Thumbnail Upload ───────────────────────────────────────

/** Upload a thumbnail image to Supabase Storage and return the public URL */
export async function uploadThumbnail(file: File, companyId: number, courseId: number) {
  const ext = file.name.split('.').pop() || 'png';
  const filePath = `${companyId}/${courseId}/thumbnail.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from('course-thumbnails')
    .upload(filePath, file, { upsert: true });

  if (uploadErr) throw uploadErr;

  const { data } = supabase.storage
    .from('course-thumbnails')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// ─── Lesson File Attachments ────────────────────────────────

export const LESSON_FILES_BUCKET = 'lesson-files';
export const LESSON_FILE_MAX_BYTES = 25 * 1024 * 1024; // 25 MB
export const LESSON_FILE_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx';

export type LessonFileMeta = {
  path: string;
  name: string;
  size: number;
  mime: string;
};

/** Upload a document (PDF / Word / Excel / PowerPoint) for a lesson's File Block */
export async function uploadLessonFile(
  file: File,
  companyId: number | string,
  courseId: number | string,
  lessonId: number | string
): Promise<LessonFileMeta> {
  if (file.size > LESSON_FILE_MAX_BYTES) {
    throw new Error('File is larger than 25 MB.');
  }
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!LESSON_FILE_ACCEPT.split(',').includes(`.${ext}`)) {
    throw new Error('Unsupported file type. Use PDF, Word, Excel, or PowerPoint.');
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${companyId}/${courseId}/${lessonId}/${Date.now()}_${safeName}`;

  const { error } = await supabase.storage
    .from(LESSON_FILES_BUCKET)
    .upload(filePath, file, { upsert: false, contentType: file.type || undefined });
  if (error) {
    if (error.message?.toLowerCase().includes('bucket not found') || (error as any).statusCode === '404') {
      throw new Error(`Storage bucket "${LESSON_FILES_BUCKET}" does not exist in Supabase. Please create a "${LESSON_FILES_BUCKET}" bucket in your Supabase Storage dashboard.`);
    }
    throw error;
  }

  return { path: filePath, name: file.name, size: file.size, mime: file.type };
}

/** Remove a previously uploaded lesson file (best-effort) */
export async function deleteLessonFile(path: string) {
  if (!path) return;
  await supabase.storage.from(LESSON_FILES_BUCKET).remove([path]);
}

/**
 * Get a short-lived signed URL for a lesson file.
 * Pass `downloadName` to force a browser download with that filename.
 */
export async function getLessonFileUrl(path: string, downloadName?: string, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(LESSON_FILES_BUCKET)
    .createSignedUrl(path, expiresIn, downloadName ? { download: downloadName } : undefined);
  if (error) throw error;
  return data.signedUrl;
}

// ─── Creator Courses List ───────────────────────────────────

/** Fetch all courses created within a specific company (for CreatorCourses page) */
export async function fetchCreatorCourses(companyId: number) {
  const { data: courses, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      description,
      thumbnail_url,
      icon_emoji,
      status,
      created_at,
      course_modules (
        id,
        course_lessons (
          id,
          type
        )
      )
    `)
    .eq('company_id', companyId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Transform into the shape the UI expects
  return (courses || []).map((c: any) => {
    const modules = c.course_modules || [];
    const allLessons = modules.flatMap((m: any) => m.course_lessons || []);
    const lessonsCount = allLessons.filter((l: any) => l.type !== 'assessment').length;
    const assessmentsCount = allLessons.filter((l: any) => l.type === 'assessment').length;

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      thumbnail: c.thumbnail_url,
      icon_emoji: c.icon_emoji,
      status: c.status,
      modulesCount: modules.length,
      lessonsCount,
      assessmentsCount,
      createdAt: c.created_at,
    };
  });
}
