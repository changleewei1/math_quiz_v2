export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type Dimension =
  | 'number_sense'
  | 'algebra_logic'
  | 'word_problem'
  | 'geometry'
  | 'data_reasoning';

export interface QuestionItem {
  id: string;
  question: string;
  options: string[];
  /** 正確選項索引 0～3 */
  correct_answer: number;
  dimension: Dimension;
  difficulty: QuestionDifficulty;
  concept_tag: string;
  mistake_type: string;
}

export const DIMENSION_LABEL: Record<Dimension, string> = {
  number_sense: '數感與計算',
  algebra_logic: '代數與規律',
  word_problem: '應用題',
  geometry: '幾何',
  data_reasoning: '資料判讀',
};

export function isAnswerCorrect(question: QuestionItem, selected: string): boolean {
  const idx = question.correct_answer;
  if (idx < 0 || idx >= question.options.length) return false;
  return selected === question.options[idx];
}

/**
 * 20 題高區辨力題庫：小六～國一銜接；每向度 4 題；錯誤類型對應補強話術。
 * 應用敘述題占比 ≥ 40%（含應用題向度與帶情境之題干）。
 */
export const QUESTIONS: QuestionItem[] = [
  // —— number_sense ×4 ——
  {
    id: 'ns1',
    question:
      '便利商店促銷：同款飲料「買 4 瓶送 1 瓶」。媽媽付了 12 瓶的錢，實際拿到幾瓶？',
    options: ['12 瓶', '14 瓶', '15 瓶', '16 瓶'],
    correct_answer: 2,
    dimension: 'number_sense',
    difficulty: 'medium',
    concept_tag: '數量關係與整數應用',
    mistake_type: '題意轉換錯誤',
  },
  {
    id: 'ns2',
    question: '下列何者最大？',
    options: ['2/3', '0.66', '13/20', '65%'],
    correct_answer: 0,
    dimension: 'number_sense',
    difficulty: 'hard',
    concept_tag: '分數小數百分率換算',
    mistake_type: '概念混淆',
  },
  {
    id: 'ns3',
    question: '一條繩子長 7/8 公尺，用掉 1/4 公尺後，還剩多少公尺？',
    options: ['6/12 公尺', '5/8 公尺', '3/4 公尺', '1/2 公尺'],
    correct_answer: 1,
    dimension: 'number_sense',
    difficulty: 'medium',
    concept_tag: '分數加減與通分',
    mistake_type: '計算不穩',
  },
  {
    id: 'ns4',
    question: '估算：49.2 × 5.1 最接近下列哪一個數？',
    options: ['200', '230', '250', '280'],
    correct_answer: 2,
    dimension: 'number_sense',
    difficulty: 'easy',
    concept_tag: '估算與數感',
    mistake_type: '計算不穩',
  },
  // —— algebra_logic ×4 ——
  {
    id: 'al1',
    question: '觀察規律：3、7、11、15、19、？ 下一個數是多少？',
    options: ['21', '22', '23', '25'],
    correct_answer: 2,
    dimension: 'algebra_logic',
    difficulty: 'easy',
    concept_tag: '數列規律',
    mistake_type: '概念混淆',
  },
  {
    id: 'al2',
    question: '若 4x − 9 = 15，則 x = ？',
    options: ['4', '5', '6', '7'],
    correct_answer: 2,
    dimension: 'algebra_logic',
    difficulty: 'medium',
    concept_tag: '一元一次方程式',
    mistake_type: '計算不穩',
  },
  {
    id: 'al3',
    question:
      '蘋果每顆 x 元，買 5 顆再付 10 元運費共 95 元。下列哪個方程式正確？',
    options: ['5x = 95', '5x − 10 = 95', '5x + 10 = 95', 'x + 5 + 10 = 95'],
    correct_answer: 2,
    dimension: 'algebra_logic',
    difficulty: 'hard',
    concept_tag: '等量關係與列式',
    mistake_type: '不會列式',
  },
  {
    id: 'al4',
    question: '化簡：2(3a + 1) − 4a = ？',
    options: ['2a + 1', '2a + 2', '10a + 2', '6a − 4a + 1'],
    correct_answer: 1,
    dimension: 'algebra_logic',
    difficulty: 'medium',
    concept_tag: '代數式化簡',
    mistake_type: '概念混淆',
  },
  // —— word_problem ×4 ——
  {
    id: 'wp1',
    question: '地圖上 2 公分代表實際 15 公里。實際 60 公里在地圖上是幾公分？',
    options: ['4 公分', '6 公分', '8 公分', '10 公分'],
    correct_answer: 2,
    dimension: 'word_problem',
    difficulty: 'medium',
    concept_tag: '比例與比',
    mistake_type: '題意轉換錯誤',
  },
  {
    id: 'wp2',
    question:
      '水塔有進水管與排水管。單開進水管 6 小時可注滿空槽；單開排水管 9 小時可排光滿槽。若同時開兩管，空槽幾小時可注滿？',
    options: ['10 小時', '15 小時', '18 小時', '24 小時'],
    correct_answer: 2,
    dimension: 'word_problem',
    difficulty: 'hard',
    concept_tag: '工程問題（效率）',
    mistake_type: '不會列式',
  },
  {
    id: 'wp3',
    question:
      '某商品成本 400 元，希望獲利 25%（以成本為基準），售價應訂多少元？',
    options: ['420 元', '450 元', '480 元', '500 元'],
    correct_answer: 3,
    dimension: 'word_problem',
    difficulty: 'medium',
    concept_tag: '百分率與價錢',
    mistake_type: '概念混淆',
  },
  {
    id: 'wp4',
    question:
      '小安買鉛筆與橡皮共 8 樣，總價 200 元。橡皮比鉛筆多買 2 個，且橡皮每個比鉛筆便宜 8 元。鉛筆每支幾元？',
    options: ['24 元', '30 元', '32 元', '36 元'],
    correct_answer: 1,
    dimension: 'word_problem',
    difficulty: 'hard',
    concept_tag: '兩未知數情境（代數思維）',
    mistake_type: '題意轉換錯誤',
  },
  // —— geometry ×4 ——
  {
    id: 'g1',
    question: '如圖概念：一個長方形長 10、寬 6，內部挖掉一個邊長 2 的正方形洞。剩餘面積是多少？',
    options: ['56', '58', '60', '64'],
    correct_answer: 0,
    dimension: 'geometry',
    difficulty: 'medium',
    concept_tag: '複合圖形面積',
    mistake_type: '概念混淆',
  },
  {
    id: 'g2',
    question: '等腰三角形頂角 40°，則一個底角是多少度？',
    options: ['40°', '70°', '80°', '140°'],
    correct_answer: 1,
    dimension: 'geometry',
    difficulty: 'medium',
    concept_tag: '三角形角度',
    mistake_type: '計算不穩',
  },
  {
    id: 'g3',
    question: '半徑 6 的圓，圓周長是多少？（取 π）',
    options: ['6π', '12π', '18π', '36π'],
    correct_answer: 1,
    dimension: 'geometry',
    difficulty: 'easy',
    concept_tag: '圓周長',
    mistake_type: '概念混淆',
  },
  {
    id: 'g4',
    question: '一個立方體邊長 4 公分，表面積是多少平方公分？',
    options: ['48', '64', '80', '96'],
    correct_answer: 3,
    dimension: 'geometry',
    difficulty: 'hard',
    concept_tag: '立體圖形表面積',
    mistake_type: '計算不穩',
  },
  // —— data_reasoning ×4 ——
  {
    id: 'dr1',
    question:
      '某班週一到週五閱讀分鐘數的折線圖顯示：週三最低、週五最高。下列敘述何者「一定」正確？',
    options: [
      '週五讀最久',
      '五天總分鐘數超過 300 分鐘',
      '週二比週一多',
      '無法從題目資訊判斷高低以外的數值',
    ],
    correct_answer: 0,
    dimension: 'data_reasoning',
    difficulty: 'medium',
    concept_tag: '折線圖判讀',
    mistake_type: '題意轉換錯誤',
  },
  {
    id: 'dr2',
    question: '圓形圖中，某區塊圓心角 90°，占全體的百分之幾？',
    options: ['15%', '20%', '25%', '30%'],
    correct_answer: 2,
    dimension: 'data_reasoning',
    difficulty: 'easy',
    concept_tag: '圓形圖與比例',
    mistake_type: '概念混淆',
  },
  {
    id: 'dr3',
    question: '資料組：10、12、14、16、48。下列何者最能描述「集中趨勢」不宜只用平均數的原因？',
    options: [
      '數字太少不能算平均',
      '有極端值會拉高超平均，無法代表多數人的水準',
      '平均數一定等於中位數',
      '眾數一定比平均數大',
    ],
    correct_answer: 1,
    dimension: 'data_reasoning',
    difficulty: 'hard',
    concept_tag: '平均數與極端值',
    mistake_type: '概念混淆',
  },
  {
    id: 'dr4',
    question:
      '甲、乙兩班參加同一測驗。甲班平均 72、乙班平均 75。關於「哪一班比較強」，下列何者最合理？',
    options: [
      '乙班一定每個人都比甲班高',
      '平均較高通常整體表現較好，但仍需看分布與極端值',
      '平均數與強弱無關',
      '甲班一定比較強',
    ],
    correct_answer: 1,
    dimension: 'data_reasoning',
    difficulty: 'medium',
    concept_tag: '統計敘述合理性',
    mistake_type: '題意轉換錯誤',
  },
];
