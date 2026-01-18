# 題目圖片功能使用指南

## 📋 功能概述

題目圖片功能允許後台管理員為題目附加圖片、圖表等媒體資源，並在前台（弱點分析模式、題型練習模式）自動顯示。

## 🗄️ 資料庫設定

### 1. 執行 Migration SQL

在 Supabase SQL Editor 執行：

```sql
-- 檔案位置：supabase/add_question_media.sql
ALTER TABLE questions ADD COLUMN IF NOT EXISTS media jsonb;
CREATE INDEX IF NOT EXISTS idx_questions_media ON questions USING gin (media);
```

### 2. 建立 Storage Bucket

1. 前往 Supabase Dashboard → Storage
2. 點擊 "New bucket"
3. 設定：
   - **Name**: `question-media`
   - **Public bucket**: ✅ 勾選（讓圖片可公開存取）
4. 點擊 "Create bucket"

## 📸 使用流程

### 後台：上傳題目圖片

1. **新增或編輯題目**
   - 前往 `/admin`
   - 選擇章節和題型
   - 點擊「新增題目」或選擇現有題目「編輯」

2. **上傳圖片（僅限已儲存的題目）**
   - 在題目編輯頁面，找到「題目圖片（可選）」區塊
   - 如果是新題目，請先點擊「儲存」建立題目
   - 點擊「上傳圖片」按鈕
   - 選擇圖片檔案：
     - **支援格式**：PNG、JPEG、WebP
     - **檔案大小**：不超過 2MB
   - （可選）輸入圖片說明（例如：圖一、座標圖、統計圖表）
   - 圖片會自動上傳並顯示預覽

3. **更新或移除圖片**
   - 若要更新圖片，直接點擊「更新圖片」並選擇新檔案
   - 若要移除圖片，點擊「移除圖片」按鈕

### 前台：查看題目圖片

題目圖片會在以下頁面自動顯示：

1. **弱點分析模式** (`/diagnostic`)
   - 在題目內容下方自動顯示圖片
   - 如有設定圖片說明，會顯示在圖片下方

2. **題型練習模式** (`/practice`)
   - 在題目內容下方自動顯示圖片
   - 如有設定圖片說明，會顯示在圖片下方

## 📁 檔案結構

### 新增檔案

- `supabase/add_question_media.sql` - 資料庫 migration
- `types/media.ts` - 媒體類型定義
- `components/QuestionMedia.tsx` - 題目媒體顯示元件

### 修改檔案

- `types/index.ts` - 更新 Question 接口，加入 media 欄位
- `app/admin/question/[id]/page.tsx` - 加入圖片上傳 UI
- `app/diagnostic/page.tsx` - 加入圖片顯示
- `app/practice/page.tsx` - 加入圖片顯示
- `README.md` - 更新文件說明

## 🔧 技術細節

### Media 資料格式

```json
{
  "type": "image",
  "url": "https://xxx.supabase.co/storage/v1/object/public/question-media/m1-1-1-1/type-abc/uuid.png",
  "caption": "圖一"
}
```

### Storage 路徑規則

```
question-media/{chapterId}/{typeId}/{questionId}.{ext}
```

範例：
- `question-media/m1-1-1-1/type-abc/12345678-1234-1234-1234-123456789abc.png`

### API 端點

- `PATCH /api/admin/question?id={questionId}` - 更新題目的 media 欄位
  - Body: `{ media: MediaBlock | null }`

## ⚠️ 注意事項

1. **新題目必須先儲存**：只有已儲存的題目才能上傳圖片（需要有 questionId）
2. **檔案大小限制**：圖片檔案不超過 2MB
3. **公開存取**：Storage bucket 必須設定為 Public，否則圖片無法顯示
4. **覆蓋舊檔**：更新圖片時會自動覆蓋舊檔案（使用相同的檔案名稱）

## 🧪 測試步驟

1. **執行資料庫 Migration**
   ```sql
   -- 在 Supabase SQL Editor 執行
   -- 複製 supabase/add_question_media.sql 的內容並執行
   ```

2. **建立 Storage Bucket**
   - 前往 Supabase Dashboard → Storage
   - 建立名為 `question-media` 的 Public bucket

3. **後台測試**
   - 登入後台 `/admin/login`
   - 新增一個題目並儲存
   - 上傳一張測試圖片
   - 檢查圖片是否正確顯示在預覽區

4. **前台測試**
   - 登入學生帳號
   - 前往弱點分析模式或題型練習模式
   - 確認題目圖片正確顯示

## 🐛 常見問題

### Q: 圖片無法顯示？

**A:** 檢查以下項目：
1. Storage bucket 是否設定為 Public
2. 圖片 URL 是否正確
3. 瀏覽器控制台是否有錯誤訊息

### Q: 上傳圖片失敗？

**A:** 檢查以下項目：
1. 檔案格式是否為 PNG、JPEG 或 WebP
2. 檔案大小是否超過 2MB
3. 題目是否已儲存（有 questionId）
4. 終端機是否有錯誤訊息

### Q: 如何刪除已上傳的圖片？

**A:** 在題目編輯頁面，點擊「移除圖片」按鈕。這會將 media 欄位設為 null，但不會刪除 Storage 中的檔案（可手動在 Supabase Dashboard 刪除）。

## 📝 未來擴充

目前僅支援圖片類型，未來可擴充：

- **表格類型**：支援在題目中嵌入表格資料
- **圖表類型**：支援動態生成圖表（如長條圖、折線圖）
- **多媒體**：支援影片、音訊等

擴充時只需：
1. 在 `types/media.ts` 新增類型定義
2. 在 `components/QuestionMedia.tsx` 新增渲染邏輯
3. 在後台 UI 新增對應的上傳/編輯功能


