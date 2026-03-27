-- =========================================================
-- 第 5 階段：後台權限與 CRM 資料表
-- =========================================================

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- lead_contact_logs
CREATE TABLE IF NOT EXISTS lead_contact_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('phone', 'line', 'in_person', 'other')),
  contact_result TEXT NOT NULL CHECK (contact_result IN (
    'no_answer',
    'interested',
    'not_interested',
    'booked_trial',
    'enrolled',
    'follow_up_later'
  )),
  summary TEXT NOT NULL,
  next_follow_up_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- trial_bookings
CREATE TABLE IF NOT EXISTS trial_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  trial_date TIMESTAMPTZ NOT NULL,
  course_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('booked', 'attended', 'absent', 'rescheduled', 'cancelled')),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- enrollment_records
CREATE TABLE IF NOT EXISTS enrollment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  enrolled_course TEXT NOT NULL,
  tuition_amount NUMERIC,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- leads 補充欄位
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMPTZ;

-- updated_at trigger function (若尚未存在)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lead_contact_logs_updated_at ON lead_contact_logs;
CREATE TRIGGER update_lead_contact_logs_updated_at BEFORE UPDATE ON lead_contact_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trial_bookings_updated_at ON trial_bookings;
CREATE TRIGGER update_trial_bookings_updated_at BEFORE UPDATE ON trial_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_enrollment_records_updated_at ON enrollment_records;
CREATE TRIGGER update_enrollment_records_updated_at BEFORE UPDATE ON enrollment_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_lead_contact_logs_lead ON lead_contact_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_contact_logs_next_follow_up ON lead_contact_logs(next_follow_up_at);
CREATE INDEX IF NOT EXISTS idx_trial_bookings_lead ON trial_bookings(lead_id);
CREATE INDEX IF NOT EXISTS idx_trial_bookings_status ON trial_bookings(status);
CREATE INDEX IF NOT EXISTS idx_enrollment_records_lead ON enrollment_records(lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up ON leads(next_follow_up_at);


