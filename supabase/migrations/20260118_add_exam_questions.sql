-- 會考弱點分析題庫（獨立表，避免與一般題庫混用）
CREATE TABLE IF NOT EXISTS exam_questions (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL CHECK (subject IN ('math', 'physics')),
    year INTEGER,
    code TEXT NOT NULL,
    description TEXT NOT NULL,
    options JSONB,
    answer JSONB NOT NULL,
    explanation TEXT,
    difficulty TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_exam_questions_subject_code ON exam_questions(subject, code);
CREATE INDEX IF NOT EXISTS idx_exam_questions_subject ON exam_questions(subject);

