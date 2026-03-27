import type { Dimension } from '@/lib/questions';
import { DIMENSION_LABEL } from '@/lib/questions';
import { ENROLLMENT_COURSE_TEMPLATES, type EnrollmentCourseTemplate } from '@/lib/mvp/enrollment-courses';

export type DimensionStatus = 'weak' | 'watch' | 'strong';

export function getDimensionStatus(percentage: number): DimensionStatus {
  if (percentage < 60) return 'weak';
  if (percentage < 80) return 'watch';
  return 'strong';
}

const STATUS_LABEL: Record<DimensionStatus, string> = {
  weak: '需加強',
  watch: '尚可加強',
  strong: '表現穩定',
};

/** 各向度 × 狀態：家長說明與補強重點 */
const DIMENSION_NARRATIVE: Record<
  Dimension,
  Record<DimensionStatus, { explanation: string; strengthenFocus: string }>
> = {
  number_sense: {
    weak: {
      explanation:
        '在數感與計算穩定度上仍有明顯落差；若進入國中後題目步驟變長，容易在基本運算或數量感上卡住，影響後續單元吸收。',
      strengthenFocus: '整數／分數／小數四則運算熟練度、估算與單位換算、百分比比率直覺',
    },
    watch: {
      explanation:
        '整體尚可，但在速度、正確率或題型變化上仍可能起伏；建議在升國一前把「常見計算套路」練到更穩。',
      strengthenFocus: '混合運算與檢查習慣、分數小數轉換、應用情境下的數量關係',
    },
    strong: {
      explanation:
        '數感與計算表現相對穩定，具備銜接國中題量的基礎；後續可把重心放在閱讀題意與多步驟解題策略。',
      strengthenFocus: '維持計算品質、銜接代數符號與式子運算',
    },
  },
  algebra_logic: {
    weak: {
      explanation:
        '對未知數、等式與代數式操作仍不熟練；國一將快速進入「用符號思考」，此處若基礎不足，容易在方程式與應用題銜接上感到吃力。',
      strengthenFocus: '用符號表示數量關係、一元一次方程式、式子化簡與代入',
    },
    watch: {
      explanation:
        '已接觸代數概念，但在列式或推理步驟上仍需要引導；建議用少量題目把「把文字變成式子」練熟。',
      strengthenFocus: '等量關係、從情境列式、解題步驟書寫與驗算',
    },
    strong: {
      explanation:
        '代數思維相對穩定，能處理基礎等式與簡單推理；後續可銜接更完整的國一代數題型與應用整合。',
      strengthenFocus: '多步驟題、與應用題結合的代數建模',
    },
  },
  word_problem: {
    weak: {
      explanation:
        '題意理解與「把情境轉成數學」的能力偏弱；這類能力在國中會直接影響段考與素養題表現，也常被家長誤以為只是粗心。',
      strengthenFocus: '讀題策略（圈關鍵字／畫線段圖）、列式順序、單位與合理性檢查',
    },
    watch: {
      explanation:
        '多數題目可解，但在較長題干或兩步驟以上題型時容易失分；適合在暑假用「少量題、多次拆解」的方式補起來。',
      strengthenFocus: '分段讀題、表格整理資訊、常見應用題模型（比例、價錢、行程）',
    },
    strong: {
      explanation:
        '能把題意轉成策略並完成列式，顯示閱讀與應用能力不錯；後續可往更複雜情境與開放題延伸。',
      strengthenFocus: '綜合題、逆向思考與解題反思',
    },
  },
  geometry: {
    weak: {
      explanation:
        '圖形觀念與度量（角度、周長、面積）仍不穩；國中幾何步調快，若空間直覺不足，容易在證明與作圖銜接上卡關。',
      strengthenFocus: '基本圖形性質、公式意義（不死背）、簡單作圖與度量推理',
    },
    watch: {
      explanation:
        '能處理基礎題，但在綜合圖形或需要「看出關係」的題型上仍會猶豫；建議用圖像化方式補強觀念連結。',
      strengthenFocus: '複合圖形拆解、座標與方位、生活情境中的幾何量感',
    },
    strong: {
      explanation:
        '圖形與度量理解度不錯；後續可銜接國中較正式的幾何語言與推理表達。',
      strengthenFocus: '推理題、文字敘述與圖形轉換',
    },
  },
  data_reasoning: {
    weak: {
      explanation:
        '對圖表資訊的讀取、比較與解讀偏弱；國中常見長條圖、折線圖、圓形圖與統計概念，會直接影響段考與素養題得分。',
      strengthenFocus: '讀圖順序、最大最小與趨勢、平均數／眾數等基礎統計語彙',
    },
    watch: {
      explanation:
        '能讀取單一資訊，但在「整合兩個圖表」或「反推情境」時仍不穩；適合用生活素材練習。',
      strengthenFocus: '從圖表寫出結論、比較差異、簡單推論與合理性判斷',
    },
    strong: {
      explanation:
        '資料判讀能力相對成熟，能掌握圖表重點；後續可銜接更正式的資料分析語言與題型。',
      strengthenFocus: '綜合判讀、與其他單元結合的素養題',
    },
  },
};

