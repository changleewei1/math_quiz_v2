# 空白頁面除錯指南

## 問題：`/admin/brand` 頁面顯示空白

## 除錯步驟

### 1. 檢查瀏覽器開發者工具

按 `F12` 開啟開發者工具，檢查：

#### Console 標籤
- 查看是否有 JavaScript 錯誤（紅色訊息）
- 查看是否有警告（黃色訊息）

#### Network 標籤
- 重新整理頁面
- 檢查 `/admin/brand` 請求的狀態碼
- 檢查是否有失敗的資源請求（紅色）

#### Elements 標籤
- 檢查 `<body>` 是否有內容
- 檢查是否有隱藏的 `<div>`（可能是 CSS 問題）

### 2. 檢查是否已登入

訪問 `/admin/login` 確認是否已登入管理員帳號。

如果未登入，middleware 會自動重定向到登入頁。

### 3. 檢查路由是否正常

嘗試訪問其他頁面：
- `http://localhost:3000/admin` - 應該顯示後台主頁
- `http://localhost:3000/admin/login` - 應該顯示登入頁

如果這些頁面也空白，可能是更廣泛的問題。

### 4. 檢查終端機輸出

查看運行 `npm run dev` 的終端機，是否有錯誤訊息。

### 5. 清除快取

```bash
# 清除 Next.js 快取
rm -rf .next

# 重新啟動開發伺服器
npm run dev
```

### 6. 檢查瀏覽器快取

- 按 `Ctrl+Shift+R` (Windows/Linux) 或 `Cmd+Shift+R` (Mac) 強制重新整理
- 或使用無痕模式訪問頁面

### 7. 檢查組件檔案

確認 `app/admin/brand/page.tsx` 存在且語法正確：

```bash
# 檢查檔案是否存在
ls -la app/admin/brand/page.tsx

# 檢查語法
npm run build
```

## 常見原因

1. **未登入**：middleware 重定向導致空白
2. **JavaScript 錯誤**：組件渲染時出錯
3. **CSS 問題**：內容被隱藏或位置錯誤
4. **路由問題**：Next.js 路由配置錯誤
5. **快取問題**：瀏覽器或 Next.js 快取舊版本

## 快速測試

如果頁面仍然空白，可以暫時替換 `app/admin/brand/page.tsx` 為最簡單的版本：

```tsx
'use client';

export default function BrandTest() {
  return (
    <div style={{ padding: '40px' }}>
      <h1>品牌設定測試</h1>
      <p>如果你能看到這段文字，表示頁面可以正常渲染。</p>
    </div>
  );
}
```

如果這個簡化版本可以顯示，則問題在原始組件的邏輯中。


