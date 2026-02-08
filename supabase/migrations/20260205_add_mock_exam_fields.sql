ALTER TABLE exam_questions
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS exam_year INTEGER,
  ADD COLUMN IF NOT EXISTS question_no INTEGER,
  ADD COLUMN IF NOT EXISTS order_index INTEGER,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE exam_questions
SET source = 'CAP'
WHERE source IS NULL;

UPDATE exam_questions
SET exam_year = year
WHERE exam_year IS NULL AND year IS NOT NULL;

UPDATE exam_questions
SET order_index = question_no
WHERE order_index IS NULL AND question_no IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_exam_questions_unique_no
  ON exam_questions(source, subject, exam_year, question_no)
  WHERE question_no IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_exam_questions_unique_order
  ON exam_questions(source, subject, exam_year, order_index)
  WHERE order_index IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_exam_questions_subject_year
  ON exam_questions(subject, exam_year);

ALTER TABLE student_sessions
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS quiz_mode TEXT,
  ADD COLUMN IF NOT EXISTS exam_year INTEGER,
  ADD COLUMN IF NOT EXISTS source TEXT;

CREATE INDEX IF NOT EXISTS idx_student_sessions_subject_mode
  ON student_sessions(subject, quiz_mode);