export type MvpDimensionDetail = {
  dimension: Dimension;
  label: string;
  percentage: number;
  status: DimensionStatus;
  statusLabel: string;
  explanation: string;
  strengthenFocus: string;
};

export type MvpEnrollmentCourse = EnrollmentCourseTemplate & {
  recommendedReason: string;
};

export function buildDimensionDetails(scores: { dimension: Dimension; percentage: number }[]): MvpDimensionDetail[] {
  return scores.map((s) => {
    const status = getDimensionStatus(s.percentage);
    const n = DIMENSION_NARRATIVE[s.dimension][status];
    return {
      dimension: s.dimension,
      label: DIMENSION_LABEL[s.dimension],
      percentage: s.percentage,
      status,
      statusLabel: STATUS_LABEL[status],
      explanation: n.explanation,
      strengthenFocus: n.strengthenFocus,
    };
  });
}

function dimensionOrderPriority(d: Dimension): number {
  const order: Dimension[] = ['number_sense', 'algebra_logic', 'word_problem', 'geometry', 'data_reasoning'];
  return order.indexOf(d);
}

export function generateExecutiveSummary(args: {
  studentName: string;
  totalScore: number;
  overallLevel: string;
  details: MvpDimensionDetail[];
}): string {
  const weak = args.details.filter((d) => d.status === 'weak').sort((a, b) => a.percentage - b.percentage);
  const watch = args.details.filter((d) => d.status === 'watch');

  const weakNames = weak.map((d) => d.label).join('、');
  const watchNames = watch.map((d) => d.label).join('、');

  let body = '';
  if (weak.length === 0 && watch.length === 0) {
    body = `整體程度落在 ${args.overallLevel} 等級，五大面向目前表現相對均衡，已具備不少升國一數學的先備基礎。建議接下來把重心放在「維持穩定度」與「銜接國一題型節奏」，讓開學後的適應更順。`;
  } else if (weak.length === 0) {
    body = `整體程度落在 ${args.overallLevel} 等級，基礎大致穩定，但在「${watchNames}」等面向仍可再補強，讓升國一後的學習更省力。若能在暑假把這些面向補到更穩，開學後較不容易被題目長度與步驟嚇到。`;
  } else {
    body = `從本次檢測結果來看，孩子已具備部分升國一所需的數學基礎，整體程度約為 ${args.overallLevel} 等級（總分 ${args.totalScore} 分）。但在「${weakNames}」方面仍建議優先補強；`;
    if (watch.length) {
      body += `另外「${watchNames}」也屬於可趁暑假提前穩定的項目。`;
    }
    body += `若能在升國一前先把關鍵觀念建立好，進入國中後的課堂吸收與段考準備通常會更順利。`;
  }

  return body;
}

export function generateWeaknessSummaryParagraph(details: MvpDimensionDetail[]): string {
  const weak = details.filter((d) => d.status === 'weak');
  if (weak.length === 0) {
    return '本次檢測未出現明顯低於門檻的面向，代表孩子的基礎結構相對完整。接下來更重要的是維持練習頻率、建立檢查習慣，並逐步銜接國一題型的敘述長度與綜合度。若您希望更進一步，也可以把目標放在「解題速度」與「錯因追蹤」，讓學習品質再往上拉。';
  }

  const sorted = [...weak].sort((a, b) => a.percentage - b.percentage);
  const parts = sorted.map(
    (d) =>
      `「${d.label}」（${d.percentage}%）顯示孩子在該類題型上仍需要結構化的練習與引導，避免進入國中後一次面對大量新符號與步驟時壓力過大。`
  );

  return `若以家長角度來看，最值得先正視的是：${parts.join(' ')}我們會建議把暑假學習時間優先配置在這些面向，先用「理解與熟練」打底，再進入更深題型，效果通常比盲目刷題更明顯。`;
}

