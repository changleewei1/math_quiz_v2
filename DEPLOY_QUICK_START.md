# 🚀 Vercel 快速部署指南

這是一份簡化版的部署指南，讓您可以快速將系統上線給學生測試。

## ✅ 前置檢查

### 1. 確認專案可以本地建置

```bash
npm run build
```

如果建置成功（即使有警告也沒關係），就可以繼續部署。

### 2. 準備環境變數

請準備以下資訊：

- ✅ **Supabase URL**：例如 `https://xxxxx.supabase.co`
- ✅ **Supabase Anon Key**：在 Supabase Dashboard → Settings → API 可以找到
- ✅ **管理員密碼**：用於登入後台
- ✅ **Cookie Secret**：至少 32 個字元的隨機字串（可用以下指令生成）

```bash
# 生成隨機 Secret（32 字元）
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📦 步驟 1：準備 Git 倉庫

```bash
# 1. 初始化 Git（如果還沒有）
git init

# 2. 添加所有檔案
git add .

# 3. 提交
git commit -m "準備部署到 Vercel"
```

---

## 📤 步驟 2：推送到 GitHub

### 如果還沒有 GitHub 倉庫：

1. 前往 https://github.com 並登入
2. 點擊右上角 "+" → "New repository"
3. 輸入倉庫名稱（例如：`math-quiz-v2`）
4. 選擇 "Public" 或 "Private"
5. **不要**勾選任何初始化選項
6. 點擊 "Create repository"

### 推送代碼：

```bash
# 替換 YOUR_USERNAME 為您的 GitHub 用戶名
git remote add origin https://github.com/YOUR_USERNAME/math-quiz-v2.git

# 推送
git branch -M main
git push -u origin main
```

---

## 🚀 步驟 3：在 Vercel 部署

### 3.1 登入 Vercel

1. 前往 https://vercel.com
2. 點擊 "Sign Up" 或 "Log In"
3. **推薦使用 GitHub 帳號登入**（會自動連結，方便後續自動部署）

### 3.2 匯入專案

1. 登入後，點擊 "Add New..." → "Project"
2. 在 "Import Git Repository" 中找到您的 `math-quiz-v2` 倉庫
3. 點擊 "Import"

### 3.3 設定專案

- **Framework Preset**: Next.js（應該會自動偵測）
- **Root Directory**: `./`（預設即可）
- 其他設定保持預設即可

### 3.4 設定環境變數 ⚠️ 重要！

點擊 "Environment Variables" 區塊，**逐一添加**以下變數：

#### 必要變數（必須設定）

| 變數名稱 | 範例值 | 說明 |
|---------|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase 專案 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Supabase Anon Key |
| `ADMIN_PASSWORD` | `YourSecurePassword123!` | 後台管理密碼 |
| `ADMIN_COOKIE_NAME` | `admin_session` | Cookie 名稱（預設即可） |
| `ADMIN_COOKIE_SECRET` | `your_32_char_random_string_here` | Cookie 加密密鑰（至少 32 字元） |
| `ADMIN_COOKIE_SECURE` | `true` | 生產環境設為 true |
| `APP_PUBLIC_BASE_URL` | `https://your-project.vercel.app` | **部署後再更新**（先用臨時的） |

#### 選填變數（如果需要）

| 變數名稱 | 說明 |
|---------|------|
| `TEACHER_COOKIE_SECRET` | 老師認證密鑰（如果使用老師功能） |
| `STUDENT_COOKIE_SECRET` | 學生認證密鑰（如果使用學生登入） |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE API Token（如果使用 LINE 功能） |

**設定提示：**
- 每個變數都要選擇環境：勾選 `Production`、`Preview`、`Development`
- 如果只在生產環境使用，只勾選 `Production`
- `APP_PUBLIC_BASE_URL` 可以先填一個臨時的，部署完成後再更新為實際網址

### 3.5 部署

1. 確認所有環境變數都已添加
2. 點擊 "Deploy" 按鈕
3. 等待 2-3 分鐘，Vercel 會自動建置和部署
4. 看到 "Ready" 表示部署成功！✅

### 3.6 更新 APP_PUBLIC_BASE_URL

部署完成後：

1. Vercel 會給您一個網址，例如：`https://math-quiz-v2-abc123.vercel.app`
2. 回到 Vercel Dashboard → 專案 → Settings → Environment Variables
3. 找到 `APP_PUBLIC_BASE_URL`，點擊編輯
4. 更新為實際的 Vercel 網址（例如：`https://math-quiz-v2-abc123.vercel.app`）
5. 前往 Deployments → 點擊最新部署右側的 "..." → "Redeploy"

---

## ✅ 部署後測試

### 1. 基本功能測試

- [ ] 訪問首頁：`https://your-project.vercel.app`
- [ ] 測試弱點分析模式：選擇章節 → 開始測驗
- [ ] 測試題型練習模式：選擇章節和題型 → 開始練習
- [ ] 測試後台登入：`https://your-project.vercel.app/admin/login`

### 2. 後台管理測試

- [ ] 使用您設定的 `ADMIN_PASSWORD` 登入
- [ ] 確認可以查看章節和題型
- [ ] 確認可以新增/編輯題目
- [ ] 確認可以管理學生、老師、班級

### 3. 如果遇到問題

**檢查 Vercel 日誌：**
- Vercel Dashboard → 專案 → Deployments → 點擊最新部署 → "Build Logs"

**常見問題：**
- **環境變數未生效**：確認變數名稱正確，重新部署
- **Supabase 連線失敗**：確認 URL 和 Key 正確，檢查 Supabase 專案狀態
- **登入失敗**：確認 `ADMIN_COOKIE_SECURE=true`，`ADMIN_COOKIE_SECRET` 至少 32 字元

---

## 📝 更新部署

每次修改代碼後：

```bash
git add .
git commit -m "更新說明"
git push
```

Vercel 會**自動偵測並重新部署**，通常 2-3 分鐘完成。

---

## 🎉 完成！

部署完成後，您可以：

1. **分享網址給學生**
   - 例如：`https://math-quiz-v2-abc123.vercel.app`
   - 學生可以直接訪問使用

2. **開始使用後台管理**
   - 訪問：`https://your-project.vercel.app/admin/login`
   - 使用您設定的管理員密碼登入
   - 開始新增題目和管理學生

3. **監控使用情況**
   - Vercel Dashboard 可查看訪問統計
   - Supabase Dashboard 可查看資料庫使用量

---

## 📚 詳細說明

如果需要更詳細的說明，請參考：
- [完整部署指南](./VERCEL_DEPLOYMENT.md)
- [環境變數說明](./README.md#環境變數設定)

祝您部署順利！🚀

