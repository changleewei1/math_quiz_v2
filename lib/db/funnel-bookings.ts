import { createSupabaseServerClient } from '@/lib/supabase/server';

export type FunnelBookingListItem = {
  id: string;
  student_name: string;
  parent_name: string;
  phone: string;
  preferred_time: string;
  note: string | null;
  overall_level: string | null;
  weak_dimensions: unknown;
  recommended_course: string | null;
  created_at: string;
};

function escapeIlike(q: string): string {
  return q.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export type FetchFunnelBookingsFilters = {
  search?: string;
  preferred_time?: string;
  overall_level?: string;
  limit?: number;
};

export async function fetchFunnelBookings(
  filters: FetchFunnelBookingsFilters = {}
): Promise<FunnelBookingListItem[]> {
  const supabase = createSupabaseServerClient();
  const limit = Math.min(filters.limit ?? 500, 2000);
  const search = filters.search?.trim() ?? '';
  const pt = filters.preferred_time?.trim() ?? '';
  const level = filters.overall_level?.trim() ?? '';

  let q = supabase
    .from('funnel_trial_bookings')
    .select(
      `
      id,
      student_name,
      parent_name,
      phone,
      preferred_time,
      note,
      overall_level,
      weak_dimensions,
      recommended_course,
      created_at
    `
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (search) {
    const s = escapeIlike(search);
    q = q.or(`student_name.ilike.%${s}%,parent_name.ilike.%${s}%,phone.ilike.%${s}%`);
  }

  if (pt) {
    q = q.eq('preferred_time', pt);
  }

  if (level && ['A', 'B', 'C', 'D'].includes(level)) {
    q = q.eq('overall_level', level);
  }

  const { data, error } = await q;
  if (error) {
    console.error('fetchFunnelBookings', error);
    return [];
  }

  return (data ?? []) as FunnelBookingListItem[];
}
