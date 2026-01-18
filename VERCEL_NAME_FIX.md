# Vercel 專案名稱限制說明

## ❌ 錯誤訊息
"The name contains invalid characters. Only letters, digits, and underscores are allowed. Furthermore, the name should not start with a digit."

## ✅ Vercel 專案名稱規則

1. **只能使用**：英文字母（a-z, A-Z）、數字（0-9）、底線（_）
2. **不能使用**：連字號（-）、空格、其他特殊字元
3. **不能以數字開頭**

## 正確的專案名稱範例

✅ **可以使用：**
- `math_quiz_v2`
- `mathquizv2`
- `mathquiz_v2`
- `math_quiz_system`

❌ **不能使用：**
- `math-quiz-v2`（包含連字號 `-`）
- `math quiz v2`（包含空格）
- `2mathquiz`（以數字開頭）
- `math.quiz.v2`（包含點 `.`）

## 如何修改專案名稱

### 方法 1：匯入時修改（推薦）

1. 在 Vercel 匯入專案時
2. 找到 "Project Name" 欄位
3. 將名稱改為：`math_quiz_v2` 或 `mathquizv2`
4. 然後繼續匯入和設定環境變數

### 方法 2：匯入後修改

如果已經匯入但名稱錯誤：

1. 前往 Vercel Dashboard
2. 選擇您的專案
3. 點擊 "Settings" → "General"
4. 找到 "Project Name" 欄位
5. 修改為有效的名稱（例如：`math_quiz_v2`）
6. 點擊 "Save"

## 注意事項

- 專案名稱只影響 Vercel Dashboard 的顯示和 URL 路徑
- 不會影響 GitHub 倉庫名稱
- 部署後，URL 會是：`https://your-project-name.vercel.app`


