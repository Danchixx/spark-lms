-- ============================================================
-- Migration: Support multiple question types in assessments
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Add question_type to assessment_questions
ALTER TABLE public.assessment_questions
ADD COLUMN IF NOT EXISTS question_type character varying NOT NULL DEFAULT 'multiple_choice';

-- 2. Add correct_answers (JSON array) for identification/enumeration
ALTER TABLE public.assessment_questions
ADD COLUMN IF NOT EXISTS correct_answers jsonb DEFAULT '[]'::jsonb;

-- 3. Add text_answer to attempt_answers for free-text question types
ALTER TABLE public.attempt_answers
ADD COLUMN IF NOT EXISTS text_answer text;
