import PageContainer from '@/components/layout/PageContainer';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import FilterBar from '@/components/admin/FilterBar';
import FunnelBookingsTable from '@/components/admin/FunnelBookingsTable';
import { fetchFunnelBookings } from '@/lib/db/funnel-bookings';
import { MVP_PREFERRED_TIME_OPTIONS } from '@/lib/validations/mvp-trial-booking-form';
import { requireRole } from '@/lib/auth/guards';

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function AdminFunnelBookingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireRole(['admin', 'staff']);
  const sp = await searchParams;
  const search = first(sp.search);
  const preferredTime = first(sp.preferred_time) ?? '';
  const overallLevel = first(sp.overall_level) ?? '';

  const rows = await fetchFunnelBookings({
    search,
    preferred_time: preferredTime || undefined,
    overall_level: overallLevel || undefined,
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PageContainer className="space-y-6 py-10 sm:py-14">
        <AdminPageHeader
          title="漏斗試聽預約（唯讀）"
          subtitle="前台 /booking 寫入 funnel_trial_bookings 之紀錄。"
        />
        <FilterBar title="搜尋與篩選">
          <form className="flex flex-1 flex-wrap items-end gap-3" method="get">
            <div className="flex min-w-[200px] flex-1 flex-col gap-1">
              <label htmlFor="search" className="text-xs font-medium text-slate-500">
                關鍵字
              </label>
              <input
                id="search"
                type="text"
                name="search"
                defaultValue={search}
                placeholder="學生姓名、家長姓名或電話"
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="preferred_time" className="text-xs font-medium text-slate-500">
                可上課時段
              </label>
              <select
                id="preferred_time"
                name="preferred_time"
                defaultValue={preferredTime}
                className="min-w-[180px] rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">全部時段</option>
                {MVP_PREFERRED_TIME_OPTIONS.map((o) => (
                  <option key={o.value} value={o.label}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="overall_level" className="text-xs font-medium text-slate-500">
                整體等級
              </label>
              <select
                id="overall_level"
                name="overall_level"
                defaultValue={overallLevel}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">全部</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              套用
            </button>
          </form>
        </FilterBar>
        <p className="text-xs text-slate-500">最多顯示 500 筆（依建立時間新到舊）。時段篩選比對儲存之中文標籤。</p>
        <FunnelBookingsTable rows={rows} />
      </PageContainer>
    </main>
  );
}
