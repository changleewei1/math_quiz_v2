-- 為 chapters 表新增年級（科目）和學期欄位
-- 此 migration 會為現有資料設定預設值：J1-MATH (國一數學) 和 upper (上學期)

-- 新增 grade_id 欄位
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS grade_id text;

-- 新增 term 欄位
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS term text;

-- 為現有資料設定預設值（國一數學上學期）
UPDATE chapters SET grade_id = 'J1-MATH' WHERE grade_id IS NULL;
UPDATE chapters SET term = 'upper' WHERE term IS NULL;

-- 設定非空約束（在設定預設值後）
ALTER TABLE chapters ALTER COLUMN grade_id SET NOT NULL;
ALTER TABLE chapters ALTER COLUMN term SET NOT NULL;

-- 為 grade_id 和 term 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_chapters_grade_id ON chapters(grade_id);
CREATE INDEX IF NOT EXISTS idx_chapters_term ON chapters(term);
CREATE INDEX IF NOT EXISTS idx_chapters_grade_term ON chapters(grade_id, term);

-- 說明：
-- grade_id 規範：
--   J1-MATH: 國一數學
--   J2-MATH: 國二數學
--   J3-MATH: 國三數學
--   J2-SCI: 國二理化
--   J3-SCI: 國三理化
--
-- term 規範：
--   upper: 上學期
--   lower: 下學期
--
-- 注意：現有資料全部視為「國一數學上學期」，後續需要根據實際情況人工調整或使用技能樹匯入功能修正


