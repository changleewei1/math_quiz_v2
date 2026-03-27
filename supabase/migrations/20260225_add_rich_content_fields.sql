ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS prompt_content JSONB,
  ADD COLUMN IF NOT EXISTS explain_content JSONB,
  ADD COLUMN IF NOT EXISTS choices_content JSONB;

ALTER TABLE exam_questions
  ADD COLUMN IF NOT EXISTS prompt_content JSONB,
  ADD COLUMN IF NOT EXISTS explain_content JSONB,
  ADD COLUMN IF NOT EXISTS choices_content JSONB;

