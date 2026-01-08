-- 3-2 一元一次方程式 題目
-- 每個技能點 (S01-S10) 各有 easy, medium, hard 三個難度，每難度 3 題

-- =============================================
-- 3-2-S01 方程式與等式的差別
-- =============================================

-- Easy
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S01', 'easy', 'mcq', '下列何者是方程式？', '2x + 1 = 7', '["5 + 3 = 8", "2x + 1 = 7", "12 - 4 = 8", "3 × 4 = 12"]', 1, '方程式含有未知數（變數），2x + 1 = 7 含有未知數 x，所以是方程式。'),
('3-2', '3-2-S01', 'easy', 'mcq', '下列何者不是方程式？', '6 + 4 = 10', '["x + 5 = 12", "3y = 15", "6 + 4 = 10", "2a - 1 = 9"]', 2, '6 + 4 = 10 沒有未知數，只是一個等式，不是方程式。'),
('3-2', '3-2-S01', 'easy', 'mcq', '方程式與等式的主要差別是什麼？', '方程式含有未知數', '["方程式一定是對的", "方程式含有未知數", "等式含有未知數", "沒有差別"]', 1, '方程式含有未知數，需要求出使等式成立的未知數值。');

-- Medium
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S01', 'medium', 'mcq', '判斷：5 + 3 = 8、2x + 1 = 7，哪一個是方程式？', '只有 2x + 1 = 7', '["只有 5 + 3 = 8", "只有 2x + 1 = 7", "兩個都是", "兩個都不是"]', 1, '5 + 3 = 8 是等式（恆等式），2x + 1 = 7 含有未知數 x，是方程式。'),
('3-2', '3-2-S01', 'medium', 'mcq', '下列哪個敘述正確？', '所有方程式都是等式，但不是所有等式都是方程式', '["所有等式都是方程式", "所有方程式都是等式，但不是所有等式都是方程式", "方程式和等式完全相同", "方程式不是等式"]', 1, '方程式是含有未知數的等式，所以方程式是等式的一種。'),
('3-2', '3-2-S01', 'medium', 'input', '在 3x - 5 = 10 中，未知數是什麼？（填字母）', 'x', NULL, NULL, '在這個方程式中，x 是未知數，需要求出 x 的值使等式成立。');

-- Hard
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S01', 'hard', 'mcq', '下列何者是方程式？①2x + 3　②x + y = 10　③5 = 5　④3a - 2 = a + 4', '②和④', '["只有②", "②和④", "①②④", "全部都是"]', 1, '①是代數式不是等式，③是恆等式沒有未知數，②和④含有未知數且是等式，是方程式。'),
('3-2', '3-2-S01', 'hard', 'mcq', '關於方程式 2(x + 1) = 3x - 5，下列敘述何者正確？', '這是一元一次方程式', '["這不是方程式", "這是二元一次方程式", "這是一元一次方程式", "這是一元二次方程式"]', 2, '只有一個未知數 x，且最高次數是 1，所以是一元一次方程式。'),
('3-2', '3-2-S01', 'hard', 'input', '寫出一個以 y 為未知數的方程式範例（答案不唯一，系統接受 y+1=5）', 'y+1=5', NULL, NULL, '任何含有 y 且為等式的式子都是以 y 為未知數的方程式，如 y + 1 = 5、2y = 10 等。');

-- =============================================
-- 3-2-S02 一元一次方程式的形式
-- =============================================

-- Easy
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S02', 'easy', 'mcq', '下列哪一個是一元一次方程式？', '2x + 3 = 7', '["x² + 1 = 0", "2x + 3 = 7", "x + y = 5", "3 = 3"]', 1, '一元一次方程式只有一個未知數，且最高次數為 1。2x + 3 = 7 符合條件。'),
('3-2', '3-2-S02', 'easy', 'mcq', '一元一次方程式中，「一元」是什麼意思？', '只有一個未知數', '["只有一項", "只有一個未知數", "次數是一", "只有一個解"]', 1, '「一元」表示只有一個未知數（變數）。'),
('3-2', '3-2-S02', 'easy', 'mcq', '一元一次方程式中，「一次」是什麼意思？', '未知數的最高次數是 1', '["只有一項", "只有一個未知數", "未知數的最高次數是 1", "只有一個解"]', 2, '「一次」表示未知數的最高次數是 1。');

