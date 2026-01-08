-- 檢查和修復章節ID修改後的問題
-- 此腳本會檢查新舊章節的狀態，並修復不一致的情況

-- 1. 查看所有章節及其相關資料
SELECT 
  '=== 所有章節狀態 ===' as section,
  id,
  title,
  is_active,
  (SELECT COUNT(*) FROM question_types WHERE chapter_id = chapters.id) as type_count,
  (SELECT COUNT(*) FROM questions WHERE chapter_id = chapters.id) as question_count
FROM chapters
WHERE id LIKE '3-%'
ORDER BY id;

-- 2. 檢查是否有新舊章節同時存在
SELECT 
  '=== 章節ID衝突檢查 ===' as section,
  CASE 
    WHEN id LIKE '3-1%' THEN '3-1系列'
    WHEN id LIKE '3-2%' THEN '3-2系列'
    WHEN id LIKE '3-3%' THEN '3-3系列'
    ELSE '其他'
  END as chapter_group,
  id,
  title,
  is_active,
  created_at
FROM chapters
WHERE id LIKE '3-%'
ORDER BY chapter_group, id;

-- 3. 修復：將舊章節（3-1, 3-2, 3-3）設置為非活動狀態
-- 執行此部分前，請確認新章節（3-1-1等）已存在且有資料
UPDATE chapters 
SET is_active = false 
WHERE id IN ('3-1', '3-2', '3-3')
  AND is_active = true
  AND EXISTS (
    -- 只有當對應的新章節存在時才停用舊章節
    SELECT 1 FROM chapters c2 
    WHERE (c2.id = '3-1-1' AND chapters.id = '3-1')
       OR (c2.id LIKE '3-2-%' AND chapters.id = '3-2')
       OR (c2.id LIKE '3-3-%' AND chapters.id = '3-3')
  );

-- 4. 驗證修復結果
SELECT 
  '=== 修復後的章節狀態 ===' as section,
  id,
  title,
  is_active
FROM chapters
WHERE id LIKE '3-%'
ORDER BY id;

