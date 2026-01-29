# 客戶一鍵部署流程（最短版）

目標：快速為每個補習班建立「獨立版本 + 獨立資料庫 + 獨立網址」。

---

## 0) 前提

- GitHub 有三個分支：`v1` / `v2` / `v3`
- Supabase 有三個專案（建議）：
  - `supabase-v1`
  - `supabase-v2`
  - `supabase-v3`
- Vercel 需綁定 GitHub repo

---

## 1) 版本選擇

- **v1**：空機版（無題目）
- **v2**：含題庫
- **v3**：功能擴充版

---

## 2) Vercel 一鍵部署（每個客戶一個專案）

1. Vercel → **Add New → Project**
2. 選擇 GitHub repo
3. 選擇對應分支（v1 / v2 / v3）
4. 填入環境變數（對應該版本的 Supabase 專案）
5. Deploy

---

## 3) 環境變數（必填）

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

ADMIN_PASSWORD=...
ADMIN_COOKIE_SECRET=...至少32字
ADMIN_COOKIE_SECURE=true

TEACHER_COOKIE_SECRET=...至少32字
TEACHER_COOKIE_SECURE=true

STUDENT_COOKIE_SECRET=...至少32字
STUDENT_COOKIE_SECURE=true

APP_PUBLIC_BASE_URL=https://你的新網址
```

---

## 4) Supabase 套用 SQL（依版本）

依 `docs/VERSION_MIGRATIONS.md` 套用對應 SQL。

---

## 5) 完成後檢查

- `/admin/login` 可登入
- `/practice` 可進入
- `/diagnostic` 可進入
- 若題庫不足應顯示「題庫不足」

---

## 6) 建議命名

- Vercel 專案：`math-quiz-v1-clientA`
- Supabase 專案：`mq-v1-clientA`

---

如需「客戶專屬網域」或「功能切換」可再加。

