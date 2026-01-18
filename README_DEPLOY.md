# 部署準備（Phase 1）

本文件對應本次上線任務的 Phase 1：Vercel 部署準備與設定檢查。

## 1) 必要環境變數（Vercel）

在 Vercel 專案設定 → Environment Variables 加入：

```env
# Supabase (必要)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 後台管理 (必要)
ADMIN_PASSWORD=your_admin_password
ADMIN_COOKIE_NAME=admin_session
ADMIN_COOKIE_SECRET=your_secret_at_least_32_characters_long
ADMIN_COOKIE_SECURE=true

# 老師/學生 Cookie (必要)
TEACHER_COOKIE_NAME=teacher_session
TEACHER_COOKIE_SECRET=your_teacher_secret_at_least_32_characters_long
TEACHER_COOKIE_SECURE=true
STUDENT_COOKIE_NAME=student_session
STUDENT_COOKIE_SECRET=your_student_secret_at_least_32_characters_long
STUDENT_COOKIE_SECURE=true

# 專案基礎 URL (建議)
APP_PUBLIC_BASE_URL=https://your-project.vercel.app
```

注意事項：
- `*_COOKIE_SECRET` 必須 >= 32 字元。
- `*_COOKIE_SECURE` 在 Vercel (HTTPS) 要設為 `true`。
- `APP_PUBLIC_BASE_URL` 會用於報告/分享連結。

## 2) Supabase 設定（Site URL / Redirect / CORS）

雖然本專案目前用自建 cookie 登入，但建議先設定以避免未來功能擴充時出錯：

在 Supabase Dashboard → Authentication → URL Configuration：
- Site URL：`https://your-project.vercel.app`
- Additional Redirect URLs：
  - `http://localhost:3000`
  - `https://*.vercel.app`（Preview 用）

在 Supabase Dashboard → Project Settings → API：
- 確認 Project URL 與 anon key 正確

## 3) Build 前檢查

本機先跑一次：

```bash
npm run build
```

若有 `Dynamic server usage` 錯誤，可能是 Server Component 使用了 `cookies()` 或 `headers()`，
需要在該頁面加上：

```ts
export const dynamic = 'force-dynamic';
```

目前專案中 `cookies()` 主要在 API route / middleware 使用，風險較低。

## 4) Vercel 部署步驟

1. 推送專案到 GitHub
2. Vercel 新建專案 → Import
3. 設定環境變數（見上）
4. Deploy

部署成功後，請回到 Vercel → Environment Variables 更新：
- `APP_PUBLIC_BASE_URL` 為實際 Vercel 網址

## 5) 重要提醒

- 本專案採自建 cookie session，非 Supabase Auth。
- 前端不要暴露 Service Role Key。
- 若登入後馬上被登出，先檢查 `*_COOKIE_SECURE` 是否為 `true`。

