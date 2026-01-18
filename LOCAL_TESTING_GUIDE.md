# 本機測試指南

## 📋 前置準備

### 1. 確認環境變數設定

檢查是否有 `.env.local` 檔案：

```bash
ls -la .env.local
```

如果沒有，從範例檔案建立：

```bash
cp .env.local.example .env.local
```

編輯 `.env.local`，填入您的 Supabase 資訊：

```env
# Supabase 設定
NEXT_PUBLIC_SUPABASE_URL=https://您的專案URL.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=您的Anon Key

# 後台管理密碼
ADMIN_PASSWORD=your_admin_password

# Cookie 設定
ADMIN_COOKIE_NAME=admin_session
ADMIN_COOKIE_SECRET=至少32字元的隨機字串，例如：d38eae64ce42d0c81d48ca655bc83eee12345678901234567890
ADMIN_COOKIE_SECURE=false

# 其他（選填）
APP_PUBLIC_BASE_URL=http://localhost:3000
TEACHER_COOKIE_SECRET=teacher_secret_key_at_least_32_characters
STUDENT_COOKIE_SECRET=student_secret_key_at_least_32_characters
PARENT_LINK_SECRET=parent_link_secret_key_at_least_32_characters
```

### 2. 確認 Supabase 資料庫已設定

確保您已經：
- ✅ 在 Supabase 建立了專案
- ✅ 執行了所有必要的 SQL 腳本（schema.sql, add_students.sql, add_classes.sql, add_teachers.sql 等）
- ✅ 至少建立了一個章節（例如：`m1-1` 或 `m2-1`）

### 3. 安裝依賴（如果尚未安裝）

```bash
npm install
```

## 🚀 啟動開發伺服器

```bash
npm run dev
```

應該會看到類似以下的輸出：

```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
- Environments: .env.local
✓ Ready in 2.5s
```

開啟瀏覽器訪問：**http://localhost:3000**

## ✅ 測試流程

### 測試 1：首頁顯示

1. 訪問 http://localhost:3000
2. 應該看到：
   - Logo 和「名貫補習班」標題
   - 五個科目/年級選項（國一數學、國二數學、國三數學、國二理化、國三理化）
   - 老師登入和管理員登入按鈕

### 測試 2：科目選擇和模式選擇

1. 點擊「國一數學」
2. 應該顯示：
   - 已選擇的科目資訊
   - 兩個模式選項（弱點分析模式、題型練習模式）
   - 「重新選擇」按鈕

### 測試 3：弱點分析模式（需要學生登入）

1. 選擇「國一數學」→「弱點分析模式」
2. 如果未登入，會自動導向登入頁
3. 登入後：
   - URL 應該是：`/diagnostic?subject=math&grade=1`
   - 應該顯示章節選擇下拉選單
   - 章節應該只顯示以 `m1-` 開頭的章節
4. 選擇一個章節並點擊「開始測驗」

### 測試 4：題型練習模式（需要學生登入）

1. 選擇「國二數學」→「題型練習模式」
2. 如果未登入，會自動導向登入頁
3. 登入後：
   - URL 應該是：`/practice?subject=math&grade=2`
   - 應該顯示章節和題型選擇
   - 章節應該只顯示以 `m2-` 開頭的章節
4. 選擇章節和題型，點擊「開始練習」

### 測試 5：後台管理（需要管理員登入）

1. 點擊「管理員登入」
2. 輸入您在 `.env.local` 設定的 `ADMIN_PASSWORD`
3. 登入後應該看到：
   - 章節管理
   - 題型管理
   - 題目管理
   - 學生管理
   - 老師管理
   - 班級管理

### 測試 6：章節 ID 過濾

**重要**：測試章節過濾是否正確

1. 在後台建立測試章節：
   - `m1-1` - 數學國一第一章
   - `m2-1` - 數學國二第一章
   - `p2-1` - 理化國二第一章
   - `p3-1` - 理化國三第一章

2. 測試各科目的章節過濾：
   - 選擇「國一數學」→ 應該只顯示 `m1-*` 開頭的章節
   - 選擇「國二數學」→ 應該只顯示 `m2-*` 開頭的章節
   - 選擇「國二理化」→ 應該只顯示 `p2-*` 開頭的章節
   - 選擇「國三理化」→ 應該只顯示 `p3-*` 開頭的章節

