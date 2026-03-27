-- MVP 升國一漏斗：正式寫入測驗／作答／報告快照／試聽預約（與既有 admission `answers` 表分離）

-- quiz_sessions：補齊報告欄位
ALTER TABLE quiz_sessions
  ADD COLUMN IF NOT EXISTS study_suggestions JSONB,
  ADD COLUMN IF NOT EXISTS mvp_report_snapshot JSONB;

COMMENT ON COLUMN quiz_sessions.study_suggestions IS '學習建議字串陣列（JSON）';
COMMENT ON COLUMN quiz_sessions.mvp_report_snapshot IS '完整 MVP 報告 JSON，供 /report 還原 UI';

-- 漏斗作答：question_id 為題庫字串 id（如 ns1），非 admission_questions UUID
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

-- 公開漏斗試聽預約（與後台 CRM 之 trial_bookings 分表，避免 schema 衝突）
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

ALTER TABLE funnel_trial_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY funnel_trial_bookings_insert_anon
  ON funnel_trial_bookings FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY funnel_trial_bookings_insert_authenticated
  ON funnel_trial_bookings FOR INSERT TO authenticated WITH CHECK (true);

GRANT INSERT ON funnel_trial_bookings TO anon, authenticated;
