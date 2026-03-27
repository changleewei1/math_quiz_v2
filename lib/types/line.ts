export type MessageTemplateType =
  | 'follow_up_reminder'
  | 'trial_reminder'
  | 'post_trial_follow_up'
  | 'quiz_completion_follow_up'
  | 'custom';

export type LineSendStatus = 'pending' | 'sent' | 'failed' | 'skipped';

export type LineTextMessage = {
  type: 'text';
  text: string;
};

export type LineFlexMessage = {
  type: 'flex';
  altText: string;
  contents: Record<string, any>;
};

export type LineMessage = LineTextMessage | LineFlexMessage;

export interface LinePushResult {
  ok: boolean;
  errorMessage?: string;
  providerMessageId?: string;
}

export interface LineMessageLog {
  id: string;
  target_type: 'profile' | 'lead';
  target_profile_id?: string | null;
  target_lead_id?: string | null;
  line_user_id: string;
  message_type: MessageTemplateType;
  message_body: string;
  send_status: LineSendStatus;
  error_message?: string | null;
  created_at: string;
}

