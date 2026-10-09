-- Add ON DELETE CASCADE to course_modules
ALTER TABLE public.course_modules
  DROP CONSTRAINT IF EXISTS course_modules_course_id_fkey,
  ADD CONSTRAINT course_modules_course_id_fkey
    FOREIGN KEY (course_id)
    REFERENCES public.courses(id)
    ON DELETE CASCADE;

-- Add ON DELETE CASCADE to course_lessons
ALTER TABLE public.course_lessons
  DROP CONSTRAINT IF EXISTS course_lessons_module_id_fkey,
  ADD CONSTRAINT course_lessons_module_id_fkey
    FOREIGN KEY (module_id)
    REFERENCES public.course_modules(id)
    ON DELETE CASCADE;

-- Add ON DELETE CASCADE to course_assignments
ALTER TABLE public.course_assignments
  DROP CONSTRAINT IF EXISTS course_assignments_course_id_fkey,
  ADD CONSTRAINT course_assignments_course_id_fkey
    FOREIGN KEY (course_id)
    REFERENCES public.courses(id)
    ON DELETE CASCADE;

-- Add ON DELETE CASCADE to course_progress
ALTER TABLE public.course_progress
  DROP CONSTRAINT IF EXISTS course_progress_assignment_id_fkey,
  ADD CONSTRAINT course_progress_assignment_id_fkey
    FOREIGN KEY (assignment_id)
    REFERENCES public.course_assignments(id)
    ON DELETE CASCADE;

-- Add ON DELETE CASCADE to assessments
ALTER TABLE public.assessments
  DROP CONSTRAINT IF EXISTS assessments_course_id_fkey,
  ADD CONSTRAINT assessments_course_id_fkey
    FOREIGN KEY (course_id)
    REFERENCES public.courses(id)
    ON DELETE CASCADE;

-- Add ON DELETE CASCADE to assessment_questions
ALTER TABLE public.assessment_questions
  DROP CONSTRAINT IF EXISTS assessment_questions_assessment_id_fkey,
  ADD CONSTRAINT assessment_questions_assessment_id_fkey
    FOREIGN KEY (assessment_id)
    REFERENCES public.assessments(id)
    ON DELETE CASCADE;

-- Add ON DELETE CASCADE to assessment_choices
ALTER TABLE public.assessment_choices
  DROP CONSTRAINT IF EXISTS assessment_choices_question_id_fkey,
  ADD CONSTRAINT assessment_choices_question_id_fkey
    FOREIGN KEY (question_id)
    REFERENCES public.assessment_questions(id)
    ON DELETE CASCADE;
