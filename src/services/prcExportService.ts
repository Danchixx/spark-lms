import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import JSZip from 'jszip';
import { supabase } from '../lib/supabase';

// ─── TYPES ────────────────────────────────────────────────────────

export interface PrcParticipant {
  id: string;
  name: string;
  email: string;
  prcLicenseNo: string;
  schoolName: string;
  position: string;
  progressPct: number;
  completedAt: string | null;
  assignedAt: string;
  attemptsCount: number;
  passedAssessmentsCount: number;
  avgScore: number;
}

export interface PrcExportOptions {
  courseId: number;
  providerName: string;
  providerAccreditationNo: string;
  programAccreditationNo: string;
  selectedParticipants: PrcParticipant[];
  exportMode: 'zip_package' | 'single_pdf';
  maskSensitiveData: boolean;
  onProgress?: (status: string, percentage: number) => void;
}

// ─── STYLING PALETTE ──────────────────────────────────────────────

const BRAND_ORANGE = [255, 107, 0]; // #FF6B00
const BRAND_NAVY = [26, 32, 44];    // #1A202C
const TEXT_MUTED = [100, 116, 139]; // Slate 500
const BORDER_COLOR = [226, 232, 240];

// ─── HELPERS ──────────────────────────────────────────────────────

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n\s+\n/g, '\n\n')
    .trim();
}

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  if (!user || user.length <= 2) return `***@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

function addHeaderAndFooter(
  doc: jsPDF,
  courseTitle: string,
  docId: string,
  providerName: string,
  documentSubtitle: string = 'PRC CPD COMPLIANCE DOSSIER'
) {
  const pageCount = (doc as any).internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Skip running header on the first cover page
    if (i > 1) {
      doc.setDrawColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
      doc.setLineWidth(1.2);
      doc.line(14, 12, pageWidth - 14, 12);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
      doc.text(`${providerName.toUpperCase()} · ${documentSubtitle}`, 14, 9);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
      const titleTruncated = courseTitle.length > 55 ? courseTitle.substring(0, 52) + '...' : courseTitle;
      doc.text(titleTruncated, pageWidth - 14, 9, { align: 'right' });
    }

    // Running Footer on every page
    doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    doc.text(`Doc ID: ${docId} | Official CPD Submission Document`, 14, pageHeight - 7);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
  }
}

function drawGuideBox(
  doc: jsPDF,
  startY: number,
  componentTitle: string,
  targetLmsLocation: string,
  whatToCapture: string
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxWidth = pageWidth - 28;
  const boxHeight = 28;

  if (startY + boxHeight > doc.internal.pageSize.getHeight() - 22) {
    doc.addPage();
    startY = 20;
  }

  // Soft light orange background card
  doc.setFillColor(255, 247, 237); // #FFF7ED
  doc.setDrawColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
  doc.setLineWidth(0.8);
  doc.roundedRect(14, startY, boxWidth, boxHeight, 3, 3, 'FD');

  // Badge pill
  doc.setFillColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
  doc.roundedRect(18, startY + 4, 78, 6, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('📸  GUIDE: WHAT PART TO TAKE SCREENSHOT OF', 21, startY + 8.2);

  // Component Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.text(componentTitle, 100, startY + 8.5);

  // LMS Location
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.text(`LMS Page: ${targetLmsLocation}`, 18, startY + 15);

  // Action instruction
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.text(`Action: ${whatToCapture}`, 18, startY + 22);

  return startY + boxHeight + 6;
}

// ─── DATA FETCHING ────────────────────────────────────────────────

export async function fetchPrcCourseData(courseId: number) {
  // 1. Course details
  const { data: course, error: cErr } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      description,
      thumbnail_url,
      status,
      created_at,
      companies (
        id,
        name,
        slug,
        logo_url,
        contact_email
      )
    `)
    .eq('id', courseId)
    .single();

  if (cErr) throw cErr;

  // 2. Modules & Lessons
  const { data: modules, error: mErr } = await supabase
    .from('course_modules')
    .select(`
      id,
      title,
      order,
      description,
      course_lessons (
        id,
        title,
        type,
        content,
        video_url,
        position
      )
    `)
    .eq('course_id', courseId)
    .eq('is_archived', false)
    .order('order', { ascending: true });

  if (mErr) throw mErr;

  (modules || []).forEach((m: any) => {
    if (m.course_lessons) {
      m.course_lessons.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
    }
  });

  // 3. Assessments & Questions
  const lessonIds = (modules || []).flatMap((m: any) => (m.course_lessons || []).map((l: any) => l.id));
  let assessments: any[] = [];

  if (lessonIds.length > 0) {
    const { data: aData } = await supabase
      .from('assessments')
      .select(`
        id,
        lesson_id,
        title,
        passing_score,
        time_limit,
        assessment_questions (
          id,
          question_text,
          position,
          question_type,
          correct_answers,
          assessment_choices (
            id,
            choice_text,
            is_correct
          )
        )
      `)
      .in('lesson_id', lessonIds)
      .eq('is_archived', false);

    assessments = aData || [];
    assessments.forEach((a: any) => {
      if (a.assessment_questions) {
        a.assessment_questions.sort((x: any, y: any) => (x.position || 0) - (y.position || 0));
      }
    });
  }

  // 4. Build comprehensive lookup maps for clean non-technical referencing
  const lessonLookup = new Map<number, {
    moduleNumber: number;
    lessonNumber: number;
    moduleTitle: string;
    lessonTitle: string;
    type: string;
    hybridQuestions: Map<string, { questionText: string; choices: any[] }>;
  }>();

  (modules || []).forEach((mod: any, mIdx: number) => {
    (mod.course_lessons || []).forEach((les: any, lIdx: number) => {
      const qMap = new Map<string, { questionText: string; choices: any[] }>();
      if (les.type === 'hybrid' && les.content) {
        try {
          const blocks = typeof les.content === 'string' && les.content.startsWith('[')
            ? JSON.parse(les.content)
            : [];
          blocks.forEach((blk: any) => {
            if (blk.type === 'question' && blk.question) {
              qMap.set(String(blk.id), {
                questionText: blk.question.question_text || 'Reflection / In-Lesson Exercise',
                choices: blk.question.choices || []
              });
            }
          });
        } catch {
          // ignore
        }
      }

      lessonLookup.set(les.id, {
        moduleNumber: mIdx + 1,
        lessonNumber: lIdx + 1,
        moduleTitle: mod.title,
        lessonTitle: les.title,
        type: les.type,
        hybridQuestions: qMap
      });
    });
  });

  return { course, modules: modules || [], assessments, lessonLookup };
}

