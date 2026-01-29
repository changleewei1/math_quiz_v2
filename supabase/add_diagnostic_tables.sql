-- 診斷模式資料表（全部使用 text PK / FK）
CREATE TABLE IF NOT EXISTS diagnostic_sessions (
    id TEXT PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    scope_type TEXT NOT NULL CHECK (scope_type IN ('chapter', 'book', 'exam')),
    scope_ref JSONB NOT NULL,
    total_questions INTEGER NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    accuracy NUMERIC,
    score NUMERIC
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_student ON diagnostic_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_subject ON diagnostic_sessions(subject);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_scope_type ON diagnostic_sessions(scope_type);

CREATE TABLE IF NOT EXISTS diagnostic_answers (
    id TEXT PRIMARY KEY,
    diagnostic_session_id TEXT NOT NULL REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE SET NULL,
    chapter_id TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    user_answer JSONB,
    time_spent_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_answers_session ON diagnostic_answers(diagnostic_session_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_answers_question ON diagnostic_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_answers_chapter ON diagnostic_answers(chapter_id);

CREATE TABLE IF NOT EXISTS diagnostic_results (
    id TEXT PRIMARY KEY,
    diagnostic_session_id TEXT NOT NULL REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
    overall_summary JSONB NOT NULL,
    chapter_summary JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_results_session ON diagnostic_results(diagnostic_session_id);

CREATE TABLE IF NOT EXISTS remediation_actions (
    id TEXT PRIMARY KEY,
    diagnostic_session_id TEXT NOT NULL REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE SET NULL,
    chapter_id TEXT NOT NULL,
    assigned_by_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('practice', 'video', 'worksheet', 'custom')),
    action_payload JSONB NOT NULL,
    status TEXT DEFAULT 'assigned',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_remediation_actions_session ON remediation_actions(diagnostic_session_id);
CREATE INDEX IF NOT EXISTS idx_remediation_actions_student ON remediation_actions(student_id);