export function generateStudySuggestions(details: MvpDimensionDetail[], overallLevel: string): string[] {
  const weak = details.filter((d) => d.status === 'weak');
  const watch = details.filter((d) => d.status === 'watch');
  const out: string[] = [];

  if (weak.some((d) => d.dimension === 'number_sense')) {
    out.push('每天安排 10～15 分鐘「計算與換算」小練習，重點不是做很多題，而是把正確率與步驟寫清楚，並用一道題檢討錯因。');
  }
  if (weak.some((d) => d.dimension === 'algebra_logic')) {
    out.push('代數銜接建議從「用符號表示數量」開始，練習把一句話寫成式子；每週固定 2～3 次、每次少量題目，更容易建立信心。');
  }
  if (weak.some((d) => d.dimension === 'word_problem')) {
    out.push('應用題請用「讀題三段式」：先找已知／再找要求／最後決定運算；可先讓孩子用口頭說一遍題意，再動筆列式，降低漏讀與誤解。');
  }
  if (weak.some((d) => d.dimension === 'geometry')) {
    out.push('幾何題建議搭配圖形草稿：把已知條件標在圖上，先理解「為什麼用這個公式」，再進入計算，避免只靠死背。');
  }
  if (weak.some((d) => d.dimension === 'data_reasoning')) {
    out.push('圖表題可用生活素材練習：讓孩子用一句話描述圖表「最重要的訊息」，再進入數字比較與趨勢判讀，提升讀圖自信。');
  }

  if (out.length < 2 && watch.length) {
    out.push(`目前整體為 ${overallLevel} 等級，建議把「尚可加強」面向排進每週固定時段，每次 20 分鐘即可，重點是連續性而非一次爆量。`);
  }
  if (out.length < 2) {
    out.push('維持每週至少三次、每次 20～30 分鐘的節奏，搭配錯題本整理，通常比假期最後一週密集補課更有效。');
  }
  if (out.length < 3 && overallLevel === 'A') {
    out.push('若孩子程度已偏高，可把目標放在「題型整合」與「解題策略」：例如一題多解、或把錯題改寫成自創題，提升思考深度。');
  }

  return out.slice(0, 4);
}

export function generateStudyOrderSteps(details: MvpDimensionDetail[]): string[] {
  const weak = details.filter((d) => d.status === 'weak').sort((a, b) => dimensionOrderPriority(a.dimension) - dimensionOrderPriority(b.dimension));
  const watch = details.filter((d) => d.status === 'watch').sort((a, b) => dimensionOrderPriority(a.dimension) - dimensionOrderPriority(b.dimension));

  const steps: string[] = [];
  const pushUnique = (s: string) => {
    if (!steps.includes(s)) steps.push(s);
  };

  if (weak.some((d) => d.dimension === 'number_sense') || watch.some((d) => d.dimension === 'number_sense')) {
    pushUnique('先穩定整數、分數與四則運算，確保計算正確率與速度達到一定水準');
  }
  if (weak.some((d) => d.dimension === 'algebra_logic') || watch.some((d) => d.dimension === 'algebra_logic')) {
    pushUnique('再建立未知數、等式與代數式的理解，練習把文字敘述轉成數學式');
  }
  if (weak.some((d) => d.dimension === 'word_problem') || watch.some((d) => d.dimension === 'word_problem')) {
    pushUnique('接著加強應用題的讀題與列式，把「解題步驟」寫清楚，並練習驗算習慣');
  }
  if (weak.some((d) => d.dimension === 'geometry') || watch.some((d) => d.dimension === 'geometry')) {
    pushUnique('同步或稍後補強圖形觀念與度量（角度、周長、面積），用圖像協助理解公式意義');
  }
  if (weak.some((d) => d.dimension === 'data_reasoning') || watch.some((d) => d.dimension === 'data_reasoning')) {
    pushUnique('最後強化圖表判讀與資料整合，讓孩子能用口頭說出圖表重點與結論');
  }

  if (steps.length === 0) {
    return [
      '維持五大面向均衡練習，每週安排一次「弱項追蹤」小考卷檢視是否退步',
      '加入國一題型的綜合練習，熟悉敘述長度與多步驟要求',
      '建立錯題本與訂正流程，讓每次錯誤都轉成下一次進步的線索',
    ];
  }

  return steps.slice(0, 3);
}

