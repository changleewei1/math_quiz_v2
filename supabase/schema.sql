-- 啟用必要的擴充功能
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 章節表
CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 題型表
CREATE TABLE IF NOT EXISTS question_types (
    id TEXT PRIMARY KEY,
    chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chapter_id, code)
);

-- 題目表
-- 建立 ENUM 類型（如果不存在）
DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE question_type_enum AS ENUM ('input', 'mcq', 'word');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    type_id TEXT NOT NULL REFERENCES question_types(id) ON DELETE CASCADE,
    difficulty difficulty_level NOT NULL,
    qtype question_type_enum NOT NULL,
    prompt TEXT NOT NULL,
    answer TEXT NOT NULL,
    choices JSONB,
    correct_choice_index INTEGER,
    equation TEXT,
    tags TEXT[],
    video_url TEXT,
    explain TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 自動更新 updated_at 的觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 索引
CREATE INDEX IF NOT EXISTS idx_questions_chapter_type ON questions(chapter_id, type_id);
CREATE INDEX IF NOT EXISTS idx_questions_is_active ON questions(is_active);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_question_types_chapter ON question_types(chapter_id);

-- 學生作答紀錄
DO $$ BEGIN
    CREATE TYPE session_mode AS ENUM ('diagnostic', 'practice');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS student_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT,
    mode session_mode NOT NULL,
    chapter_id TEXT REFERENCES chapters(id) ON DELETE SET NULL,
    type_id TEXT REFERENCES question_types(id) ON DELETE SET NULL,
    settings JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS question_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES student_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
    chapter_id TEXT,
    type_id TEXT,
    difficulty difficulty_level,
    qtype question_type_enum,
    prompt_snapshot TEXT,
    user_answer TEXT,
    selected_choice_index INTEGER,
    is_correct BOOLEAN NOT NULL,
    time_spent_sec INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_attempts_session ON question_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_attempts_question ON question_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_chapter_type ON question_attempts(chapter_id, type_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student ON student_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_mode ON student_sessions(mode);

