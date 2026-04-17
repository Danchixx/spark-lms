-- DATABASE MIGRATION SCRIPT
-- Safely converts public.users Primary Key from bigInt to UUID matching auth.users
-- This script preserves all data across all 17 referencing tables!

BEGIN;

-- 1. Add new UUID column to users
ALTER TABLE public.users ADD COLUMN new_id UUID DEFAULT gen_random_uuid();

-- 2. Link existing auth.users to public.users based on email
UPDATE public.users u 
SET new_id = a.id 
FROM auth.users a 
WHERE u.email = a.email;

-- 3. Add new UUID columns to referencing tables
ALTER TABLE public.users ADD COLUMN new_archived_by UUID;
ALTER TABLE public.companies ADD COLUMN new_archived_by UUID;
ALTER TABLE public.user_approvals ADD COLUMN new_user_id UUID, ADD COLUMN new_approved_by UUID;
ALTER TABLE public.user_notification_preferences ADD COLUMN new_user_id UUID;
ALTER TABLE public.courses ADD COLUMN new_created_by UUID, ADD COLUMN new_archived_by UUID;
ALTER TABLE public.course_approvals ADD COLUMN new_approver_id UUID;
ALTER TABLE public.course_assignments ADD COLUMN new_user_id UUID, ADD COLUMN new_assigned_by UUID, ADD COLUMN new_archived_by UUID;
ALTER TABLE public.course_modules ADD COLUMN new_archived_by UUID;
ALTER TABLE public.course_lessons ADD COLUMN new_archived_by UUID;
ALTER TABLE public.assessments ADD COLUMN new_archived_by UUID;
ALTER TABLE public.assessment_attempts ADD COLUMN new_user_id UUID;
ALTER TABLE public.quick_notes ADD COLUMN new_user_id UUID;
ALTER TABLE public.audit_logs ADD COLUMN new_user_id UUID;

-- 4. Update the new UUID columns based on the mapping
UPDATE public.users t SET new_archived_by = u.new_id FROM public.users u WHERE t.archived_by = u.id;
UPDATE public.companies t SET new_archived_by = u.new_id FROM public.users u WHERE t.archived_by = u.id;
UPDATE public.user_approvals t SET new_user_id = u.new_id FROM public.users u WHERE t.user_id = u.id;
UPDATE public.user_approvals t SET new_approved_by = u.new_id FROM public.users u WHERE t.approved_by = u.id;
UPDATE public.user_notification_preferences t SET new_user_id = u.new_id FROM public.users u WHERE t.user_id = u.id;
UPDATE public.courses t SET new_created_by = u.new_id FROM public.users u WHERE t.created_by = u.id;
UPDATE public.courses t SET new_archived_by = u.new_id FROM public.users u WHERE t.archived_by = u.id;
UPDATE public.course_approvals t SET new_approver_id = u.new_id FROM public.users u WHERE t.approver_id = u.id;
UPDATE public.course_assignments t SET new_user_id = u.new_id FROM public.users u WHERE t.user_id = u.id;
UPDATE public.course_assignments t SET new_assigned_by = u.new_id FROM public.users u WHERE t.assigned_by = u.id;
UPDATE public.course_assignments t SET new_archived_by = u.new_id FROM public.users u WHERE t.archived_by = u.id;
UPDATE public.course_modules t SET new_archived_by = u.new_id FROM public.users u WHERE t.archived_by = u.id;
UPDATE public.course_lessons t SET new_archived_by = u.new_id FROM public.users u WHERE t.archived_by = u.id;
UPDATE public.assessments t SET new_archived_by = u.new_id FROM public.users u WHERE t.archived_by = u.id;
UPDATE public.assessment_attempts t SET new_user_id = u.new_id FROM public.users u WHERE t.user_id = u.id;
UPDATE public.quick_notes t SET new_user_id = u.new_id FROM public.users u WHERE t.user_id = u.id;
UPDATE public.audit_logs t SET new_user_id = u.new_id FROM public.users u WHERE t.user_id = u.id;

-- 5. Drop old foreign key constraints & columns, then rename new to old
ALTER TABLE public.users DROP CONSTRAINT users_archived_by_fkey;
ALTER TABLE public.companies DROP CONSTRAINT fk_companies_archived_by;
ALTER TABLE public.user_approvals DROP CONSTRAINT user_approvals_user_id_fkey, DROP CONSTRAINT user_approvals_approved_by_fkey;
ALTER TABLE public.user_notification_preferences DROP CONSTRAINT user_notification_preferences_user_id_fkey;
ALTER TABLE public.courses DROP CONSTRAINT courses_created_by_fkey, DROP CONSTRAINT courses_archived_by_fkey;
ALTER TABLE public.course_approvals DROP CONSTRAINT course_approvals_approver_id_fkey;
ALTER TABLE public.course_assignments DROP CONSTRAINT course_assignments_user_id_fkey, DROP CONSTRAINT course_assignments_assigned_by_fkey, DROP CONSTRAINT course_assignments_archived_by_fkey;
ALTER TABLE public.course_modules DROP CONSTRAINT course_modules_archived_by_fkey;
ALTER TABLE public.course_lessons DROP CONSTRAINT course_lessons_archived_by_fkey;
ALTER TABLE public.assessments DROP CONSTRAINT assessments_archived_by_fkey;
ALTER TABLE public.assessment_attempts DROP CONSTRAINT assessment_attempts_user_id_fkey;
ALTER TABLE public.quick_notes DROP CONSTRAINT quick_notes_user_id_fkey;
ALTER TABLE public.audit_logs DROP CONSTRAINT audit_logs_user_id_fkey;

