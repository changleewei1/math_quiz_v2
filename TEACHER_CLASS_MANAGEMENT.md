# 老師班級管理功能說明

## 功能概述

已完成以下功能：

1. **管理員可以幫老師選擇管理的班級**
   - 新增老師時可以選擇管理的班級（可多選）
   - 編輯老師時可以修改管理的班級（可多選）

2. **管理員可以編輯修改已存在的老師資料**
   - 編輯帳號、暱稱、狀態
   - 修改密碼（可選，留空則不修改）
   - 修改管理的班級

## 資料庫設定

### 1. 建立 teacher_classes 表

請在 Supabase SQL Editor 中執行 `supabase/add_teacher_classes.sql`：

```sql
-- 建立 teacher_classes 表（老師-班級關聯）
CREATE TABLE IF NOT EXISTS teacher_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(teacher_id, class_id)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_teacher_classes_teacher ON teacher_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_classes_class ON teacher_classes(class_id);
```

## 功能說明

### 管理員端（/admin）

#### 新增老師
1. 點擊「老師管理」頁籤
2. 點擊「新增老師」按鈕
3. 填寫：
   - **帳號**（必填）
   - **密碼**（必填）
   - **暱稱**（必填）
   - **帳號狀態**（啟用/停用）
   - **管理的班級**（可多選，選項來自已建立的班級）
4. 點擊「新增老師」按鈕

#### 編輯老師
1. 在老師列表中，點擊要編輯的老師的「編輯」按鈕
2. 系統會載入該老師的資料和管理的班級
3. 可以修改：
   - **帳號**（必填）
   - **密碼**（選填，留空則不修改）
   - **暱稱**（必填）
   - **帳號狀態**（啟用/停用）
   - **管理的班級**（可多選）
4. 點擊「儲存修改」按鈕
5. 點擊「取消」按鈕可取消編輯

### 老師端（/teacher）

#### 查看管理的班級
- 老師登入後，在 `/teacher` 頁面只會顯示該老師被分配管理的班級
- 如果老師沒有被分配任何班級，則不會顯示任何班級

## API 端點

### GET /api/admin/teacher-classes?teacherId={teacherId}
取得指定老師管理的班級 ID 列表。

**權限要求**：管理員

**回應範例**：
```json
{
  "classIds": ["uuid1", "uuid2"]
}
```

### POST /api/admin/teacher-classes
更新老師管理的班級。

**權限要求**：管理員

**請求體**：
```json
{
  "teacherId": "teacher-uuid",
  "classIds": ["class-uuid-1", "class-uuid-2"]
}
```

**回應範例**：
```json
{
  "success": true
}
```

### GET /api/teacher/classes
取得當前登入老師管理的班級列表。

**權限要求**：已登入的老師

**回應範例**：
```json
{
  "classes": [
    {
      "id": "uuid",
      "name": "一年級A班",
      "school_year": "2024",
      "semester": "上學期"
    }
  ]
}
```

## 測試步驟

### 1. 建立資料庫表
```sql
-- 在 Supabase SQL Editor 執行
\i supabase/add_teacher_classes.sql
```

或直接複製 `supabase/add_teacher_classes.sql` 的內容到 Supabase SQL Editor 執行。

### 2. 測試新增老師並選擇班級
1. 登入管理員後台（`/admin/login`）
2. 點擊「老師管理」頁籤
3. 點擊「新增老師」
4. 填寫老師資料，並在「管理的班級」中選擇一個或多個班級
5. 點擊「新增老師」
6. 確認老師新增成功

### 3. 測試編輯老師資料和班級
1. 在老師列表中找到剛才新增的老師
2. 點擊「編輯」按鈕
3. 修改帳號、暱稱或狀態
4. 修改管理的班級（可新增或移除班級）
5. 點擊「儲存修改」
6. 確認修改成功

### 4. 測試老師端顯示
1. 使用剛才編輯的老師帳號登入（`/teacher/login`）
2. 進入 `/teacher` 頁面
3. 確認只顯示該老師被分配管理的班級
4. 點擊班級進入班級總覽頁面，確認功能正常

### 5. 測試密碼修改
1. 編輯老師資料
2. 在密碼欄位輸入新密碼（或不填以保持原密碼）
3. 儲存修改
4. 使用新密碼登入測試（如果修改了密碼）

## 注意事項

1. **班級必須先建立**：在為老師分配班級之前，必須先在「班級管理」中建立班級。
2. **一個老師可以管理多個班級**：支援多選。
3. **一個班級可以有多個老師管理**：允許多對多關係。
4. **刪除老師時會自動刪除關聯**：由於使用了 `ON DELETE CASCADE`，刪除老師時會自動刪除 `teacher_classes` 表中的相關記錄。
5. **刪除班級時會自動刪除關聯**：同樣使用 `ON DELETE CASCADE`，刪除班級時會自動刪除相關記錄。

## 故障排除

### 問題：找不到 teacher_classes 表
**解決方案**：確認已在 Supabase SQL Editor 中執行 `supabase/add_teacher_classes.sql`。

### 問題：編輯老師時無法載入管理的班級
**解決方案**：
1. 檢查 `/api/admin/teacher-classes?teacherId=...` API 是否正常運作
2. 確認資料庫中是否有 `teacher_classes` 表
3. 檢查瀏覽器 Console 是否有錯誤訊息

### 問題：老師登入後看不到班級
**解決方案**：
1. 確認該老師已在管理員後台被分配至少一個班級
2. 確認班級狀態為「啟用」
3. 檢查 `/api/teacher/classes` API 是否正常運作