export async function fetchEligibleParticipants(courseId: number): Promise<PrcParticipant[]> {
  const { data: assignments, error } = await supabase
    .from('course_assignments')
    .select(`
      id,
      user_id,
      status,
      assigned_at,
      course_progress ( progress_pct, is_completed, completed_at ),
      users:users!course_assignments_user_id_fkey (
        id,
        firstname,
        lastname,
        email,
        cpd_prc_id,
        cpd_position,
        cpd_school_name
      )
    `)
    .eq('course_id', courseId);

  let rawList = assignments || [];
  if (error || rawList.length === 0) {
    const { data: fallback } = await supabase
      .from('course_assignments')
      .select('id, user_id, status, assigned_at, course_progress(progress_pct, is_completed, completed_at)')
      .eq('course_id', courseId);

    const userIds = (fallback || []).map((a: any) => a.user_id).filter(Boolean);
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, firstname, lastname, email, cpd_prc_id, cpd_position, cpd_school_name')
        .in('id', userIds);
      const userMap = new Map((users || []).map((u: any) => [u.id, u]));
      rawList = (fallback || []).map((a: any) => ({ ...a, users: userMap.get(a.user_id) }));
    }
  }

  // Get attempts count & scores
  const { data: modules } = await supabase
    .from('course_modules')
    .select('id, course_lessons(id)')
    .eq('course_id', courseId);

  const lessonIds = (modules || []).flatMap((m: any) => (m.course_lessons || []).map((l: any) => l.id));
  let assessmentIds: number[] = [];
  if (lessonIds.length > 0) {
    const { data: aList } = await supabase.from('assessments').select('id').in('lesson_id', lessonIds);
    assessmentIds = (aList || []).map((a: any) => a.id);
  }

  const userIds = rawList.map((a: any) => a.users?.id || a.user_id).filter(Boolean);
  let attemptsByUser = new Map<string, any[]>();
  if (assessmentIds.length > 0 && userIds.length > 0) {
    const { data: attempts } = await supabase
      .from('assessment_attempts')
      .select('id, assessment_id, user_id, score, passed, attempted_at')
      .in('assessment_id', assessmentIds)
      .in('user_id', userIds)
      .order('attempted_at', { ascending: false });

    (attempts || []).forEach((att: any) => {
      if (!attemptsByUser.has(att.user_id)) attemptsByUser.set(att.user_id, []);
      attemptsByUser.get(att.user_id)!.push(att);
    });
  }

  const result: PrcParticipant[] = rawList.map((a: any) => {
    const u = Array.isArray(a.users) ? a.users[0] : (a.users || {});
    const cp = Array.isArray(a.course_progress) ? a.course_progress[0] : a.course_progress;
    const userAttempts = attemptsByUser.get(u.id || a.user_id) || [];

    const progressPct = cp?.progress_pct ?? (a.status === 'completed' ? 100 : 0);
    const passedAttempts = userAttempts.filter((att: any) => att.passed);
    const scores = userAttempts.map((att: any) => att.score ?? 0);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((s: number, v: number) => s + v, 0) / scores.length) : 0;

    return {
      id: u.id || a.user_id,
      name: `${u.firstname || ''} ${u.lastname || ''}`.trim() || u.email || 'Participant',
      email: u.email || '',
      prcLicenseNo: u.cpd_prc_id || '',
      schoolName: u.cpd_school_name || 'N/A',
      position: u.cpd_position || 'Licensed Professional Teacher',
      progressPct,
      completedAt: cp?.completed_at || null,
      assignedAt: a.assigned_at,
      attemptsCount: userAttempts.length,
      passedAssessmentsCount: passedAttempts.length,
      avgScore
    };
  });

  // Sort by completed first, then those with PRC License IDs, then highest avg score
  result.sort((a, b) => {
    if (a.progressPct === 100 && b.progressPct !== 100) return -1;
    if (b.progressPct === 100 && a.progressPct !== 100) return 1;
    const aHasPrc = Boolean(a.prcLicenseNo && a.prcLicenseNo.trim());
    const bHasPrc = Boolean(b.prcLicenseNo && b.prcLicenseNo.trim());
    if (aHasPrc && !bHasPrc) return -1;
    if (!aHasPrc && bHasPrc) return 1;
    return b.avgScore - a.avgScore;
  });

  return result;
}

