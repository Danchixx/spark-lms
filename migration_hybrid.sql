CREATE TABLE IF NOT EXISTS hybrid_lesson_responses (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id INT REFERENCES course_lessons(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  answer_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id, question_id)
);
