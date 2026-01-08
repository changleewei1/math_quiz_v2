-- 更新章節名稱
-- 3-1: 一元一次式化簡
-- 3-2: 一元一次方程式計算
-- 3-3: 一元一次方程式應用問題

UPDATE chapters SET title = '一元一次式化簡' WHERE id = '3-1';
UPDATE chapters SET title = '一元一次方程式計算' WHERE id = '3-2';
UPDATE chapters SET title = '一元一次方程式應用問題' WHERE id = '3-3';

-- 驗證更新
SELECT id, title, sort_order FROM chapters WHERE id IN ('3-1', '3-2', '3-3') ORDER BY sort_order;

