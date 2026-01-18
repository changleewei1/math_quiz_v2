-- 弱點分析模式矩陣 Migration
-- 為 student_sessions 表新增 subject、mode（新模式）、scope_id 欄位

-- 建立新的模式 enum（擴充原有的 session_mode）
DO $$ BEGIN
    CREATE TYPE quiz_mode AS ENUM (
        'exam_term',        -- 段考弱點分析
        'mock_exam',        -- 模擬考弱點分析
        'daily_practice',   -- 平常弱點分析
        'speed_training',   -- 速度專項
        'error_diagnosis',  -- 錯誤類型診斷
        'teacher_diagnosis' -- 教師診斷
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 建立科目 enum
DO $$ BEGIN
    CREATE TYPE subject_type AS ENUM ('math', 'science');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 為 student_sessions 表新增欄位
ALTER TABLE student_sessions ADD COLUMN IF NOT EXISTS subject subject_type;
ALTER TABLE student_sessions ADD COLUMN IF NOT EXISTS quiz_mode quiz_mode;
ALTER TABLE student_sessions ADD COLUMN IF NOT EXISTS scope_id TEXT;

-- 為現有資料設定預設值（保持向後相容）
UPDATE student_sessions 
SET 
    subject = 'math',
    quiz_mode = 'daily_practice'
WHERE subject IS NULL OR quiz_mode IS NULL;

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_sessions_subject ON student_sessions(subject);
CREATE INDEX IF NOT EXISTS idx_sessions_quiz_mode ON student_sessions(quiz_mode);
CREATE INDEX IF NOT EXISTS idx_sessions_scope ON student_sessions(scope_id);

-- 說明：
-- subject: 'math' = 數學, 'science' = 理化
-- quiz_mode: 
--   - exam_term: 段考弱點分析
--   - mock_exam: 模擬考弱點分析
--   - daily_practice: 平常弱點分析（預設）
--   - speed_training: 速度專項
--   - error_diagnosis: 錯誤類型診斷
--   - teacher_diagnosis: 教師診斷（不開放給學生）
-- scope_id: 用於段考範圍或指定範圍（可為 null）


