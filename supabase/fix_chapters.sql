-- 快速修復：將舊章節設置為非活動狀態
-- 執行此腳本後，舊章節（3-1, 3-2, 3-3）將不會出現在前端頁面

-- 1. 將舊章節設置為非活動狀態
UPDATE chapters 
SET is_active = false 
WHERE id IN ('3-1', '3-2', '3-3')
  AND is_active = true;

-- 2. 查看結果
SELECT 
  id,
  title,
  is_active,
  (SELECT COUNT(*) FROM question_types WHERE chapter_id = chapters.id) as type_count,
  (SELECT COUNT(*) FROM questions WHERE chapter_id = chapters.id) as question_count
FROM chapters
WHERE id LIKE '3-%'
ORDER BY id;

