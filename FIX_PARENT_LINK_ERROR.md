# 修復批次產生家長連結 404 錯誤

## 🔍 問題描述

批次產生家長連結時出現錯誤：
```
404: NOT_FOUND
Code: DEPLOYMENT_NOT_FOUND
ID: hkg1::hzkdw-1767924880464-757ec6bfd2b7

This deployment cannot be found.
```

## 🎯 問題原因

這個錯誤通常是因為 `APP_PUBLIC_BASE_URL` 環境變數設定錯誤，指向了一個不存在的 Vercel 部署 URL。

## ✅ 解決方法

### 方法 1：本機測試（推薦）

如果在本機測試，請將 `.env.local` 中的 `APP_PUBLIC_BASE_URL` 設定為：

```env
APP_PUBLIC_BASE_URL=http://localhost:3000
```

### 方法 2：檢查 Vercel 部署 URL

如果已部署到 Vercel，請確認：

1. **確認正確的 Vercel URL**
   - 前往 Vercel Dashboard
   - 檢查您的專案
   - 複製正確的部署 URL（例如：`https://your-project.vercel.app`）

2. **更新環境變數**
   - 在 Vercel Dashboard → Settings → Environment Variables
   - 找到 `APP_PUBLIC_BASE_URL`
   - 更新為正確的 URL
   - 重新部署專案

### 方法 3：本機測試時暫時修改

如果您在本機測試，可以暫時修改 API 路由，使用相對路徑或動態獲取：

**修改 `/app/api/reports/parent-links-batch/route.ts`：**

```typescript
// 原本：
const baseUrl = process.env.APP_PUBLIC_BASE_URL || 'http://localhost:3000';

// 改為（本機測試時）：
const baseUrl = process.env.APP_PUBLIC_BASE_URL || 
                (process.env.NODE_ENV === 'development' 
                  ? 'http://localhost:3000' 
                  : 'http://localhost:3000');
```

## 🔧 快速修復步驟

### 步驟 1：檢查 `.env.local`

```bash
cat .env.local | grep APP_PUBLIC_BASE_URL
```

### 步驟 2：更新 `.env.local`

如果 URL 不正確，編輯 `.env.local`：

```env
# 本機測試使用
APP_PUBLIC_BASE_URL=http://localhost:3000
```

### 步驟 3：重新啟動開發伺服器

```bash
# 停止現有的開發伺服器（Ctrl+C）
# 重新啟動
npm run dev
```

### 步驟 4：清除瀏覽器快取

- 清除瀏覽器的 Cookie 和快取
- 或使用無痕模式測試

## 📝 檢查清單

- [ ] `.env.local` 中的 `APP_PUBLIC_BASE_URL` 是否正確
- [ ] 本機測試時是否使用 `http://localhost:3000`
- [ ] 已部署時是否使用正確的 Vercel URL（例如：`https://your-project.vercel.app`）
- [ ] 環境變數更改後是否重新啟動開發伺服器
- [ ] 是否清除了瀏覽器快取

## 🧪 測試步驟

1. **確認環境變數**
   ```bash
   # 檢查 .env.local
   cat .env.local | grep APP_PUBLIC_BASE_URL
   ```

2. **測試產生連結**
   - 登入老師帳號
   - 進入班級總覽頁面
   - 點擊「批次產生本班全部學生連結」
   - 檢查生成的 URL 是否正確

3. **測試單一連結**
   - 嘗試產生單一學生的家長連結
   - 確認連結可以正常開啟

## ⚠️ 重要提醒

### 本機測試
- `APP_PUBLIC_BASE_URL` 應設為 `http://localhost:3000`
- 確保開發伺服器正在運行（`npm run dev`）

### 生產環境（Vercel）
- `APP_PUBLIC_BASE_URL` 應設為實際的 Vercel 部署 URL
- 格式：`https://your-project-name.vercel.app`
- **不要**包含尾隨斜線（`/`）

### 環境變數優先順序

API 路由會依以下順序檢查：
1. `process.env.APP_PUBLIC_BASE_URL`
2. 如果未設定，預設為 `http://localhost:3000`

## 🔍 除錯建議

如果問題仍然存在，請檢查：

1. **瀏覽器控制台（F12）**
   - 查看是否有其他錯誤訊息
   - 檢查 API 請求的 URL

2. **終端機輸出**
   - 查看開發伺服器的日誌
   - 檢查是否有錯誤訊息

3. **網路請求**
   - 在瀏覽器開發者工具的 Network 標籤
   - 檢查 `/api/reports/parent-links-batch` 的請求
   - 查看響應內容

## 💡 預防措施

為避免此問題，建議：

1. **分離環境設定**
   - 開發環境：`.env.local` 使用 `http://localhost:3000`
   - 生產環境：Vercel 環境變數使用實際部署 URL

2. **驗證 URL**
   - 在產生連結前，驗證 `APP_PUBLIC_BASE_URL` 是否有效
   - 可以添加 URL 驗證邏輯

3. **錯誤處理**
   - 在產生連結的 UI 中，顯示更清楚的錯誤訊息
   - 提示用戶檢查環境變數設定

## 📚 相關檔案

- `app/api/reports/parent-links-batch/route.ts` - 批次產生家長連結 API
- `app/api/reports/create-parent-link/route.ts` - 單一產生家長連結 API
- `.env.local` - 本機環境變數設定


