# Vercel 部署指南 - 快速上線

這份指南將帶您完成使用 Vercel 部署數學題庫系統的所有步驟，讓學生可以線上測試。

## 📋 前置準備

### 1. 確保專案可以本地運行

```bash
# 確保所有依賴已安裝
npm install

# 確保可以成功建置
npm run build
```

如果建置失敗，請先解決錯誤後再繼續。

### 2. 準備環境變數清單

在開始之前，請準備以下環境變數：

- ✅ Supabase URL 和 Anon Key
- ✅ 管理員密碼（ADMIN_PASSWORD）
- ✅ Cookie Secret（至少 32 字元）
- ⚠️ LINE Channel Access Token（選填，如果不用 LINE 功能可不填）
- ⚠️ Supabase Storage Bucket 名稱（選填，如果不用圖片上傳功能）

---

## 🚀 部署步驟

### 步驟 1：準備 Git 倉庫（如果還沒有）

```bash
# 初始化 Git（如果還沒有）
git init

# 確認 .gitignore 包含 .env.local
cat .gitignore | grep env

# 添加所有檔案
git add .

# 提交
git commit -m "準備部署到 Vercel"
```

### 步驟 2：推送到 GitHub

**如果還沒有 GitHub 倉庫：**

1. 前往 https://github.com 登入
2. 點擊右上角 "+" → "New repository"
3. 輸入倉庫名稱（例如：`math-quiz-v2`）
4. 選擇 "Public" 或 "Private"
5. **不要**勾選 "Initialize this repository with a README"
6. 點擊 "Create repository"

**推送代碼：**

```bash
# 添加遠端倉庫（替換 YOUR_USERNAME 為您的 GitHub 用戶名）
git remote add origin https://github.com/YOUR_USERNAME/math-quiz-v2.git

# 推送代碼
git branch -M main
git push -u origin main
```

