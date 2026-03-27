import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendLinePushMessage } from '@/lib/line/send';
import {
  buildTrialReminderMessage,
  buildPostTrialReminderMessage,
} from '@/lib/line/messages';
import {
  logLineMessageResult,
  createAutomationRun,
  finishAutomationRun,
} from '@/lib/automations/metrics';

export async function runTrialReminderJob() {
  const supabase = createSupabaseServerClient();
  const run = await createAutomationRun('trial_reminders');

  let scanned = 0;
  let sent = 0;
  let skipped = 0;
  let error = 0;

  const tomorrowStart = new Date();
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const { data: trials } = await supabase
    .from('trial_bookings')
    .select(
      'id, lead_id, trial_date, course_name, status, leads(student_name, parent_name, line_user_id), leads!inner(assigned_to, profiles!leads_assigned_to_fkey(line_user_id))'
    )
    .eq('status', 'booked')
    .gte('trial_date', tomorrowStart.toISOString())
    .lte('trial_date', tomorrowEnd.toISOString());

  for (const trial of trials ?? []) {
    scanned += 1;
    const leadInfo = Array.isArray(trial.leads) ? trial.leads[0] : trial.leads;
    const assignedProfile = Array.isArray(leadInfo?.profiles) ? leadInfo?.profiles[0] : leadInfo?.profiles;
    const staffLine = assignedProfile?.line_user_id;
    const parentLine = leadInfo?.line_user_id;

    const trialTime = new Date(trial.trial_date).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (staffLine) {
      const msgPack = buildTrialReminderMessage({
        studentName: leadInfo?.student_name ?? '',
        courseName: trial.course_name,
        trialDateTime: trialTime,
      });
      const result = await sendLinePushMessage(staffLine, [msgPack.message]);
      await logLineMessageResult({
        targetType: 'profile',
        targetProfileId: leadInfo?.assigned_to ?? null,
        lineUserId: staffLine,
        messageType: 'trial_reminder',
        messageBody: msgPack.text,
        sendStatus: result.ok ? 'sent' : 'failed',
        errorMessage: result.ok ? undefined : result.errorMessage,
        metadata: { trial_id: trial.id },
      });
      if (result.ok) sent += 1;
      else error += 1;
    } else {
      skipped += 1;
    }

    if (parentLine) {
      const msgParentPack = buildTrialReminderMessage({
        studentName: leadInfo?.student_name ?? '',
        courseName: trial.course_name,
        trialDateTime: trialTime,
        isParent: true,
      });
      const result = await sendLinePushMessage(parentLine, [msgParentPack.message]);
      await logLineMessageResult({
        targetType: 'lead',
        targetLeadId: trial.lead_id,
        lineUserId: parentLine,
        messageType: 'trial_reminder',
        messageBody: msgParentPack.text,
        sendStatus: result.ok ? 'sent' : 'failed',
        errorMessage: result.ok ? undefined : result.errorMessage,
        metadata: { trial_id: trial.id },
      });
      if (result.ok) sent += 1;
      else error += 1;
    } else {
      skipped += 1;
    }
  }

  const afterDays = 2;
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - afterDays);

  const { data: attended } = await supabase
    .from('trial_bookings')
    .select(
      'id, lead_id, trial_date, course_name, leads(student_name, assigned_to, profiles!leads_assigned_to_fkey(line_user_id))'
    )
    .eq('status', 'attended')
    .lte('trial_date', threshold.toISOString());

  for (const trial of attended ?? []) {
    const { count: enrollCount } = await supabase
      .from('enrollment_records')
      .select('id', { count: 'exact', head: true })
      .eq('lead_id', trial.lead_id);

    if (enrollCount && enrollCount > 0) continue;

    scanned += 1;
    const leadInfo = Array.isArray(trial.leads) ? trial.leads[0] : trial.leads;
    const assignedProfile = Array.isArray(leadInfo?.profiles) ? leadInfo?.profiles[0] : leadInfo?.profiles;
    const staffLine = assignedProfile?.line_user_id;
    if (!staffLine) {
      skipped += 1;
      continue;
    }

    const msgPack = buildPostTrialReminderMessage({
      studentName: leadInfo?.student_name ?? '',
      daysAfter: afterDays,
    });

    const result = await sendLinePushMessage(staffLine, [msgPack.message]);
    await logLineMessageResult({
      targetType: 'profile',
      targetProfileId: leadInfo?.assigned_to ?? null,
      lineUserId: staffLine,
      messageType: 'post_trial_follow_up',
      messageBody: msgPack.text,
      sendStatus: result.ok ? 'sent' : 'failed',
      errorMessage: result.ok ? undefined : result.errorMessage,
      metadata: { trial_id: trial.id },
    });

    if (result.ok) sent += 1;
    else error += 1;
  }

  return await finishAutomationRun(run.id, { scanned, sent, skipped, error });
}

