# 測試指南

本指南提供完整的測試步驟，幫助您驗證系統是否正常運作。

## 📋 測試項目清單

### 1. 資料庫測試
### 2. API 端點測試
### 3. 前端功能測試
### 4. 資料完整性測試

---

## 1️⃣ 資料庫測試

### 1.1 驗證章節和題型

在 Supabase SQL Editor 執行以下查詢：

```sql
-- 檢查章節
SELECT id, title, sort_order, is_active 
FROM chapters 
WHERE id IN ('3-1', '3-2', '3-3')
ORDER BY sort_order;

-- 預期結果：應該看到 3 筆資料
-- 3-1: 代數式
-- 3-2: 一元一次方程式
-- 3-3: 一元一次應用問題
```

```sql
-- 檢查題型數量
SELECT 
    c.title AS chapter_name,
    COUNT(qt.id) AS type_count
FROM chapters c
LEFT JOIN question_types qt ON c.id = qt.chapter_id
WHERE c.id IN ('3-1', '3-2', '3-3')
GROUP BY c.id, c.title
ORDER BY c.id;

-- 預期結果：
-- 3-1: 8 個題型
-- 3-2: 10 個題型
-- 3-3: 9 個題型
```

### 1.2 驗證題目數量

```sql
-- 檢查各章節題目數量
SELECT 
    c.id AS chapter_id,
    c.title AS chapter_name,
    COUNT(q.id) AS question_count
FROM chapters c
LEFT JOIN questions q ON c.id = q.chapter_id
WHERE c.id IN ('3-1', '3-2', '3-3')
GROUP BY c.id, c.title
ORDER BY c.id;

-- 預期結果：
-- 3-1: 72 題
-- 3-2: 90 題
-- 3-3: 81 題
-- 總計：243 題
```

```sql
-- 檢查各題型的題目數量
SELECT 
    qt.id AS type_id,
    qt.name AS type_name,
    COUNT(q.id) AS question_count,
    qt.chapter_id
FROM question_types qt
LEFT JOIN questions q ON qt.id = q.type_id
WHERE qt.chapter_id IN ('3-1', '3-2', '3-3')
GROUP BY qt.id, qt.name, qt.chapter_id
ORDER BY qt.chapter_id, qt.id;

-- 預期結果：每個題型應該有 9 題（3 easy + 3 medium + 3 hard）
```

```sql
-- 檢查難度分布
SELECT 
    chapter_id,
    difficulty,
    COUNT(*) AS count
FROM questions
WHERE chapter_id IN ('3-1', '3-2', '3-3')
GROUP BY chapter_id, difficulty
ORDER BY chapter_id, difficulty;

-- 預期結果：每個章節的每個難度應該有相同數量的題目
```

### 1.3 驗證題目資料完整性

```sql
-- 檢查是否有缺少必要欄位的題目
SELECT 
    id,
    chapter_id,
    type_id,
    difficulty,
    qtype,
    prompt,
    answer
FROM questions
WHERE chapter_id IN ('3-1', '3-2', '3-3')
  AND (prompt IS NULL OR prompt = '' OR answer IS NULL OR answer = '')
LIMIT 10;

-- 預期結果：應該沒有資料（所有題目都應該有 prompt 和 answer）
```

```sql
-- 檢查選擇題的選項是否正確
SELECT 
    id,
    type_id,
    difficulty,
    prompt,
    choices,
    correct_choice_index,
    answer
FROM questions
WHERE chapter_id IN ('3-1', '3-2', '3-3')
  AND qtype = 'mcq'
  AND (choices IS NULL OR correct_choice_index IS NULL)
LIMIT 10;

-- 預期結果：應該沒有資料（所有選擇題都應該有 choices 和 correct_choice_index）
```

---

## 2️⃣ API 端點測試

### 2.1 測試章節 API

在終端機執行以下命令（確保開發伺服器正在運行 `npm run dev`）：

```bash
# 測試取得所有章節
curl http://localhost:3000/api/chapters

# 預期結果：應該返回 JSON 格式的章節列表
```

或在瀏覽器打開：`http://localhost:3000/api/chapters`

### 2.2 測試題型 API

```bash
# 測試取得特定章節的題型
curl http://localhost:3000/api/types?chapter_id=3-1

# 預期結果：應該返回 3-1 章節的所有題型（8 個）
```

或在瀏覽器打開：`http://localhost:3000/api/types?chapter_id=3-1`

### 2.3 測試練習模式 API

```bash
# 測試建立練習會話
curl -X POST http://localhost:3000/api/practice/session \
  -H "Content-Type: application/json" \
  -d '{"chapterId":"3-1","typeId":"3-1-S01"}'

# 預期結果：應該返回 session 資料，包含題目
```

---

## 3️⃣ 前端功能測試

### 3.1 首頁測試

1. 啟動開發伺服器：`npm run dev`
2. 打開瀏覽器前往：`http://localhost:3000`
3. 檢查首頁是否正常顯示
4. 檢查是否有導航選單

### 3.2 弱點分析模式測試

1. 前往：`http://localhost:3000/diagnostic`
2. 選擇章節（例如：3-1 代數式）
3. 點擊「開始診斷」
4. 檢查是否正確載入題目
5. 回答幾題並提交
6. 檢查結果頁面是否顯示

### 3.3 題型練習模式測試

1. 前往：`http://localhost:3000/practice`
2. 選擇章節和題型
3. 開始練習
4. 測試答題流程
5. 檢查難度是否會根據答題情況調整

### 3.4 後台管理測試

