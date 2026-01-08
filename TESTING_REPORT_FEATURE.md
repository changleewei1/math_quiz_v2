# 弱點分析報告功能測試指南

## 前置準備

### 1. 建立資料表

在 Supabase SQL Editor 執行：

```sql
-- 執行 supabase/add_recipients.sql
\i supabase/add_recipients.sql
```

或直接執行：

```sql
CREATE TABLE IF NOT EXISTS student_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('parent', 'teacher')),
    line_user_id TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, role, line_user_id)
);

CREATE INDEX IF NOT EXISTS idx_recipients_student ON student_recipients(student_id);
CREATE INDEX IF NOT EXISTS idx_recipients_active ON student_recipients(is_active);
CREATE INDEX IF NOT EXISTS idx_recipients_line_user ON student_recipients(line_user_id);
```

### 2. 建立 Supabase Storage Bucket

1. 前往 Supabase Dashboard → Storage
2. 建立新的 bucket，名稱：`reports`
3. 設定為 **Public**（或使用 Signed URL，但需要額外設定）

### 3. 設定環境變數

在 `.env.local` 中新增：

```env
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
APP_PUBLIC_BASE_URL=http://localhost:3000  # 或使用 ngrok
```

### 4. 取得 LINE User ID

有兩種方式：

**方式 1：使用 LINE Official Account Manager**
- 前往 [LINE Official Account Manager](https://manager.line.biz/)
- 找到你的 Channel
- 在「設定」→「Messaging API」中可以看到 Webhook URL 設定
- 但這不會直接顯示 User ID

**方式 2：使用 LINE Bot 取得 User ID（推薦）**
1. 建立一個簡單的 LINE Bot
2. 當用戶加入 Bot 時，Bot 會收到 `follow` 事件
3. 從事件中取得 `source.userId`，這就是 LINE User ID
4. 或使用 [LINE Developers Console](https://developers.line.biz/console/) 的「Messaging API」→「Webhook settings」→「Verify」來測試

**方式 3：使用測試工具**
- 使用 [LINE Web Simulator](https://developers.line.biz/console/flex-simulator/) 來測試
- 或使用 [ngrok](https://ngrok.com/) 建立 webhook 接收測試訊息

### 5. 插入測試接收者資料

在 Supabase SQL Editor 執行：

```sql
-- 插入測試接收者（請替換為實際的 LINE User ID）
INSERT INTO student_recipients (student_id, role, line_user_id, is_active)
VALUES 
  ('student001', 'parent', 'U1234567890abcdef1234567890abcdef', true),
  ('student001', 'teacher', 'U0987654321fedcba0987654321fedcba', true);
```

**注意**：`line_user_id` 必須是真實的 LINE User ID（通常以 `U` 開頭，32 個字元）

## 測試步驟

### 步驟 1：完成一次診斷測驗

1. 啟動開發伺服器：`npm run dev`
2. 前往 `http://localhost:3000/diagnostic`
3. 選擇一個章節
4. 點擊「開始測驗」
5. 完成所有題目並提交

### 步驟 2：檢查報告生成

提交後，系統會自動：
1. 分析作答記錄
2. 生成統計圖表
3. 上傳到 Supabase Storage
4. 發送 LINE Flex Message

檢查方式：
- 查看瀏覽器控制台是否有錯誤
- 查看終端是否有錯誤訊息
- 如果成功，會顯示「已成功發送報告給 X 位接收者」

### 步驟 3：檢查 LINE 訊息

1. 打開 LINE App
2. 找到你的 Bot 或 Official Account
3. 應該會收到一條 Flex Message，包含：
   - 標題：弱點分析報告
   - 章節名稱和日期
   - 統計圖表
   - 總題數、正確題數、總正確率
   - 主要弱點 Top 3
   - 推薦練習按鈕
   - 「查看完整報告」按鈕

### 步驟 4：查看完整報告頁面

1. 點擊 LINE 訊息中的「查看完整報告」按鈕
2. 或直接前往：`http://localhost:3000/report/{sessionId}`
3. 應該會看到：
   - 總體統計（總題數、正確題數、總正確率）
   - 統計圖表
   - 各題型詳細統計表格
   - 主要弱點 Top 3
   - 分析摘要

### 步驟 5：測試後台接收者管理

1. 前往 `http://localhost:3000/admin`
2. 登入後台
3. 點擊「接收者管理」按鈕
4. 測試功能：
   - 新增接收者
   - 啟用/停用接收者
   - 刪除接收者

## 常見問題

### Q1: 沒有收到 LINE 訊息

**可能原因：**
1. LINE User ID 不正確
2. LINE Channel Access Token 未設定或錯誤
3. 接收者未設定或 `is_active = false`
4. `student_id` 不匹配（系統使用 `session.student_id` 或 `'anonymous'`）

**解決方法：**
1. 檢查 `.env.local` 中的 `LINE_CHANNEL_ACCESS_TOKEN`
2. 檢查 `student_recipients` 表中的資料
3. 查看終端錯誤訊息
4. 確認 `student_id` 與 session 中的 `student_id` 一致（或使用 `'anonymous'`）

### Q2: 圖表上傳失敗

**可能原因：**
1. Supabase Storage bucket `reports` 不存在
2. Bucket 權限設定錯誤
3. Supabase Storage 未啟用

**解決方法：**
1. 在 Supabase Dashboard 建立 `reports` bucket
2. 設定為 Public 或使用 Signed URL
3. 檢查 Supabase 專案設定

### Q3: 報告頁面無法載入

**可能原因：**
1. `sessionId` 不存在
2. 沒有作答記錄
3. API 錯誤

**解決方法：**
1. 檢查 URL 中的 `sessionId` 是否正確
2. 檢查 `student_sessions` 和 `question_attempts` 表中是否有資料
3. 查看瀏覽器控制台和終端錯誤訊息

### Q4: 統計分析不正確

**可能原因：**
1. 題型資料不完整
2. 作答記錄格式錯誤

**解決方法：**
1. 檢查 `question_types` 表中是否有對應的題型資料
2. 檢查 `question_attempts` 表中的資料完整性

## 測試資料範例

### 插入測試接收者（使用 anonymous）

```sql
INSERT INTO student_recipients (student_id, role, line_user_id, is_active)
VALUES 
  ('anonymous', 'parent', 'YOUR_LINE_USER_ID_1', true),
  ('anonymous', 'teacher', 'YOUR_LINE_USER_ID_2', true);
```

### 檢查 session 和 attempts

```sql
-- 查看最近的診斷測驗
SELECT id, mode, chapter_id, student_id, started_at, ended_at
FROM student_sessions
WHERE mode = 'diagnostic'
ORDER BY started_at DESC
LIMIT 5;

-- 查看作答記錄
SELECT 
  qa.session_id,
  qa.type_id,
  qt.code as type_code,
  qt.name as type_name,
  qa.difficulty,
  qa.is_correct,
  COUNT(*) as count
FROM question_attempts qa
LEFT JOIN question_types qt ON qa.type_id = qt.id
WHERE qa.session_id = 'YOUR_SESSION_ID'
GROUP BY qa.session_id, qa.type_id, qt.code, qt.name, qa.difficulty, qa.is_correct;
```

## 下一步

完成測試後，可以：
1. 整合到正式環境
2. 設定 ngrok 或正式網域
3. 設定 LINE Official Account
4. 邀請家長和老師加入 Bot
5. 在後台設定接收者資料

