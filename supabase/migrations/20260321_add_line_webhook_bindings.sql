-- =========================================================
-- 第 6 階段：LINE webhook 綁定流程
-- =========================================================

-- LINE 身分綁定表
CREATE TABLE IF NOT EXISTS line_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id TEXT NOT NULL UNIQUE,
  target_type TEXT NOT NULL CHECK (target_type IN ('profile', 'lead')),
  target_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_line_identities_target ON line_identities(target_type, target_id);

-- 綁定碼表
CREATE TABLE IF NOT EXISTS line_bind_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  target_type TEXT NOT NULL CHECK (target_type IN ('profile', 'lead')),
  target_id UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_line_bind_tokens_target ON line_bind_tokens(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_line_bind_tokens_expires ON line_bind_tokens(expires_at);


