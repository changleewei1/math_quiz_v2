-- 建立 student_recipients 表
CREATE TABLE IF NOT EXISTS student_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('parent', 'teacher')),
    line_user_id TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, role, line_user_id)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_recipients_student ON student_recipients(student_id);
CREATE INDEX IF NOT EXISTS idx_recipients_active ON student_recipients(is_active);
CREATE INDEX IF NOT EXISTS idx_recipients_line_user ON student_recipients(line_user_id);

-- 建立 Supabase Storage bucket（如果不存在）
-- 注意：這需要在 Supabase Dashboard 中手動建立，或使用 Supabase CLI
-- 建立 bucket: reports
-- 設定為 public 或使用 signed URL

