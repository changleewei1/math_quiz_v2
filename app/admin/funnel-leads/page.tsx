import PageContainer from '@/components/layout/PageContainer';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import FilterBar from '@/components/admin/FilterBar';
import FunnelLeadsTable from '@/components/admin/FunnelLeadsTable';
import { fetchFunnelLeads } from '@/lib/db/funnel-leads';
import { requireRole } from '@/lib/auth/guards';

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function AdminFunnelLeadsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireRole(['admin', 'staff']);
  const sp = await searchParams;
  const search = first(sp.search);
  const quiz = first(sp.quiz) ?? 'all';
  const trial = first(sp.trial) ?? 'all';

  const rows = await fetchFunnelLeads({
    search,
    quiz,
    trial,
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PageContainer className="space-y-6 py-10 sm:py-14">
        <AdminPageHeader
          title="漏斗名單（唯讀）"
          subtitle="前台 /register 建立之名單與測驗、試聽預約關聯摘要。"
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
              <label htmlFor="quiz" className="text-xs font-medium text-slate-500">
                測驗狀態
              </label>
              <select
                id="quiz"
                name="quiz"
                defaultValue={quiz}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="all">全部</option>
                <option value="completed">已完成測驗</option>
                <option value="incomplete">未完成測驗</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="trial" className="text-xs font-medium text-slate-500">
                試聽預約
              </label>
              <select
                id="trial"
                name="trial"
                defaultValue={trial}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="all">全部</option>
                <option value="yes">已預約試聽</option>
                <option value="no">尚未預約試聽</option>
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
        <p className="text-xs text-slate-500">最多顯示 500 筆（依建立時間新到舊）。查看報告將另開分頁。</p>
        <FunnelLeadsTable rows={rows} />
      </PageContainer>
    </main>
  );
}
