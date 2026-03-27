'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { SourceConversionMetric } from '@/lib/types/analytics';

export async function getSourceConversionMetrics(
  range?: { from?: string; to?: string }
): Promise<SourceConversionMetric[]> {
  const supabase = createSupabaseServerClient();
  const query = supabase.from('leads').select('id, source, status, created_at');
  if (range?.from) query.gte('created_at', range.from);
  if (range?.to) query.lte('created_at', range.to);
  const { data: leads } = await query;

  const grouped: Record<string, SourceConversionMetric> = {};
  for (const lead of leads ?? []) {
    const key = lead.source || '未標註';
    if (!grouped[key]) {
      grouped[key] = {
        source: key,
        leadCount: 0,
        finishedQuiz: 0,
        trialBooked: 0,
        enrolled: 0,
        enrollRate: 0,
      };
    }
    grouped[key].leadCount += 1;
    if (lead.status === 'finished_quiz') grouped[key].finishedQuiz += 1;
    if (lead.status === 'trial_booked') grouped[key].trialBooked += 1;
    if (lead.status === 'enrolled') grouped[key].enrolled += 1;
  }

  return Object.values(grouped).map((item) => ({
    ...item,
    enrollRate: item.leadCount === 0 ? 0 : Math.round((item.enrolled / item.leadCount) * 100),
  }));
}


