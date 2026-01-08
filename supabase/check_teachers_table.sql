-- 檢查 teachers 表是否存在
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public' 
    AND table_name = 'teachers';

-- 如果表存在，顯示表結構
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'teachers'
ORDER BY ordinal_position;

-- 如果表存在，顯示記錄數
SELECT COUNT(*) as teacher_count FROM teachers;

