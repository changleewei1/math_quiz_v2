-- 為 questions 資料表新增 media 欄位（用於儲存題目圖片、圖表等媒體資源）

ALTER TABLE questions ADD COLUMN IF NOT EXISTS media jsonb;

-- 建立索引以提升查詢效能（可選）
CREATE INDEX IF NOT EXISTS idx_questions_media ON questions USING gin (media);

-- 新增註解說明欄位用途
COMMENT ON COLUMN questions.media IS '題目媒體資源（圖片、圖表等），格式：{"type": "image", "url": "...", "caption": "..."}';


