-- 檢查是否還有舊章節（3-1, 3-2, 3-3）存在
SELECT id, title, is_active 
FROM chapters 
WHERE id IN ('3-1', '3-2', '3-3');

-- 如果上面查詢有結果，執行以下SQL來停用它們：
-- UPDATE chapters SET is_active = false WHERE id IN ('3-1', '3-2', '3-3');

