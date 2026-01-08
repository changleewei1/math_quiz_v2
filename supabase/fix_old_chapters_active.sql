-- 修復舊章節問題：將舊章節（3-1, 3-2, 3-3）設置為非活動狀態
-- 執行此腳本前，請確認新章節（3-1-1, 3-2-1, 3-2-2, 3-3-1）已存在

-- 1. 先查看所有章節狀態
SELECT 
  '=== 修復前的章節狀態 ===' as status,
  id,
  title,
  is_active,
  (SELECT COUNT(*) FROM question_types WHERE chapter_id = chapters.id) as type_count,
  (SELECT COUNT(*) FROM questions WHERE chapter_id = chapters.id) as question_count
FROM chapters
WHERE id LIKE '3-%'
ORDER BY id;

-- 2. 將舊章節設置為非活動狀態
UPDATE chapters 
SET is_active = false 
WHERE id IN ('3-1', '3-2', '3-3')
  AND is_active = true;

-- 3. 確認新章節是活動狀態
UPDATE chapters 
SET is_active = true 
WHERE id IN ('3-1-1', '3-2-1', '3-2-2', '3-3-1')
  AND is_active = false;

-- 4. 查看修復後的狀態
SELECT 
  '=== 修復後的章節狀態 ===' as status,
  id,
  title,
  is_active,
  (SELECT COUNT(*) FROM question_types WHERE chapter_id = chapters.id) as type_count,
  (SELECT COUNT(*) FROM questions WHERE chapter_id = chapters.id) as question_count
FROM chapters
WHERE id LIKE '3-%'
ORDER BY id;

