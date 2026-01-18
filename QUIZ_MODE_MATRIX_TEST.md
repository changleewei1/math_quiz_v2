# 弱點分析模式矩陣測試指南

## 功能概述

本系統新增「弱點分析模式矩陣」骨架，支援：
- **科目**：數學（math）、理化（science）
- **模式**：
  - `exam_term`：段考弱點分析
  - `mock_exam`：模擬考弱點分析
  - `daily_practice`：平常弱點分析（預設）
  - `speed_training`：速度專項
  - `error_diagnosis`：錯誤類型診斷
  - `teacher_diagnosis`：教師診斷（不開放給學生）

## 資料庫 Migration

### 1. 執行 Migration SQL

在 Supabase SQL Editor 中執行：

```sql
-- 檔案：supabase/add_quiz_mode_matrix.sql
```

此 migration 會：
- 建立 `quiz_mode` enum 類型
- 建立 `subject_type` enum 類型
- 在 `student_sessions` 表新增 `subject`、`quiz_mode`、`scope_id` 欄位
- 為現有資料設定預設值（math, daily_practice）
- 建立索引以提升查詢效能

### 2. 驗證 Migration

執行以下 SQL 確認欄位已新增：

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'student_sessions' 
AND column_name IN ('subject', 'quiz_mode', 'scope_id');
```

## 測試步驟

### 步驟 1：學生端 - 選擇模式並完成測驗

1. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

2. **學生登入**
   - 訪問 `http://localhost:3000`
   - 選擇科目與年級（例如：國一數學）
   - 點選「弱點分析模式」
   - 使用學生帳號登入

3. **選擇章節**
   - 在弱點分析頁面選擇一個章節
   - 點擊「開始測驗」按鈕

4. **選擇模式**
   - 系統會顯示模式選擇下拉選單
   - 預設為「平常 - 平常弱點分析」
   - 可選擇其他模式（段考、模擬考、速度、診斷）
   - 點擊「確認並開始測驗」

5. **完成測驗**
   - 回答所有題目
   - 提交答案

6. **查看結果**
   - 結果頁面應顯示：
     - 科目（例如：數學）
     - 模式（例如：平常）
     - 日期
     - 弱點分析結果

### 步驟 2：驗證資料庫記錄

在 Supabase SQL Editor 中查詢：

```sql
SELECT 
  id,
  student_id,
  mode,
  subject,
  quiz_mode,
  scope_id,
  chapter_id,
  started_at,
  ended_at
FROM student_sessions
WHERE mode = 'diagnostic'
ORDER BY started_at DESC
LIMIT 5;
```

確認：
- `subject` 欄位有值（'math' 或 'science'）
- `quiz_mode` 欄位有值（例如 'daily_practice'）
- `scope_id` 可為 null（目前未使用）

### 步驟 3：查看報告頁面

1. **學生報告頁面**
   - 訪問 `/report/student/[studentId]?token=...`
   - 確認顯示：
     - 科目
     - 模式（中文名稱）
     - 日期
     - 章節

2. **老師端報告頁面**
   - 老師登入
   - 訪問 `/teacher/class/[classId]/student/[studentId]`
   - 確認顯示：
     - 科目
     - 模式（中文名稱）
     - 日期
     - 章節

### 步驟 4：驗證向後相容性

1. **舊資料測試**
   - 確認舊的測驗記錄（沒有 subject/quiz_mode）仍可正常顯示
   - 系統應使用預設值（math, daily_practice）

2. **既有功能測試**
   - 題型練習模式應不受影響
   - 其他功能應正常運作

## 驗收標準

✅ **必達項目**：
- [ ] 能在開始測驗前選擇模式
- [ ] 完成測驗後，DB 中 session 記錄包含 `subject` 和 `quiz_mode`
- [ ] 結果頁面能顯示科目 + 模式（中文名稱）+ 日期
- [ ] 報告頁面（學生/老師端）能顯示模式資訊
- [ ] 不影響既有題庫/作答流程
- [ ] 系統能正常編譯和執行

## 已知限制

1. **目前未實作的分析邏輯**
   - 不同模式的出題邏輯（目前都使用相同的出題方式）
   - `scope_id` 的使用（預留欄位，尚未實作）
   - `teacher_diagnosis` 模式（不開放給學生選擇）

2. **未來擴充**
   - 根據模式調整出題策略
   - 段考範圍指定（使用 `scope_id`）
   - 速度專項的時間限制
   - 錯誤類型診斷的詳細分析

## 檔案清單

### 新增檔案
- `supabase/add_quiz_mode_matrix.sql` - Migration SQL
- `types/quizMode.ts` - 模式型別定義與工具函數
- `QUIZ_MODE_MATRIX_TEST.md` - 本測試文件

### 修改檔案
- `types/index.ts` - 更新 `Session` 介面
- `app/diagnostic/page.tsx` - 加入模式選擇 UI
- `app/api/diagnostic/build/route.ts` - 接收模式參數
- `app/api/diagnostic/submit/route.ts` - 儲存模式資訊
- `app/api/reports/student-latest/route.ts` - 回傳模式資訊
- `app/api/reports/class-student/route.ts` - 回傳模式資訊
- `app/report/student/[studentId]/page.tsx` - 顯示模式資訊
- `app/teacher/class/[classId]/student/[studentId]/page.tsx` - 顯示模式資訊

## 疑難排解

### 問題 1：Migration 執行失敗

**錯誤訊息**：`type "quiz_mode" already exists`

**解決方法**：
- 檢查 enum 是否已存在
- 若已存在，可跳過 enum 建立步驟，直接新增欄位

### 問題 2：模式選擇未顯示

**可能原因**：
- `showModeSelection` 狀態未正確設定
- 章節選擇後未觸發模式選擇

**解決方法**：
- 檢查瀏覽器 Console 是否有錯誤
- 確認 `handleStart` 函數邏輯正確

### 問題 3：資料庫記錄缺少模式資訊

**可能原因**：
- API 未正確傳遞 `subject` 和 `quizMode`
- Migration 未正確執行

**解決方法**：
- 檢查 Network 標籤中的 API 請求 payload
- 確認 Migration SQL 已執行
- 檢查 `student_sessions` 表結構

## 聯絡資訊

如有問題，請檢查：
1. 終端機錯誤訊息
2. 瀏覽器 Console
3. Supabase 日誌


