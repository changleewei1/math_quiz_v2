# 品牌設定功能設定指南

## 📋 功能概述

品牌設定功能允許管理員在後台即時調整前台的品牌元素：
- **補習班名稱**：可自訂顯示在前台的名稱
- **Logo 圖案**：可上傳並更換 Logo
- **字型設定**：可選擇前台使用的字型

## 🚀 設定步驟

### 步驟 1：建立 Supabase 資料表

在 Supabase SQL Editor 執行：

```sql
-- 執行 supabase/add_brand_settings.sql
```

或直接執行以下 SQL：

```sql
CREATE TABLE IF NOT EXISTS brand_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    brand_name TEXT NOT NULL DEFAULT '名貫補習班',
    logo_url TEXT,
    font_family TEXT DEFAULT 'var(--font-noto-serif-tc), serif',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO brand_settings (id, brand_name, logo_url, font_family)
VALUES ('default', '名貫補習班', '/Black and White Circle Business Logo.png', 'var(--font-noto-serif-tc), serif')
ON CONFLICT (id) DO NOTHING;
```

### 步驟 2：建立 Supabase Storage Bucket

1. 前往 Supabase Dashboard → Storage
2. 點擊 "New bucket"
3. 設定：
   - **Name**: `brand-assets`
   - **Public bucket**: ✅ 勾選（讓前台可以讀取 Logo）
4. 點擊 "Create bucket"

### 步驟 3：設定 Storage 權限（可選）

如果需要更細緻的權限控制，可以在 SQL Editor 執行：

```sql
-- 允許公開讀取 brand-assets bucket
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'brand-assets');
```

### 步驟 4：新增自訂字型（可選）

如果您有自訂字型檔案：

1. 將字型檔案（.woff2, .woff, .ttf）放到 `public/fonts/` 目錄
2. 編輯 `lib/fonts.ts`，在 `AVAILABLE_FONTS` 陣列中新增：

```typescript
{
  id: 'my-custom-font',
  name: '我的自訂字型',
  cssFamily: '"MyCustomFont", "Noto Sans TC", sans-serif',
  filePath: '/fonts/my-custom-font.woff2',
  description: '自訂字型說明',
},
```

3. 如果需要在前端載入字型，可以在 `app/layout.tsx` 或 `app/globals.css` 中新增 `@font-face`：

```css
@font-face {
  font-family: 'MyCustomFont';
  src: url('/fonts/my-custom-font.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}
```

## 🎯 使用方式

### 後台管理

1. 登入後台管理（`/admin/login`）
2. 點擊「品牌設定」按鈕
3. 編輯以下項目：
   - **補習班名稱**：輸入新的名稱
   - **Logo**：點擊「選擇並上傳 Logo」選擇圖片
   - **前台字型**：從下拉選單選擇字型
4. 點擊「儲存設定」

### 前台效果

設定儲存後，前台會立即套用：
- 首頁標題區域顯示新的補習班名稱和 Logo
- 全站文字使用選擇的字型
- 所有頁面都會自動更新

## 📁 檔案結構

```
math-quiz-v2/
├── supabase/
│   └── add_brand_settings.sql          # 資料表建立腳本
├── lib/
│   ├── brandSettings.ts                # 品牌設定 Server Helper
│   └── fonts.ts                        # 字型設定檔
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   └── brand/
│   │   │       ├── route.ts            # 讀取/更新品牌設定 API
│   │   │       └── upload-logo/
│   │   │           └── route.ts        # Logo 上傳 API
│   │   └── brand/
│   │       └── route.ts                # 前台取得品牌設定 API
│   ├── admin/
│   │   └── brand/
│   │       └── page.tsx                 # 品牌設定後台頁面
│   └── layout.tsx                       # 已修改：套用品牌設定
├── components/
│   └── BrandHeader.tsx                  # 品牌 Header 組件
└── app/page.tsx                         # 已修改：使用 BrandHeader
```

## 🔧 技術細節

### 快取策略

- **Server-side**：使用 React `cache()` 函數，在同一個 request 中只查詢一次
- **Client-side**：前台 API (`/api/brand`) 設定 `revalidate: 60`，快取 60 秒
- **更新後**：使用 `revalidatePath()` 立即清除快取，讓前台立即更新

### Logo 儲存

- Logo 上傳到 Supabase Storage (`brand-assets` bucket)
- 使用 timestamp 作為檔名，避免快取問題
- 取得公開 URL 後存入資料庫

### 字型套用

- 字型透過 `style={{ fontFamily }}` 套用到 `<body>` 標籤
- 支援 CSS 變數（如 `var(--font-noto-serif-tc)`）
- 自動 fallback 到系統字型

## ⚠️ 注意事項

1. **Storage Bucket 必須是 Public**：讓前台可以讀取 Logo
2. **Logo 檔案大小限制**：目前設定為 5MB
3. **支援的圖片格式**：PNG、JPEG、SVG、WebP
4. **字型檔案**：如果使用自訂字型，需要在前端載入（`@font-face`）

## 🧪 測試步驟

1. **測試讀取設定**
   - 訪問 `/admin/brand`
   - 確認可以載入現有設定

2. **測試更新名稱**
   - 修改補習班名稱
   - 點擊儲存
   - 訪問首頁，確認名稱已更新

3. **測試上傳 Logo**
   - 選擇一個圖片檔案
   - 上傳後確認預覽更新
   - 訪問首頁，確認 Logo 已更新

4. **測試字型變更**
   - 選擇不同的字型
   - 點擊儲存
   - 訪問首頁，確認字型已套用

5. **測試快取**
   - 修改設定後，立即訪問前台
   - 確認設定立即生效（無需等待）

## 📝 後續擴充建議

1. **多語言支援**：可以擴充為支援多語言品牌名稱
2. **主題色彩**：可以新增主題色彩設定
3. **Logo 尺寸調整**：可以新增 Logo 尺寸設定
4. **字型預覽**：可以新增更多字型預覽選項
5. **版本控制**：可以保留 Logo 歷史版本