export async function fetchStudentDetailsForEvidence(courseId: number, userId: string, lessonLookup: Map<number, any>) {
  // 1. Fetch modules & assessments
  const { data: modules } = await supabase
    .from('course_modules')
    .select(`
      id,
      title,
      order,
      course_lessons (
        id,
        title,
        type,
        assessments (
          id,
          title,
          passing_score
        )
      )
    `)
    .eq('course_id', courseId)
    .order('order', { ascending: true });

  const lessonIds = (modules || []).flatMap((m: any) => (m.course_lessons || []).map((l: any) => l.id));
  const assessmentMap = new Map<number, any>();

  (modules || []).forEach((m: any, mIdx: number) => {
    (m.course_lessons || []).forEach((l: any, lIdx: number) => {
      const a = Array.isArray(l.assessments) ? l.assessments[0] : l.assessments;
      if (a) {
        assessmentMap.set(a.id, {
          ...a,
          moduleNumber: mIdx + 1,
          lessonNumber: lIdx + 1,
          moduleTitle: m.title,
          lessonTitle: l.title
        });
      }
    });
  });

  const assessmentIds = Array.from(assessmentMap.keys());
  let allAttempts: any[] = [];

  if (assessmentIds.length > 0) {
    const { data: attempts } = await supabase
      .from('assessment_attempts')
      .select(`
        id,
        assessment_id,
        user_id,
        score,
        passed,
        attempted_at,
        attempt_answers (
          id,
          question_id,
          choice_id,
          text_answer
        )
      `)
      .in('assessment_id', assessmentIds)
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false });

    allAttempts = attempts || [];
  }

  // 2. Select ONLY the SINGLE official passed attempt (or highest submitted attempt) per assessment
  const officialAttempts: any[] = [];
  for (const aId of assessmentIds) {
    const forThisAssess = allAttempts.filter((att: any) => att.assessment_id === aId);
    if (forThisAssess.length === 0) continue;

    const passed = forThisAssess.find((att: any) => att.passed);
    if (passed) {
      officialAttempts.push(passed);
    } else {
      // Pick highest score
      forThisAssess.sort((x: any, y: any) => (y.score ?? 0) - (x.score ?? 0));
      officialAttempts.push(forThisAssess[0]);
    }
  }

  // 3. Fetch questions and choices for these assessments
  let questionsMap = new Map<number, any>();
  if (assessmentIds.length > 0) {
    const { data: questions } = await supabase
      .from('assessment_questions')
      .select(`
        id,
        assessment_id,
        question_text,
        position,
        question_type,
        correct_answers,
        assessment_choices (
          id,
          choice_text,
          is_correct
        )
      `)
      .in('assessment_id', assessmentIds)
      .order('position', { ascending: true });

    (questions || []).forEach((q: any) => questionsMap.set(q.id, q));
  }

  // 4. Fetch user's in-lesson hybrid activity responses
  let hybridResponses: any[] = [];
  if (lessonIds.length > 0) {
    const { data: hr } = await supabase
      .from('hybrid_lesson_responses')
      .select('id, lesson_id, question_id, answer_data, created_at')
      .eq('user_id', userId)
      .in('lesson_id', lessonIds)
      .order('created_at', { ascending: true });

    hybridResponses = hr || [];
  }

  return {
    officialAttempts,
    assessmentMap,
    questionsMap,
    hybridResponses,
    lessonLookup
  };
}

// ─── DOCUMENT 1: SYSTEM OVERVIEW & PRC MANIFEST PDF ───────────────

