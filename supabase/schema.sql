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

-- =========================================================
-- 補習班招生神器系統 - 第 1 階段基礎資料層
-- =========================================================

-- Leads
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    parent_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    line_id TEXT,
    elementary_school TEXT NOT NULL,
    junior_high_school TEXT,
    source TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
        'new',
        'started_quiz',
        'finished_quiz',
        'contacted',
        'trial_booked',
        'enrolled'
    )),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz sessions
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    total_score NUMERIC,
    overall_level TEXT CHECK (overall_level IN ('A', 'B', 'C', 'D')),
    dimension_scores JSONB,
    weakness_summary TEXT,
    enrollment_cta TEXT,
    recommended_courses JSONB,
    recommended_videos JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions
CREATE TABLE IF NOT EXISTS admission_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt TEXT NOT NULL,
    prompt_md TEXT,
    image_url TEXT,
    choices JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    dimension TEXT NOT NULL CHECK (dimension IN (
        'number_sense',
        'algebra_logic',
        'word_problem',
        'geometry',
        'data_reasoning'
    )),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES admission_questions(id) ON DELETE CASCADE,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN,
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_weaknesses JSONB NOT NULL,
    cta_link TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    dimension TEXT NOT NULL CHECK (dimension IN (
        'number_sense',
        'algebra_logic',
        'word_problem',
        'geometry',
        'data_reasoning'
    )),
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at triggers
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quiz_sessions_updated_at ON quiz_sessions;
CREATE TRIGGER update_quiz_sessions_updated_at BEFORE UPDATE ON quiz_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admission_questions_updated_at ON admission_questions;
CREATE TRIGGER update_admission_questions_updated_at BEFORE UPDATE ON admission_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_lead_id ON quiz_sessions(lead_id);
CREATE INDEX IF NOT EXISTS idx_answers_session_id ON answers(session_id);
CREATE INDEX IF NOT EXISTS idx_questions_dimension_difficulty_active
    ON admission_questions(dimension, difficulty, is_active);
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON courses(is_active);
CREATE INDEX IF NOT EXISTS idx_videos_dimension_active ON videos(dimension, is_active);

-- =========================================================
-- 升國一 MVP 公開漏斗（2026-03-26）：作答與報告快照、試聽預約
-- 註：與既有 admission `answers`（UUID question）分表；試聽預約與 CRM `trial_bookings` 分表
-- =========================================================

ALTER TABLE quiz_sessions
  ADD COLUMN IF NOT EXISTS study_suggestions JSONB,
  ADD COLUMN IF NOT EXISTS mvp_report_snapshot JSONB;

CREATE TABLE IF NOT EXISTS funnel_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN,
  dimension TEXT,
  concept_tag TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funnel_answers_session_id ON funnel_answers(session_id);

CREATE TABLE IF NOT EXISTS funnel_trial_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  note TEXT,
  overall_level TEXT,
  weak_dimensions JSONB,
  recommended_course TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funnel_trial_bookings_lead_id ON funnel_trial_bookings(lead_id);
CREATE INDEX IF NOT EXISTS idx_funnel_trial_bookings_created_at ON funnel_trial_bookings(created_at DESC);

