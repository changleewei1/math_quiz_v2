# 如何取得 Supabase 連線資訊

## 步驟 1：登入 Supabase Dashboard

1. 前往 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 使用您的帳號登入
3. 選擇您的專案（如果還沒有專案，請先建立一個新專案）

## 步驟 2：進入 Project Settings

1. 在左側選單中，點擊 **「Project Settings」**（齒輪圖示 ⚙️）
   - 通常位於選單最下方

## 步驟 3：開啟 API 分頁

1. 在 Project Settings 頁面中，點擊 **「API」** 分頁
   - 位於頁面頂部的分頁選單中

## 步驟 4：找到 Project URL

在 API 頁面中，您會看到：

### 📍 Project URL
- 位置：頁面頂部的 **「Project URL」** 區塊
- 格式：`https://xxxxxxxxxxxxx.supabase.co`
- 範例：`https://abcdefghijklmnop.supabase.co`
- **複製這個 URL**，這就是 `NEXT_PUBLIC_SUPABASE_URL`

### 🔑 Project API keys

在同一個頁面往下看，會看到 **「Project API keys」** 區塊：

#### anon public
- 這是公開的 API key，用於前端應用程式
- 點擊 key 旁邊的 **「眼睛圖示」👁️** 來顯示完整的 key
- 複製完整的 key（很長的字串，通常以 `eyJ` 開頭）
- 這就是 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### service_role（不要使用這個）
- 這個 key 有完整權限，**不要**用在前端應用程式
- 只用於後端服務

## 視覺化指引

```
Supabase Dashboard
├── 左側選單
│   └── Project Settings ⚙️  ← 點擊這裡
│       └── API 分頁 ← 點擊這裡
│           ├── Project URL ← 複製這個
│           └── Project API keys
│               └── anon public 👁️ ← 點擊眼睛，複製這個
```

## 完整範例

取得後，您的 `.env.local` 應該類似這樣：

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.很長的字串...
```

## 常見問題

### Q: 找不到 Project Settings？
**A:** 確保您已經選擇了一個專案。如果沒有專案，請先建立一個新專案。

### Q: 找不到 API 分頁？
**A:** 在 Project Settings 頁面頂部，應該有分頁選單（General, API, Database 等），點擊「API」分頁。

### Q: anon public key 顯示為隱藏？
**A:** 點擊 key 右側的「眼睛圖示」👁️ 來顯示完整 key。

### Q: 有多個專案怎麼辦？
**A:** 確保選擇正確的專案。可以在 Dashboard 首頁切換專案。


