# 國一數題庫系統 v2

一元一次方程式練習系統，使用 Next.js 14+ App Router、TypeScript、Tailwind CSS 和 Supabase 建置。

## 功能特色

- **弱點分析模式**：快速檢測學習弱點，獲得個人化建議
- **題型練習模式**：針對特定題型進行系統化練習，包含難度升降機制
- **後台管理**：完整的題庫管理系統，支援新增、編輯、刪除、匯出/匯入

## 技術棧

- **框架**：Next.js 14+ (App Router)
- **語言**：TypeScript
- **樣式**：Tailwind CSS
- **資料庫**：Supabase (PostgreSQL)
- **認證**：HttpOnly Cookie (後台管理)

## 初始化步驟

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定 Supabase

1. 在 Supabase 專案中，進入 SQL Editor
2. 執行 `supabase/schema.sql` 建立資料表結構
3. 執行 `supabase/seed.sql` 建立初始章節和題型資料
4. （可選）執行 `supabase/seed_questions.sql` 建立初始題庫

### 3. 設定環境變數

複製 `.env.local.example` 為 `.env.local` 並填入以下資訊：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 後台管理
ADMIN_PASSWORD=your_admin_password
ADMIN_COOKIE_NAME=admin_session
ADMIN_COOKIE_SECRET=your_secret_key_at_least_32_characters_long
ADMIN_COOKIE_SECURE=false

# LINE Messaging API（弱點分析報告功能）
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_CHANNEL_SECRET=your_line_channel_secret  # 可選，若做 webhook 驗證再用

# 應用程式基礎 URL（用於生成報告連結）
APP_PUBLIC_BASE_URL=https://your-domain.com  # 或使用 ngrok: https://xxx.ngrok.app

