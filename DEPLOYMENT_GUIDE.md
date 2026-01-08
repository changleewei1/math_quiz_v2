# 部署指南 - 讓學生線上測試

## 📋 目錄

1. [部署選項](#部署選項)
2. [方案一：使用 Vercel（推薦）](#方案一使用-vercel推薦)
3. [方案二：使用 ngrok（臨時測試）](#方案二使用-ngrok臨時測試)
4. [方案三：自託管（長期運行）](#方案三自託管長期運行)
5. [環境變數設定](#環境變數設定)
6. [常見問題](#常見問題)

---

## 部署選項

### 選項比較

| 選項 | 優點 | 缺點 | 適用場景 |
|------|------|------|----------|
| **Vercel** | ✅ 免費、自動部署<br>✅ 全球 CDN<br>✅ HTTPS 自動配置<br>✅ 不佔用本地資源 | ⚠️ 需要 Git 倉庫 | 正式上線推薦 |
| **ngrok** | ✅ 快速測試<br>✅ 不需要 Git<br>✅ 立即獲得公開 URL | ⚠️ 免費版 URL 會變動<br>⚠️ 需要本地電腦運行 | 臨時測試 |
| **自託管** | ✅ 完全控制<br>✅ 固定 IP/網域 | ⚠️ 需要伺服器<br>⚠️ 需要維護 | 企業/學校內網 |

---

## 方案一：使用 Vercel（推薦）

### 優點
- ✅ **完全免費**（個人專案）
- ✅ **自動 HTTPS**（安全連線）
- ✅ **全球 CDN**（快速存取）
- ✅ **自動部署**（推送代碼自動更新）
- ✅ **不需要本地電腦運行**

### 步驟

#### 1. 準備 Git 倉庫

```bash
# 如果還沒有 Git 倉庫，初始化一個
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub（需要先建立 GitHub 帳號和倉庫）
git remote add origin https://github.com/yourusername/math-quiz-v2.git
git branch -M main
git push -u origin main
```

#### 2. 在 Vercel 部署

1. **前往 Vercel**
   - 訪問：https://vercel.com
   - 使用 GitHub 帳號登入（推薦）

2. **匯入專案**
   - 點擊 "Add New..." → "Project"
   - 選擇你的 GitHub 倉庫
   - 點擊 "Import"

3. **設定環境變數**
   - 在 "Environment Variables" 區塊添加以下變數：
   
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ADMIN_PASSWORD=your_admin_password
   ADMIN_COOKIE_NAME=admin_session
   ADMIN_COOKIE_SECRET=your_secret_key_at_least_32_characters_long
   ADMIN_COOKIE_SECURE=true
   LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
   APP_PUBLIC_BASE_URL=https://your-project.vercel.app
   ```

4. **部署**
   - 點擊 "Deploy"
   - 等待 2-3 分鐘完成部署
   - 獲得網址：`https://your-project.vercel.app`

5. **分享網址給學生**
   - 將獲得的網址分享給學生
   - 例如：`https://math-quiz-v2.vercel.app`

### 更新部署

每次更新代碼後：

```bash
git add .
git commit -m "Update features"
git push
```

Vercel 會自動檢測並重新部署，通常 2-3 分鐘完成。

---

## 方案二：使用 ngrok（臨時測試）

### 優點
- ✅ 快速獲得公開 URL
- ✅ 不需要 Git
- ✅ 適合快速測試

### 缺點
- ⚠️ 免費版 URL 每次啟動都會變動
- ⚠️ 需要本地電腦持續運行
- ⚠️ 電腦關閉就無法訪問

### 步驟

#### 1. 安裝 ngrok

**macOS:**
```bash
brew install ngrok
```

**或下載：**
- 訪問：https://ngrok.com/download
- 下載並解壓縮

#### 2. 註冊 ngrok（免費）

1. 訪問：https://ngrok.com
2. 註冊免費帳號
3. 獲取 Authtoken（在 Dashboard → Getting Started）

#### 3. 設定 ngrok

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

#### 4. 啟動本地開發伺服器

```bash
# 在專案目錄下
npm run dev
```

應該會看到：
```
✓ Ready on http://localhost:3000
```

#### 5. 啟動 ngrok 隧道

```bash
ngrok http 3000
```

會顯示：
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

#### 6. 更新環境變數

在 `.env.local` 中更新：

```env
APP_PUBLIC_BASE_URL=https://abc123.ngrok-free.app
```

#### 7. 分享網址給學生

將 `https://abc123.ngrok-free.app` 分享給學生

⚠️ **注意**：
- 每次重啟 ngrok，URL 都會改變（免費版）
- 本地電腦必須保持運行
- 電腦關閉或網路斷線，學生就無法訪問

---

## 方案三：自託管（長期運行）

### 使用雲端伺服器（推薦：DigitalOcean、AWS、Linode）

#### 1. 租用雲端伺服器

- **DigitalOcean**: https://www.digitalocean.com (最便宜，$6/月起)
- **AWS EC2**: https://aws.amazon.com/ec2
- **Linode**: https://www.linode.com

建議規格：
- 1 CPU、1GB RAM 即可
- Ubuntu 22.04 LTS

#### 2. 在伺服器上設定

SSH 連接到伺服器後：

```bash
# 更新系統
sudo apt update && sudo apt upgrade -y

# 安裝 Node.js（使用 nvm）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# 安裝 PM2（進程管理器）
npm install -g pm2

# 克隆專案
git clone https://github.com/yourusername/math-quiz-v2.git
cd math-quiz-v2

# 安裝依賴
npm install

# 設定環境變數
nano .env.local
# 填入所有環境變數

# 建置專案
npm run build

# 使用 PM2 啟動（讓應用持續運行）
pm2 start npm --name "math-quiz" -- start
pm2 save
pm2 startup
```

#### 3. 設定網域（可選）

1. 購買網域（如：mathquiz.yourschool.com）
2. 設定 DNS A 記錄指向伺服器 IP
3. 使用 Nginx 作為反向代理：

```bash
# 安裝 Nginx
sudo apt install nginx

# 設定 Nginx
sudo nano /etc/nginx/sites-available/math-quiz
```

加入以下內容：

```nginx
server {
    listen 80;
    server_name mathquiz.yourschool.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 啟用設定
sudo ln -s /etc/nginx/sites-available/math-quiz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 設定 HTTPS（使用 Let's Encrypt）
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d mathquiz.yourschool.com
```

#### 4. PM2 常用指令

```bash
# 查看狀態
pm2 status

# 查看日誌
pm2 logs math-quiz

# 重啟應用
pm2 restart math-quiz

# 停止應用
pm2 stop math-quiz

# 刪除應用
pm2 delete math-quiz
```

---

## 環境變數設定

### 部署時的環境變數

無論使用哪種方案，都需要設定以下環境變數：

```env
# Supabase（必要）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 後台管理（必要）
ADMIN_PASSWORD=your_secure_password
ADMIN_COOKIE_NAME=admin_session
ADMIN_COOKIE_SECRET=your_secret_at_least_32_characters_long
ADMIN_COOKIE_SECURE=true  # Vercel/生產環境設為 true

# LINE Messaging API（選填，弱點分析報告功能）
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token

# 應用程式基礎 URL（必要，用於生成報告連結）
# Vercel: https://your-project.vercel.app
# ngrok: https://abc123.ngrok-free.app
# 自託管: https://your-domain.com
APP_PUBLIC_BASE_URL=https://your-domain.com
```

### 在不同平台設定

**Vercel:**
- 專案設定 → Environment Variables → Add
- 分別為 Production、Preview、Development 設定

**ngrok:**
- 編輯 `.env.local` 文件

**自託管:**
- 編輯 `.env.local` 或在系統環境變數中設定

---

## 常見問題

### Q1: 學生需要帳號密碼嗎？

**A:** 不需要。學生可以直接訪問網址使用，不需要登入。只有後台管理需要密碼。

### Q2: 電腦需要一直開著嗎？

**A:** 
- **Vercel**: ✅ 不需要，應用在雲端運行
- **ngrok**: ⚠️ 需要，本地電腦必須運行
- **自託管**: ✅ 不需要，伺服器 24/7 運行

### Q3: 可以同時多少人使用？

**A:**
- **Vercel**: 免費版有流量限制，但一般學校使用足夠
- **自託管**: 取決於伺服器規格，一般 1GB RAM 可支援 50-100 人同時使用

### Q4: 如何更新題目？

**A:**
1. 訪問後台：`https://your-domain.com/admin`
2. 使用管理密碼登入
3. 在後台新增/編輯/刪除題目
4. 學生刷新頁面即可看到更新

### Q5: 資料會保存在哪裡？

**A:** 所有資料保存在 Supabase 雲端資料庫，不會存在本地電腦。

### Q6: 如何備份資料？

**A:** 
- Supabase Dashboard → Settings → Database → Backups
- 或使用 Supabase CLI 匯出資料

### Q7: 費用是多少？

**A:**
- **Vercel**: 完全免費（個人專案）
- **Supabase**: 免費版 500MB 資料庫，足夠使用
- **ngrok**: 免費版可用（URL 會變動）
- **自託管**: 約 $6-12/月（雲端伺服器）

### Q8: 如何監控使用情況？

**A:**
- Vercel Dashboard 可查看訪問統計
- Supabase Dashboard 可查看資料庫使用量
- 在應用中可查看 `student_sessions` 表了解學生作答記錄

---

## 推薦方案

### 🥇 首選：Vercel（正式上線）
- 免費、穩定、快速
- 不需要維護伺服器
- 適合正式使用

### 🥈 臨時測試：ngrok
- 快速測試用
- 不適合正式上線

### 🥉 企業/學校：自託管
- 需要固定網域
- 完全控制
- 適合內部網路

---

## 快速開始（推薦流程）

1. **準備 Git 倉庫**（5 分鐘）
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   # 推送到 GitHub
   ```

2. **部署到 Vercel**（10 分鐘）
   - 註冊 Vercel 帳號
   - 匯入 GitHub 倉庫
   - 設定環境變數
   - 點擊部署

3. **分享網址給學生**（1 分鐘）
   - 複製 Vercel 提供的網址
   - 分享給學生

4. **完成！** ✅
   - 學生可以立即使用
   - 你可以在後台管理題目

---

## 需要協助？

如果部署過程中遇到問題：
1. 檢查環境變數是否正確設定
2. 查看 Vercel/伺服器日誌
3. 確認 Supabase 連線正常
4. 檢查 `.env.local` 檔案格式