export function generateParentAdvice(details: MvpDimensionDetail[]): string[] {
  const weak = details.filter((d) => d.status === 'weak');
  const wp = weak.find((d) => d.dimension === 'word_problem');
  const ns = weak.find((d) => d.dimension === 'number_sense');
  const alg = weak.find((d) => d.dimension === 'algebra_logic');

  const paras: string[] = [];

  if (wp) {
    paras.push(
      '若孩子目前在題意轉換上較不穩定，建議暑假不要只做大量計算題；可搭配「讀題＋說題」的方式，讓孩子練習把題目用自己的話講一遍，再進入列式。這種做法對國中長題幹特別有幫助。'
    );
  }
  if (ns) {
    paras.push(
      '若基礎計算仍常出錯，家長可以先協助建立「固定練習節奏」與「簡單檢查習慣」（例如估算範圍、反向驗算），再逐步增加題目難度；先把正確率拉起來，再往速度與國中題型銜接。'
    );
  }
  if (alg) {
    paras.push(
      '代數銜接最怕「看不懂符號在幹嘛」。建議從生活例子（價錢、數量關係）切入，讓孩子理解「用字母代表未知數」的目的，再進入方程式操作，學習曲線會比較平順。'
    );
  }

  if (paras.length === 0) {
    paras.push(
      '以本次結果來看，孩子的整體結構不錯。家長可以扮演「節奏管理者」：把學習切成固定時段、降低考前才衝刺的壓力，並多鼓勵孩子說出解題思路，這對國中數學的長期表現很有幫助。'
    );
    paras.push(
      '若您希望更進一步，也可以把目標放在「習慣」：包含書寫格式、訂正流程與錯因紀錄。這些細節往往比多做十題更能提升段考穩定度。'
    );
  }

  return paras.slice(0, 4);
}

function reasonForCourse(templateId: string, weakestLabels: string[]): string {
  const top = weakestLabels.slice(0, 2).join('、') || '目前較需關注的面向';
  switch (templateId) {
    case 'course_foundation':
      return `本次檢測顯示孩子在「${top}」等基礎銜接仍需加固；先修基礎班能把計算與數量感補到更穩，降低國一開學落差。`;
    case 'course_word_problem':
      return `孩子在應用題／題意理解相關面向需要結構化訓練；此課程聚焦讀題與列式，能直接對應本次報告中的弱點趨勢。`;
    case 'course_geometry':
      return `圖形與度量相關題型若偏弱，開學後遇到綜合圖形題容易失分；此課程用觀念＋題型並行的方式，協助建立空間與推理基礎。`;
    case 'course_full_track':
      return `若您希望暑假用一套完整路徑銜接國一數學，全科先修能把五大面向一次補齊，並建立適合國中的學習節奏與解題習慣。`;
    default:
      return '此課程與本次檢測的補強方向高度相關，建議由專業老師依孩子狀況微調學習起點。';
  }
}

export function getRecommendedCourses(details: MvpDimensionDetail[]): MvpEnrollmentCourse[] {
  const weak = details.filter((d) => d.status === 'weak').sort((a, b) => a.percentage - b.percentage);
  const labels = weak.map((d) => d.label);
  const labelPool = labels.length ? labels : details.filter((d) => d.status !== 'strong').map((d) => d.label);
  const pool = labelPool.length ? labelPool : details.map((d) => d.label);

  return ENROLLMENT_COURSE_TEMPLATES.map((t) => ({
    ...t,
    recommendedReason: reasonForCourse(t.id, pool),
  }));
}

export function buildRadarNotes(details: MvpDimensionDetail[]): { stable: string; priority: string } {
  const strong = details.filter((d) => d.status === 'strong').map((d) => d.label);
  const weak = details.filter((d) => d.status === 'weak').map((d) => d.label);
  const watch = details.filter((d) => d.status === 'watch').map((d) => d.label);

  const stable =
    strong.length > 0
      ? `目前相對穩定的面向包含：${strong.join('、')}。建議維持練習節奏，並把這些能力運用在綜合題與較長題干上。`
      : '目前各面向仍有提升空間，代表暑假非常適合用「分階段補強」建立信心，而不是一次硬衝難題。';

  let priority = '';
  if (weak.length) {
    priority = `建議優先處理：${weak.join('、')}。這些面向在國一課程中常與後續單元連動，越早補齊越能減少開學後的挫折感。`;
  } else if (watch.length) {
    priority = `建議關注：${watch.join('、')}。這些面向不算落後，但若能提前補到更穩，段考與素養題會更輕鬆。`;
  } else {
    priority = '整體分布均衡，下一步可著重在「速度與檢查習慣」以及國一題型的綜合演練。';
  }

  return { stable, priority };
}