-- Now drop old columns safely since FK constraints are gone
ALTER TABLE public.users DROP COLUMN archived_by;
ALTER TABLE public.companies DROP COLUMN archived_by;
ALTER TABLE public.user_approvals DROP COLUMN user_id, DROP COLUMN approved_by;
ALTER TABLE public.user_notification_preferences DROP COLUMN user_id;
ALTER TABLE public.courses DROP COLUMN created_by, DROP COLUMN archived_by;
ALTER TABLE public.course_approvals DROP COLUMN approver_id;
ALTER TABLE public.course_assignments DROP COLUMN user_id, DROP COLUMN assigned_by, DROP COLUMN archived_by;
ALTER TABLE public.course_modules DROP COLUMN archived_by;
ALTER TABLE public.course_lessons DROP COLUMN archived_by;
ALTER TABLE public.assessments DROP COLUMN archived_by;
ALTER TABLE public.assessment_attempts DROP COLUMN user_id;
ALTER TABLE public.quick_notes DROP COLUMN user_id;
ALTER TABLE public.audit_logs DROP COLUMN user_id;

-- Rename new columns to original names
ALTER TABLE public.users RENAME COLUMN new_archived_by TO archived_by;
ALTER TABLE public.companies RENAME COLUMN new_archived_by TO archived_by;
ALTER TABLE public.user_approvals RENAME COLUMN new_user_id TO user_id;
ALTER TABLE public.user_approvals RENAME COLUMN new_approved_by TO approved_by;
ALTER TABLE public.user_notification_preferences RENAME COLUMN new_user_id TO user_id;
ALTER TABLE public.courses RENAME COLUMN new_created_by TO created_by;
ALTER TABLE public.courses RENAME COLUMN new_archived_by TO archived_by;
ALTER TABLE public.course_approvals RENAME COLUMN new_approver_id TO approver_id;
ALTER TABLE public.course_assignments RENAME COLUMN new_user_id TO user_id;
ALTER TABLE public.course_assignments RENAME COLUMN new_assigned_by TO assigned_by;
ALTER TABLE public.course_assignments RENAME COLUMN new_archived_by TO archived_by;
ALTER TABLE public.course_modules RENAME COLUMN new_archived_by TO archived_by;
ALTER TABLE public.course_lessons RENAME COLUMN new_archived_by TO archived_by;
ALTER TABLE public.assessments RENAME COLUMN new_archived_by TO archived_by;
ALTER TABLE public.assessment_attempts RENAME COLUMN new_user_id TO user_id;
ALTER TABLE public.quick_notes RENAME COLUMN new_user_id TO user_id;
ALTER TABLE public.audit_logs RENAME COLUMN new_user_id TO user_id;

-- 6. Also drop old primary key on users, swap to UUID, recreate constraints
ALTER TABLE public.users DROP CONSTRAINT users_pkey CASCADE;
ALTER TABLE public.users DROP COLUMN id;
ALTER TABLE public.users RENAME COLUMN new_id TO id;
ALTER TABLE public.users ADD PRIMARY KEY (id);

-- Make users.id a foreign key to auth.users.id
ALTER TABLE public.users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Re-add mapping constraints from other tables
ALTER TABLE public.users ADD CONSTRAINT users_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES public.users(id);
ALTER TABLE public.companies ADD CONSTRAINT fk_companies_archived_by FOREIGN KEY (archived_by) REFERENCES public.users(id);
ALTER TABLE public.user_approvals ADD CONSTRAINT user_approvals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.user_approvals ADD CONSTRAINT user_approvals_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);
ALTER TABLE public.user_notification_preferences ADD CONSTRAINT user_notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.courses ADD CONSTRAINT courses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
ALTER TABLE public.courses ADD CONSTRAINT courses_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES public.users(id);
ALTER TABLE public.course_approvals ADD CONSTRAINT course_approvals_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES public.users(id);
ALTER TABLE public.course_assignments ADD CONSTRAINT course_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.course_assignments ADD CONSTRAINT course_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);
ALTER TABLE public.course_assignments ADD CONSTRAINT course_assignments_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES public.users(id);
ALTER TABLE public.course_modules ADD CONSTRAINT course_modules_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES public.users(id);
ALTER TABLE public.course_lessons ADD CONSTRAINT course_lessons_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES public.users(id);
ALTER TABLE public.assessments ADD CONSTRAINT assessments_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES public.users(id);
ALTER TABLE public.assessment_attempts ADD CONSTRAINT assessment_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.quick_notes ADD CONSTRAINT quick_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

COMMIT;
