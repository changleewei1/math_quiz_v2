import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendLinePushMessage } from '@/lib/line/send';
import {
  buildFollowUpReminderMessage,
  buildQuizCompletionReminderMessage,
} from '@/lib/line/messages';
import {
  logLineMessageResult,
  createAutomationRun,
  finishAutomationRun,
} from '@/lib/automations/metrics';
import { LEAD_STATUS_LABELS } from '@/lib/admin/constants';

export async function runFollowUpReminderJob() {
  const supabase = createSupabaseServerClient();
  const run = await createAutomationRun('follow_ups');

  let scanned = 0;
  let sent = 0;
  let skipped = 0;
  let error = 0;

  const today = new Date();
  const { data: leads } = await supabase
    .from('leads')
    .select(
      'id, student_name, parent_name, status, next_follow_up_at, assigned_to, profiles!leads_assigned_to_fkey(line_user_id)'
    )
    .not('status', 'eq', 'enrolled')
    .lte('next_follow_up_at', today.toISOString());

  for (const lead of leads ?? []) {
    scanned += 1;
    const assignedProfile = Array.isArray(lead.profiles) ? lead.profiles[0] : lead.profiles;
    const lineUserId = assignedProfile?.line_user_id;
    if (!lineUserId) {
      skipped += 1;
      await logLineMessageResult({
        targetType: 'profile',
        targetProfileId: lead.assigned_to,
        lineUserId: 'N/A',
        messageType: 'follow_up_reminder',
        messageBody: '',
        sendStatus: 'skipped',
        errorMessage: '未綁定 LINE',
        metadata: { lead_id: lead.id },
      });
      continue;
    }

    const messagePack = buildFollowUpReminderMessage({
      studentName: lead.student_name,
      parentName: lead.parent_name,
      statusLabel: LEAD_STATUS_LABELS[lead.status as keyof typeof LEAD_STATUS_LABELS],
    });

    const result = await sendLinePushMessage(lineUserId, [messagePack.message]);
    if (result.ok) {
      sent += 1;
      await logLineMessageResult({
        targetType: 'profile',
        targetProfileId: lead.assigned_to,
        lineUserId,
        messageType: 'follow_up_reminder',
        messageBody: messagePack.text,
        sendStatus: 'sent',
      });
    } else {
      error += 1;
      await logLineMessageResult({
        targetType: 'profile',
        targetProfileId: lead.assigned_to,
        lineUserId,
        messageType: 'follow_up_reminder',
        messageBody: messagePack.text,
        sendStatus: 'failed',
        errorMessage: result.errorMessage,
      });
    }
  }

  const { count: finishedNotContacted } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'finished_quiz');

  if (finishedNotContacted && finishedNotContacted > 0) {
    const { data: admins } = await supabase
      .from('profiles')
      .select('id, line_user_id')
      .eq('role', 'admin');

    for (const admin of admins ?? []) {
      if (!admin.line_user_id) {
        skipped += 1;
        continue;
      }
      const messagePack = buildQuizCompletionReminderMessage({
        count: finishedNotContacted,
      });
      const result = await sendLinePushMessage(admin.line_user_id, [messagePack.message]);
      if (result.ok) sent += 1;
      else error += 1;

      await logLineMessageResult({
        targetType: 'profile',
        targetProfileId: admin.id,
        lineUserId: admin.line_user_id,
        messageType: 'quiz_completion_follow_up',
        messageBody: messagePack.text,
        sendStatus: result.ok ? 'sent' : 'failed',
        errorMessage: result.ok ? undefined : result.errorMessage,
      });
    }
  }

  return await finishAutomationRun(run.id, { scanned, sent, skipped, error });
}