1. 前往：`http://localhost:3000/admin/login`
2. 使用 `ADMIN_PASSWORD` 環境變數中設定的密碼登入
3. 檢查是否可以瀏覽題目列表
4. 測試新增題目功能
5. 測試編輯題目功能
6. 測試刪除題目功能
7. 測試匯出/匯入功能

---

## 4️⃣ 資料完整性測試腳本

建立一個 SQL 腳本來執行完整的資料完整性檢查：

```sql
-- =============================================
-- 資料完整性測試腳本
-- =============================================

-- 1. 檢查章節
SELECT '章節檢查' AS test_name;
SELECT COUNT(*) AS chapter_count FROM chapters WHERE id IN ('3-1', '3-2', '3-3');
-- 預期：3

-- 2. 檢查題型總數
SELECT '題型總數檢查' AS test_name;
SELECT COUNT(*) AS type_count FROM question_types WHERE chapter_id IN ('3-1', '3-2', '3-3');
-- 預期：27 (8+10+9)

-- 3. 檢查題目總數
SELECT '題目總數檢查' AS test_name;
SELECT COUNT(*) AS question_count FROM questions WHERE chapter_id IN ('3-1', '3-2', '3-3');
-- 預期：243 (72+90+81)

-- 4. 檢查每個題型的題目數量
SELECT '題型題目數量檢查' AS test_name;
SELECT 
    qt.id,
    qt.name,
    COUNT(q.id) AS question_count
FROM question_types qt
LEFT JOIN questions q ON qt.id = q.type_id
WHERE qt.chapter_id IN ('3-1', '3-2', '3-3')
GROUP BY qt.id, qt.name
HAVING COUNT(q.id) != 9
ORDER BY qt.id;
-- 預期：沒有資料（每個題型都應該有 9 題）

-- 5. 檢查難度分布
SELECT '難度分布檢查' AS test_name;
SELECT 
    chapter_id,
    difficulty,
    COUNT(*) AS count
FROM questions
WHERE chapter_id IN ('3-1', '3-2', '3-3')
GROUP BY chapter_id, difficulty
ORDER BY chapter_id, difficulty;
-- 預期：每個章節的每個難度都有適當的題目

-- 6. 檢查選擇題的選項
SELECT '選擇題檢查' AS test_name;
SELECT COUNT(*) AS mcq_without_choices
FROM questions
WHERE qtype = 'mcq'
  AND (choices IS NULL OR correct_choice_index IS NULL);
-- 預期：0

-- 7. 檢查必填欄位
SELECT '必填欄位檢查' AS test_name;
SELECT COUNT(*) AS missing_required_fields
FROM questions
WHERE chapter_id IN ('3-1', '3-2', '3-3')
  AND (prompt IS NULL OR prompt = '' OR answer IS NULL OR answer = '');
-- 預期：0

SELECT '所有檢查完成！' AS status;
```

---

## 5️⃣ 快速測試清單

完成以下清單來確認系統正常運作：

### 資料庫
- [ ] 3 個章節都已建立
- [ ] 27 個題型都已建立（3-1: 8個, 3-2: 10個, 3-3: 9個）
- [ ] 243 題都已匯入（3-1: 72題, 3-2: 90題, 3-3: 81題）
- [ ] 每個題型都有 9 題（3 easy + 3 medium + 3 hard）
- [ ] 所有題目都有完整的資料（prompt, answer 等）

### API
- [ ] `/api/chapters` 可以正常取得章節
- [ ] `/api/types?chapter_id=3-1` 可以正常取得題型
- [ ] `/api/practice/session` 可以正常建立會話

### 前端
- [ ] 首頁正常顯示
- [ ] 弱點分析模式可以正常使用
- [ ] 題型練習模式可以正常使用
- [ ] 後台管理可以正常登入和管理題目

---

## 6️⃣ 常見問題排除

### 問題：題目數量不符合預期

**檢查方法：**
```sql
-- 查看實際題目數量
SELECT chapter_id, COUNT(*) 
FROM questions 
WHERE chapter_id IN ('3-1', '3-2', '3-3')
GROUP BY chapter_id;
```

**解決方法：**
1. 檢查 SQL 腳本是否全部執行成功
2. 檢查是否有錯誤訊息
3. 重新執行 `seed_questions_3-1.sql`、`seed_questions_3-2.sql`、`seed_questions_3-3.sql`

### 問題：某些題型沒有題目

**檢查方法：**
```sql
-- 查看沒有題目的題型
SELECT qt.id, qt.name, qt.chapter_id
FROM question_types qt
LEFT JOIN questions q ON qt.id = q.type_id
WHERE qt.chapter_id IN ('3-1', '3-2', '3-3')
  AND q.id IS NULL;
```

**解決方法：**
1. 確認題型 ID 正確（例如：3-1-S01, 3-2-S01 等）
2. 重新執行對應的題目匯入腳本

### 問題：API 無法連接 Supabase

**檢查方法：**
1. 確認 `.env.local` 中的 Supabase URL 和 Key 正確
2. 確認 Supabase 專案正在運行
3. 檢查瀏覽器控制台是否有錯誤訊息

**解決方法：**
1. 重新檢查 `ENV_SETUP.md` 的設定步驟
2. 確認環境變數已正確載入（重啟開發伺服器）

---

## 7️⃣ 自動化測試腳本（可選）

如果您想建立自動化測試，可以建立一個測試腳本檔案。但目前專案沒有配置測試框架，建議先完成手動測試。

---

## ✅ 測試完成

完成以上所有測試項目後，您的系統應該已經正常運作！

如有任何問題，請檢查：
1. Supabase 連線是否正常
2. 環境變數是否正確設定
3. SQL 腳本是否全部執行成功
4. 瀏覽器控制台是否有錯誤訊息

