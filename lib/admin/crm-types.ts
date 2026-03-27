import type { LeadStatus, OverallLevel, QuestionDimension } from '@/types/quiz';
import type { UserRole } from '@/lib/auth/roles';

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
}

export type ContactType = 'phone' | 'line' | 'in_person' | 'other';
export type ContactResult =
  | 'no_answer'
  | 'interested'
  | 'not_interested'
  | 'booked_trial'
  | 'enrolled'
  | 'follow_up_later';

export interface LeadContactLog {
  id: string;
  lead_id: string;
  contact_type: ContactType;
  contact_result: ContactResult;
  summary: string;
  next_follow_up_at: string | null;
  created_by: string | null;
  created_at: string;
  created_by_profile?: Profile | null;
}

export type TrialStatus = 'booked' | 'attended' | 'absent' | 'rescheduled' | 'cancelled';

export interface TrialBooking {
  id: string;
  lead_id: string;
  trial_date: string;
  course_name: string;
  status: TrialStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  created_by_profile?: Profile | null;
}

export interface EnrollmentRecord {
  id: string;
  lead_id: string;
  enrolled_course: string;
  tuition_amount: number | null;
  enrolled_at: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  created_by_profile?: Profile | null;
}

export type FollowUpStatus = 'today' | 'overdue' | 'upcoming' | 'none';

export interface LeadDetailData {
  id: string;
  student_name: string;
  parent_name: string;
  phone: string;
  line_id: string | null;
  elementary_school: string;
  junior_high_school: string | null;
  status: LeadStatus;
  assigned_to: string | null;
  assigned_profile?: Profile | null;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  created_at: string;
  latest_session?: {
    id: string;
    total_score: number | null;
    overall_level: OverallLevel | null;
    dimension_scores: Record<QuestionDimension, number> | null;
    completed_at: string | null;
  } | null;
  contact_logs: LeadContactLog[];
  trial_bookings: TrialBooking[];
  enrollment_records: EnrollmentRecord[];
}

export interface ExportFilterInput {
  status?: LeadStatus;
  created_from?: string;
  created_to?: string;
  completed?: boolean;
  overall_level?: OverallLevel;
}