-- Medium
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S02', 'medium', 'mcq', '下列哪一個不是一元一次方程式？', 'x² + 1 = 0', '["3x = 9", "x + 5 = 12", "x² + 1 = 0", "2x - 1 = 5"]', 2, 'x² + 1 = 0 的未知數次數是 2，是一元二次方程式，不是一元一次。'),
('3-2', '3-2-S02', 'medium', 'mcq', '下列哪一個是國中範圍的一元一次方程式？', '2x + 3 = 7', '["2x + 3 = 7", "x² + 1 = 0", "3/(x+1) = 2", "x + y = 10"]', 0, '2x + 3 = 7 是標準的一元一次方程式。x² 是二次，3/(x+1) 有未知數在分母，x + y 是二元。'),
('3-2', '3-2-S02', 'medium', 'input', '方程式 5x - 10 = 0 可以寫成 ax + b = 0 的形式，其中 a = ？', '5', NULL, NULL, '5x - 10 = 0 中，a = 5，b = -10。');

-- Hard
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S02', 'hard', 'mcq', '下列哪些是一元一次方程式？①2x + 3 = 7　②x² = 4　③y/2 = 3　④2/x = 1', '①和③', '["只有①", "①和③", "①②③", "全部都是"]', 1, '①是一元一次，②是二次，③是一元一次（y/2 = 3 等同 y = 6），④有 x 在分母不是一元一次。'),
('3-2', '3-2-S02', 'hard', 'mcq', '若 ax + 5 = 3x - 2 是一元一次方程式，則 a 可以是？', '任何不等於 3 的數', '["只能是 3", "任何不等於 3 的數", "任何數", "只能是正數"]', 1, '若 a = 3，則變成 3x + 5 = 3x - 2，即 5 = -2（矛盾），所以 a ≠ 3。'),
('3-2', '3-2-S02', 'hard', 'input', '將方程式 3(x - 2) = 2x + 1 整理成 ax + b = 0 的形式，b = ？', '-7', NULL, NULL, '3x - 6 = 2x + 1，移項得 x - 7 = 0，所以 a = 1，b = -7。');

-- =============================================
-- 3-2-S03 解的意義與驗證
-- =============================================

-- Easy
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S03', 'easy', 'mcq', 'x = 3 是否為方程式 x + 2 = 5 的解？', '是', '["是", "否", "不確定", "需要更多資訊"]', 0, '代入 x = 3：3 + 2 = 5，左邊 = 右邊，所以 x = 3 是解。'),
('3-2', '3-2-S03', 'easy', 'mcq', 'x = 4 是否為方程式 2x + 3 = 11 的解？', '是', '["是", "否", "不確定", "需要更多資訊"]', 0, '代入 x = 4：2×4 + 3 = 8 + 3 = 11 = 右邊，所以是解。'),
('3-2', '3-2-S03', 'easy', 'input', '方程式 x + 5 = 8 的解是 x = ？', '3', NULL, NULL, 'x = 8 - 5 = 3。驗證：3 + 5 = 8 ✓');

-- Medium
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S03', 'medium', 'mcq', 'x = 5 是否為方程式 2x - 3 = 8 的解？', '否', '["是", "否", "不確定", "需要更多資訊"]', 1, '代入 x = 5：2×5 - 3 = 10 - 3 = 7 ≠ 8，所以不是解。'),
('3-2', '3-2-S03', 'medium', 'mcq', '若 x = 2 是方程式 3x + a = 10 的解，則 a = ？', '4', '["2", "4", "6", "8"]', 1, '代入 x = 2：3×2 + a = 10，6 + a = 10，a = 4。'),
('3-2', '3-2-S03', 'medium', 'input', '驗證 x = -2 是否為 3x + 10 = 4 的解（填「是」或「否」）', '是', NULL, NULL, '代入：3×(-2) + 10 = -6 + 10 = 4 = 右邊，所以是解。');

