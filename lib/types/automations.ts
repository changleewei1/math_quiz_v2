import type { MessageTemplateType, LineSendStatus } from '@/lib/types/line';

export interface AutomationRun {
  id: string;
  job_name: string;
  started_at: string;
  finished_at?: string | null;
  status: 'running' | 'success' | 'partial_success' | 'failed';
  scanned_count: number;
  sent_count: number;
  skipped_count: number;
  error_count: number;
  notes?: string | null;
}

export interface AutomationRunResultInput {
  scanned: number;
  sent: number;
  skipped: number;
  error: number;
}

export interface LineMessageLogInput {
  targetType: 'profile' | 'lead';
  targetProfileId?: string | null;
  targetLeadId?: string | null;
  lineUserId: string;
  messageType: MessageTemplateType;
  messageBody: string;
  sendStatus: LineSendStatus;
  providerMessageId?: string | null;
  errorMessage?: string | null;
  metadata?: Record<string, any>;
}

export interface ReminderJobResult {
  ok: boolean;
  status: 'success' | 'partial_success' | 'failed';
  scanned: number;
  sent: number;
  skipped: number;
  error: number;
}


