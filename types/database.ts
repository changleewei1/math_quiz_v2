import type { Dimension } from '@/lib/questions';

/** `public.leads`（招生漏斗相關欄位） */
export type LeadRow = {
  id: string;
  student_name: string;
  parent_name: string;
  phone: string;
  elementary_school: string;
  junior_high_school: string | null;
  created_at: string;
  status?: string;
};

/** `public.quiz_sessions`（與 MVP 漏斗共用） */
export type QuizSessionRow = {
  id: string;
  lead_id: string;
  started_at: string | null;
  completed_at: string | null;
  total_score: number | null;
  overall_level: string | null;
  dimension_scores: unknown;
  weakness_summary: string | null;
  study_suggestions: unknown;
  enrollment_cta: string | null;
  recommended_courses: unknown;
  recommended_videos: unknown;
  mvp_report_snapshot: unknown;
  created_at: string;
  updated_at: string;
};

export type FunnelAnswerInsert = {
  session_id: string;
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
  dimension: Dimension;
  concept_tag: string;
};

export type TrialBookingInsert = {
  lead_id: string | null;
  student_name: string;
  parent_name: string;
  phone: string;
  preferred_time: string;
  note: string | null;
  overall_level: string | null;
  weak_dimensions: Dimension[] | null;
  recommended_course: string | null;
};
