# 品牌設定功能問題排除指南

## 🔴 錯誤：missing required error components, refreshing...

### 可能原因

1. **資料表尚未建立**：`brand_settings` 資料表不存在
2. **Storage Bucket 不存在**：`brand-assets` bucket 尚未建立
3. **API 錯誤未正確處理**：某些錯誤導致組件崩潰

### 解決方法

#### 步驟 1：確認資料表已建立

在 Supabase SQL Editor 執行：

```sql
-- 檢查資料表是否存在
SELECT * FROM brand_settings WHERE id = 'default';

-- 如果不存在，執行以下 SQL
-- 複製 supabase/add_brand_settings.sql 的內容並執行
```

#### 步驟 2：確認 Storage Bucket 已建立

1. 前往 Supabase Dashboard → Storage
2. 確認是否有 `brand-assets` bucket
3. 如果沒有，建立一個 Public bucket

#### 步驟 3：檢查終端機錯誤訊息

```bash
# 查看開發伺服器的完整輸出
npm run dev
```

查看是否有以下錯誤：
- `relation "brand_settings" does not exist`
- `bucket "brand-assets" does not exist`
- 其他資料庫連線錯誤

#### 步驟 4：清除快取並重新啟動

```bash
# 清除 Next.js 快取
rm -rf .next

# 重新啟動
npm run dev
```

## ✅ 快速修復檢查清單

- [ ] 已執行 `supabase/add_brand_settings.sql`
- [ ] 已建立 `brand-assets` Storage bucket（Public）
- [ ] 確認 `.env.local` 中的 Supabase 設定正確
- [ ] 清除 `.next` 目錄並重新啟動
- [ ] 檢查瀏覽器控制台（F12）的錯誤訊息
- [ ] 檢查終端機的錯誤輸出

## 🧪 測試資料表是否存在

在 Supabase SQL Editor 執行：

```sql
-- 測試查詢
SELECT * FROM brand_settings;
```

如果出現錯誤 "relation does not exist"，表示資料表尚未建立。

## 🔧 手動建立資料表（如果 SQL 腳本失敗）

如果執行 SQL 腳本時出現錯誤，可以手動建立：

```sql
-- 1. 建立資料表
CREATE TABLE IF NOT EXISTS brand_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    brand_name TEXT NOT NULL DEFAULT '名貫補習班',
    logo_url TEXT,
    font_family TEXT DEFAULT 'var(--font-noto-serif-tc), serif',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 插入預設值
INSERT INTO brand_settings (id, brand_name, logo_url, font_family)
VALUES ('default', '名貫補習班', '/Black and White Circle Business Logo.png', 'var(--font-noto-serif-tc), serif')
ON CONFLICT (id) DO NOTHING;

-- 3. 驗證資料
SELECT * FROM brand_settings;
```

## 📝 常見錯誤訊息與解決方法

### 錯誤 1：PGRST116 - relation does not exist

**原因**：資料表不存在

**解決**：執行 `supabase/add_brand_settings.sql`

### 錯誤 2：bucket not found

**原因**：Storage bucket 不存在

**解決**：在 Supabase Dashboard 建立 `brand-assets` bucket（Public）

### 錯誤 3：Unauthorized

**原因**：未登入或 Cookie 過期

**解決**：重新登入管理員帳號

### 錯誤 4：無法載入品牌設定

**原因**：Supabase 連線問題或資料表結構錯誤

**解決**：
1. 檢查 `.env.local` 中的 Supabase URL 和 Key
2. 確認 Supabase 專案正常運行
3. 檢查資料表結構是否正確

## 💡 開發模式除錯

如果問題持續，可以：

1. **檢查終端機輸出**
   ```bash
   npm run dev
   # 查看完整的錯誤訊息
   ```

2. **檢查瀏覽器控制台**
   - 按 F12 開啟開發者工具
   - 查看 Console 標籤的錯誤訊息
   - 查看 Network 標籤的 API 請求

3. **測試 API 直接呼叫**
   ```bash
   # 測試取得品牌設定 API
   curl http://localhost:3000/api/admin/brand \
     -H "Cookie: admin_session=your_session_cookie"
   ```

## 🆘 如果問題仍然存在

如果執行上述步驟後問題仍然存在，請：

1. 檢查 Supabase 專案是否正常運行
2. 確認環境變數設定正確
3. 查看完整的錯誤訊息（終端機 + 瀏覽器控制台）
4. 確認資料表和 bucket 都已正確建立

## 📞 取得幫助

如果問題持續，請提供：
- 終端機的完整錯誤訊息
- 瀏覽器控制台的錯誤訊息
- 已執行的 SQL 腳本內容
- Supabase Dashboard 的截圖（Storage 和 Table Editor）


