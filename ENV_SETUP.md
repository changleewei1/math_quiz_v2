# 環境變數設定指南

## 步驟 1：建立 .env.local 檔案

如果還沒有 `.env.local` 檔案，請複製範例檔案：

```bash
cp .env.local.example .env.local
```

或者手動建立一個新檔案，命名為 `.env.local`

## 步驟 2：取得 Supabase 連線資訊

### 在 Supabase Dashboard 中：

1. **登入 Supabase Dashboard**
   - 前往 https://supabase.com/dashboard
   - 選擇您的專案

2. **取得 Project URL**
   - 點擊左側選單的 **「Project Settings」**（齒輪圖示）
   - 點擊 **「API」** 分頁
   - 在 **「Project URL」** 區塊，複製 URL
   - 格式類似：`https://xxxxxxxxxxxxx.supabase.co`

3. **取得 Anon Key**
   - 在同一個頁面（Project Settings → API）
   - 在 **「Project API keys」** 區塊
   - 找到 **「anon public」** 這個 key
   - 點擊旁邊的「眼睛」圖示顯示完整 key，然後複製
   - 格式類似：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（很長的字串）

## 步驟 3：編輯 .env.local 檔案

開啟 `.env.local` 檔案，填入以下資訊：

```env
# Supabase 設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.your-anon-key-here

# 後台管理密碼（請設定一個安全的密碼）
ADMIN_PASSWORD=5; xu4jo3

# Cookie 設定
ADMIN_COOKIE_NAME=admin_session
ADMIN_COOKIE_SECRET=your_secret_key_at_least_32_characters_long_please_make_it_random
ADMIN_COOKIE_SECURE=false
```

### 詳細說明：

1. **NEXT_PUBLIC_SUPABASE_URL**
   - 貼上從 Supabase 複製的 Project URL

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - 貼上從 Supabase 複製的 anon public key

3. **ADMIN_PASSWORD**
   - 設定後台登入密碼（例如：`MySecurePassword123!`）
   - 這個密碼用於 `/admin/login` 頁面

4. **ADMIN_COOKIE_NAME**
   - 保持預設值 `admin_session` 即可

5. **ADMIN_COOKIE_SECRET**
   - **重要**：必須至少 32 個字元
   - 建議使用隨機字串，例如：
     - 使用線上工具生成：https://randomkeygen.com/
     - 或使用命令列：`openssl rand -base64 32`
   - 範例：`a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

6. **ADMIN_COOKIE_SECURE**
   - 本機開發時設為 `false`
   - 上線到正式環境時設為 `true`

## 步驟 4：驗證設定

完成後，您的 `.env.local` 應該類似這樣：

```env
# Supabase 設定
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example_key_here

# 後台管理密碼
ADMIN_PASSWORD=MyAdminPassword123!

# Cookie 設定
ADMIN_COOKIE_NAME=admin_session
ADMIN_COOKIE_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
ADMIN_COOKIE_SECURE=false
```

## 步驟 5：測試連線

設定完成後，執行：

```bash
npm run dev
```

如果設定正確，應用程式應該可以正常啟動，並且可以連接到 Supabase。

## 常見問題

### Q: 如何快速生成 ADMIN_COOKIE_SECRET？
**A:** 在終端機執行：
```bash
openssl rand -base64 32
```
或使用線上工具：https://randomkeygen.com/

### Q: .env.local 檔案在哪裡？
**A:** 在專案根目錄，與 `package.json` 同一層。

### Q: 為什麼看不到 .env.local 檔案？
**A:** 因為 `.env.local` 在 `.gitignore` 中，某些編輯器預設會隱藏。您可以用文字編輯器直接開啟，或使用命令列：
```bash
cat .env.local
```

### Q: 修改 .env.local 後需要重啟嗎？
**A:** 是的，修改環境變數後需要重新啟動開發伺服器（`npm run dev`）。

### Q: 可以分享 .env.local 嗎？
**A:** **絕對不要！** `.env.local` 包含敏感資訊，永遠不要提交到 Git 或分享給他人。