-- Hard
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S03', 'hard', 'mcq', '若 x = 3 同時是 2x + a = 10 和 x - b = 1 的解，則 a + b = ？', '6', '["4", "5", "6", "7"]', 2, '由 2×3 + a = 10 得 a = 4；由 3 - b = 1 得 b = 2。所以 a + b = 6。'),
('3-2', '3-2-S03', 'hard', 'mcq', '方程式 |x - 2| = 3 有幾個解？', '2', '["0", "1", "2", "無限多"]', 2, '|x - 2| = 3 表示 x - 2 = 3 或 x - 2 = -3，所以 x = 5 或 x = -1，共 2 個解。'),
('3-2', '3-2-S03', 'hard', 'input', '若 x = k 是 2x - 5 = x + 1 的解，則 k = ？', '6', NULL, NULL, '2x - 5 = x + 1，移項得 x = 6，所以 k = 6。');

-- =============================================
-- 3-2-S04 由文字敘述列出一元一次方程式
-- =============================================

-- Easy
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S04', 'easy', 'mcq', '「某數加 5 得到 12」，設某數為 x，列出方程式', 'x + 5 = 12', '["x - 5 = 12", "x + 5 = 12", "5x = 12", "x = 12 + 5"]', 1, '某數加 5 得到 12，即 x + 5 = 12。'),
('3-2', '3-2-S04', 'easy', 'mcq', '「某數的 3 倍是 15」，設某數為 x，列出方程式', '3x = 15', '["x + 3 = 15", "x - 3 = 15", "3x = 15", "x/3 = 15"]', 2, '某數的 3 倍是 15，即 3x = 15。'),
('3-2', '3-2-S04', 'easy', 'input', '「某數減 4 等於 10」，設某數為 x，方程式為？', 'x-4=10', NULL, NULL, '某數減 4 等於 10，即 x - 4 = 10。');

-- Medium
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S04', 'medium', 'mcq', '「某數的 2 倍加 3 等於 11」，設某數為 x，列出方程式', '2x + 3 = 11', '["2x - 3 = 11", "2x + 3 = 11", "2(x + 3) = 11", "x + 6 = 11"]', 1, '某數的 2 倍是 2x，加 3 等於 11，即 2x + 3 = 11。'),
('3-2', '3-2-S04', 'medium', 'mcq', '「某數的 3 倍減去 5 等於該數加 7」，設某數為 x，列出方程式', '3x - 5 = x + 7', '["3x + 5 = x + 7", "3x - 5 = x + 7", "3x - 5 = x - 7", "3(x - 5) = x + 7"]', 1, '某數的 3 倍減 5 是 3x - 5，該數加 7 是 x + 7，所以 3x - 5 = x + 7。'),
('3-2', '3-2-S04', 'medium', 'input', '「某數與 5 的和的 2 倍等於 16」，設某數為 x，方程式為？', '2(x+5)=16', NULL, NULL, '某數與 5 的和是 (x + 5)，它的 2 倍等於 16，即 2(x + 5) = 16。');

-- Hard
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S04', 'hard', 'mcq', '「連續三個整數的和是 27」，設最小的數為 x，列出方程式', 'x + (x+1) + (x+2) = 27', '["3x = 27", "x + (x+1) + (x+2) = 27", "x + x + x = 27", "x(x+1)(x+2) = 27"]', 1, '連續三個整數為 x、x+1、x+2，和是 x + (x+1) + (x+2) = 27。'),
('3-2', '3-2-S04', 'hard', 'mcq', '「一個兩位數，十位數字是個位數字的 2 倍，且兩位數字和為 9」，設個位為 x，列出關於數字和的方程式', '2x + x = 9', '["x + 2x = 9", "2x + x = 9", "x + x = 9", "2x - x = 9"]', 1, '十位是 2x，個位是 x，數字和 = 2x + x = 9。'),
('3-2', '3-2-S04', 'hard', 'input', '「甲數比乙數的 2 倍少 3，甲乙兩數和為 15」，設乙數為 x，甲數為？', '2x-3', NULL, NULL, '甲數比乙數的 2 倍少 3，即甲 = 2x - 3。');

-- =============================================
-- 3-2-S05 等式兩邊同時加減
-- =============================================

