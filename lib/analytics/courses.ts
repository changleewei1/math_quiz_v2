'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { CourseConversionMetric } from '@/lib/types/analytics';

export async function getCourseConversionMetrics(
  range?: { from?: string; to?: string }
): Promise<CourseConversionMetric[]> {
  const supabase = createSupabaseServerClient();
  const query = supabase
    .from('trial_bookings')
    .select('course_name, trial_date, status, lead_id');
  if (range?.from) query.gte('trial_date', range.from);
  if (range?.to) query.lte('trial_date', range.to);
  const { data: trials } = await query;

  const grouped: Record<string, CourseConversionMetric> = {};
  for (const t of trials ?? []) {
    const key = t.course_name;
    if (!grouped[key]) {
      grouped[key] = {
        courseName: key,
        trialCount: 0,
        attendedCount: 0,
        enrolledCount: 0,
        enrollRate: 0,
      };
    }
    grouped[key].trialCount += 1;
    if (t.status === 'attended') grouped[key].attendedCount += 1;
  }

  for (const key of Object.keys(grouped)) {
    const { count } = await supabase
      .from('enrollment_records')
      .select('id', { count: 'exact', head: true })
      .eq('enrolled_course', key);
    grouped[key].enrolledCount = count ?? 0;
    grouped[key].enrollRate =
      grouped[key].trialCount === 0
        ? 0
        : Math.round((grouped[key].enrolledCount / grouped[key].trialCount) * 100);
  }

  return Object.values(grouped);
}


