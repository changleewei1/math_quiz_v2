# 上線 Smoke Test 清單（Phase 3）

本文件提供最小流程驗證，確保管理員 / 老師 / 學生可正常使用。

---

## 0) 前置檢查

- Vercel 環境變數已設定完成（含 `SUPABASE_SERVICE_ROLE_KEY`）
- Supabase SQL 已執行：
  - `supabase/add_diagnostic_tables.sql`
  - `supabase/migrations/20260118_enable_rls_min.sql`

---

## 1) 建立測試帳號

### 1-1 管理員
- 使用 `ADMIN_PASSWORD` 登入 `/admin/login`

### 1-2 老師（範例）
- 需在 `teachers` 表建立一筆資料
- 欄位至少包含：`username`, `password_hash`, `nickname`, `is_active`

### 1-3 學生（範例）
- 需在 `students` 表建立一筆資料
- 欄位至少包含：`name`, `password_hash`, `is_active`

> 密碼需使用 SHA-256 hash（與現有登入流程一致）

---

## 2) 角色登入驗證

### 管理員
1. 開啟 `/admin/login`
2. 輸入管理密碼
3. 應可進入 `/admin`

### 老師
1. 開啟 `/teacher/login`
2. 輸入老師帳密
3. 應可進入 `/teacher`

### 學生
1. 開啟 `/login`
2. 輸入學生姓名與密碼
3. 應可進入首頁

---

## 3) 基本功能驗證（不依賴大量題庫）

### 章節與題型讀取
- 管理員後台 → 章節列表能載入
- 題型列表能載入

### 練習模式
1. 進入 `/practice`
2. 選擇年級 / 學期 / 章節
3. 若題庫不足：顯示「題庫不足」
4. 不應 crash

### 弱點分析（若尚未正式上線）
- 進入 `/diagnostic` 應可看到入口頁
- 若題庫不足：顯示提示，不應 crash

---

## 4) 權限驗證

### 未登入保護
- 直接開 `/practice` 或 `/diagnostic`  
  → 應導向 `/login`

### API 存取
- 未登入直接呼叫 `/api/practice/*` 或 `/api/diagnostic/*`  
  → 應回 401

---

## 5) 上線環境驗證（Vercel）

### Production URL
- 首頁能正常進入
- 登入流程同上
- 不應出現無限重導、cookie 設定失敗、dynamic server error

### Preview URL（選測）
- 測試流程與 production 相同

---

## 6) 已知限制

- 題庫若不足，練習/測驗會顯示「題庫不足」提示
- 若 RLS 已啟用，server 端必須使用 `SUPABASE_SERVICE_ROLE_KEY`