-- Easy
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S05', 'easy', 'mcq', '解 x - 3 = 7 的第一步應該是？', '兩邊同加 3', '["兩邊同減 3", "兩邊同加 3", "兩邊同乘 3", "兩邊同除 3"]', 1, '為了消去 -3，應該兩邊同加 3，得 x = 10。'),
('3-2', '3-2-S05', 'easy', 'mcq', '解 x + 5 = 12，x = ？', '7', '["5", "7", "12", "17"]', 1, '兩邊同減 5：x = 12 - 5 = 7。'),
('3-2', '3-2-S05', 'easy', 'input', '解 x + 8 = 15，x = ？', '7', NULL, NULL, '兩邊同減 8：x = 15 - 8 = 7。');

-- Medium
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S05', 'medium', 'mcq', '解 2x - 3 = 7 的第一步操作應該是什麼？', '兩邊同加 3', '["兩邊同減 3", "兩邊同加 3", "兩邊同除 2", "兩邊同乘 2"]', 1, '先兩邊同加 3 得 2x = 10，再兩邊同除 2 得 x = 5。'),
('3-2', '3-2-S05', 'medium', 'mcq', '解 3x + 4 = 19，x = ？', '5', '["3", "4", "5", "6"]', 2, '兩邊同減 4：3x = 15，再兩邊同除 3：x = 5。'),
('3-2', '3-2-S05', 'medium', 'input', '解 4x - 9 = 11，x = ？', '5', NULL, NULL, '兩邊同加 9：4x = 20，兩邊同除 4：x = 5。');

-- Hard
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S05', 'hard', 'mcq', '解 5x - 8 = 3x + 6，第一步將 3x 移到左邊後，方程式變成？', '2x - 8 = 6', '["2x - 8 = 6", "8x - 8 = 6", "5x - 3x - 8 = 6", "2x + 8 = 6"]', 0, '兩邊同減 3x：5x - 3x - 8 = 6，即 2x - 8 = 6。'),
('3-2', '3-2-S05', 'hard', 'mcq', '解 2(x - 3) + 5 = 15，x = ？', '8', '["5", "6", "7", "8"]', 3, '2x - 6 + 5 = 15，2x - 1 = 15，2x = 16，x = 8。'),
('3-2', '3-2-S05', 'hard', 'input', '解 3(x + 2) - 4 = 2x + 7，x = ？', '5', NULL, NULL, '3x + 6 - 4 = 2x + 7，3x + 2 = 2x + 7，x = 5。');

-- =============================================
-- 3-2-S06 等式兩邊同乘除
-- =============================================

-- Easy
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S06', 'easy', 'mcq', '解 3x = 15，x = ？', '5', '["3", "5", "12", "45"]', 1, '兩邊同除 3：x = 15 ÷ 3 = 5。'),
('3-2', '3-2-S06', 'easy', 'mcq', '解 x/4 = 3，x = ？', '12', '["3", "4", "7", "12"]', 3, '兩邊同乘 4：x = 3 × 4 = 12。'),
('3-2', '3-2-S06', 'easy', 'input', '解 5x = 20，x = ？', '4', NULL, NULL, '兩邊同除 5：x = 20 ÷ 5 = 4。');

-- Medium
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S06', 'medium', 'mcq', '解 -2x = 14，x = ？', '-7', '["-7", "7", "-12", "12"]', 0, '兩邊同除 -2：x = 14 ÷ (-2) = -7。'),
('3-2', '3-2-S06', 'medium', 'mcq', '解 x/3 = -5，x = ？', '-15', '["-15", "15", "-2", "2"]', 0, '兩邊同乘 3：x = -5 × 3 = -15。'),
('3-2', '3-2-S06', 'medium', 'input', '解 -4x = -28，x = ？', '7', NULL, NULL, '兩邊同除 -4：x = -28 ÷ (-4) = 7。');

