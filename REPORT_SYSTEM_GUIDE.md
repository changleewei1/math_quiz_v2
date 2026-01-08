# 報表系統 v1 使用指南

本系統提供三個報表頁面，讓家長、學生和老師可以查看弱點分析報告。

## 功能概覽

### 1. 家長/學生報表頁面
- **路徑**: `/report/student/[studentId]?token=...`
- **功能**: 顯示學生最近一次診斷測驗的詳細報告
- **內容**:
  - 總體統計（總題數、答對題數、總正確率）
  - 各題型正確率長條圖
  - Top 3 弱點題型及建議
  - 錯題清單（可展開/收起）
  - 每個弱點題型提供「開始練習」按鈕

### 2. 老師班級總覽頁面
- **路徑**: `/teacher/class/[classId]/overview`
- **功能**: 顯示班級整體弱點分析
- **內容**:
  - 全班各題型平均正確率圖表
  - 主要弱點題型（Top 5）及弱點人數分布
  - 學生清單表格（含總正確率、主要弱點、連結）

### 3. 老師個人報表頁面
- **路徑**: `/teacher/class/[classId]/student/[studentId]`
- **功能**: 顯示單一學生的詳細報告，並與班平均對照
- **內容**:
  - 總體統計
  - 與班平均對照圖（雙柱狀圖）
  - 相對班平均偏弱的題型提示
  - Top 3 弱點題型及建議

## 資料庫結構

### 新增資料表

1. **classes（班級表）**
   ```sql
   CREATE TABLE classes (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       name TEXT NOT NULL,
       school_year TEXT,
       semester TEXT,
       is_active BOOLEAN DEFAULT true,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **class_members（班級成員表）**
   ```sql
   CREATE TABLE class_members (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
       student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
       student_number TEXT,
       is_active BOOLEAN DEFAULT true,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       UNIQUE(class_id, student_id)
   );
   ```

### 執行 SQL 腳本

在 Supabase SQL Editor 中執行：
```bash
supabase/add_classes.sql
```

## 權限控制

### 家長/學生報表
- 使用 token 驗證機制
- Token 有效期 7 天
- Token 格式：`HMAC(studentId + expireTimestamp)`
- 若 token 無效或過期，顯示「連結已失效，請向老師索取最新連結」

### 老師報表
- 使用 admin cookie 認證（與 `/admin` 相同的認證機制）
- 未登入時會自動重定向到 `/admin/login`

## 後台管理功能

### 產生家長連結

1. 登入後台 (`/admin`)
2. 點擊「家長連結」按鈕
3. 選擇班級 → 選擇學生（或直接選擇學生）
4. 點擊「產生家長連結」
5. 複製生成的連結並分享給家長

連結格式：
```
https://your-domain.com/report/student/[studentId]?token=[token]
```

## API 端點

### 1. 學生報表 API
- **GET** `/api/reports/student-latest?studentId=...`
- **Headers**: `X-Report-Token: [token]` 或 query parameter `token=...`
- **回應**: 包含最近一次診斷測驗的完整報告資料

### 2. 班級總覽 API
- **GET** `/api/reports/class-overview?classId=...`
- **認證**: Admin cookie
- **回應**: 班級整體統計和學生列表

### 3. 班級學生報表 API
- **GET** `/api/reports/class-student?classId=...&studentId=...`
- **認證**: Admin cookie
- **回應**: 學生詳細報告 + 班平均對照資料

### 4. 產生家長連結 API
- **POST** `/api/reports/create-parent-link`
- **認證**: Admin cookie
- **Body**: `{ studentId: "..." }`
- **回應**: `{ reportUrl: "...", token: "...", studentName: "...", expiresIn: "7天" }`

### 5. 班級管理 API
- **GET** `/api/admin/classes` - 取得班級列表
- **POST** `/api/admin/classes` - 新增班級
- **GET** `/api/admin/class-members?classId=...` - 取得班級成員
- **POST** `/api/admin/class-members` - 加入班級成員

## 統計演算法

### 弱點優先級計算
```typescript
priority = wrong * 10 + hardWrong * 5 + mediumWrong * 3
```

### 建議文字規則
- `wrong >= 2`: 「主要弱點，建議先從簡單題開始練習，熟練後再挑戰中等和困難題」
- `hardWrong >= 1`: 「進階題目待加強，建議先鞏固基礎後再挑戰困難題」
- `accuracy === 100%`: 「表現良好，可進入下一題型」
- 其他: 「表現尚可，建議繼續練習以提升熟練度」

## 測試步驟

### 1. 設定資料庫
```bash
# 在 Supabase SQL Editor 中執行
\i supabase/add_classes.sql
```

### 2. 建立測試資料
- 建立班級
- 建立學生帳號
- 將學生加入班級
- 讓學生完成至少一次診斷測驗

### 3. 測試家長連結
1. 登入後台
2. 進入「家長連結」頁籤
3. 選擇學生並產生連結
4. 在無痕視窗中開啟連結，驗證報表顯示正確

### 4. 測試老師報表
1. 登入後台（確保有 admin cookie）
2. 訪問 `/teacher/class/[classId]/overview`
3. 驗證班級總覽顯示正確
4. 點擊學生連結，查看個人報表

## 注意事項

1. **student_id 類型問題**
   - `students` 表的 `id` 是 UUID
   - `student_sessions` 表的 `student_id` 是 TEXT（可能是學生的名字或其他識別符）
   - `class_members` 表的 `student_id` 是 UUID（對應 `students.id`）
   - 系統會自動處理這些類型轉換

2. **Token 安全性**
   - Token 使用 HMAC-SHA256 簽名
   - 有效期固定為 7 天
   - Token 與 studentId 綁定，無法偽造

3. **圖表庫**
   - 前端使用 Recharts 繪製圖表
   - 圖表在手機上可自適應和捲動

4. **環境變數**
   - `REPORT_TOKEN_SECRET`（可選，預設使用 `ADMIN_COOKIE_SECRET`）
   - `APP_PUBLIC_BASE_URL`（用於生成完整的報表連結）

## 故障排除

### 問題：找不到班級或學生
- 確認已執行 `supabase/add_classes.sql`
- 確認班級和學生資料已正確建立
- 確認 `class_members` 表中有對應的關聯記錄

### 問題：Token 驗證失敗
- 確認 token 未過期（7天內）
- 確認 token 是從 `/api/reports/create-parent-link` 產生的
- 確認 `REPORT_TOKEN_SECRET` 或 `ADMIN_COOKIE_SECRET` 環境變數已設定

### 問題：報表顯示「找不到診斷測驗記錄」
- 確認學生已完成至少一次診斷測驗（`mode='diagnostic'`）
- 確認 `student_sessions` 表中有對應的記錄
- 確認 `question_attempts` 表中有對應的作答記錄

