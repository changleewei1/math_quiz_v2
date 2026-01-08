# 老師系統設定指南

## 建立 teachers 表

### 方法 1：使用 Supabase Dashboard（推薦）

1. **登入 Supabase Dashboard**
   - 前往 [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - 登入您的帳號並選擇專案

2. **執行 SQL 腳本**
   - 在左側選單點擊 **「SQL Editor」**
   - 點擊 **「New query」** 建立新查詢
   - 開啟本專案的 `supabase/add_teachers.sql` 檔案
   - **複製全部內容**（Cmd/Ctrl + A，然後 Cmd/Ctrl + C）
   - **貼上到 SQL Editor**（Cmd/Ctrl + V）
   - 點擊右上角的 **「Run」** 按鈕，或按快捷鍵 `Cmd + Enter`（Mac）或 `Ctrl + Enter`（Windows）
   - 等待執行完成，應該會看到 "Success. No rows returned" 訊息

3. **驗證表是否建立成功**
   - 在 SQL Editor 中執行以下查詢：
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'teachers';
   ```
   - 應該會看到 `teachers` 表
   - 或使用 `supabase/check_teachers_table.sql` 檢查

### 方法 2：使用 Supabase CLI（進階）

如果您已安裝 Supabase CLI：

```bash
# 連結到您的 Supabase 專案
supabase link --project-ref your-project-ref

# 執行 SQL 檔案
supabase db push --file supabase/add_teachers.sql
```

## 驗證設定

執行完成後，您可以：

1. **檢查資料表**：
   - 在 Supabase Dashboard 左側選單點擊 **「Table Editor」**
   - 應該會看到 `teachers` 資料表

2. **檢查表結構**：
   - 點擊 `teachers` 表
   - 確認欄位包含：
     - `id` (UUID)
     - `username` (TEXT, UNIQUE)
     - `password_hash` (TEXT)
     - `nickname` (TEXT)
     - `is_active` (BOOLEAN)
     - `created_at` (TIMESTAMP)
     - `updated_at` (TIMESTAMP)

## 建立第一個老師帳號

### 方式 1：透過管理員後台（推薦）

1. 登入管理員後台 (`/admin/login`)
2. 點擊「老師管理」按鈕
3. 點擊「新增老師」
4. 填寫：
   - **帳號**：例如 `teacher001`
   - **密碼**：例如 `Teacher2024!`
   - **暱稱**：例如 `王老師`
   - **狀態**：啟用
5. 點擊「新增老師」

### 方式 2：直接在 Supabase 執行 SQL

```sql
-- 建立測試老師帳號
-- 密碼：Teacher2024! (SHA-256 hash: 需要計算)
INSERT INTO teachers (username, password_hash, nickname, is_active)
VALUES (
    'teacher001',
    'a1b2c3d4e5f6...',  -- 這裡需要填入 SHA-256 hash
    '王老師',
    true
);
```

**注意**：密碼需要使用 SHA-256 計算 hash。建議使用管理員後台新增，系統會自動處理密碼加密。

## 測試老師登入

1. **訪問首頁** (`/`)
2. **點擊「老師登入」**
3. **輸入帳號和密碼**
   - 帳號：`teacher001`
   - 密碼：`Teacher2024!`
4. **確認登入成功**
   - 應該會跳轉到 `/teacher` 頁面
   - 顯示老師暱稱和班級列表

## 環境變數設定

確認 `.env.local` 中包含（如果尚未設定）：

```env
# 老師認證相關（可選，有預設值）
TEACHER_COOKIE_NAME=teacher_session
TEACHER_COOKIE_SECRET=your-teacher-secret-at-least-32-chars
TEACHER_COOKIE_SECURE=false  # 開發環境設為 false，正式環境設為 true

# 如果未設定 TEACHER_COOKIE_SECRET，會使用 ADMIN_COOKIE_SECRET
ADMIN_COOKIE_SECRET=your-admin-secret-at-least-32-chars
```

## 故障排除

### 問題：找不到 teachers 表
**解決方案**：
1. 確認已在 Supabase SQL Editor 中執行 `supabase/add_teachers.sql`
2. 檢查執行結果是否有錯誤訊息
3. 使用 `supabase/check_teachers_table.sql` 驗證表是否存在

### 問題：無法新增老師
**解決方案**：
1. 確認已登入管理員後台
2. 檢查瀏覽器 Console 是否有錯誤
3. 確認所有必填欄位都已填寫
4. 檢查帳號是否已存在（帳號必須唯一）

### 問題：老師無法登入
**解決方案**：
1. 確認老師帳號狀態為「啟用」
2. 確認帳號和密碼正確
3. 檢查環境變數 `TEACHER_COOKIE_SECRET` 或 `ADMIN_COOKIE_SECRET` 是否設定
4. 確認 cookie 設定正確（開發環境 `TEACHER_COOKIE_SECURE=false`）

### 問題：登入後看不到班級
**解決方案**：
1. 確認已建立班級資料（在管理員後台建立）
2. 確認班級 `is_active = true`
3. 檢查 `/api/teacher/classes` API 是否正常運作