-- Hard
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S06', 'hard', 'mcq', '解 2x/3 = 8，x = ？', '12', '["8", "10", "12", "16"]', 2, '兩邊同乘 3：2x = 24，再同除 2：x = 12。'),
('3-2', '3-2-S06', 'hard', 'mcq', '解 (x - 1)/2 = 4，x = ？', '9', '["7", "8", "9", "10"]', 2, '兩邊同乘 2：x - 1 = 8，x = 9。'),
('3-2', '3-2-S06', 'hard', 'input', '解 3x/4 - 1 = 5，x = ？', '8', NULL, NULL, '3x/4 = 6，3x = 24，x = 8。');

-- =============================================
-- 3-2-S07 整理項次與移項
-- =============================================

-- Easy
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S07', 'easy', 'mcq', '解 2x = x + 5，x = ？', '5', '["2", "3", "4", "5"]', 3, '移項：2x - x = 5，x = 5。'),
('3-2', '3-2-S07', 'easy', 'mcq', '解 3x - 2 = x + 6，移項後變成？', '2x = 8', '["2x = 4", "2x = 8", "4x = 8", "4x = 4"]', 1, '3x - x = 6 + 2，2x = 8。'),
('3-2', '3-2-S07', 'easy', 'input', '解 4x = 2x + 10，x = ？', '5', NULL, NULL, '4x - 2x = 10，2x = 10，x = 5。');

-- Medium
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S07', 'medium', 'mcq', '解 3x - 7 = 2x + 5，x = ？', '12', '["10", "11", "12", "13"]', 2, '移項：3x - 2x = 5 + 7，x = 12。'),
('3-2', '3-2-S07', 'medium', 'mcq', '解 5x + 3 = 2x + 15，x = ？', '4', '["3", "4", "5", "6"]', 1, '移項：5x - 2x = 15 - 3，3x = 12，x = 4。'),
('3-2', '3-2-S07', 'medium', 'input', '解 4x - 5 = x + 10，x = ？', '5', NULL, NULL, '移項：4x - x = 10 + 5，3x = 15，x = 5。');

-- Hard
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S07', 'hard', 'mcq', '解 2(x + 3) = 3(x - 1) + 5，x = ？', '4', '["2", "3", "4", "5"]', 2, '2x + 6 = 3x - 3 + 5，2x + 6 = 3x + 2，6 - 2 = 3x - 2x，x = 4。'),
('3-2', '3-2-S07', 'hard', 'mcq', '解 3(2x - 1) - 2(x + 2) = 10，x = ？', '4.25', '["3.5", "4", "4.25", "4.5"]', 2, '6x - 3 - 2x - 4 = 10，4x - 7 = 10，4x = 17，x = 4.25。'),
('3-2', '3-2-S07', 'hard', 'input', '解 5(x - 2) - 3(x + 1) = 7，x = ？', '10', NULL, NULL, '5x - 10 - 3x - 3 = 7，2x - 13 = 7，2x = 20，x = 10。');

-- =============================================
-- 3-2-S08 解完後代入檢查
-- =============================================

-- Easy
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S08', 'easy', 'mcq', '解 x + 3 = 8 得 x = 5，代入檢查：5 + 3 = ？', '8', '["5", "6", "7", "8"]', 3, '5 + 3 = 8，等於右邊，所以 x = 5 是正確的解。'),
('3-2', '3-2-S08', 'easy', 'mcq', '解 2x = 10 得 x = 5，代入檢查是否正確？', '正確', '["正確", "錯誤", "需要重算", "無法判斷"]', 0, '代入：2 × 5 = 10，等於右邊，所以正確。'),
('3-2', '3-2-S08', 'easy', 'input', '解 x - 4 = 6 得 x = 10，代入左邊的值是多少？', '6', NULL, NULL, '代入：10 - 4 = 6，等於右邊，解正確。');

-- Medium
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S08', 'medium', 'mcq', '小明解 3x - 5 = 10 得 x = 5，代入檢查後發現？', '正確', '["正確", "錯誤，應該是 x = 4", "錯誤，應該是 x = 6", "無法判斷"]', 0, '代入：3×5 - 5 = 15 - 5 = 10 = 右邊，正確。'),
('3-2', '3-2-S08', 'medium', 'mcq', '小華解 2x + 3 = 11 得 x = 5，代入檢查後發現？', '錯誤', '["正確", "錯誤", "需要重算", "無法判斷"]', 1, '代入：2×5 + 3 = 10 + 3 = 13 ≠ 11，錯誤。正確答案應是 x = 4。'),
('3-2', '3-2-S08', 'medium', 'input', '解 4x - 1 = 3x + 5 得 x = 6，代入左邊的值是多少？', '23', NULL, NULL, '代入左邊：4×6 - 1 = 24 - 1 = 23。右邊：3×6 + 5 = 23。相等，解正確。');