## 🐛 常見問題排除

### 問題 1：無法連線 Supabase

**症狀**：頁面顯示錯誤或無法載入章節

**解決方法**：
1. 檢查 `.env.local` 中的 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否正確
2. 確認 Supabase 專案是否正常運行
3. 檢查瀏覽器控制台（F12）的錯誤訊息

### 問題 2：章節選擇為空

**症狀**：選擇科目和模式後，章節下拉選單為空

**解決方法**：
1. 確認在後台已建立章節
2. 確認章節 ID 符合命名規則（`m1-*`, `m2-*`, `p2-*`, `p3-*`）
3. 確認章節的 `is_active` 欄位為 `true`
4. 檢查瀏覽器控制台的 Console 訊息

### 問題 3：管理員無法登入

**症狀**：輸入密碼後無法登入

**解決方法**：
1. 檢查 `.env.local` 中的 `ADMIN_PASSWORD` 是否正確
2. 確認 `ADMIN_COOKIE_SECRET` 已設定且至少 32 個字元
3. 清除瀏覽器 Cookie 後重試

### 問題 4：學生無法登入

**症狀**：學生登入頁面無法登入

**解決方法**：
1. 確認 Supabase 的 `students` 表已建立
2. 確認已在資料庫中建立學生帳號
3. 檢查 `student_sessions` Cookie 是否正常設定

### 問題 5：建置錯誤

**症狀**：`npm run build` 失敗

**解決方法**：
```bash
# 清除快取
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

## 🔍 檢查清單

使用前請確認：

- [ ] `.env.local` 檔案已建立且內容正確
- [ ] Supabase 專案已建立並執行所有 SQL 腳本
- [ ] 至少建立了一個測試章節（例如：`m1-1`）
- [ ] `npm install` 已執行完成
- [ ] `npm run dev` 可以正常啟動
- [ ] 瀏覽器可以訪問 http://localhost:3000
- [ ] 首頁顯示五個科目選項
- [ ] 可以選擇科目和模式
- [ ] 章節過濾功能正常

## 📝 測試資料範例

### 建立測試章節（在 Supabase SQL Editor 執行）

```sql
-- 數學國一第一章
INSERT INTO chapters (id, title, sort_order, is_active)
VALUES ('m1-1', '第一章 代數式', 1, true)
ON CONFLICT (id) DO NOTHING;

-- 數學國二第一章
INSERT INTO chapters (id, title, sort_order, is_active)
VALUES ('m2-1', '第一章 一元一次方程式', 1, true)
ON CONFLICT (id) DO NOTHING;

-- 理化國二第一章
INSERT INTO chapters (id, title, sort_order, is_active)
VALUES ('p2-1', '第一章 基礎測量', 1, true)
ON CONFLICT (id) DO NOTHING;

-- 理化國三第一章
INSERT INTO chapters (id, title, sort_order, is_active)
VALUES ('p3-1', '第一章 運動學', 1, true)
ON CONFLICT (id) DO NOTHING;
```

### 建立測試題型

```sql
-- 數學國一第一章的題型
INSERT INTO question_types (id, chapter_id, name, code, sort_order, is_active)
VALUES 
  ('m1-1-type1', 'm1-1', '變數與常數', 'A1', 1, true),
  ('m1-1-type2', 'm1-1', '代數式化簡', 'A2', 2, true)
ON CONFLICT (id) DO NOTHING;
```

## 🎯 快速測試指令

```bash
# 1. 檢查環境變數
cat .env.local | grep -E "(SUPABASE|ADMIN)"

# 2. 啟動開發伺服器
npm run dev

# 3. 在另一個終端機檢查建置
npm run build

# 4. 檢查 TypeScript 錯誤
npx tsc --noEmit
```

## 📚 相關文件

- [CHAPTER_ID_FORMAT.md](./CHAPTER_ID_FORMAT.md) - 章節ID命名規則
- [README.md](./README.md) - 專案說明
- [DEPLOY_QUICK_START.md](./DEPLOY_QUICK_START.md) - 部署指南

如有問題，請檢查瀏覽器控制台（F12）和終端機的錯誤訊息。


