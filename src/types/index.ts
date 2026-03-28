// ─── Roles ───────────────────────────────────────────────────
export type RoleName = 'user' | 'admin' | 'approver' | 'creator' | 'spark_admin';

export type Role = {
  id: number;
  name: RoleName;
};

// ─── Companies ───────────────────────────────────────────────
export type Company = {
  id: number;
  name: string;
  industry: string | null;
  logo_url: string | null;
  cover_photo_url: string | null;
  slug: string;
  website_url: string | null;
  year_founded: number | null;
  description: string | null;
  contact_person: string | null;
  contact_email: string | null;
  phone_number: string | null;
  country: string | null;
  office_address: string | null;
  color: string | null;
  members: number | null;
  is_archived: boolean;
  archived_at: string | null;
  archived_by: number | null;
};

// ─── Users (DB row) ──────────────────────────────────────────
export type UserRow = {
  id: number;
  company_id: number;
  role_id: number;
  email: string;
  lastname: string;
  firstname: string;
  middlename: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  contact_no: string | null;
  address: string | null;
  employee_id: string | null;
  department: string | null;
  job_title: string | null;
  date_hired: string | null;
  status: string;
  created_at: string;
  is_archived: boolean;
  archived_at: string | null;
  archived_by: number | null;
};

/** The user object after AuthContext unpacks Supabase joins */
export type AppUser = Omit<UserRow, 'role_id'> & {
  role: RoleName;
  name: string; // computed: `${firstname} ${lastname}`
};

// ─── Courses ─────────────────────────────────────────────────
export type Course = {
  id: number;
  company_id: number;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  icon_emoji: string | null;
  created_by: number | null;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  is_archived: boolean;
  archived_at: string | null;
  archived_by: number | null;
};

export type CourseAssignment = {
  id: number;
  user_id: number;
  course_id: number;
  assigned_by: number | null;
  assigned_at: string;
  status: 'not_started' | 'ongoing' | 'completed';
  is_archived: boolean;
  archived_at: string | null;
  archived_by: number | null;
};

export type CourseModule = {
  id: number;
  course_id: number;
  title: string;
  order: number;
  description: string | null;
  created_at: string;
  is_archived: boolean;
  archived_at: string | null;
  archived_by: number | null;
};

export type CourseLesson = {
  id: number;
  module_id: number;
  title: string;
  type: 'video' | 'reading' | 'assessment';
  content: string | null;
  video_url: string | null;
  position: number;
  created_at: string;
  is_archived: boolean;
  archived_at: string | null;
  archived_by: number | null;
};

// ─── Assessments ─────────────────────────────────────────────
export type Assessment = {
  id: number;
  lesson_id: number;
  title: string;
  description: string | null;
  passing_score: number;
  time_limit: number | null;
  is_archived: boolean;
  archived_at: string | null;
  archived_by: number | null;
};

export type AssessmentQuestion = {
  id: number;
  assessment_id: number;
  question_text: string;
  position: number;
};

export type AssessmentChoice = {
  id: number;
  question_id: number;
  choice_text: string;
  is_correct: boolean;
};

export type AssessmentAttempt = {
  id: number;
  assessment_id: number;
  user_id: number;
  score: number | null;
  passed: boolean | null;
  attempted_at: string;
};

// ─── Progress ────────────────────────────────────────────────
export type LessonProgress = {
  id: number;
  assignment_id: number;
  lesson_id: number;
  is_completed: boolean;
  completed_at: string | null;
};

export type ModuleProgress = {
  id: number;
  assignment_id: number;
  module_id: number;
  is_completed: boolean;
  completed_at: string | null;
};

export type CourseProgress = {
  id: number;
  assignment_id: number;
  progress_pct: number;
  is_completed: boolean;
  completed_at: string | null;
};

// ─── Certificates ────────────────────────────────────────────
export type Certificate = {
  id: number;
  assignment_id: number;
  certificate_url: string | null;
  issued_at: string;
};

// ─── Quick Notes ─────────────────────────────────────────────
export type QuickNote = {
  id: number;
  user_id: number;
  lesson_id: number;
  content: string | null;
  updated_at: string;
};

// ─── Notification Preferences ────────────────────────────────
export type NotificationPreferences = {
  id: number;
  user_id: number;
  course_assigned: boolean;
  course_reminder: boolean;
  assessment_due: boolean;
  certificate_earned: boolean;
  announcements: boolean;
  weekly_digest: boolean;
};
