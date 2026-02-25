# 品牌設定功能 - 檔案清單

## 📁 新增檔案

### 資料庫與設定
1. **supabase/add_brand_settings.sql**
   - 建立 `brand_settings` 資料表
   - 插入預設值
   - 建立更新時間觸發器

### 核心功能
2. **lib/brandSettings.ts**
   - Server-side helper：`getBrandSettings()`
   - 使用 React `cache()` 快取
   - 提供預設值 fallback

3. **lib/fonts.ts**
   - 字型設定檔
   - `AVAILABLE_FONTS` 陣列定義可用字型
   - Helper 函數：`getFontById()`, `getDefaultFont()`

### API Routes
4. **app/api/admin/brand/route.ts**
   - `GET`: 取得品牌設定（需 admin 權限）
   - `PATCH`: 更新品牌設定（需 admin 權限）
   - 使用 `revalidatePath()` 清除快取

5. **app/api/admin/brand/upload-logo/route.ts**
   - `POST`: 上傳 Logo 到 Supabase Storage
   - 驗證檔案類型和大小
   - 自動更新資料庫

6. **app/api/brand/route.ts**
   - `GET`: 公開 API，前台取得品牌設定
   - 設定 `revalidate: 60` 快取策略

### 後台頁面
7. **app/admin/brand/page.tsx**
   - 品牌設定後台管理頁面
   - 表單：補習班名稱、Logo 上傳、字型選擇
   - 即時預覽功能

### 前台組件
8. **components/BrandHeader.tsx**
   - 可重用的品牌 Header 組件
   - 顯示 Logo 和補習班名稱
   - 整合學生登入狀態

### 文件
9. **BRAND_SETTINGS_SETUP.md**
   - 完整設定指南
   - 使用說明
   - 測試步驟

10. **BRAND_SETTINGS_FILES.md**（本檔案）
    - 檔案清單與說明

## 📝 修改檔案

### 核心 Layout
1. **app/layout.tsx**
   - 修改：改為 async function
   - 新增：讀取品牌設定並套用到 `<body>` 的 `fontFamily` style
   - 保留：原有的 Google Fonts 載入

### 首頁
2. **app/page.tsx**
   - 修改：使用 `BrandHeader` 組件取代原本的 Header 程式碼
   - 簡化：移除重複的學生登入邏輯（移至 BrandHeader）

### 後台管理
3. **app/admin/page.tsx**
   - 修改：在標題區域新增「品牌設定」按鈕
   - 連結到 `/admin/brand`

## 🔧 需要手動設定的項目

### Supabase 設定

1. **執行 SQL 腳本**
   ```sql
   -- 在 Supabase SQL Editor 執行
   -- supabase/add_brand_settings.sql
   ```

2. **建立 Storage Bucket**
   - 名稱：`brand-assets`
   - 設定為 Public bucket
   - 允許公開讀取

### 環境變數

無需新增環境變數，使用現有的 Supabase 設定即可。

## ✅ 驗收檢查清單

- [ ] 執行 `supabase/add_brand_settings.sql` 建立資料表
- [ ] 在 Supabase 建立 `brand-assets` Storage bucket（Public）
- [ ] 訪問 `/admin/brand` 可以正常載入頁面
- [ ] 可以修改補習班名稱並儲存
- [ ] 可以上傳 Logo 並看到預覽
- [ ] 可以選擇字型並看到預覽
- [ ] 修改設定後，前台首頁立即更新
- [ ] 重新整理頁面後設定仍存在
- [ ] 非 admin 無法訪問 `/admin/brand`（會導向登入頁）

## 🧪 測試指令

```bash
# 1. 建置測試
npm run build

# 2. 啟動開發伺服器
npm run dev

# 3. 訪問後台品牌設定
# http://localhost:3000/admin/brand

# 4. 訪問前台首頁
# http://localhost:3000
```

## 📊 資料庫結構

### brand_settings 表

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | TEXT (PK) | 固定為 'default'（單例模式） |
| brand_name | TEXT | 補習班名稱 |
| logo_url | TEXT | Logo 圖片 URL（Supabase Storage 或 public 路徑） |
| font_family | TEXT | CSS font-family 值 |
| updated_at | TIMESTAMPTZ | 最後更新時間 |
| created_at | TIMESTAMPTZ | 建立時間 |

## 🔐 權限控制

- **後台品牌設定頁面** (`/admin/brand`)：由 proxy 保護，需 admin 登入
- **API Routes** (`/api/admin/brand/*`)：使用 `verifyAdminCookie()` 驗證
- **前台 API** (`/api/brand`)：公開 API，無需登入

## 🎨 字型擴充方式

在 `lib/fonts.ts` 的 `AVAILABLE_FONTS` 陣列中新增：

```typescript
{
  id: 'my-font',
  name: '我的字型',
  cssFamily: '"MyFont", "Noto Sans TC", sans-serif',
  filePath: '/fonts/my-font.woff2', // 可選
  description: '字型說明',
},
```

如果需要載入自訂字型檔案，在 `app/globals.css` 或 `app/layout.tsx` 中新增 `@font-face`。


