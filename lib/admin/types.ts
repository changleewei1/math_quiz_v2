import type { LeadStatus, OverallLevel, QuestionDimension, QuestionDifficulty } from '@/types/quiz';

export interface DashboardStats {
  totalLeads: number;
  startedQuiz: number;
  finishedQuiz: number;
  trialBooked: number;
  enrolled: number;
}

export interface FunnelStage {
  key: LeadStatus | 'total';
  label: string;
  count: number;
  percentage: number;
}

export interface WeaknessChartItem {
  dimension: QuestionDimension;
  label: string;
  weakCount: number;
}

export interface RecentSessionItem {
  sessionId: string;
  studentName: string;
  completedAt: string;
  totalScore: number | null;
  overallLevel: OverallLevel | null;
  leadStatus: LeadStatus;
}

export interface LeadListItem {
  id: string;
  student_name: string;
  parent_name: string;
  phone: string;
  elementary_school: string;
  junior_high_school: string | null;
  status: LeadStatus;
  assigned_to?: string | null;
  assigned_profile?: { full_name: string | null } | null;
  last_contacted_at?: string | null;
  next_follow_up_at?: string | null;
  created_at: string;
  latest_session?: {
    id: string;
    completed_at: string | null;
    total_score: number | null;
    overall_level: OverallLevel | null;
  } | null;
}

export interface SessionListItem {
  id: string;
  lead_id: string;
  student_name: string;
  started_at: string | null;
  completed_at: string | null;
  total_score: number | null;
  overall_level: OverallLevel | null;
  dimension_scores: Record<QuestionDimension, number> | null;
  weakness_summary: string | null;
  lead_status: LeadStatus;
}

export interface QuestionListItem {
  id: string;
  prompt: string;
  dimension: QuestionDimension;
  difficulty: QuestionDifficulty;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface QuestionFormInput {
  prompt: string;
  explanation?: string | null;
  choice_1: string;
  choice_2: string;
  choice_3: string;
  choice_4: string;
  correct_answer: string;
  dimension: QuestionDimension;
  difficulty: QuestionDifficulty;
  sort_order: number;
  is_active: boolean;
}

