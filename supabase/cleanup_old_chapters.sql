-- 清理舊章節的腳本
-- 此腳本會將舊章節（3-1, 3-2, 3-3）設置為非活動狀態
-- 如果新章節（3-1-1, 3-2-1等）已存在，則刪除舊章節

-- 1. 首先查看當前章節狀態
SELECT '=== 當前章節狀態 ===' as info;
SELECT id, title, is_active, 
       (SELECT COUNT(*) FROM question_types WHERE chapter_id = chapters.id) as type_count,
       (SELECT COUNT(*) FROM questions WHERE chapter_id = chapters.id) as question_count
FROM chapters
WHERE id LIKE '3-%'
ORDER BY id;

-- 2. 檢查並設置舊章節為非活動狀態
UPDATE chapters 
SET is_active = false 
WHERE id IN ('3-1', '3-2', '3-3')
  AND is_active = true;

-- 3. 確認更新結果
SELECT '=== 更新後的章節狀態 ===' as info;
SELECT id, title, is_active 
FROM chapters
WHERE id IN ('3-1', '3-2', '3-3');

-- 2. 檢查新章節是否存在
-- 如果新章節存在，則可以安全刪除舊章節
-- 注意：由於外鍵約束，如果舊章節還有相關資料，刪除會失敗

-- 3. 嘗試刪除舊章節（如果沒有相關資料）
-- 注意：這會因為外鍵約束而失敗，如果還有題型或題目引用舊章節
-- DELETE FROM chapters WHERE id IN ('3-1', '3-2', '3-3');

-- 4. 查看當前所有章節的狀態
SELECT id, title, is_active, 
       (SELECT COUNT(*) FROM question_types WHERE chapter_id = chapters.id) as type_count,
       (SELECT COUNT(*) FROM questions WHERE chapter_id = chapters.id) as question_count
FROM chapters
ORDER BY sort_order;

-- 5. 查看是否有章節ID衝突（新舊章節同時存在）
SELECT 
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
ORDER BY id;

