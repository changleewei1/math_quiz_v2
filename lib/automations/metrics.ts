import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { AutomationRun, AutomationRunResultInput, LineMessageLogInput } from '@/lib/types/automations';
import type { LineMessageLog } from '@/lib/types/line';

export async function createAutomationRun(jobName: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('automation_runs')
    .insert({ job_name: jobName, status: 'running' })
    .select('id')
    .single();
  return data!;
}

export async function finishAutomationRun(
  id: string,
  result: AutomationRunResultInput
) {
  const supabase = createSupabaseServerClient();
  const status =
    result.error > 0 && result.sent > 0
      ? 'partial_success'
      : result.error > 0
        ? 'failed'
        : 'success';

  await supabase
    .from('automation_runs')
    .update({
      finished_at: new Date().toISOString(),
      status,
      scanned_count: result.scanned,
      sent_count: result.sent,
      skipped_count: result.skipped,
      error_count: result.error,
    })
    .eq('id', id);

  return {
    ok: true,
    status,
    ...result,
  };
}

export async function logLineMessageResult(input: LineMessageLogInput) {
  const supabase = createSupabaseServerClient();
  await supabase.from('line_message_logs').insert({
    target_type: input.targetType,
    target_profile_id: input.targetProfileId ?? null,
    target_lead_id: input.targetLeadId ?? null,
    line_user_id: input.lineUserId,
    message_type: input.messageType,
    message_body: input.messageBody,
    send_status: input.sendStatus,
    provider_message_id: input.providerMessageId ?? null,
    error_message: input.errorMessage ?? null,
    metadata: input.metadata ?? {},
  });
}

export async function fetchAutomationRuns(): Promise<AutomationRun[]> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('automation_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(20);
  return (data ?? []) as AutomationRun[];
}

export async function fetchMessageLogs(): Promise<LineMessageLog[]> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('line_message_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  return (data ?? []) as LineMessageLog[];
}

export async function runConversionMetricsJob() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('automation_runs')
    .insert({
      job_name: 'conversion_metrics',
      status: 'success',
      scanned_count: 0,
      sent_count: 0,
      skipped_count: 0,
      error_count: 0,
    })
    .select('id')
    .single();

  return { ok: true, runId: data?.id ?? null };
}


