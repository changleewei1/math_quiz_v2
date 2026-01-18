-- 建立品牌設定表（單例模式）
CREATE TABLE IF NOT EXISTS brand_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    brand_name TEXT NOT NULL DEFAULT '名貫補習班',
    logo_url TEXT,
    font_family TEXT DEFAULT 'var(--font-noto-serif-tc), serif',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入預設值
INSERT INTO brand_settings (id, brand_name, logo_url, font_family)
VALUES ('default', '名貫補習班', '/Black and White Circle Business Logo.png', 'var(--font-noto-serif-tc), serif')
ON CONFLICT (id) DO NOTHING;

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_brand_settings_id ON brand_settings(id);

-- 建立更新時間觸發器
-- 先刪除舊的 trigger（如果存在）
DROP TRIGGER IF EXISTS trigger_update_brand_settings_updated_at ON brand_settings;

-- 建立或替換函數
CREATE OR REPLACE FUNCTION update_brand_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 建立 trigger
CREATE TRIGGER trigger_update_brand_settings_updated_at
    BEFORE UPDATE ON brand_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_brand_settings_updated_at();

