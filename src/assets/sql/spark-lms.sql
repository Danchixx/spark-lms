-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.assessment_attempts (
  id bigint NOT NULL DEFAULT nextval('assessment_attempts_id_seq'::regclass),
  assessment_id bigint NOT NULL,
  user_id bigint NOT NULL,
  score integer,
  passed boolean,
  attempted_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT assessment_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT assessment_attempts_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id),
  CONSTRAINT assessment_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.assessment_choices (
  id bigint NOT NULL DEFAULT nextval('assessment_choices_id_seq'::regclass),
  question_id bigint NOT NULL,
  choice_text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  CONSTRAINT assessment_choices_pkey PRIMARY KEY (id),
  CONSTRAINT assessment_choices_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.assessment_questions(id)
);
CREATE TABLE public.assessment_questions (
  id bigint NOT NULL DEFAULT nextval('assessment_questions_id_seq'::regclass),
  assessment_id bigint NOT NULL,
  question_text text NOT NULL,
  position integer NOT NULL DEFAULT 1,
  CONSTRAINT assessment_questions_pkey PRIMARY KEY (id),
  CONSTRAINT assessment_questions_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id)
);
CREATE TABLE public.assessments (
  id bigint NOT NULL DEFAULT nextval('assessments_id_seq'::regclass),
  lesson_id bigint NOT NULL,
  title character varying NOT NULL,
  description text,
  passing_score integer NOT NULL DEFAULT 70,
  time_limit integer,
  is_archived boolean NOT NULL DEFAULT false,
  archived_at timestamp with time zone,
  archived_by bigint,
  CONSTRAINT assessments_pkey PRIMARY KEY (id),
  CONSTRAINT assessments_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.course_lessons(id),
  CONSTRAINT assessments_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES public.users(id)
);
CREATE TABLE public.attempt_answers (
  id bigint NOT NULL DEFAULT nextval('attempt_answers_id_seq'::regclass),
  attempt_id bigint NOT NULL,
  question_id bigint NOT NULL,
  choice_id bigint,
  CONSTRAINT attempt_answers_pkey PRIMARY KEY (id),
  CONSTRAINT attempt_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.assessment_attempts(id),
  CONSTRAINT attempt_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.assessment_questions(id),
  CONSTRAINT attempt_answers_choice_id_fkey FOREIGN KEY (choice_id) REFERENCES public.assessment_choices(id)
);
CREATE TABLE public.audit_logs (
  id bigint NOT NULL DEFAULT nextval('audit_logs_id_seq'::regclass),
  user_id bigint,
  action character varying NOT NULL,
  table_name character varying,
  record_id bigint,
  old_value text,
  new_value text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.certificates (
  id bigint NOT NULL DEFAULT nextval('certificates_id_seq'::regclass),
  assignment_id bigint NOT NULL UNIQUE,
  certificate_url character varying,
  issued_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT certificates_pkey PRIMARY KEY (id),
  CONSTRAINT certificates_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.course_assignments(id)
);
CREATE TABLE public.companies (
  id bigint NOT NULL DEFAULT nextval('companies_id_seq'::regclass),
  name character varying NOT NULL,
  industry character varying,
  logo_url character varying,
  cover_photo_url character varying,
  slug character varying NOT NULL UNIQUE,
  website_url character varying,
  year_founded integer,
  description text,
  contact_person character varying,
  contact_email character varying,
  phone_number character varying,
  country character varying,
  office_address text,
  is_archived boolean NOT NULL DEFAULT false,
  archived_at timestamp with time zone,
  archived_by bigint,
  CONSTRAINT companies_pkey PRIMARY KEY (id),
  CONSTRAINT fk_companies_archived_by FOREIGN KEY (archived_by) REFERENCES public.users(id)
);
CREATE TABLE public.course_approvals (
  id bigint NOT NULL DEFAULT nextval('course_approvals_id_seq'::regclass),
  course_id bigint NOT NULL,
  approver_id bigint,
  decision character varying,
  reason text,
  decided_at timestamp with time zone,
  CONSTRAINT course_approvals_pkey PRIMARY KEY (id),
  CONSTRAINT course_approvals_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT course_approvals_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES public.users(id)
);
CREATE TABLE public.course_assignments (
  id bigint NOT NULL DEFAULT nextval('course_assignments_id_seq'::regclass),
  user_id bigint NOT NULL,
  course_id bigint NOT NULL,
  assigned_by bigint,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  status character varying NOT NULL DEFAULT 'not_started'::character varying,
  is_archived boolean NOT NULL DEFAULT false,
  archived_at timestamp with time zone,
  archived_by bigint,
  CONSTRAINT course_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT course_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT course_assignments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT course_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id),
  CONSTRAINT course_assignments_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES public.users(id)
);
CREATE TABLE public.course_lessons (
  id bigint NOT NULL DEFAULT nextval('course_lessons_id_seq'::regclass),
  module_id bigint NOT NULL,
  title character varying NOT NULL,
  type character varying NOT NULL DEFAULT 'text'::character varying,
  content text,
  video_url character varying,
  position integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_archived boolean NOT NULL DEFAULT false,
  archived_at timestamp with time zone,
  archived_by bigint,
  CONSTRAINT course_lessons_pkey PRIMARY KEY (id),
  CONSTRAINT course_lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.course_modules(id),
  CONSTRAINT course_lessons_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES public.users(id)
);
CREATE TABLE public.course_modules (
  id bigint NOT NULL DEFAULT nextval('course_modules_id_seq'::regclass),
  course_id bigint NOT NULL,
  title character varying NOT NULL,
  order integer NOT NULL DEFAULT 1,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_archived boolean NOT NULL DEFAULT false,
  archived_at timestamp with time zone,
  archived_by bigint,
  CONSTRAINT course_modules_pkey PRIMARY KEY (id),
  CONSTRAINT course_modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT course_modules_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES public.users(id)
);
CREATE TABLE public.course_progress (
  id bigint NOT NULL DEFAULT nextval('course_progress_id_seq'::regclass),
  assignment_id bigint NOT NULL UNIQUE,
  progress_pct integer NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  CONSTRAINT course_progress_pkey PRIMARY KEY (id),
  CONSTRAINT course_progress_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.course_assignments(id)
);
CREATE TABLE public.courses (
  id bigint NOT NULL DEFAULT nextval('courses_id_seq'::regclass),
  company_id bigint NOT NULL,
  title character varying NOT NULL,
  description text,
  thumbnail_url character varying,
  icon_emoji character varying,
  created_by bigint,
  status character varying NOT NULL DEFAULT 'draft'::character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_archived boolean NOT NULL DEFAULT false,
  archived_at timestamp with time zone,
  archived_by bigint,
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT courses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT courses_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES public.users(id)
);
CREATE TABLE public.lessons_progress (
  id bigint NOT NULL DEFAULT nextval('lessons_progress_id_seq'::regclass),
  assignment_id bigint NOT NULL,
  lesson_id bigint NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  CONSTRAINT lessons_progress_pkey PRIMARY KEY (id),
  CONSTRAINT lessons_progress_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.course_assignments(id),
  CONSTRAINT lessons_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.course_lessons(id)
);
CREATE TABLE public.module_progress (
  id bigint NOT NULL DEFAULT nextval('module_progress_id_seq'::regclass),
  assignment_id bigint NOT NULL,
  module_id bigint NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  CONSTRAINT module_progress_pkey PRIMARY KEY (id),
  CONSTRAINT module_progress_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.course_assignments(id),
  CONSTRAINT module_progress_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.course_modules(id)
);
CREATE TABLE public.quick_notes (
  id bigint NOT NULL DEFAULT nextval('quick_notes_id_seq'::regclass),
  user_id bigint NOT NULL,
  lesson_id bigint NOT NULL,
  content text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT quick_notes_pkey PRIMARY KEY (id),
  CONSTRAINT quick_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT quick_notes_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.course_lessons(id)
);
CREATE TABLE public.roles (
  id bigint NOT NULL DEFAULT nextval('roles_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_approvals (
  id bigint NOT NULL DEFAULT nextval('user_approvals_id_seq'::regclass),
  user_id bigint NOT NULL,
  approved_by bigint,
  decision character varying,
  reason text,
  decided_at timestamp with time zone,
  CONSTRAINT user_approvals_pkey PRIMARY KEY (id),
  CONSTRAINT user_approvals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_approvals_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id)
);
CREATE TABLE public.user_notification_preferences (
  id bigint NOT NULL DEFAULT nextval('user_notification_preferences_id_seq'::regclass),
  user_id bigint NOT NULL UNIQUE,
  course_assigned boolean NOT NULL DEFAULT true,
  course_reminder boolean NOT NULL DEFAULT true,
  assessment_due boolean NOT NULL DEFAULT true,
  certificate_earned boolean NOT NULL DEFAULT true,
  announcements boolean NOT NULL DEFAULT false,
  weekly_digest boolean NOT NULL DEFAULT false,
  CONSTRAINT user_notification_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id bigint NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  company_id bigint NOT NULL,
  role_id bigint NOT NULL,
  email character varying NOT NULL UNIQUE,
  password character varying NOT NULL,
  lastname character varying NOT NULL,
  firstname character varying NOT NULL,
  avatar_url character varying,
  date_of_birth date,
  gender character varying,
  contact_no character varying,
  address text,
  employee_id character varying,
  department character varying,
  job_title character varying,
  date_hired date,
  status character varying NOT NULL DEFAULT 'active'::character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_archived boolean NOT NULL DEFAULT false,
  archived_at timestamp with time zone,
  archived_by bigint,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id),
  CONSTRAINT users_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES public.users(id)
);