import { supabase } from '../lib/supabase';

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
};

export type LessonPayload = {
  title: string;
  type: 'video' | 'reading' | 'assessment';
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
  return course;
}

/** Hard-delete a course and ALL its modules, lessons, assessments, questions, and choices */
export async function deleteCourse(courseId: number) {
  // 1. Get all modules
  const { data: modules } = await supabase
    .from('course_modules')
    .select('id')
    .eq('course_id', courseId);

  if (modules && modules.length > 0) {
    const moduleIds = modules.map((m: any) => m.id);

    // 2. Get all lessons across all modules
    const { data: lessons } = await supabase
      .from('course_lessons')
      .select('id')
      .in('module_id', moduleIds);

    if (lessons && lessons.length > 0) {
      const lessonIds = lessons.map((l: any) => l.id);

      // 3. Get all assessments
      const { data: assessments } = await supabase
        .from('assessments')
        .select('id')
        .in('lesson_id', lessonIds);

      if (assessments && assessments.length > 0) {
        const assessmentIds = assessments.map((a: any) => a.id);

        // 4. Get all questions
        const { data: questions } = await supabase
          .from('assessment_questions')
          .select('id')
          .in('assessment_id', assessmentIds);

        if (questions && questions.length > 0) {
          const questionIds = questions.map((q: any) => q.id);
          // 5. Delete choices
          await supabase.from('assessment_choices').delete().in('question_id', questionIds);
        }

        // 6. Delete questions
        await supabase.from('assessment_questions').delete().in('assessment_id', assessmentIds);
        // 7. Delete assessments
        await supabase.from('assessments').delete().in('lesson_id', lessonIds);
      }

      // 8. Delete lessons
      await supabase.from('course_lessons').delete().in('module_id', moduleIds);
    }

    // 9. Delete modules
    await supabase.from('course_modules').delete().eq('course_id', courseId);
  }

  // 10. Delete the course itself
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);

  if (error) throw error;
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

/** Hard-delete a module and all its lessons (with their assessment data) */
export async function deleteModule(moduleId: number, _userId?: string) {
  // 1. Get all lessons in this module
  const { data: lessons } = await supabase
    .from('course_lessons')
    .select('id')
    .eq('module_id', moduleId);

  // 2. Delete each lesson's assessment data
  if (lessons && lessons.length > 0) {
    const lessonIds = lessons.map((l: any) => l.id);

    // Get assessments for these lessons
    const { data: assessments } = await supabase
      .from('assessments')
      .select('id')
      .in('lesson_id', lessonIds);

    if (assessments && assessments.length > 0) {
      const assessmentIds = assessments.map((a: any) => a.id);

      // Get questions to delete their choices
      const { data: questions } = await supabase
        .from('assessment_questions')
        .select('id')
        .in('assessment_id', assessmentIds);

      if (questions && questions.length > 0) {
        const questionIds = questions.map((q: any) => q.id);
        await supabase.from('assessment_choices').delete().in('question_id', questionIds);
      }

      await supabase.from('assessment_questions').delete().in('assessment_id', assessmentIds);
      await supabase.from('assessments').delete().in('lesson_id', lessonIds);
    }

    // 3. Delete lessons
    await supabase.from('course_lessons').delete().eq('module_id', moduleId);
  }

  // 4. Delete the module
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

/** Update a lesson */
export async function updateLesson(lessonId: number, data: Partial<LessonPayload>) {
  const { data: lesson, error } = await supabase
    .from('course_lessons')
    .update(data)
    .eq('id', lessonId)
    .select()
    .single();

  if (error) throw error;
  return lesson;
}

/** Hard-delete a lesson and its assessment data */
export async function deleteLesson(lessonId: number, _userId?: string) {
  // 1. Delete assessment data if it exists
  const { data: assessments } = await supabase
    .from('assessments')
    .select('id')
    .eq('lesson_id', lessonId);

  if (assessments && assessments.length > 0) {
    const assessmentIds = assessments.map((a: any) => a.id);

    const { data: questions } = await supabase
      .from('assessment_questions')
      .select('id')
      .in('assessment_id', assessmentIds);

    if (questions && questions.length > 0) {
      const questionIds = questions.map((q: any) => q.id);
      await supabase.from('assessment_choices').delete().in('question_id', questionIds);
    }

    await supabase.from('assessment_questions').delete().in('assessment_id', assessmentIds);
    await supabase.from('assessments').delete().eq('lesson_id', lessonId);
  }

  // 2. Delete the lesson
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

// ─── Creator Courses List ───────────────────────────────────

/** Fetch all courses created by a specific user (for CreatorCourses page) */
export async function fetchCreatorCourses(userId: string) {
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
    .eq('created_by', userId)
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
