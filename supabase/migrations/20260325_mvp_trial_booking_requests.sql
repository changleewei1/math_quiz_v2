-- MVP 升國一漏斗：公開試聽預約（不依賴 leads / CRM）
CREATE TABLE IF NOT EXISTS mvp_trial_booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  note TEXT,
  overall_level TEXT,
  weak_dimensions TEXT,
  recommended_course TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mvp_trial_booking_requests_created_at
  ON mvp_trial_booking_requests (created_at DESC);

ALTER TABLE mvp_trial_booking_requests ENABLE ROW LEVEL SECURITY;

-- 僅允許寫入（前台表單）；查詢由 service role / 後台處理
CREATE POLICY mvp_trial_booking_requests_insert_anon
  ON mvp_trial_booking_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY mvp_trial_booking_requests_insert_authenticated
  ON mvp_trial_booking_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

GRANT INSERT ON mvp_trial_booking_requests TO anon, authenticated;
