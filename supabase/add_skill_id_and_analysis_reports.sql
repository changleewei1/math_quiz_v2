-- 新增題目 skill_id 與 daily_practice 分析報告表

-- 1) questions 表新增 skill_id
ALTER TABLE questions ADD COLUMN IF NOT EXISTS skill_id TEXT;

-- 2) 既有資料補齊 skill_id（最小可用：先用 type_id）
UPDATE questions
SET skill_id = type_id
WHERE skill_id IS NULL;

-- 3) 建立索引
CREATE INDEX IF NOT EXISTS idx_questions_skill_id ON questions(skill_id);

-- 4) 建立 analysis_reports 表（若不存在）
CREATE TABLE IF NOT EXISTS analysis_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES student_sessions(id) ON DELETE CASCADE,
    subject subject_type NOT NULL,
    mode quiz_mode NOT NULL,
    summary_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_reports_session ON analysis_reports(session_id);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_subject_mode ON analysis_reports(subject, mode);


