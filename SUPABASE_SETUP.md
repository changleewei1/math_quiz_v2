# Supabase 設定指南

## 方法一：使用 Supabase Dashboard（推薦）

### 步驟 1：登入 Supabase
1. 前往 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 登入您的帳號
3. 選擇您的專案（如果還沒有專案，請先建立一個新專案）

### 步驟 2：執行 schema.sql
1. 在左側選單點擊 **「SQL Editor」**
2. 點擊 **「New query」** 按鈕建立新查詢
3. 開啟本專案的 `supabase/schema.sql` 檔案
4. **複製全部內容**（Cmd/Ctrl + A，然後 Cmd/Ctrl + C）
5. **貼上到 SQL Editor**（Cmd/Ctrl + V）
6. 點擊右上角的 **「Run」** 按鈕，或按快捷鍵 `Cmd + Enter`（Mac）或 `Ctrl + Enter`（Windows）
7. 等待執行完成，應該會看到 "Success. No rows returned" 訊息

### 步驟 3：執行 seed.sql
1. 在 SQL Editor 中，點擊 **「New query」** 建立新的查詢（或清空現有內容）
2. 開啟本專案的 `supabase/seed.sql` 檔案
3. **複製全部內容**並**貼上到 SQL Editor**
4. 點擊 **「Run」** 執行
5. 確認執行成功

### 步驟 4：（可選）執行 seed_questions.sql
1. 同樣方式，開啟 `supabase/seed_questions.sql`
2. 複製全部內容並貼到 SQL Editor
3. 執行（此檔案較大，可能需要較長時間）

## 方法二：使用 Supabase CLI（進階）

如果您已安裝 Supabase CLI，可以使用以下指令：

```bash
# 連結到您的 Supabase 專案
supabase link --project-ref your-project-ref

# 執行 SQL 檔案
supabase db push --file supabase/schema.sql
supabase db push --file supabase/seed.sql
supabase db push --file supabase/seed_questions.sql
```

## 驗證設定

執行完成後，您可以：

1. **檢查資料表**：
   - 在 Supabase Dashboard 左側選單點擊 **「Table Editor」**
   - 應該會看到以下資料表：
     - `chapters`
     - `question_types`
     - `questions`
     - `student_sessions`
     - `question_attempts`

2. **檢查資料**：
   - 在 Table Editor 中點擊 `chapters` 資料表
   - 應該會看到 3 筆資料（3-1, 3-2, 3-3）
   - 點擊 `question_types` 應該會看到 8 筆資料（A1, A2, E, EPLUS, F, W1, W2, W3）
   - 如果執行了 `seed_questions.sql`，`questions` 資料表應該會有大量題目

## 常見問題

### Q: 執行時出現錯誤 "relation already exists"
**A:** 這表示資料表已經存在。您可以：
- 先刪除現有資料表（在 SQL Editor 執行 `DROP TABLE IF EXISTS ...`）
- 或直接跳過 schema.sql，只執行 seed.sql

### Q: 如何清空所有資料重新開始？
**A:** 在 SQL Editor 執行以下 SQL：

```sql
-- 注意：這會刪除所有資料！
DROP TABLE IF EXISTS question_attempts CASCADE;
DROP TABLE IF EXISTS student_sessions CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS question_types CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
```

然後重新執行 schema.sql 和 seed.sql

### Q: 執行 seed_questions.sql 時很慢
**A:** 這是正常的，因為檔案包含大量 INSERT 語句。請耐心等待，或分批執行。

## 取得 Supabase 連線資訊

執行完 SQL 後，您需要取得連線資訊：

1. 在 Supabase Dashboard 左側選單點擊 **「Project Settings」**
2. 點擊 **「API」** 分頁
3. 複製以下資訊：
   - **Project URL** → 這就是 `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → 這就是 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

將這些資訊填入 `.env.local` 檔案中。


