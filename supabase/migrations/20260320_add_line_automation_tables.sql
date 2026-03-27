-- =========================================================
-- 第 6 階段：LINE 自動提醒與自動化任務
-- =========================================================

-- LINE 綁定欄位
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS line_user_id TEXT;

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS line_user_id TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_line_user_id ON profiles(line_user_id);
CREATE INDEX IF NOT EXISTS idx_leads_line_user_id ON leads(line_user_id);

-- LINE 訊息紀錄
CREATE TABLE IF NOT EXISTS line_message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('profile', 'lead')),
  target_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  line_user_id TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN (
    'follow_up_reminder',
    'trial_reminder',
    'post_trial_follow_up',
    'quiz_completion_follow_up',
    'custom'
  )),
  message_body TEXT NOT NULL,
  send_status TEXT NOT NULL CHECK (send_status IN ('pending', 'sent', 'failed', 'skipped')),
  provider_message_id TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_line_message_logs_type ON line_message_logs(message_type);
CREATE INDEX IF NOT EXISTS idx_line_message_logs_status ON line_message_logs(send_status);
CREATE INDEX IF NOT EXISTS idx_line_message_logs_target_profile ON line_message_logs(target_profile_id);
CREATE INDEX IF NOT EXISTS idx_line_message_logs_target_lead ON line_message_logs(target_lead_id);

-- 自動化任務紀錄
CREATE TABLE IF NOT EXISTS automation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'partial_success', 'failed')),
  scanned_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_runs_job_name ON automation_runs(job_name);
CREATE INDEX IF NOT EXISTS idx_automation_runs_started_at ON automation_runs(started_at);

-- 去重用：同日同類型提醒
CREATE UNIQUE INDEX IF NOT EXISTS uniq_line_message_daily
  ON line_message_logs (line_user_id, message_type, date_trunc('day', created_at));


