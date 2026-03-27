import type { Dimension, QuestionDifficulty, QuestionItem } from '@/lib/questions';

export type MvpOverallLevel = 'A' | 'B' | 'C' | 'D';

export type MvpQuestionDifficulty = QuestionDifficulty;

/** 單題答錯時，用於報告話術 */
export interface MvpMistakeRecord {
  dimension: Dimension;
  concept_tag: string;
  mistake_type: string;
}

/** MVP 題庫一題（含招生分析用 meta）；完整列表見 `lib/questions.ts` 的 `QUESTIONS` */
export type MvpQuestionItem = QuestionItem;

/** 預約頁 URL 查詢：`/booking?level=&studentName=&weakDimensions=`（weakDimensions 為 dimension key 逗號分隔） */
export type BookingQueryWeakDimensions = string;
