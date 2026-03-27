'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { WeaknessConversionMetric } from '@/lib/types/analytics';

export async function getWeaknessConversionMetrics(): Promise<WeaknessConversionMetric[]> {
  const supabase = createSupabaseServerClient();
  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('lead_id, dimension_scores, overall_level');

  const { data: enrollments } = await supabase.from('enrollment_records').select('lead_id');

  const enrolledSet = new Set((enrollments ?? []).map((e) => e.lead_id));

  const metrics: Record<string, WeaknessConversionMetric> = {};
  for (const s of sessions ?? []) {
    const scores = s.dimension_scores || {};
    for (const [dimension] of Object.entries(scores)) {
      if (!metrics[dimension]) {
        metrics[dimension] = {
          dimension,
          totalCount: 0,
          enrolledCount: 0,
          enrollRate: 0,
        };
      }
      metrics[dimension].totalCount += 1;
      if (enrolledSet.has(s.lead_id)) {
        metrics[dimension].enrolledCount += 1;
      }
    }
  }

  return Object.values(metrics).map((m) => ({
    ...m,
    enrollRate: m.totalCount === 0 ? 0 : Math.round((m.enrolledCount / m.totalCount) * 100),
  }));
}


