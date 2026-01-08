-- 快速修復：刪除現有的 ENUM 類型（如果存在）
-- 注意：這會刪除使用這些類型的資料表，請謹慎使用

-- 如果資料表已存在，先刪除（可選）
-- DROP TABLE IF EXISTS question_attempts CASCADE;
-- DROP TABLE IF EXISTS student_sessions CASCADE;
-- DROP TABLE IF EXISTS questions CASCADE;

-- 刪除 ENUM 類型（如果存在）
DROP TYPE IF EXISTS difficulty_level CASCADE;
DROP TYPE IF EXISTS question_type_enum CASCADE;
DROP TYPE IF EXISTS session_mode CASCADE;

-- 現在可以重新執行 schema.sql 了


