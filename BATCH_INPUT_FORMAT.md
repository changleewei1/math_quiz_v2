# 批次輸入題目格式說明

## 概述

批次輸入功能允許您一次新增多道題目，支援 JSON 格式的輸入。所有題目會新增到當前選擇的章節和題型中。

## 使用方式

1. 在後台管理頁面，選擇要新增題目的章節和題型
2. 點擊「批次輸入」按鈕
3. 在輸入框中貼上 JSON 格式的題目資料
4. 點擊「批次新增題目」按鈕完成新增

## JSON 格式

輸入必須是一個 JSON **陣列**，每個元素代表一道題目。

### 基本結構

```json
[
  {
    "difficulty": "easy",
    "qtype": "input",
    "prompt": "題目內容",
    "answer": "答案"
  },
  {
    "difficulty": "medium",
    "qtype": "mcq",
    "prompt": "題目內容",
    "answer": "答案",
    "choices": ["選項1", "選項2", "選項3", "選項4"],
    "correct_choice_index": 1
  }
]
```

## 欄位說明

### 必要欄位（所有題型都需要）

| 欄位名稱 | 類型 | 說明 | 範例 |
|---------|------|------|------|
| `difficulty` | string | 難度等級 | `"easy"`, `"medium"`, `"hard"` |
| `qtype` | string | 題型 | `"input"`, `"mcq"`, `"word"` |
| `prompt` | string | 題目內容 | `"計算 3 + 5 = ?"` |
| `answer` | string | 正確答案 | `"8"` |

### 選擇題（mcq）額外必要欄位

| 欄位名稱 | 類型 | 說明 | 範例 |
|---------|------|------|------|
| `choices` | array | 選項陣列（至少 2 個） | `["選項 A", "選項 B", "選項 C", "選項 D"]` |
| `correct_choice_index` | number | 正確選項的索引（從 0 開始） | `1` （表示第二個選項是正確答案） |

### 可選欄位（所有題型都可以使用）

| 欄位名稱 | 類型 | 說明 | 範例 |
|---------|------|------|------|
| `equation` | string | 方程式或計算過程（word 題型常用） | `"10 - 3 = 7"` |
| `explain` | string | 解析說明 | `"3 + 5 = 8"` |
| `tags` | array | 標籤陣列 | `["代數", "一次方程式"]` |
| `video_url` | string | 相關教學影片連結 | `"https://example.com/video"` |

## 題型說明

### 1. 輸入題（input）

適合需要學生直接輸入答案的題目。

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
  "prompt": "下列哪個選項是正確的？",
  "answer": "選項 B",
  "choices": ["選項 A", "選項 B", "選項 C", "選項 D"],
  "correct_choice_index": 1,
  "explain": "正確答案是選項 B"
}
```

**注意：**
- `choices` 必須是陣列，至少包含 2 個選項
- `correct_choice_index` 是從 0 開始的索引
  - `0` = 第一個選項
  - `1` = 第二個選項
  - `2` = 第三個選項
  - 以此類推

### 3. 應用題（word）

適合文字敘述的應用題。

```json
{
  "difficulty": "hard",
  "qtype": "word",
  "prompt": "小明有 10 元，買了 3 元的糖果，還剩多少？",
  "answer": "7",
  "equation": "10 - 3 = 7",
  "explain": "10 - 3 = 7 元"
}
```

## 完整範例

以下是一個包含三種題型的完整範例：

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
    "difficulty": "medium",
    "qtype": "mcq",
    "prompt": "下列哪個是 2x + 3 = 7 的解？",
    "answer": "x = 2",
    "choices": ["x = 1", "x = 2", "x = 3", "x = 4"],
    "correct_choice_index": 1,
    "explain": "2x + 3 = 7，移項得 2x = 4，所以 x = 2"
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
    "difficulty": "medium",
    "qtype": "mcq",
    "prompt": "一元一次方程式的形式是？",
    "answer": "ax + b = 0",
    "choices": [
      "ax² + bx + c = 0",
      "ax + b = 0",
      "a/x + b = 0",
      "x³ + a = 0"
    ],
    "correct_choice_index": 1,
    "explain": "一元一次方程式的標準形式是 ax + b = 0，其中 a ≠ 0",
    "tags": ["概念", "一元一次方程式"]
  }
]
```

## 常見錯誤

### 1. JSON 格式錯誤

**錯誤：**
```json
{
  "difficulty": "easy",
  "qtype": "input"
  // 缺少逗號或括號
}
```

**正確：**
```json
{
  "difficulty": "easy",
  "qtype": "input",
  "prompt": "題目",
  "answer": "答案"
}
```

### 2. 選擇題缺少必要欄位

**錯誤：**
```json
{
  "difficulty": "easy",
  "qtype": "mcq",
  "prompt": "題目",
  "answer": "答案"
  // 缺少 choices 和 correct_choice_index
}
```

**正確：**
```json
{
  "difficulty": "easy",
  "qtype": "mcq",
  "prompt": "題目",
  "answer": "答案",
  "choices": ["選項1", "選項2"],
  "correct_choice_index": 0
}
```

### 3. 難度或題型值錯誤

**錯誤：**
```json
{
  "difficulty": "簡單",  // 應該使用 "easy"
  "qtype": "選擇題"      // 應該使用 "mcq"
}
```

**正確：**
```json
{
  "difficulty": "easy",
  "qtype": "mcq"
}
```

## 驗證規則

系統會自動驗證以下項目：

1. ✅ JSON 格式是否正確
2. ✅ 資料是否為陣列
3. ✅ 每個題目是否包含所有必要欄位
4. ✅ `difficulty` 是否為 `easy`、`medium` 或 `hard`
5. ✅ `qtype` 是否為 `input`、`mcq` 或 `word`
6. ✅ `prompt` 和 `answer` 是否為非空字串
7. ✅ 選擇題是否有 `choices` 陣列（至少 2 個選項）
8. ✅ 選擇題是否有有效的 `correct_choice_index`

## 提示

- 使用 JSON 格式化工具（如 [JSONLint](https://jsonlint.com/)）檢查格式
- 可以先匯出現有題目，參考其格式
- 使用「載入範例」按鈕查看範例格式
- 批次新增不會刪除現有題目，會直接新增到現有題目之後

## 支援

如有問題，請檢查：
1. JSON 格式是否正確
2. 所有必要欄位是否都有填寫
3. 欄位值是否符合要求（特別是 `difficulty` 和 `qtype`）
4. 選擇題的 `correct_choice_index` 是否在 `choices` 陣列的範圍內

