ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS prompt_md TEXT,
  ADD COLUMN IF NOT EXISTS explain_md TEXT;

ALTER TABLE exam_questions
  ADD COLUMN IF NOT EXISTS description_md TEXT,
  ADD COLUMN IF NOT EXISTS explanation_md TEXT;

