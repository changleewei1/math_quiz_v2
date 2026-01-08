# ChatGPT 生成題目提示模板

## 🚀 快速使用

直接複製以下模板，填入你的需求，貼給 ChatGPT 即可！

---

## 模板 1：生成指定數量的題目（最常用）

```
請幫我生成 [數量] 道 [難度] 難度的 [題型] 題目，主題是 [主題名稱]。

要求：
1. 輸出格式必須是 JSON 陣列
2. 每道題目必須包含以下欄位：
   - difficulty: "easy" 或 "medium" 或 "hard"
   - qtype: "input" 或 "mcq" 或 "word"
   - prompt: 題目內容
   - answer: 正確答案
   - explain: 解析說明

3. 如果是選擇題（mcq），還需要：
   - choices: 選項陣列（至少 4 個選項）
   - correct_choice_index: 正確選項的索引（從 0 開始，0 表示第一個選項）

4. 如果是應用題（word），建議包含：
   - equation: 計算過程或方程式

5. 請確保 JSON 格式正確，可以直接使用

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

### 使用範例：

```
請幫我生成 9 道中等難度的選擇題，主題是一元一次方程式。

要求：
1. 輸出格式必須是 JSON 陣列
2. 每道題目必須包含以下欄位：
   - difficulty: "medium"
   - qtype: "mcq"
   - prompt: 題目內容
   - answer: 正確答案
   - choices: 選項陣列（至少 4 個選項）
   - correct_choice_index: 正確選項的索引（從 0 開始）
   - explain: 解析說明

3. 請確保 JSON 格式正確，可以直接使用
```

---

## 模板 2：生成混合難度和題型的題目

```
請幫我生成 [總數] 道題目，主題是 [主題名稱]。

難度分配：
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

### 使用範例：

```
請幫我生成 9 道題目，主題是一元一次式化簡。

難度分配：
- 簡單題（easy）：3 道
- 中等題（medium）：3 道
- 困難題（hard）：3 道

題型分配：
- 輸入題（input）：3 道
- 選擇題（mcq）：3 道
- 應用題（word）：3 道

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

---

## 模板 3：根據技能點生成題目

```
根據以下技能點，請為每個技能點生成 [數量] 道題目（包含 easy、medium、hard 各 [數量] 道）：

技能點列表：
[貼上技能點列表，例如：]
- S01: 變數與常數概念
- S02: 代數式的項與係數
- S03: 同類項與代數式次數

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
   - choices: 選項陣列（選擇題需要，至少 4 個選項）
   - correct_choice_index: 正確選項索引（選擇題需要，從 0 開始）

請確保 JSON 格式正確，可以直接使用。
```

---

## 模板 4：生成特定章節的完整題庫

```
請為「[章節名稱]」章節生成完整的題庫，包含以下題型：

題型列表：
[貼上題型列表，例如：]
- S01: 變數與常數概念（Concept，基礎）
- S02: 代數式的項與係數（Concept，基礎）
- S03: 同類項與代數式次數（Concept，進階）

要求：
1. 每個題型生成 9 道題目（easy、medium、hard 各 3 道）
2. 根據題型特性選擇適當的題型（input、mcq、word）
3. 輸出格式：JSON 陣列
4. 每道題目包含：
   - difficulty: "easy" | "medium" | "hard"
   - qtype: "input" | "mcq" | "word"
   - prompt: 題目內容
   - answer: 正確答案
   - explain: 詳細解析
   - equation: 計算過程（應用題必須包含）
   - choices: 選項陣列（選擇題必須包含，至少 4 個選項）
   - correct_choice_index: 正確選項索引（選擇題必須包含，從 0 開始）

請確保 JSON 格式正確，可以直接使用。
```

---

## 📝 欄位說明（給 ChatGPT 參考）

### 必要欄位
- `difficulty`: 難度等級，只能是 `"easy"`、`"medium"`、`"hard"`（小寫英文）
- `qtype`: 題型，只能是 `"input"`（輸入題）、`"mcq"`（選擇題）、`"word"`（應用題）
- `prompt`: 題目內容（問題描述）
- `answer`: 正確答案

### 選擇題專用欄位（qtype: "mcq" 時必須有）
- `choices`: 選項陣列，至少 4 個選項，例如：`["選項 A", "選項 B", "選項 C", "選項 D"]`
- `correct_choice_index`: 正確選項的索引，從 0 開始（0 = 第一個選項，1 = 第二個選項，以此類推）

### 可選欄位
- `explain`: 解析說明（建議所有題目都包含）
- `equation`: 方程式或計算過程（應用題建議包含）
- `tags`: 標籤陣列，例如：`["代數", "一次方程式"]`
- `video_url`: 相關教學影片連結

---

## ✅ 驗證清單

生成後，請確認：
- [ ] JSON 格式正確（可用 [JSONLint](https://jsonlint.com/) 驗證）
- [ ] 資料是陣列格式 `[...]`
- [ ] 每道題目都包含 `difficulty`、`qtype`、`prompt`、`answer`
- [ ] `difficulty` 是 `"easy"`、`"medium"` 或 `"hard"`（小寫）
- [ ] `qtype` 是 `"input"`、`"mcq"` 或 `"word"`（小寫）
- [ ] 選擇題包含 `choices` 陣列（至少 4 個選項）
- [ ] 選擇題包含 `correct_choice_index`（在有效範圍內）
- [ ] `prompt` 和 `answer` 不是空字串

---

## 💡 提示

1. **明確指定格式**：在提示中明確要求「輸出 JSON 格式」
2. **指定數量**：明確說明要生成多少道題目
3. **指定難度**：明確說明難度分配（如：easy 3 道、medium 3 道、hard 3 道）
4. **檢查格式**：生成後先用 JSONLint 驗證格式
5. **測試少量**：先測試 3-5 道題目，確認格式正確後再大量生成

---

## 📄 完整範例（給 ChatGPT 參考）

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
  }
]
```

