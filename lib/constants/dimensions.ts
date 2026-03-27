import type { QuestionDimension } from '@/types/quiz';

export interface DimensionMeta {
  key: QuestionDimension;
  label: string;
  shortLabel: string;
  description: string;
  reportHintWeak: string;
  reportHintWatch: string;
  reportHintStrong: string;
}

export const DIMENSION_METADATA: DimensionMeta[] = [
  {
    key: 'number_sense',
    label: '數感與計算',
    shortLabel: '數感',
    description: '整數、分數、小數與四則運算的基本能力。',
    reportHintWeak: '基礎計算與數感較弱，升國一後遇到整數與代數先備時可能較吃力。',
    reportHintWatch: '計算基礎尚可，但在換算與估算上仍可加強。',
    reportHintStrong: '數感穩定，能快速完成計算與換算題。',
  },
  {
    key: 'algebra_logic',
    label: '代數與邏輯',
    shortLabel: '代數',
    description: '未知數、規律觀察與簡單等式推理能力。',
    reportHintWeak: '未知數、規律與等式推理概念尚未穩定，建議先建立代數基礎。',
    reportHintWatch: '代數概念已有基礎，仍需練習規律與等式的應用。',
    reportHintStrong: '代數與規律題掌握良好，可進入更高階題型。',
  },
  {
    key: 'word_problem',
    label: '文字題理解',
    shortLabel: '文字題',
    description: '將文字敘述轉成算式並完成解題的能力。',
    reportHintWeak: '從文字敘述轉成算式的能力需加強，建議練習題意拆解。',
    reportHintWatch: '能理解題意但步驟安排略不穩，需加強解題流程。',
    reportHintStrong: '文字題理解佳，能快速建立算式並完成解題。',
  },
  {
    key: 'geometry',
    label: '幾何與圖形',
    shortLabel: '幾何',
    description: '圖形特性、面積周長與角度概念。',
    reportHintWeak: '圖形觀察與幾何基礎概念仍需補強，建議在暑假先建立基礎。',
    reportHintWatch: '幾何基礎尚可，但在圖形關係判讀上仍可加強。',
    reportHintStrong: '幾何題掌握佳，圖形關係判讀清楚。',
  },
  {
    key: 'data_reasoning',
    label: '資料判讀',
    shortLabel: '資料',
    description: '表格、統計圖與資料比較推理能力。',
    reportHintWeak: '表格、統計圖與資料比較的判讀能力需要再加強。',
    reportHintWatch: '資料判讀基礎尚可，但比較與推理步驟需更清楚。',
    reportHintStrong: '能快速判讀資料並作出正確推理。',
  },
];

export const DIMENSION_META_MAP = Object.fromEntries(
  DIMENSION_METADATA.map((item) => [item.key, item])
) as Record<QuestionDimension, DimensionMeta>;

