'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { FunnelMetricItem } from '@/lib/types/analytics';

export async function getFunnelMetrics(
  range?: { from?: string; to?: string }
): Promise<FunnelMetricItem[]> {
  const supabase = createSupabaseServerClient();

  const leadQuery = supabase.from('leads').select('id, status, created_at');
  if (range?.from) leadQuery.gte('created_at', range.from);
  if (range?.to) leadQuery.lte('created_at', range.to);
  const { data: leads } = await leadQuery;

  const total = leads?.length ?? 0;
  const started = leads?.filter((l) => l.status !== 'new').length ?? 0;
  const finished = leads?.filter((l) => l.status === 'finished_quiz').length ?? 0;
  const contacted = leads?.filter((l) => l.status === 'contacted').length ?? 0;
  const trial = leads?.filter((l) => l.status === 'trial_booked').length ?? 0;
  const enrolled = leads?.filter((l) => l.status === 'enrolled').length ?? 0;

  const calc = (count: number) => (total === 0 ? 0 : Math.round((count / total) * 100));

  return [
    { stage: '留資料', count: total, rate: 100 },
    { stage: '開始測驗', count: started, rate: calc(started) },
    { stage: '完成測驗', count: finished, rate: calc(finished) },
    { stage: '已聯絡', count: contacted, rate: calc(contacted) },
    { stage: '已預約試聽', count: trial, rate: calc(trial) },
    { stage: '已報名', count: enrolled, rate: calc(enrolled) },
  ];
}


