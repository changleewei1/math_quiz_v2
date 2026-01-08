# 批次輸入題目完整指南

## 📋 目錄
1. [快速開始](#快速開始)
2. [JSON 格式說明](#json-格式說明)
3. [欄位詳細說明](#欄位詳細說明)
4. [三種題型範例](#三種題型範例)
5. [給 ChatGPT 的提示模板](#給-chatgpt-的提示模板)
6. [完整範例](#完整範例)
7. [常見錯誤與解決方法](#常見錯誤與解決方法)

---

## 快速開始

### 步驟 1：準備 JSON 檔案
1. 使用 ChatGPT 或其他工具生成題目 JSON
2. 將 JSON 內容儲存為 `.json` 檔案（可選，也可以直接複製貼上）

### 步驟 2：在後台匯入
1. 登入後台管理頁面 (`/admin`)
2. 選擇要新增題目的**章節**和**題型**
3. 點擊「批次輸入」按鈕
4. 將 JSON 內容貼上到輸入框
5. 點擊「批次新增題目」完成匯入

---

## JSON 格式說明

### 基本結構
批次輸入必須是一個 **JSON 陣列**，每個元素代表一道題目：

```json
[
  { /* 題目 1 */ },
  { /* 題目 2 */ },
  { /* 題目 3 */ }
]
```

### 單一題目結構
每道題目是一個 JSON 物件，包含以下欄位：

```json
{
  "difficulty": "easy|medium|hard",
  "qtype": "input|mcq|word",
  "prompt": "題目內容",
  "answer": "正確答案",
  "choices": ["選項1", "選項2", ...],  // 僅選擇題需要
  "correct_choice_index": 0,            // 僅選擇題需要
  "equation": "計算過程",                // 可選
  "explain": "解析說明",                 // 可選
  "tags": ["標籤1", "標籤2"],            // 可選
  "video_url": "https://..."            // 可選
}
```

---

## 欄位詳細說明

### 🔴 必要欄位（所有題型都必須有）

| 欄位名稱 | 類型 | 允許值 | 說明 | 範例 |
|---------|------|--------|------|------|
| `difficulty` | string | `"easy"`<br>`"medium"`<br>`"hard"` | 難度等級 | `"easy"` |
| `qtype` | string | `"input"`<br>`"mcq"`<br>`"word"` | 題型類型 | `"input"` |
| `prompt` | string | 任何非空字串 | 題目內容（問題描述） | `"計算 3 + 5 = ?"` |
| `answer` | string | 任何非空字串 | 正確答案 | `"8"` |

### 🟡 選擇題專用欄位（`qtype: "mcq"` 時必須有）

| 欄位名稱 | 類型 | 說明 | 範例 |
|---------|------|------|------|
| `choices` | array | 選項陣列，至少 2 個選項 | `["選項 A", "選項 B", "選項 C", "選項 D"]` |
| `correct_choice_index` | number | 正確選項的索引（從 0 開始） | `1` 表示第二個選項是正確答案 |

**重要：**
- `choices` 必須是陣列，至少包含 2 個元素
- `correct_choice_index` 必須是 0 到 `choices.length - 1` 之間的整數
- 索引從 0 開始：`0` = 第一個選項，`1` = 第二個選項，以此類推

### 🟢 可選欄位（所有題型都可以使用）

| 欄位名稱 | 類型 | 說明 | 範例 |
|---------|------|------|------|
| `equation` | string | 方程式或計算過程（應用題常用） | `"10 - 3 = 7"` |
| `explain` | string | 解析說明（解題步驟） | `"3 + 5 = 8"` |
| `tags` | array | 標籤陣列（用於分類） | `["代數", "一次方程式"]` |
| `video_url` | string | 相關教學影片連結 | `"https://example.com/video"` |

---

## 三種題型範例

### 1. 輸入題（input）
適合需要學生直接輸入答案的計算題。

```json
{
  "difficulty": "easy",
  "qtype": "input",
  "prompt": "計算 3 + 5 = ?",
  "answer": "8",
  "explain": "3 + 5 = 8"
}
```

### 2. 選擇題（mcq）
適合有多個選項的題目。

```json
{
  "difficulty": "medium",
  "qtype": "mcq",
  "prompt": "下列哪個是 2x + 3 = 7 的解？",
  "answer": "x = 2",
  "choices": ["x = 1", "x = 2", "x = 3", "x = 4"],
  "correct_choice_index": 1,
  "explain": "2x + 3 = 7，移項得 2x = 4，所以 x = 2"
}
```

**注意：**
- `correct_choice_index: 1` 表示第二個選項（`"x = 2"`）是正確答案
- `choices` 陣列中的順序：`[0] = "x = 1"`, `[1] = "x = 2"`, `[2] = "x = 3"`, `[3] = "x = 4"`

### 3. 應用題（word）
適合文字敘述的應用題。

```json
{
  "difficulty": "hard",
  "qtype": "word",
  "prompt": "小明比小華大 3 歲，兩人年齡和為 25 歲，小明幾歲？",
  "answer": "14",
  "equation": "設小明 x 歲，則 x + (x - 3) = 25，得 x = 14",
  "explain": "設小明 x 歲，則小華 (x - 3) 歲，x + (x - 3) = 25，解出 x = 14"
}
```

---

## 給 ChatGPT 的提示模板

### 模板 1：生成單一題型的題目

```
請幫我生成 [數量] 道 [難度] 難度的 [題型] 題目，主題是 [主題]。

要求：
1. 輸出格式必須是 JSON 陣列
2. 每道題目必須包含以下欄位：
   - difficulty: "easy" 或 "medium" 或 "hard"
   - qtype: "input" 或 "mcq" 或 "word"
   - prompt: 題目內容
   - answer: 正確答案
   - explain: 解析說明（可選）
   - equation: 計算過程（應用題建議包含）

3. 如果是選擇題（mcq），還需要：
   - choices: 選項陣列（至少 4 個選項）
   - correct_choice_index: 正確選項的索引（從 0 開始）

4. 請確保 JSON 格式正確，可以直接使用

範例格式：
[
  {
    "difficulty": "easy",
    "qtype": "input",
    "prompt": "計算 3 + 5 = ?",
    "answer": "8",
    "explain": "3 + 5 = 8"
  }
]
```

### 模板 2：生成混合難度的題目

```
請幫我生成 [總數] 道題目，主題是 [主題]，要求：
- 簡單題（easy）：[數量] 道
- 中等題（medium）：[數量] 道
- 困難題（hard）：[數量] 道

題型分配：
- 輸入題（input）：[數量] 道
- 選擇題（mcq）：[數量] 道
- 應用題（word）：[數量] 道

輸出格式：JSON 陣列，每道題目包含：
- difficulty: "easy" | "medium" | "hard"
- qtype: "input" | "mcq" | "word"
- prompt: 題目內容
- answer: 正確答案
- explain: 解析說明
- equation: 計算過程（應用題必須包含）
- choices: 選項陣列（選擇題必須包含，至少 4 個選項）
- correct_choice_index: 正確選項索引（選擇題必須包含，從 0 開始）

請確保 JSON 格式正確，可以直接使用。
```

### 模板 3：根據技能樹生成題目

```
根據以下技能點，請為每個技能點生成 [數量] 道題目（包含 easy、medium、hard 各 [數量] 道）：

技能點列表：
[貼上技能點列表]

要求：
1. 每道題目必須對應到一個技能點
2. 題目難度要符合技能點的難度等級
3. 輸出格式：JSON 陣列
4. 每道題目包含：
   - difficulty: "easy" | "medium" | "hard"
   - qtype: "input" | "mcq" | "word"（根據技能點類型選擇）
   - prompt: 題目內容
   - answer: 正確答案
   - explain: 詳細解析
   - equation: 計算過程（如有）
   - choices: 選項陣列（選擇題需要）
   - correct_choice_index: 正確選項索引（選擇題需要）

請確保 JSON 格式正確，可以直接使用。
```

---

## 完整範例

### 範例 1：混合題型（9 道題目）

```json
[
  {
    "difficulty": "easy",
    "qtype": "input",
    "prompt": "計算 3 + 5 = ?",
    "answer": "8",
    "explain": "3 + 5 = 8"
  },
  {
    "difficulty": "easy",
    "qtype": "input",
    "prompt": "計算 10 - 3 = ?",
    "answer": "7",
    "explain": "10 - 3 = 7"
  },
  {
    "difficulty": "easy",
    "qtype": "input",
    "prompt": "計算 4 × 6 = ?",
    "answer": "24",
    "explain": "4 × 6 = 24"
  },
  {
    "difficulty": "medium",
    "qtype": "mcq",
    "prompt": "下列哪個是 2x + 3 = 7 的解？",
    "answer": "x = 2",
    "choices": ["x = 1", "x = 2", "x = 3", "x = 4"],
    "correct_choice_index": 1,
    "explain": "2x + 3 = 7，移項得 2x = 4，所以 x = 2"
  },
  {
    "difficulty": "medium",
    "qtype": "mcq",
    "prompt": "一元一次方程式的標準形式是？",
    "answer": "ax + b = 0",
    "choices": [
      "ax² + bx + c = 0",
      "ax + b = 0",
      "a/x + b = 0",
      "x³ + a = 0"
    ],
    "correct_choice_index": 1,
    "explain": "一元一次方程式的標準形式是 ax + b = 0，其中 a ≠ 0"
  },
  {
    "difficulty": "medium",
    "qtype": "mcq",
    "prompt": "解方程式 3x - 5 = 10，x = ?",
    "answer": "5",
    "choices": ["3", "4", "5", "6"],
    "correct_choice_index": 2,
    "explain": "3x - 5 = 10，移項得 3x = 15，所以 x = 5"
  },
  {
    "difficulty": "hard",
    "qtype": "word",
    "prompt": "小明比小華大 3 歲，兩人年齡和為 25 歲，小明幾歲？",
    "answer": "14",
    "equation": "設小明 x 歲，則 x + (x - 3) = 25，得 x = 14",
    "explain": "設小明 x 歲，則小華 (x - 3) 歲，x + (x - 3) = 25，解出 x = 14"
  },
  {
    "difficulty": "hard",
    "qtype": "word",
    "prompt": "某商品打 8 折後是 480 元，求原價。",
    "answer": "600",
    "equation": "設原價為 x 元，則 0.8x = 480，得 x = 600",
    "explain": "設原價為 x 元，打 8 折後為 0.8x 元，0.8x = 480，解出 x = 600 元"
  },
  {
    "difficulty": "hard",
    "qtype": "word",
    "prompt": "甲以每小時 5 公里健走 2 小時又多走 x 小時，共走 20 公里，求 x。",
    "answer": "2",
    "equation": "5 × 2 + 5x = 20，得 10 + 5x = 20，5x = 10，x = 2",
    "explain": "前 2 小時走了 5 × 2 = 10 公里，後 x 小時走了 5x 公里，總共 10 + 5x = 20，解出 x = 2 小時"
  }
]
```

### 範例 2：純選擇題（6 道題目）

```json
[
  {
    "difficulty": "easy",
    "qtype": "mcq",
    "prompt": "在 3x + 5 中，x 的係數是多少？",
    "answer": "3",
    "choices": ["3", "5", "3x", "x"],
    "correct_choice_index": 0,
    "explain": "在代數式 3x + 5 中，x 的係數是 3"
  },
  {
    "difficulty": "easy",
    "qtype": "mcq",
    "prompt": "下列哪一個是常數？",
    "answer": "5",
    "choices": ["x", "3x", "5", "x + 1"],
    "correct_choice_index": 2,
    "explain": "常數是固定不變的數值，5 是常數"
  },
  {
    "difficulty": "medium",
    "qtype": "mcq",
    "prompt": "判斷下列哪些是同類項：3x, -2x, 4y, x²",
    "answer": "3x 和 -2x 是同類項",
    "choices": [
      "3x 和 4y 是同類項",
      "3x 和 -2x 是同類項",
      "4y 和 x² 是同類項",
      "全部都是同類項"
    ],
    "correct_choice_index": 1,
    "explain": "同類項需變數與指數完全相同，3x 和 -2x 都是 x 的一次項，所以是同類項"
  },
  {
    "difficulty": "medium",
    "qtype": "mcq",
    "prompt": "化簡：3x + 5 - 2x + 7",
    "answer": "x + 12",
    "choices": ["x + 12", "5x + 12", "x - 12", "5x - 12"],
    "correct_choice_index": 0,
    "explain": "合併同類項：3x - 2x = x，5 + 7 = 12，所以答案是 x + 12"
  },
  {
    "difficulty": "hard",
    "qtype": "mcq",
    "prompt": "當 x = -2 時，求 3x² - 4x + 1 的值",
    "answer": "21",
    "choices": ["21", "17", "13", "9"],
    "correct_choice_index": 0,
    "explain": "代入 x = -2：3(-2)² - 4(-2) + 1 = 3(4) + 8 + 1 = 12 + 8 + 1 = 21"
  },
  {
    "difficulty": "hard",
    "qtype": "mcq",
    "prompt": "長為 x、寬為 x + 3 的長方形周長為何？",
    "answer": "4x + 6",
    "choices": ["4x + 6", "2x + 6", "x² + 3x", "2x + 3"],
    "correct_choice_index": 0,
    "explain": "長方形周長 = 2(長 + 寬) = 2(x + x + 3) = 2(2x + 3) = 4x + 6"
  }
]
```

---

## 常見錯誤與解決方法

### ❌ 錯誤 1：JSON 格式錯誤

**錯誤範例：**
```json
{
  "difficulty": "easy",
  "qtype": "input"
  // 缺少逗號
  "prompt": "題目"
}
```

**解決方法：**
- 使用 JSON 驗證工具（如 [JSONLint](https://jsonlint.com/)）檢查格式
- 確保所有字串都用雙引號 `"` 包圍
- 確保陣列和物件正確使用 `[]` 和 `{}`
- 確保最後一個欄位後面沒有逗號

### ❌ 錯誤 2：選擇題缺少必要欄位

**錯誤範例：**
```json
{
  "difficulty": "easy",
  "qtype": "mcq",
  "prompt": "題目",
  "answer": "答案"
  // 缺少 choices 和 correct_choice_index
}
```

**解決方法：**
- 選擇題（`qtype: "mcq"`）必須包含 `choices` 和 `correct_choice_index`
- `choices` 必須是陣列，至少包含 2 個選項
- `correct_choice_index` 必須是 0 到 `choices.length - 1` 之間的整數

### ❌ 錯誤 3：難度或題型值錯誤

**錯誤範例：**
```json
{
  "difficulty": "簡單",  // 錯誤：應該使用 "easy"
  "qtype": "選擇題"      // 錯誤：應該使用 "mcq"
}
```

**解決方法：**
- `difficulty` 只能是：`"easy"`、`"medium"`、`"hard"`（小寫英文）
- `qtype` 只能是：`"input"`、`"mcq"`、`"word"`（小寫英文）

### ❌ 錯誤 4：correct_choice_index 超出範圍

**錯誤範例：**
```json
{
  "difficulty": "easy",
  "qtype": "mcq",
  "prompt": "題目",
  "answer": "答案",
  "choices": ["選項1", "選項2"],  // 只有 2 個選項
  "correct_choice_index": 3      // 錯誤：索引超出範圍（應該是 0 或 1）
}
```

**解決方法：**
- `correct_choice_index` 必須是 0 到 `choices.length - 1` 之間的整數
- 如果有 2 個選項，索引只能是 0 或 1
- 如果有 4 個選項，索引只能是 0、1、2 或 3

### ❌ 錯誤 5：不是陣列格式

**錯誤範例：**
```json
{
  "difficulty": "easy",
  "qtype": "input",
  "prompt": "題目",
  "answer": "答案"
}
```

**解決方法：**
- 批次輸入必須是**陣列格式**，即使只有一道題目也要用 `[]` 包圍
- 正確格式：`[{ ... }]`

---

## 驗證清單

在匯入前，請確認：

- [ ] JSON 格式正確（可用 [JSONLint](https://jsonlint.com/) 驗證）
- [ ] 資料是陣列格式 `[...]`
- [ ] 每道題目都包含 `difficulty`、`qtype`、`prompt`、`answer`
- [ ] `difficulty` 是 `"easy"`、`"medium"` 或 `"hard"`（小寫）
- [ ] `qtype` 是 `"input"`、`"mcq"` 或 `"word"`（小寫）
- [ ] 選擇題（`mcq`）包含 `choices` 陣列（至少 2 個選項）
- [ ] 選擇題（`mcq`）包含 `correct_choice_index`（在有效範圍內）
- [ ] `prompt` 和 `answer` 不是空字串

---

## 提示

1. **使用 ChatGPT 生成題目時**，明確要求輸出 JSON 格式
2. **先測試少量題目**（如 3-5 道），確認格式正確後再大量匯入
3. **保留原始 JSON 檔案**，以便日後修改或重新匯入
4. **檢查答案格式**，確保與題目要求一致（如數字、分數、小數等）
5. **選擇題的選項要平衡**，避免正確答案過於明顯

---

## 需要協助？

如果遇到問題，請檢查：
1. 瀏覽器控制台的錯誤訊息
2. JSON 格式是否正確
3. 所有必要欄位是否都有填寫
4. 欄位值是否符合要求