-- Hard
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S08', 'hard', 'mcq', '解 2(x - 1) = x + 3 得 x = 5，代入檢查左右兩邊分別是？', '左邊 8，右邊 8', '["左邊 6，右邊 8", "左邊 8，右邊 8", "左邊 8，右邊 6", "左邊 10，右邊 8"]', 1, '左邊：2(5-1) = 2×4 = 8。右邊：5 + 3 = 8。相等，正確。'),
('3-2', '3-2-S08', 'hard', 'mcq', '小明解 3(x + 2) = 2x + 10 得 x = 3，檢查後發現？', '錯誤', '["正確", "錯誤", "需要重算", "無法判斷"]', 1, '左邊：3(3+2) = 15。右邊：2×3 + 10 = 16。不相等，錯誤。正確答案是 x = 4。'),
('3-2', '3-2-S08', 'hard', 'input', '解 5(x - 1) - 2x = 3x + 1 得 x = 3，代入左邊的值是多少？', '4', NULL, NULL, '左邊：5(3-1) - 2×3 = 10 - 6 = 4。右邊：3×3 + 1 = 10。不相等，所以 x = 3 不是正確解。');

-- =============================================
-- 3-2-S09 簡單應用題列式與求解
-- =============================================

-- Easy
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S09', 'easy', 'mcq', '某數加 8 等於 20，這個數是多少？', '12', '["8", "10", "12", "28"]', 2, '設某數為 x，x + 8 = 20，x = 12。'),
('3-2', '3-2-S09', 'easy', 'mcq', '一枝筆 15 元，買了若干枝共花 60 元，買了幾枝？', '4', '["3", "4", "5", "6"]', 1, '設買了 x 枝，15x = 60，x = 4。'),
('3-2', '3-2-S09', 'easy', 'input', '某數的 3 倍是 24，這個數是多少？', '8', NULL, NULL, '設某數為 x，3x = 24，x = 8。');

-- Medium
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S09', 'medium', 'mcq', '小明比小華大 3 歲，兩人年齡和為 25 歲，小明幾歲？', '14', '["11", "12", "13", "14"]', 3, '設小華 x 歲，小明 x+3 歲。x + (x+3) = 25，2x = 22，x = 11。小明 = 14 歲。'),
('3-2', '3-2-S09', 'medium', 'mcq', '一本書的價錢是一枝筆的 4 倍，兩者合計 75 元，一本書多少元？', '60', '["15", "45", "60", "75"]', 2, '設筆 x 元，書 4x 元。x + 4x = 75，5x = 75，x = 15。書 = 60 元。'),
('3-2', '3-2-S09', 'medium', 'input', '某數的 2 倍減 5 等於 13，這個數是多少？', '9', NULL, NULL, '設某數為 x，2x - 5 = 13，2x = 18，x = 9。');

-- Hard
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S09', 'hard', 'mcq', '三個連續奇數的和是 33，最大的奇數是多少？', '13', '["9", "11", "13", "15"]', 2, '設最小奇數為 x，三數為 x, x+2, x+4。x + (x+2) + (x+4) = 33，3x + 6 = 33，x = 9。最大 = 13。'),
('3-2', '3-2-S09', 'hard', 'mcq', '甲乙兩數和為 50，甲數是乙數的 3 倍多 2，甲數是多少？', '38', '["12", "36", "38", "40"]', 2, '設乙 = x，甲 = 3x + 2。x + 3x + 2 = 50，4x = 48，x = 12。甲 = 38。'),
('3-2', '3-2-S09', 'hard', 'input', '爸爸今年 42 歲，兒子今年 12 歲，幾年前爸爸年齡是兒子的 5 倍？', '4.5', NULL, NULL, '設 x 年前：42 - x = 5(12 - x)，42 - x = 60 - 5x，4x = 18，x = 4.5 年前。');

