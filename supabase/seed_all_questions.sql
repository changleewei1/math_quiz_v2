-- =============================================
-- 完整題目匯入腳本
-- 包含 3-1、3-2、3-3 所有題目
-- 總計：72 + 90 + 81 = 243 題
-- =============================================

-- 首先確保章節和題型已經存在
-- 執行此腳本前，請先執行 seed.sql 或 update_3-1_to_3-3.sql

-- 清除舊題目（可選，如果要重新匯入）
-- DELETE FROM questions WHERE chapter_id IN ('3-1', '3-2', '3-3');

-- =============================================
-- 匯入 3-1 代數式題目 (72題)
-- =============================================
\i seed_questions_3-1.sql

-- =============================================
-- 匯入 3-2 一元一次方程式題目 (90題)
-- =============================================
\i seed_questions_3-2.sql

-- =============================================
-- 匯入 3-3 一元一次應用問題題目 (81題)
-- =============================================
\i seed_questions_3-3.sql

-- =============================================
-- 驗證匯入結果
-- =============================================
SELECT '題目匯入完成！' AS message;

SELECT 
    c.id AS chapter_id,
    c.title AS chapter_name,
    COUNT(q.id) AS question_count
FROM chapters c
LEFT JOIN questions q ON c.id = q.chapter_id
WHERE c.id IN ('3-1', '3-2', '3-3')
GROUP BY c.id, c.title
ORDER BY c.id;

SELECT 
    qt.id AS type_id,
    qt.name AS type_name,
    COUNT(q.id) AS question_count
FROM question_types qt
LEFT JOIN questions q ON qt.id = q.type_id
WHERE qt.chapter_id IN ('3-1', '3-2', '3-3')
GROUP BY qt.id, qt.name
ORDER BY qt.id;

SELECT 
    difficulty,
    COUNT(*) AS count
FROM questions
WHERE chapter_id IN ('3-1', '3-2', '3-3')
GROUP BY difficulty
ORDER BY difficulty;

