ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS answer_md TEXT;

ALTER TABLE exam_questions
  ADD COLUMN IF NOT EXISTS answer_md TEXT;