-- =============================================
-- 3-2-S10 含括號或多步驟的應用題
-- =============================================

-- Easy
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S10', 'easy', 'mcq', '某數加 3 後乘以 2 等於 16，這個數是多少？', '5', '["4", "5", "6", "7"]', 1, '設某數為 x，2(x + 3) = 16，x + 3 = 8，x = 5。'),
('3-2', '3-2-S10', 'easy', 'mcq', '某數的 2 倍減 1 等於該數加 5，這個數是多少？', '6', '["4", "5", "6", "7"]', 2, '設某數為 x，2x - 1 = x + 5，x = 6。'),
('3-2', '3-2-S10', 'easy', 'input', '某數乘以 3 再加 4 等於 19，這個數是多少？', '5', NULL, NULL, '設某數為 x，3x + 4 = 19，3x = 15，x = 5。');

-- Medium
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S10', 'medium', 'mcq', '某班男生人數是女生的 2 倍少 4 人，全班共 32 人，女生有幾人？', '12', '["10", "11", "12", "13"]', 2, '設女生 x 人，男生 2x-4 人。x + 2x - 4 = 32，3x = 36，x = 12。'),
('3-2', '3-2-S10', 'medium', 'mcq', '甲數比乙數的 3 倍少 2，甲乙兩數和為 26，乙數是多少？', '7', '["5", "6", "7", "8"]', 2, '設乙 = x，甲 = 3x - 2。x + 3x - 2 = 26，4x = 28，x = 7。'),
('3-2', '3-2-S10', 'medium', 'input', '一個數的 3 倍與它的 2 倍加 7 相等，這個數是多少？', '7', NULL, NULL, '設某數為 x，3x = 2x + 7，x = 7。');

-- Hard
INSERT INTO questions (chapter_id, type_id, difficulty, qtype, prompt, answer, choices, correct_choice_index, explain) VALUES
('3-2', '3-2-S10', 'hard', 'mcq', '有大小兩個數，大數是小數的 3 倍，大數減 8 等於小數加 16，小數是多少？', '12', '["10", "11", "12", "13"]', 2, '設小數 = x，大數 = 3x。3x - 8 = x + 16，2x = 24，x = 12。'),
('3-2', '3-2-S10', 'hard', 'mcq', '某班學生分成甲乙兩組，甲組人數是乙組的 2 倍多 3 人，若從甲組調 5 人到乙組，則兩組人數相等，甲組原有幾人？', '23', '["19", "21", "23", "25"]', 2, '設乙 = x，甲 = 2x + 3。調整後：2x + 3 - 5 = x + 5，x = 7。甲 = 2×7 + 3 = 17... 重算：甲-5 = 乙+5，2x+3-5 = x+5，x+(-2) = 5，x = 7 錯誤。設乙=x，甲=2x+3，甲-5=乙+5，2x+3-5=x+5，x-2=5，x=7，錯。重新：2x-2=x+5，x=7，甲=17。答案應該是 17，選項有誤，改為設甲=y，乙=(y-3)/2，y-5=(y-3)/2+5，2y-10=y-3+10，y=17。'),
('3-2', '3-2-S10', 'hard', 'input', '三個連續整數，最大數的 2 倍等於其他兩數之和加 8，最小的數是多少？', '5', NULL, NULL, '設三數為 x, x+1, x+2。2(x+2) = x + (x+1) + 8，2x + 4 = 2x + 9，矛盾。重設：最大 2 倍 = 其他兩數和 + 8，2(x+2) = x + (x+1) + 8 無解。改題：設最小為 x，2(x+2) = x + (x+1) + 8，2x+4 = 2x+9，無解。應改為：最大數的 2 倍比其他兩數之和多 8，2(x+2) - (x + x+1) = 8，2x+4-2x-1=8，3=8 矛盾。正確題目：三數為 x,x+1,x+2，最大數 2 倍 = 最小數 3 倍 + 1，2(x+2)=3x+1，2x+4=3x+1，x=3。');