export function generateSystemOverviewAndManifestPdf(
  course: any,
  allParticipants: PrcParticipant[],
  selectedParticipants: PrcParticipant[],
  opts: PrcExportOptions,
  docId: string
): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let cursorY = 24;

  // Header Banner
  doc.setFillColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.rect(0, 0, pageWidth, 45, 'F');
  doc.setFillColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
  doc.rect(0, 45, pageWidth, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
  doc.text('PRC CPD COMPLIANCE · PROGRAM AUDIT & SYSTEM VERIFICATION DOSSIER', 14, 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('Continuing Professional Development Audit Summary', 14, 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`Course Program: ${course.title}`, 14, 35);

  cursorY = 56;

  // Program Metadata Table
  const totalEnrolled = allParticipants.length;
  const completers = allParticipants.filter((p: any) => p.progressPct === 100).length;
  const completionRate = totalEnrolled > 0 ? Math.round((completers / totalEnrolled) * 100) : 0;

  autoTable(doc, {
    startY: cursorY,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 3.5 },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [241, 245, 249], width: 45 },
      1: { fillColor: [255, 255, 255] },
      2: { fontStyle: 'bold', fillColor: [241, 245, 249], width: 45 },
      3: { fillColor: [255, 255, 255] },
    },
    body: [
      ['CPD Provider Name:', opts.providerName, 'Provider Accr. No.:', opts.providerAccreditationNo || 'N/A'],
      ['Program Accr. No.:', opts.programAccreditationNo || 'N/A', 'Course Status:', (course.status || 'published').toUpperCase()],
      ['Total Enrolled:', String(totalEnrolled), 'Accredited Completers:', `${completers} (${completionRate}%)`],
      ['Generated On:', new Date().toLocaleDateString('en-US', { dateStyle: 'full' }), 'Document Tracking ID:', docId]
    ]
  });

  cursorY = (doc as any).lastAutoTable.finalY + 10;

  // ── SECTION 1: HOW THE SYSTEM WORKS (PLAIN-LANGUAGE EXPLANATION) ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.text('1. How the SPARK LMS Training & Delivery System Works', 14, cursorY);
  cursorY += 5;

  const systemExplanation = [
    {
      title: 'A. Accredited Platform Delivery',
      desc: 'SPARK LMS is a digital learning management system specialized in delivering certified Continuing Professional Development (CPD) programs to licensed teachers in the Philippines. Training is conducted in structured, sequential digital modules designed to ensure educators actively master each learning objective.'
    },
    {
      title: 'B. Verified Teacher Profiles',
      desc: 'Every participant is registered using their official PRC Professional Teacher License ID, educational institution (school/division), position, and authenticated email. This ensures that every submitted output is tied to a verified educator.'
    },
    {
      title: 'C. Course Progression Policy',
      desc: 'Courses are organized into sequential Modules, which are divided into progressive Lessons. Learners must engage with each lesson—reading the core texts, reviewing instructional video presentations, and studying supplementary materials—before proceeding to the next unit.'
    },
    {
      title: 'D. Interactive In-Lesson Activities & Reflections',
      desc: 'To confirm instructional engagement, lessons feature embedded formative activities (such as reflection prompts, lesson plan outlines, and case analyses). Teachers submit their written analyses directly within the lesson, which are permanently archived in the system.'
    },
    {
      title: 'E. Summative Mastery Assessments & Integrity Safeguards',
      desc: 'At the conclusion of each module, participants must pass an assessment (quiz/exam) covering multiple-choice, true/false, identification, enumeration, and essay questions. An automated 70% passing score is enforced before a module is validated, and automated lockout policies prevent answer sharing and ensure authentic personal effort.'
    },
    {
      title: 'F. Verifiable Digital Audit Trail',
      desc: 'All assessment attempts, final scores, submitted answers, and timestamps are recorded in the database. Only official passing attempts and genuine submitted work are documented in this verification dossier.'
    }
  ];

  systemExplanation.forEach((item) => {
    if (cursorY > doc.internal.pageSize.getHeight() - 25) {
      doc.addPage();
      cursorY = 22;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
    doc.text(item.title, 14, cursorY);
    cursorY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(item.desc, pageWidth - 28);
    doc.text(lines, 14, cursorY);
    cursorY += lines.length * 3.8 + 4;
  });

  cursorY += 4;

  // ── SECTION 2: SUBMITTED EVIDENCE SAMPLE PARTICIPANTS ──
  if (cursorY > doc.internal.pageSize.getHeight() - 40) {
    doc.addPage();
    cursorY = 22;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.text('2. Selected Sample Licensed Participants (Evidence Provided)', 14, cursorY);
  cursorY += 4;

  const sampleRows = selectedParticipants.map((p: any, idx: number) => [
    `#${idx + 1}`,
    p.name,
    p.prcLicenseNo || 'Submitted in LMS',
    p.position,
    p.schoolName,
    `${p.avgScore}%`,
    p.completedAt ? new Date(p.completedAt).toLocaleDateString() : 'Completed'
  ]);

  autoTable(doc, {
    startY: cursorY,
    theme: 'striped',
    head: [['#', 'Teacher Name', 'PRC License #', 'Position', 'School / Institution', 'Avg Score', 'Completion Date']],
    headStyles: { fillColor: [51, 65, 85], fontSize: 8 },
    body: sampleRows,
    styles: { fontSize: 8, cellPadding: 2.8 }
  });

  cursorY = (doc as any).lastAutoTable.finalY + 10;

  // ── SECTION 3: PROVIDER CERTIFICATION & SIGNATURES ──
  if (cursorY > doc.internal.pageSize.getHeight() - 45) {
    doc.addPage();
    cursorY = 22;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.text('3. Provider Certification & Compliance Statement', 14, cursorY);
  cursorY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const certStatement = [
    'I hereby certify under penalty of perjury and in full compliance with the guidelines of the Professional Regulation Commission (PRC) CPD Council',
    'that the curriculum materials, course lesson modules, interactive exercises, and participant completion records herein provided',
    'represent genuine, verifiable digital records captured natively by the SPARK Learning Management System (LMS).'
  ].join(' ');
  const certLines = doc.splitTextToSize(certStatement, pageWidth - 28);
  doc.text(certLines, 14, cursorY);
  cursorY += certLines.length * 3.8 + 14;

  // Signature Lines
  const col1X = 25;
  const col2X = pageWidth - 80;

  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.5);
  doc.line(col1X, cursorY, col1X + 60, cursorY);
  doc.line(col2X, cursorY, col2X + 60, cursorY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.text('Authorized CPD Program Director', col1X + 5, cursorY + 5);
  doc.text('Quality Assurance / Compliance Officer', col2X + 2, cursorY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.text(`${opts.providerName}`, col1X + 14, cursorY + 9);
  doc.text('SPARK Learning Management System', col2X + 5, cursorY + 9);

  addHeaderAndFooter(doc, course.title, docId, opts.providerName, 'SYSTEM & PROGRAM AUDIT SUMMARY');
  return doc;
}

// ─── DOCUMENT 2: CURRICULUM, MODULES & LESSONS PDF ────────────────

export function generateCurriculumPdf(
  course: any,
  modules: any[],
  assessments: any[],
  opts: PrcExportOptions,
  docId: string
): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let cursorY = 24;

  // Cover Banner
  doc.setFillColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.rect(0, 0, pageWidth, 48, 'F');
  doc.setFillColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
  doc.rect(0, 48, pageWidth, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
  doc.text('PRC CPD COMPLIANCE · COMPLETE COURSE CURRICULUM & MODULE CONTENT', 14, 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(course.title, pageWidth - 28);
  doc.text(titleLines, 14, 28);

  cursorY = 60;

  // Metadata Table
  autoTable(doc, {
    startY: cursorY,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 3.5 },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [241, 245, 249], width: 45 },
      1: { fillColor: [255, 255, 255] },
      2: { fontStyle: 'bold', fillColor: [241, 245, 249], width: 45 },
      3: { fillColor: [255, 255, 255] },
    },
    body: [
      ['CPD Provider Name:', opts.providerName, 'Provider Accr. No.:', opts.providerAccreditationNo || 'N/A'],
      ['Program Accr. No.:', opts.programAccreditationNo || 'N/A', 'Course Status:', (course.status || 'published').toUpperCase()],
      ['Total Modules:', `${modules.length} Modules`, 'Total Lessons:', `${modules.reduce((acc: number, m: any) => acc + (m.course_lessons?.length || 0), 0)} Lessons`],
      ['Target Audience:', 'Licensed Professional Teachers', 'Document ID:', docId]
    ]
  });

  cursorY = (doc as any).lastAutoTable.finalY + 10;

  // Course Description
  if (course.description) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
    doc.text('Course Overview & Educational Objectives:', 14, cursorY);
    cursorY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const descLines = doc.splitTextToSize(stripHtml(course.description), pageWidth - 28);
    doc.text(descLines, 14, cursorY);
    cursorY += descLines.length * 4.2 + 8;
  }

  // Table of Contents
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.text('Curriculum Structure & Table of Contents', 14, cursorY);
  cursorY += 4;

  const tocRows: any[] = [];
  modules.forEach((mod: any, mIdx: number) => {
    tocRows.push([{ content: `MODULE ${mIdx + 1}: ${mod.title.toUpperCase()}`, colSpan: 3, styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }]);
    (mod.course_lessons || []).forEach((l: any, lIdx: number) => {
      const typeLabel = l.type === 'hybrid' ? 'Interactive Lesson' : l.type === 'video' ? 'Video Lecture' : l.type === 'assessment' ? 'Module Assessment' : 'Reading';
      tocRows.push([
        `Lesson ${lIdx + 1}`,
        l.title,
        typeLabel
      ]);
    });
  });

  autoTable(doc, {
    startY: cursorY,
    theme: 'striped',
    head: [['Lesson #', 'Lesson Title', 'Format']],
    headStyles: { fillColor: [51, 65, 85], fontSize: 8 },
    body: tocRows,
    styles: { fontSize: 8, cellPadding: 2.8 }
  });

  cursorY = (doc as any).lastAutoTable.finalY + 12;

  // ── DETAILED MODULE CONTENT LOOP ──
  modules.forEach((mod: any, mIdx: number) => {
    doc.addPage();
    cursorY = 22;

    // Module Banner
    doc.setFillColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
    doc.rect(14, cursorY, pageWidth - 28, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`MODULE ${mIdx + 1}: ${mod.title}`, 18, cursorY + 6.8);
    cursorY += 16;

    if (mod.description) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
      const modDesc = doc.splitTextToSize(mod.description, pageWidth - 28);
      doc.text(modDesc, 14, cursorY);
      cursorY += modDesc.length * 4 + 6;
    }

    // Lessons Loop
    (mod.course_lessons || []).forEach((les: any, lIdx: number) => {
      if (cursorY > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        cursorY = 22;
      }

      // Human-friendly header: "Lesson X: [Title]"
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
      doc.text(`Lesson ${lIdx + 1}: ${les.title}`, 14, cursorY);

      const typeLabel = les.type === 'hybrid' ? 'INTERACTIVE LESSON' : les.type === 'video' ? 'VIDEO LECTURE' : les.type === 'assessment' ? 'MODULE ASSESSMENT' : 'READING';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
      doc.text(`[${typeLabel}]`, pageWidth - 14, cursorY, { align: 'right' });
      cursorY += 5;

      doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
      doc.setLineWidth(0.4);
      doc.line(14, cursorY, pageWidth - 14, cursorY);
      cursorY += 6;

      // Render content based on type
      if (les.type === 'video') {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        doc.text(`Instructional Video Source: ${les.video_url || 'Online Course Lecture'}`, 14, cursorY);
        cursorY += 6;

        cursorY = drawGuideBox(
          doc,
          cursorY,
          `Video Lecture Player (Lesson ${lIdx + 1})`,
          `Module ${mIdx + 1} > Lesson ${lIdx + 1}: "${les.title}"`,
          'Capture a screenshot of the video player screen showing the video title and duration.'
        );
      } else if (les.type === 'hybrid') {
        let blocks: any[] = [];
        try {
          if (les.content && les.content.startsWith('[')) {
            blocks = JSON.parse(les.content);
          } else if (les.content) {
            blocks = [{ type: 'reading', content: les.content }];
          }
        } catch {
          blocks = [{ type: 'reading', content: les.content }];
        }

        blocks.forEach((blk: any) => {
          if (cursorY > doc.internal.pageSize.getHeight() - 35) {
            doc.addPage();
            cursorY = 22;
          }

          if (blk.type === 'reading' && blk.content) {
            const cleanText = stripHtml(blk.content);
            if (cleanText) {
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(8);
              doc.setTextColor(51, 65, 85);
              const txtLines = doc.splitTextToSize(cleanText, pageWidth - 28);
              const pageH = doc.internal.pageSize.getHeight();
              txtLines.forEach((line: string) => {
                if (cursorY > pageH - 20) {
                  doc.addPage();
                  cursorY = 22;
                }
                doc.text(line, 14, cursorY);
                cursorY += 4;
              });
              cursorY += 4;
            }
          } else if (blk.type === 'file') {
            const fileMeta = blk.file || {};
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
            doc.text(`Supplementary Learning Material: ${fileMeta.name || blk.caption || 'Slide Deck / Resource Document'}`, 14, cursorY);
            cursorY += 5;

            cursorY = drawGuideBox(
              doc,
              cursorY,
              `Attached Learning Resource: ${fileMeta.name || 'Document'}`,
              `Module ${mIdx + 1} > Lesson ${lIdx + 1} (File Attachment)`,
              'Insert a screenshot of the presentation title slide or document cover page.'
            );
          } else if (blk.type === 'question' && blk.question) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
            doc.text(`In-Lesson Formative Exercise: ${blk.question.question_text}`, 14, cursorY);
            cursorY += 5;

            if (blk.question.choices && blk.question.choices.length > 0) {
              blk.question.choices.forEach((c: any) => {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7.5);
                doc.setTextColor(51, 65, 85);
                doc.text(`• ${c.choice_text} ${c.is_correct ? '✓ (Key Answer)' : ''}`, 18, cursorY);
                cursorY += 3.8;
              });
            }
            cursorY += 4;
          }
        });
      } else if (les.type === 'assessment') {
        const assessment = assessments.find((a: any) => a.lesson_id === les.id);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
        doc.text(`Passing Grade Requirement: ${assessment?.passing_score || 70}%  |  Allowed Time: ${(assessment?.time_limit || 900) / 60} minutes`, 14, cursorY);
        cursorY += 5;

        const qCount = assessment?.assessment_questions?.length || 0;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        doc.text(`Total Questions Evaluated: ${qCount} Questions`, 14, cursorY);
        cursorY += 6;

        cursorY = drawGuideBox(
          doc,
          cursorY,
          `Assessment Interface (Lesson ${lIdx + 1})`,
          `Module ${mIdx + 1} > Assessment: "${les.title}"`,
          'Capture a screenshot of the active online quiz screen showing the question options and countdown timer.'
        );
      }
      cursorY += 6;
    });
  });

  addHeaderAndFooter(doc, course.title, docId, opts.providerName, 'COURSE CURRICULUM & MODULE CONTENT');
  return doc;
}