# 學生認證（可選，與後台共用 SECRET）
STUDENT_COOKIE_NAME=student_session  # 可選，預設為 student_session
STUDENT_COOKIE_SECRET=your_secret_key  # 可選，會使用 ADMIN_COOKIE_SECRET 如果未設定
STUDENT_COOKIE_SECURE=false  # 本機開發設為 false，生產環境設為 true
```

**注意**：
- `ADMIN_COOKIE_SECRET` 必須至少 32 個字元
- `ADMIN_COOKIE_SECURE` 在本機開發時設為 `false`，上線時設為 `true`
- `LINE_CHANNEL_ACCESS_TOKEN` 需要在 [LINE Developers Console](https://developers.line.biz/) 建立 Messaging API Channel 後取得
- `APP_PUBLIC_BASE_URL` 用於生成報告連結，本機開發可使用 ngrok 或設為 `http://localhost:3000`

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器前往 [http://localhost:3000](http://localhost:3000)

## 專案結構

```
math-quiz-v2/
├── app/                    # Next.js App Router
│   ├── admin/             # 後台管理頁面
│   ├── diagnostic/        # 弱點分析模式
│   ├── practice/          # 題型練習模式
│   ├── api/               # API Routes
│   │   ├── admin/        # 後台 API
│   │   ├── diagnostic/   # 弱點分析 API
│   │   └── practice/     # 練習模式 API
│   └── layout.tsx        # 根 Layout
├── lib/                   # 工具函數
│   ├── supabaseClient.ts # Client 端 Supabase
│   ├── supabaseServer.ts # Server 端 Supabase
│   └── auth.ts           # 後台認證
├── types/                 # TypeScript 類型定義
├── supabase/             # 資料庫腳本
│   ├── schema.sql        # 資料表結構
│   ├── seed.sql         # 初始資料
│   └── seed_questions.sql # 題庫資料
└── middleware.ts         # Next.js Middleware（路由保護）
```

## 題庫管理結構

本系統採用階層式結構管理題庫：

```
年級（科目） → 學期 → 章節 → 題型 → 題目
```

### 年級（科目）與學期分類

- **年級（科目）定義**（`grade_id`）：
  - `J1-MATH`: 國一數學
  - `J2-MATH`: 國二數學
  - `J3-MATH`: 國三數學
  - `J2-SCI`: 國二理化
  - `J3-SCI`: 國三理化

- **學期定義**（`term`）：
  - `upper`: 上學期
  - `lower`: 下學期

### 資料庫 Migration

執行以下 SQL 腳本以啟用年級和學期功能：

```sql
-- 執行 supabase/add_grade_term_to_chapters.sql
```

**注意**：
- 現有資料會自動設定為「國一數學上學期」（`J1-MATH`, `upper`）
- 後續可透過後台管理介面或技能樹匯入功能調整正確的分類

### 後續功能擴充

此分類結構為「技能樹匯入」功能做準備，未來可以：
- 根據技能樹檔案自動建立章節與題型
- 依年級和學期自動分類題庫
- 提供更精準的學習路徑建議

## 使用說明

### 學生端

1. **弱點分析模式** (`/diagnostic`)
   - 選擇章節
   - 系統自動生成診斷試卷（每個題型各抽 3 題）
   - 作答後獲得弱點分析與建議
   - 支援顯示題目圖片（如有設定）

2. **題型練習模式** (`/practice`)
   - 選擇章節和題型
   - 系統根據答題表現自動調整難度
   - 連續答對 10 題即完成該題型
   - 支援顯示題目圖片（如有設定）

### 後台管理 (`/admin`)

1. 前往 `/admin/login` 登入
2. **章節管理**：
   - 使用「年級（科目）」和「學期」篩選條件篩選章節
   - 新增章節時需指定年級（科目）和學期
   - 編輯章節時可修改年級（科目）、學期等屬性
3. 選擇章節和題型
4. 管理題目：新增、編輯、刪除
5. **題目圖片上傳**：為題目附加圖片、圖表等媒體資源
   - 支援 PNG、JPEG、WebP 格式
   - 檔案大小限制 2MB
   - 可設定圖片說明（caption）
6. 匯出/匯入 JSON 格式題庫

## Supabase Storage 設定

### 建立題目圖片 Storage Bucket

1. 前往 Supabase Dashboard → Storage
2. 點擊 "New bucket"
3. 設定：
   - **Name**: `question-media`
   - **Public bucket**: ✅ 勾選（讓圖片可公開存取）
4. 點擊 "Create bucket"

### 圖片儲存路徑規則

圖片會儲存在以下路徑：
```
question-media/{chapterId}/{typeId}/{questionId}.{ext}
```

例如：
- `question-media/m1-1-1-1/type-abc/12345678-1234-1234-1234-123456789abc.png`

## 題目圖片功能測試流程

1. **後台新增題目**
   - 前往 `/admin`
   - 選擇章節和題型
   - 點擊「新增題目」
   - 填寫題目內容後，點擊「儲存」

2. **上傳圖片**
   - 在題目編輯頁面，找到「題目圖片（可選）」區塊
   - 點擊「上傳圖片」按鈕
   - 選擇圖片檔案（PNG/JPEG/WebP，不超過 2MB）
   - （可選）輸入圖片說明（例如：圖一、座標圖）
   - 圖片會自動上傳並顯示預覽

3. **前台預覽顯示**
   - 在弱點分析模式或題型練習模式中
   - 當題目包含圖片時，會在題目內容下方自動顯示
   - 圖片說明會顯示在圖片下方（如有設定）

## 難度升降規則（練習模式）

- **起始**：easy
- **easy 連對 3 題** → medium
- **medium 連對 3 題** → hard
- **easy/medium 答錯** → 回到 easy
- **hard 連對 4 題** → hard 階段完成
- **hard 答錯** → 回到 medium
- **連續答對 10 題** → 題型完成

## 開發指令

```bash
# 開發模式
npm run dev

# 建置
npm run build

# 啟動生產模式
npm start

# Lint
npm run lint
```

## 部署與上線

### 讓學生線上測試

有三種部署方式：

1. **Vercel（推薦）**：免費、自動 HTTPS、不需要本地電腦運行
   - 詳見：[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#方案一使用-vercel推薦)

2. **ngrok（臨時測試）**：快速獲得公開 URL，適合臨時測試
   - 詳見：[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#方案二使用-ngrok臨時測試)

3. **自託管（長期運行）**：使用雲端伺服器，適合企業/學校
   - 詳見：[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#方案三自託管長期運行)

**完整部署指南**：請參考 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### 快速部署（Vercel）

```bash
# 1. 推送到 GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/math-quiz-v2.git
git push -u origin main

# 2. 在 Vercel 匯入專案
# 訪問 https://vercel.com，使用 GitHub 登入，匯入專案

# 3. 設定環境變數（在 Vercel Dashboard）
# 4. 部署完成，獲得網址
```

## 注意事項

- 後台管理功能需要登入，預設密碼由 `ADMIN_PASSWORD` 環境變數設定
- Supabase 需要設定 Row Level Security (RLS) 或使用 Service Role Key（本專案使用 Anon Key，需適當設定權限）
- 題庫資料可透過後台管理或直接執行 SQL 腳本新增
- **部署時記得設定 `APP_PUBLIC_BASE_URL` 為實際的公開網址**

## 授權

本專案僅供學習使用。


