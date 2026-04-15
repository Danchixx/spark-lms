-- ============================================================
-- Customer Service Pro – Module 2 Quiz (Handling Complaints)
-- Questions & Choices Seed
-- ============================================================

INSERT INTO assessment_questions (id, assessment_id, question_text, position) VALUES
  (11, 7, 'What is the "First Rule" of de-escalating an angry customer?', 1),
  (12, 7, 'Which of the following is an example of an "empathy statement"?', 2),
  (13, 7, 'If a customer is shouting, what is the best way to handle your own tone of voice?', 3),
  (14, 7, 'What does the "L" stand for in the LAST method of complaint resolution?', 4),
  (15, 7, 'Why is it important to "summarize the resolution" at the end of the interaction?', 5);

-- Ensure the ID sequence is updated
SELECT setval('assessment_questions_id_seq', (SELECT MAX(id) FROM assessment_questions));

INSERT INTO assessment_choices (id, question_id, choice_text, is_correct) VALUES
  -- Q11: First Rule - Stay calm
  (41, 11, 'Interrupt them carefully to correct facts', false),
  (42, 11, 'Stay calm and do not take the anger personally', true),
  (43, 11, 'Transfer them to a manager immediately', false),
  (44, 11, 'Match their energy so they know you are serious', false),
  -- Q12: Empathy Statement
  (45, 12, '"I understand how frustrating this situation must be for you."', true),
  (46, 12, '"Our policy clearly states that we cannot offer refunds."', false),
  (47, 12, '"You are being very loud, please quiet down."', false),
  (48, 12, '"This is actually a very common issue that happens to everyone."', false),
  -- Q13: Tone of voice
  (49, 13, 'Speak louder so you can be heard over them', false),
  (50, 13, 'Maintain a soft, steady, and professional volume', true),
  (51, 13, 'Use a sarcastic tone to de-escalate tension', false),
  (52, 13, 'Stop speaking entirely until they finish shouting', false),
  -- Q14: LAST method - Listen
  (53, 14, 'Learn',    false),
  (54, 14, 'Leverage',  false),
  (55, 14, 'Listen',    true),
  (56, 14, 'Launch',    false),
  -- Q15: Summarize resolution
  (57, 15, 'To make the call longer for metrics',                        false),
  (58, 15, 'To ensure both you and the customer have clear expectations', true),
  (59, 15, 'To convince the customer to buy another product',            false),
  (60, 15, 'To show the customer that you were right all along',         false);

-- Ensure the ID sequence is updated
SELECT setval('assessment_choices_id_seq', (SELECT MAX(id) FROM assessment_choices));