如果遇到認證問題，請參考 [GitHub 文件](https://docs.github.com/en/get-started/getting-started-with-git/caching-your-github-credentials-in-git)。

### 步驟 3：在 Vercel 部署

1. **前往 Vercel**
   - 訪問：https://vercel.com
   - 點擊 "Sign Up" 或 "Log In"
   - 推薦使用 GitHub 帳號登入（會自動連結）

2. **匯入專案**
   - 登入後，點擊 "Add New..." → "Project"
   - 找到您的 GitHub 倉庫（`math-quiz-v2`）
   - 點擊 "Import"

3. **專案設定**
   - **Framework Preset**: Next.js（應該會自動偵測）
   - **Root Directory**: `./`（預設即可）
   - **Build Command**: `npm run build`（預設）
   - **Output Directory**: `.next`（預設）
   - **Install Command**: `npm install`（預設）

4. **設定環境變數**
   點擊 "Environment Variables" 區塊，逐一添加以下變數：

   #### 必要環境變數

   ```env
   # Supabase（必要）
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # 後台管理（必要）
   ADMIN_PASSWORD=your_secure_password_here
   ADMIN_COOKIE_NAME=admin_session
   ADMIN_COOKIE_SECRET=your_secret_key_at_least_32_characters_long_random_string
   ADMIN_COOKIE_SECURE=true
   
   # 應用程式基礎 URL（必要）
   APP_PUBLIC_BASE_URL=https://your-project-name.vercel.app
   # 注意：部署後 Vercel 會給您一個網址，如果不知道可以先填一個臨時的
   # 部署完成後再回來更新
   ```

   #### 老師/學生認證（如果使用）

   ```env
   # 老師認證（選填）
   TEACHER_COOKIE_NAME=teacher_session
   TEACHER_COOKIE_SECRET=your_teacher_secret_at_least_32_characters_long
   TEACHER_COOKIE_SECURE=true
   
   # 學生認證（選填）
   STUDENT_COOKIE_NAME=student_session
   STUDENT_COOKIE_SECRET=your_student_secret_at_least_32_characters_long
   STUDENT_COOKIE_SECURE=true
   ```

   #### LINE 功能（選填）

   ```env
   # LINE Messaging API（選填）
   LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
   LINE_CHANNEL_SECRET=your_line_channel_secret
   SUPABASE_STORAGE_BUCKET=reports
   ```

   #### 其他（選填）

   ```env
   # 報告連結 Token（選填）
   REPORT_TOKEN_SECRET=your_report_token_secret
   PARENT_LINK_SECRET=your_parent_link_secret
   ```

   **設定建議：**
   - 每個變數都要選擇適用的環境：`Production`、`Preview`、`Development`
   - 如果只在生產環境使用，只勾選 `Production`
   - 如果測試環境也要用，三個都勾選

5. **生成安全的 Secret**

   如果不確定如何生成安全的 Secret，可以使用以下命令：

   ```bash
   # 在終端執行（會產生一個 32 字元的隨機字串）
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   或使用線上工具：https://randomkeygen.com/

6. **部署**
   - 確認所有環境變數已添加
   - 點擊 "Deploy" 按鈕
   - 等待 2-3 分鐘，Vercel 會自動建置和部署

### 步驟 4：更新 APP_PUBLIC_BASE_URL

部署完成後：

1. Vercel 會給您一個網址，例如：`https://math-quiz-v2-abc123.vercel.app`
2. 前往專案設定 → Environment Variables
3. 找到 `APP_PUBLIC_BASE_URL`
4. 更新為實際的 Vercel 網址
5. 重新部署（點擊 "Redeploy"）

### 步驟 5：自訂網域（可選）

如果您有自己的網域：

1. 前往專案 → Settings → Domains
2. 輸入您的網域（例如：`math.yourschool.com`）
3. 按照指示設定 DNS 記錄
4. 等待 DNS 生效（通常 5-10 分鐘）
5. 更新 `APP_PUBLIC_BASE_URL` 為您的網域

---

## ✅ 部署後檢查清單

部署完成後，請檢查以下項目：

### 1. 基本功能測試

- [ ] 首頁可以正常訪問
- [ ] 學生可以進入「弱點分析模式」
- [ ] 學生可以進入「題型練習模式」
- [ ] 後台管理可以登入（`/admin/login`）

### 2. 後台管理測試

- [ ] 管理員可以登入
- [ ] 可以查看章節和題型
- [ ] 可以新增/編輯/刪除題目
- [ ] 可以管理學生、老師、班級

### 3. 資料庫連線測試

- [ ] 題目可以正常載入
- [ ] 學生作答記錄可以正常保存
- [ ] 後台修改可以正常生效

### 4. 環境變數確認

前往 Vercel Dashboard → 專案 → Settings → Environment Variables，確認所有必要變數都已設定。

---

## 🔧 常見問題排除

### 問題 1：建置失敗

**錯誤訊息：** `Error: Command "npm run build" exited with 1`

**解決方法：**
1. 在本地執行 `npm run build` 檢查錯誤
2. 檢查是否有 TypeScript 錯誤
3. 確保所有依賴都已安裝：`npm install`
4. 檢查 `package.json` 中的建置腳本是否正確

### 問題 2：環境變數未生效

**錯誤訊息：** `undefined` 或環境變數顯示為空

**解決方法：**
1. 確認環境變數名稱完全正確（區分大小寫）
2. 確認已選擇正確的環境（Production/Preview/Development）
3. 重新部署專案
4. 檢查是否有前綴 `NEXT_PUBLIC_`（只有公開的變數需要這個前綴）

### 問題 3：Supabase 連線失敗

**錯誤訊息：** `Failed to fetch` 或 `Network error`

**解決方法：**
1. 確認 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 正確
2. 在 Supabase Dashboard 確認專案狀態為 Active
3. 檢查 Supabase 的 API 設定是否允許從 Vercel 網域訪問

### 問題 4：Cookie 無法設定

**錯誤訊息：** 登入後立即登出

**解決方法：**
1. 確認 `ADMIN_COOKIE_SECURE=true`（Vercel 使用 HTTPS）
2. 確認 `ADMIN_COOKIE_SECRET` 至少 32 字元
3. 檢查瀏覽器 Console 是否有 Cookie 相關錯誤

### 問題 5：報告連結無法生成

**錯誤訊息：** `APP_PUBLIC_BASE_URL is not set`

**解決方法：**
1. 確認已設定 `APP_PUBLIC_BASE_URL` 環境變數
2. 確認 URL 格式正確（以 `https://` 開頭）
3. 重新部署專案

---

## 📝 更新部署

每次修改代碼後：

```bash
# 1. 提交更改
git add .
git commit -m "更新功能說明"

# 2. 推送到 GitHub
git push

# 3. Vercel 會自動偵測並重新部署
# 通常 2-3 分鐘完成
```

您也可以在 Vercel Dashboard → Deployments 查看部署進度和日誌。

---

## 🔐 安全建議

1. **密碼設定**
   - 使用強密碼作為 `ADMIN_PASSWORD`
   - 定期更換 Cookie Secret

2. **環境變數保護**
   - 不要將 `.env.local` 提交到 Git
   - 使用 Vercel 的 Environment Variables 功能管理敏感資訊

3. **Supabase 權限**
   - 只使用 Anon Key，不要將 Service Role Key 放在前端
   - 在 Supabase 設定適當的 Row Level Security (RLS)

---

## 📞 取得協助

如果部署過程遇到問題：

1. **查看 Vercel 日誌**
   - Vercel Dashboard → 專案 → Deployments → 點擊最新的部署 → Logs

2. **查看 Supabase 日誌**
   - Supabase Dashboard → Logs → API Logs

3. **檢查瀏覽器 Console**
   - 打開瀏覽器開發者工具（F12）→ Console 標籤

4. **常見錯誤**
   - 參考上面的「常見問題排除」章節

---

## 🎉 完成！

部署完成後，您可以：

1. **分享網址給學生**
   - 例如：`https://math-quiz-v2-abc123.vercel.app`
   - 學生可以直接訪問，不需要登入（除非您設定了學生登入）

2. **開始使用後台管理**
   - 訪問：`https://your-domain.com/admin/login`
   - 使用您設定的管理員密碼登入
   - 開始新增題目和學生資料

3. **監控使用情況**
   - Vercel Dashboard 可查看訪問統計
   - Supabase Dashboard 可查看資料庫使用量

祝您部署順利！🚀

