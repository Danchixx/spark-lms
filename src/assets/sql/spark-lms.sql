-- ============================================================
-- SPARK LMS — PostgreSQL / Supabase Schema (User Side Draft)
-- ============================================================

-- Enable UUID extension (Supabase has this by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ROLES
-- ============================================================
CREATE TABLE roles (
  id          BIGSERIAL PRIMARY KEY,
  name        VARCHAR(50) NOT NULL UNIQUE  -- 'user', 'admin', 'approver', 'creator', 'spark_admin'
);

-- ============================================================
-- COMPANIES
-- Shown in: Settings > Company Profile, Sidebar footer logo,
--           Header company name (mobile), workspace URL
-- ============================================================
CREATE TABLE companies (
  id               BIGSERIAL PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  industry         VARCHAR(255),
  logo_url         VARCHAR(500),                 -- Supabase Storage URL
  cover_photo_url  VARCHAR(500),                 -- Supabase Storage URL
  slug             VARCHAR(100) UNIQUE NOT NULL, -- workspace URL slug e.g. "zoup"
  website_url      VARCHAR(255),                 -- Settings > Company Profile
  year_founded     INT,                          -- Settings > Company Profile
  description      TEXT,                         -- Settings > Company Profile
  contact_person   VARCHAR(255),                 -- Settings > Company Profile > Contact Info
  contact_email    VARCHAR(255),                 -- Settings > Company Profile > Contact Info
  phone_number     VARCHAR(50),                  -- Settings > Company Profile > Contact Info
  country          VARCHAR(100),                 -- Settings > Company Profile > Contact Info
  office_address   TEXT,                         -- Settings > Company Profile > Contact Info
  is_archived      BOOLEAN NOT NULL DEFAULT FALSE,
  archived_at      TIMESTAMPTZ,
  archived_by      BIGINT                        -- FK added after users table
);

-- ============================================================
-- USERS
-- Shown in: Profile page (all personal + employment fields),
--           Header (name, avatar), Sidebar logout area
-- ============================================================
CREATE TABLE users (
  id               BIGSERIAL PRIMARY KEY,
  company_id       BIGINT NOT NULL REFERENCES companies(id),
  role_id          BIGINT NOT NULL REFERENCES roles(id),
  email            VARCHAR(255) NOT NULL UNIQUE,
  password         VARCHAR(255) NOT NULL,              -- hashed
  lastname         VARCHAR(100) NOT NULL,
  firstname        VARCHAR(100) NOT NULL,
  avatar_url       VARCHAR(500),                       -- Supabase Storage URL
  date_of_birth    DATE,                               -- Profile > Personal Info
  gender           VARCHAR(20),                        -- Profile > Personal Info
  contact_no       VARCHAR(50),                        -- Profile > Personal Info
  address          TEXT,                               -- Profile > Personal Info
  -- Employment Details (Profile page right panel)
  employee_id      VARCHAR(50),                        -- e.g. "EMP-00142"
  department       VARCHAR(100),                       -- Profile left panel + Employment Details
  job_title        VARCHAR(100),                       -- Profile left panel + Employment Details
  date_hired       DATE,                               -- Profile > Employment Details
  status           VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- "Member Since" on Profile
  is_archived      BOOLEAN NOT NULL DEFAULT FALSE,
  archived_at      TIMESTAMPTZ,
  archived_by      BIGINT REFERENCES users(id)
);

-- Now add the FKs on companies that reference users
ALTER TABLE companies
  ADD CONSTRAINT fk_companies_archived_by
  FOREIGN KEY (archived_by) REFERENCES users(id);

-- ============================================================
-- USER APPROVALS
-- ============================================================
CREATE TABLE user_approvals (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES users(id),
  approved_by  BIGINT REFERENCES users(id),
  decision     VARCHAR(20),                -- 'approved', 'rejected'
  reason       TEXT,
  decided_at   TIMESTAMPTZ
);

-- ============================================================
-- USER NOTIFICATION PREFERENCES
-- Shown in: Settings > Notifications (toggles)
-- ============================================================
CREATE TABLE user_notification_preferences (
  id                   BIGSERIAL PRIMARY KEY,
  user_id              BIGINT NOT NULL REFERENCES users(id) UNIQUE,
  course_assigned      BOOLEAN NOT NULL DEFAULT TRUE,
  course_reminder      BOOLEAN NOT NULL DEFAULT TRUE,
  assessment_due       BOOLEAN NOT NULL DEFAULT TRUE,
  certificate_earned   BOOLEAN NOT NULL DEFAULT TRUE,
  announcements        BOOLEAN NOT NULL DEFAULT FALSE,
  weekly_digest        BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================
-- COURSES
-- Shown in: My Courses cards (title, status, modules, lessons),
--           Course Modules banner (title, module count, lesson count, assessment count),
--           Dashboard > My Recent Courses table
-- ============================================================
CREATE TABLE courses (
  id            BIGSERIAL PRIMARY KEY,
  company_id    BIGINT NOT NULL REFERENCES companies(id),
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  thumbnail_url VARCHAR(500),            -- Supabase Storage URL for course card image
  icon_emoji    VARCHAR(20),             -- emoji icon shown on course cards
  created_by    BIGINT REFERENCES users(id),
  status        VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft','published','archived'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_archived   BOOLEAN NOT NULL DEFAULT FALSE,
  archived_at   TIMESTAMPTZ,
  archived_by   BIGINT REFERENCES users(id)
);

-- ============================================================
-- COURSE APPROVALS
-- ============================================================
CREATE TABLE course_approvals (
  id           BIGSERIAL PRIMARY KEY,
  course_id    BIGINT NOT NULL REFERENCES courses(id),
  approver_id  BIGINT REFERENCES users(id),
  decision     VARCHAR(20),
  reason       TEXT,
  decided_at   TIMESTAMPTZ
);

-- ============================================================
-- COURSE ASSIGNMENTS
-- Shown in: Course card "Assigned by Admin", Dashboard enrolled count
-- ============================================================
CREATE TABLE course_assignments (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id),
  course_id     BIGINT NOT NULL REFERENCES courses(id),
  assigned_by   BIGINT REFERENCES users(id),
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status        VARCHAR(20) NOT NULL DEFAULT 'not_started', -- 'not_started','ongoing','completed'
  is_archived   BOOLEAN NOT NULL DEFAULT FALSE,
  archived_at   TIMESTAMPTZ,
  archived_by   BIGINT REFERENCES users(id),
  UNIQUE (user_id, course_id)
);

-- ============================================================
-- COURSE MODULES
-- Shown in: Course Modules page (module list, module number badge,
--           status "Completed" / "In Progress", lesson count)
-- ============================================================
CREATE TABLE course_modules (
  id            BIGSERIAL PRIMARY KEY,
  course_id     BIGINT NOT NULL REFERENCES courses(id),
  title         VARCHAR(255) NOT NULL,
  "order"       INT NOT NULL DEFAULT 1,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_archived   BOOLEAN NOT NULL DEFAULT FALSE,
  archived_at   TIMESTAMPTZ,
  archived_by   BIGINT REFERENCES users(id)
);

-- ============================================================
-- COURSE LESSONS
-- Shown in: Module lessons list (title, type icon, Open/completed),
--           Lesson viewer (video_url, content/text, breadcrumb),
--           Lesson sidebar list with completion checkmarks
-- ============================================================
CREATE TABLE course_lessons (
  id            BIGSERIAL PRIMARY KEY,
  module_id     BIGINT NOT NULL REFERENCES course_modules(id),
  title         VARCHAR(255) NOT NULL,
  type          VARCHAR(20) NOT NULL DEFAULT 'text', -- 'video','reading','assessment'
  content       TEXT,                                -- rich text / reading content
  video_url     VARCHAR(500),                        -- local filename for dev e.g. 'module1-lesson1.mp4'
                                                     -- YouTube ID for production e.g. 'dQw4w9WgXcQ'
  position      INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_archived   BOOLEAN NOT NULL DEFAULT FALSE,
  archived_at   TIMESTAMPTZ,
  archived_by   BIGINT REFERENCES users(id)
);

-- ============================================================
-- ASSESSMENTS
-- Shown in: Lesson > Assessment card "Lesson Assessment: Test Your Knowledge",
--           Assessment page (title, passing score, timer, question count),
--           Attempts page (passing score, total attempts, best score),
--           Dashboard > Pending Assessments
-- ============================================================
CREATE TABLE assessments (
  id             BIGSERIAL PRIMARY KEY,
  lesson_id      BIGINT NOT NULL REFERENCES course_lessons(id),
  title          VARCHAR(255) NOT NULL,
  description    TEXT,                    -- "Answer all questions. Passing score is 70%"
  passing_score  INT NOT NULL DEFAULT 70, -- percentage
  time_limit     INT,                     -- minutes; NULL = no timer
  is_archived    BOOLEAN NOT NULL DEFAULT FALSE,
  archived_at    TIMESTAMPTZ,
  archived_by    BIGINT REFERENCES users(id)
);

-- ============================================================
-- ASSESSMENT QUESTIONS
-- Shown in: Assessment page (question text, 4 choices, question map)
-- ============================================================
CREATE TABLE assessment_questions (
  id             BIGSERIAL PRIMARY KEY,
  assessment_id  BIGINT NOT NULL REFERENCES assessments(id),
  question_text  TEXT NOT NULL,
  position       INT NOT NULL DEFAULT 1
);

-- ============================================================
-- ASSESSMENT CHOICES
-- Shown in: Assessment page (radio button options per question)
-- ============================================================
CREATE TABLE assessment_choices (
  id           BIGSERIAL PRIMARY KEY,
  question_id  BIGINT NOT NULL REFERENCES assessment_questions(id),
  choice_text  TEXT NOT NULL,
  is_correct   BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================
-- ASSESSMENT ATTEMPTS
-- Shown in: Attempts page (score, passed, attempted_at),
--           Assessment page sidebar (attempts count, "1st Attempt")
-- ============================================================
CREATE TABLE assessment_attempts (
  id             BIGSERIAL PRIMARY KEY,
  assessment_id  BIGINT NOT NULL REFERENCES assessments(id),
  user_id        BIGINT NOT NULL REFERENCES users(id),
  score          INT,       -- percentage score
  passed         BOOLEAN,
  attempted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ATTEMPT ANSWERS
-- Per-question answers within an attempt
-- ============================================================
CREATE TABLE attempt_answers (
  id           BIGSERIAL PRIMARY KEY,
  attempt_id   BIGINT NOT NULL REFERENCES assessment_attempts(id),
  question_id  BIGINT NOT NULL REFERENCES assessment_questions(id),
  choice_id    BIGINT REFERENCES assessment_choices(id)  -- NULL if skipped
);

-- ============================================================
-- LESSONS PROGRESS
-- Shown in: Lesson sidebar checkmarks, module "X/Y Done"
-- ============================================================
CREATE TABLE lessons_progress (
  id             BIGSERIAL PRIMARY KEY,
  assignment_id  BIGINT NOT NULL REFERENCES course_assignments(id),
  lesson_id      BIGINT NOT NULL REFERENCES course_lessons(id),
  is_completed   BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at   TIMESTAMPTZ,
  UNIQUE (assignment_id, lesson_id)
);

-- ============================================================
-- MODULE PROGRESS
-- Shown in: Course Modules page (Completed badge, "In Progress", % Done),
--           Lesson sidebar progress panel
-- ============================================================
CREATE TABLE module_progress (
  id             BIGSERIAL PRIMARY KEY,
  assignment_id  BIGINT NOT NULL REFERENCES course_assignments(id),
  module_id      BIGINT NOT NULL REFERENCES course_modules(id),
  is_completed   BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at   TIMESTAMPTZ,
  UNIQUE (assignment_id, module_id)
);

-- ============================================================
-- COURSE PROGRESS
-- Shown in: Course card progress bar + %, Dashboard stats,
--           Course Modules "Your Progress" bar
-- ============================================================
CREATE TABLE course_progress (
  id             BIGSERIAL PRIMARY KEY,
  assignment_id  BIGINT NOT NULL REFERENCES course_assignments(id) UNIQUE,
  progress_pct   INT NOT NULL DEFAULT 0,  -- 0-100
  is_completed   BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at   TIMESTAMPTZ
);

-- ============================================================
-- CERTIFICATES
-- Shown in: Certificates page (issued_at, certificate_url,
--           "Issued by SPARK LMS · Company", Verified badge),
--           Course card "Certificate Earned" footer
-- ============================================================
CREATE TABLE certificates (
  id                BIGSERIAL PRIMARY KEY,
  assignment_id     BIGINT NOT NULL REFERENCES course_assignments(id) UNIQUE,
  certificate_url   VARCHAR(500),
  issued_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- QUICK NOTES
-- Shown in: Lesson viewer sidebar "Quick Notes" textarea
-- ============================================================
CREATE TABLE quick_notes (
  id             BIGSERIAL PRIMARY KEY,
  user_id        BIGINT NOT NULL REFERENCES users(id),
  lesson_id      BIGINT NOT NULL REFERENCES course_lessons(id),
  content        TEXT,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT REFERENCES users(id),
  action       VARCHAR(100) NOT NULL,
  table_name   VARCHAR(100),
  record_id    BIGINT,
  old_value    TEXT,
  new_value    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);