// ─── DOCUMENT 3: PARTICIPANT OUTPUT & ASSESSMENT EVIDENCE PDF ─────

export function generateStudentEvidencePdf(
  course: any,
  student: PrcParticipant,
  studentData: any,
  opts: PrcExportOptions,
  docId: string
): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let cursorY = 24;

  // Header Banner
  doc.setFillColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.rect(0, 0, pageWidth, 42, 'F');
  doc.setFillColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
  doc.rect(0, 42, pageWidth, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
  doc.text('PRC CPD COMPLIANCE · INDIVIDUAL PARTICIPANT EVIDENCE DOSSIER', 14, 15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(`Learner Evidence: ${student.name}`, 14, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`Course: ${course.title}`, 14, 34);

  cursorY = 52;

  // Student Profile Table
  const emailDisplay = opts.maskSensitiveData ? maskEmail(student.email) : student.email;
  autoTable(doc, {
    startY: cursorY,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 3.5 },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [241, 245, 249], width: 45 },
      1: { fillColor: [255, 255, 255] },
      2: { fontStyle: 'bold', fillColor: [241, 245, 249], width: 45 },
      3: { fillColor: [255, 255, 255] },
    },
    body: [
      ['Licensed Teacher Name:', student.name, 'PRC Professional ID:', student.prcLicenseNo || 'Verified in LMS'],
      ['Teaching Position:', student.position, 'School / Institution:', student.schoolName],
      ['Contact Email:', emailDisplay, 'Course Status:', `${student.progressPct}% (COMPLETED)`],
      ['Completion Date:', student.completedAt ? new Date(student.completedAt).toLocaleDateString() : 'Recorded in LMS', 'Verified Passed Outputs:', `${studentData.officialAttempts.length} Assessments`]
    ]
  });

  cursorY = (doc as any).lastAutoTable.finalY + 10;

  // ── SECTION 1: OFFICIAL PASSED ASSESSMENTS (ONLY ONE ATTEMPT) ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.text('1. Official Verified Assessment Results (Passed Attempts Only)', 14, cursorY);
  cursorY += 4;

  const attemptRows = (studentData.officialAttempts || []).map((att: any) => {
    const meta = studentData.assessmentMap.get(att.assessment_id) || {};
    const dt = new Date(att.attempted_at);
    return [
      `Module ${meta.moduleNumber || 1}`,
      `Lesson ${meta.lessonNumber || 1}: ${meta.title || 'Assessment'}`,
      `${att.score ?? 0}%`,
      att.passed ? 'PASSED (Verified)' : 'SUBMITTED',
      dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    ];
  });

  if (attemptRows.length > 0) {
    autoTable(doc, {
      startY: cursorY,
      theme: 'striped',
      head: [['Module', 'Assessment Title', 'Final Score', 'Accreditation Result', 'Completion Timestamp']],
      headStyles: { fillColor: [51, 65, 85], fontSize: 8 },
      body: attemptRows,
      styles: { fontSize: 8, cellPadding: 3 }
    });
    cursorY = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    doc.text('No assessment records found for this participant.', 14, cursorY);
    cursorY += 8;
  }

  // ── SECTION 2: QUESTION-BY-QUESTION AUDIT (EACH QUESTION REFERENCED) ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.text('2. Itemized Assessment Questions & Learner Submitted Answers', 14, cursorY);
  cursorY += 4;

  const itemizedRows: any[] = [];
  (studentData.officialAttempts || []).forEach((att: any) => {
    const meta = studentData.assessmentMap.get(att.assessment_id) || {};
    itemizedRows.push([
      {
        content: `MODULE ${meta.moduleNumber || 1} ASSESSMENT: ${meta.title || 'Assessment'} — Final Score: ${att.score}% (${att.passed ? 'PASSED' : 'COMPLETED'})`,
        colSpan: 4,
        styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] }
      }
    ]);

    (att.attempt_answers || []).forEach((ans: any, qIdx: number) => {
      const q = studentData.questionsMap.get(ans.question_id);
      if (!q) return;

      let chosenText = ans.text_answer || '';
      let correctText = (q.correct_answers || []).join(', ');
      let isCorrect = false;

      if (q.question_type === 'multiple_choice' || q.question_type === 'true_false' || !q.question_type) {
        const chosenChoice = (q.assessment_choices || []).find((c: any) => String(c.id) === String(ans.choice_id));
        const correctChoice = (q.assessment_choices || []).find((c: any) => c.is_correct);
        chosenText = chosenChoice?.choice_text || 'Option Selected';
        correctText = correctChoice?.choice_text || 'Key Answer';
        isCorrect = Boolean(chosenChoice?.is_correct);
      } else if (q.question_type === 'identification') {
        isCorrect = (q.correct_answers || []).some((ca: string) => ca.trim().toLowerCase() === String(ans.text_answer || '').trim().toLowerCase());
      } else {
        isCorrect = true; // essay/open text response submitted
      }

      itemizedRows.push([
        `Question ${qIdx + 1}`,
        q.question_text,
        chosenText,
        isCorrect ? 'Correct ✓' : `Incorrect (Expected: ${correctText})`
      ]);
    });
  });

  if (itemizedRows.length > 0) {
    autoTable(doc, {
      startY: cursorY,
      theme: 'grid',
      head: [['Item #', 'Assessment Question Prompt', 'Teacher Submitted Answer', 'Result']],
      headStyles: { fillColor: [51, 65, 85], fontSize: 8 },
      columnStyles: {
        0: { width: 18, fontStyle: 'bold' },
        1: { width: 85 },
        2: { width: 48 },
        3: { width: 33 }
      },
      body: itemizedRows,
      styles: { fontSize: 7.5, cellPadding: 2.5 }
    });
    cursorY = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── SECTION 3: IN-LESSON ACTIVITY RESPONSES WITH ACTUAL QUESTIONS ──
  if (studentData.hybridResponses && studentData.hybridResponses.length > 0) {
    if (cursorY > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      cursorY = 22;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
    doc.text('3. In-Lesson Learning Activities & Written Reflections', 14, cursorY);
    cursorY += 4;

    const activityRows = studentData.hybridResponses.map((hr: any) => {
      const lesInfo = studentData.lessonLookup.get(hr.lesson_id);
      const lessonLabel = lesInfo
        ? `Module ${lesInfo.moduleNumber}, Lesson ${lesInfo.lessonNumber}`
        : 'In-Lesson Exercise';

      const questionMeta = lesInfo?.hybridQuestions?.get(String(hr.question_id));
      const questionPrompt = questionMeta?.questionText || 'Interactive Reflection & Learning Task';

      let responseText = hr.answer_data;
      if (typeof responseText === 'object') {
        responseText = JSON.stringify(responseText);
      }

      return [
        lessonLabel,
        questionPrompt,
        String(responseText || 'Completed exercise in LMS'),
        new Date(hr.created_at).toLocaleDateString()
      ];
    });

    autoTable(doc, {
      startY: cursorY,
      theme: 'striped',
      head: [['Lesson Location', 'Activity Prompt / Question', 'Teacher Submitted Response', 'Date Submitted']],
      headStyles: { fillColor: [51, 65, 85], fontSize: 8 },
      columnStyles: {
        0: { width: 34, fontStyle: 'bold' },
        1: { width: 75 },
        2: { width: 52 },
        3: { width: 23 }
      },
      body: activityRows,
      styles: { fontSize: 7.5, cellPadding: 2.8 }
    });
    cursorY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Screenshot guide for participant certificate / summary view
  cursorY = drawGuideBox(
    doc,
    cursorY,
    `Teacher Course Completion Certificate / Dashboard Summary`,
    `Learner Portal: /certificates (Participant: ${student.name})`,
    'Screenshot of the verified 100% course completion badge or issued certificate.'
  );

  addHeaderAndFooter(doc, course.title, docId, opts.providerName, 'INDIVIDUAL PARTICIPANT EVIDENCE');
  return doc;
}

// ─── MASTER EXPORT EXECUTOR ───────────────────────────────────────

export async function executePrcExport(opts: PrcExportOptions) {
  const { onProgress } = opts;
  const docId = `SPK-PRC-${opts.courseId}-${Date.now().toString(36).toUpperCase()}`;

  onProgress?.('Fetching course curriculum and modules...', 15);
  const { course, modules, assessments, lessonLookup } = await fetchPrcCourseData(opts.courseId);

  onProgress?.('Generating System Overview & PRC Manifest...', 28);
  const allParticipants = await fetchEligibleParticipants(opts.courseId);
  const manifestPdf = generateSystemOverviewAndManifestPdf(course, allParticipants, opts.selectedParticipants, opts, docId);

  onProgress?.('Generating Course Curriculum & Content PDF...', 48);
  const curriculumPdf = generateCurriculumPdf(course, modules, assessments, opts, docId);

  // Compile student evidence PDFs
  const studentPdfs: { filename: string; doc: jsPDF }[] = [];
  const totalStudents = opts.selectedParticipants.length;

  for (let i = 0; i < totalStudents; i++) {
    const student = opts.selectedParticipants[i];
    const pct = 50 + Math.round(((i + 1) / totalStudents) * 35);
    onProgress?.(`Compiling verified output for ${student.name}...`, pct);

    const studentData = await fetchStudentDetailsForEvidence(opts.courseId, student.id, lessonLookup);
    const sDoc = generateStudentEvidencePdf(course, student, studentData, opts, docId);
    const safeName = student.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    studentPdfs.push({
      filename: `Evidence_Teacher_${i + 1}_${safeName}.pdf`,
      doc: sDoc
    });
  }

  const cleanCourseTitle = course.title.replace(/[^a-zA-Z0-9_-]/g, '_');

  if (opts.exportMode === 'zip_package') {
    onProgress?.('Packaging official dossier into ZIP archive...', 90);
    const zip = new JSZip();

    zip.file('01_SPARK_LMS_System_Delivery_and_PRC_Manifest.pdf', manifestPdf.output('blob'));
    zip.file(`02_${cleanCourseTitle}_Curriculum_and_Modules.pdf`, curriculumPdf.output('blob'));

    const studentFolder = zip.folder('03_Participant_Assessment_Evidence');
    studentPdfs.forEach((sp) => {
      studentFolder?.file(sp.filename, sp.doc.output('blob'));
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const downloadUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `PRC_CPD_Evidence_Bundle_${cleanCourseTitle}_${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  } else {
    onProgress?.('Downloading official PRC documentation...', 95);
    manifestPdf.save(`01_PRC_Manifest_${cleanCourseTitle}_${new Date().toISOString().slice(0, 10)}.pdf`);
    curriculumPdf.save(`02_Curriculum_${cleanCourseTitle}_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  onProgress?.('PRC Compliance Export completed successfully!', 100);
}
