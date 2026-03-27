import type {
  DimensionAnalysis,
  DimensionStatus,
  OverallLevel,
  QuestionDimension,
} from '@/types/quiz';
import { DIMENSION_META_MAP } from '@/lib/constants/dimensions';

const DIMENSION_STATUS_COPY: Record<
  QuestionDimension,
  Record<DimensionStatus, string>
> = {
  number_sense: {
    weak: '基礎計算與數感較弱，升國一後遇到整數與代數先備時可能較吃力。',
    watch: '基礎計算已有一定程度，但在穩定度與熟練度上仍可再加強。',
    strong: '整數、分數與四則運算基礎穩定，具備不錯的先備能力。',
  },
  algebra_logic: {
    weak: '未知數、規律與等式推理概念尚未穩定，建議先建立代數基礎。',
    watch: '已有基本代數概念，但在規律與推理題仍可再加強。',
    strong: '代數推理與規律觀察能力穩定，可挑戰進階題型。',
  },
  word_problem: {
    weak: '從文字敘述轉成算式的能力需加強，建議練習題意拆解。',
    watch: '能理解題意，但在步驟安排與算式轉換上仍可再提升。',
    strong: '文字題理解佳，能迅速建立算式並完成解題。',
  },
  geometry: {
    weak: '圖形觀察與幾何基礎概念仍需補強，建議在暑假先建立基礎。',
    watch: '幾何概念已有基礎，但在圖形關係與應用題仍可加強。',
    strong: '幾何概念穩定，能清楚理解圖形關係與角度題。',
  },
  data_reasoning: {
    weak: '表格、統計圖與資料比較的判讀能力需要再加強。',
    watch: '能閱讀基本資料，但在比較與推理上仍可提升。',
    strong: '資料判讀能力良好，能正確解讀圖表並做出判斷。',
  },
};

const DIMENSION_SUGGESTIONS: Record<QuestionDimension, string> = {
  number_sense: '先補強整數與分數運算，建立四則運算的穩定度。',
  algebra_logic: '建立未知數與規律概念，練習等式轉換與推理。',
  word_problem: '加強文字題拆解能力，先找出關鍵資訊再列算式。',
  geometry: '補強角度、周長、面積與圖形觀察的基本概念。',
  data_reasoning: '練習表格與統計圖判讀，培養資料比較與推理能力。',
};

export function generateDimensionAnalysisText(
  dimension: QuestionDimension,
  status: DimensionStatus
) {
  return DIMENSION_STATUS_COPY[dimension][status];
}

export function generateWeaknessSummary(
  dimensionAnalysis: DimensionAnalysis[]
): string {
  const weakDims = dimensionAnalysis.filter((item) => item.status === 'weak');
  const watchDims = dimensionAnalysis.filter((item) => item.status === 'watch');

  if (weakDims.length === 0 && watchDims.length === 0) {
    return '目前孩子在升國一所需的基礎能力中表現穩定，建議持續維持學習節奏，提前熟悉國中課程銜接內容。';
  }

  const weakLabels = weakDims.map((item) => DIMENSION_META_MAP[item.dimension].label);
  const watchLabels = watchDims.map((item) => DIMENSION_META_MAP[item.dimension].label);

  const parts: string[] = [];
  if (weakLabels.length) {
    parts.push(`主要需要加強的向度為${weakLabels.join('、')}。`);
  }
  if (watchLabels.length) {
    parts.push(`可再加強的向度包含${watchLabels.join('、')}。`);
  }

  return `目前孩子在升國一關鍵基礎中，${parts.join('')}若能在暑假前先補強，進入國中後會更穩定。建議先從重點觀念與題意理解練習開始，逐步提升解題穩定度。`;
}

export function generateStudySuggestions(
  dimensionAnalysis: DimensionAnalysis[]
): string[] {
  const weakDims = dimensionAnalysis.filter((item) => item.status === 'weak').map((item) => item.dimension);
  const watchDims = dimensionAnalysis.filter((item) => item.status === 'watch').map((item) => item.dimension);

  const suggestions: string[] = [];
  weakDims.forEach((dimension) => {
    if (!suggestions.includes(DIMENSION_SUGGESTIONS[dimension])) {
      suggestions.push(DIMENSION_SUGGESTIONS[dimension]);
    }
  });

  if (suggestions.length < 2) {
    watchDims.forEach((dimension) => {
      if (suggestions.length >= 4) return;
      const suggestion = DIMENSION_SUGGESTIONS[dimension];
      if (!suggestions.includes(suggestion)) {
        suggestions.push(suggestion);
      }
    });
  }

  if (suggestions.length === 0) {
    return [
      '維持每週固定練習節奏，先熟悉國中題型與基本解題流程。',
      '挑戰不同題型的題意拆解與算式建立，提升解題穩定度。',
    ];
  }

  return suggestions.slice(0, 4);
}

export function generateEnrollmentCTA(
  overallLevel: OverallLevel,
  dimensionAnalysis: DimensionAnalysis[]
): string {
  const weakCount = dimensionAnalysis.filter((item) => item.status === 'weak').length;
  const watchCount = dimensionAnalysis.filter((item) => item.status === 'watch').length;

  if (overallLevel === 'A' && weakCount === 0) {
    return '本次檢測顯示孩子基礎穩定，已具備良好升國一先備能力。建議在暑假期間透過系統化先修課程，強化課綱銜接與解題速度，讓國中學習更順利。';
  }

  if (overallLevel === 'D' || weakCount >= 3) {
    return '從本次檢測結果來看，孩子在升國一數學銜接上仍有多個向度需要補強。若能在開學前透過完整先修課程建立基礎，後續學習會更穩定。建議安排本班升國一全科數學先修班，全面打穩核心能力。';
  }

  if (weakCount > 0) {
    return '本次檢測顯示孩子已具備部分先備能力，但仍有幾個向度建議優先補強。若能在暑假前透過系統化先修建立觀念，進入國中後的學習會更順利。建議安排對應的先修課程，讓基礎更穩定。';
  }

  if (watchCount > 0) {
    return '孩子的基礎大致穩定，但仍有可再加強的向度。若能提早練習國中題型與解題流程，進入國中後會更有信心。建議安排先修課程或試聽了解最適合的補強方向。';
  }

  return `本次檢測顯示孩子整體程度良好（目前約為 ${overallLevel} 級）。建議持續維持學習節奏，透過先修課程提前熟悉國中重點觀念。`;
}

