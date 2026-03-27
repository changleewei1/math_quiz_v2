import PageContainer from '@/components/layout/PageContainer';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import FilterBar from '@/components/admin/FilterBar';
import LeadsTable from '@/components/admin/LeadsTable';
import { fetchLeads } from '@/lib/admin/leads';
import { LEAD_STATUS_LABELS } from '@/lib/admin/constants';
import { requireRole } from '@/lib/auth/guards';

interface LeadsPageProps {
  searchParams: { search?: string; status?: string; followUp?: string };
}

export default async function AdminLeadsPage({ searchParams }: LeadsPageProps) {
  await requireRole(['admin', 'staff']);
  const leads = await fetchLeads({
    search: searchParams.search,
    status: searchParams.status,
    followUp: searchParams.followUp as 'today' | 'overdue' | undefined,
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PageContainer className="py-10 sm:py-14 space-y-6">
        <AdminPageHeader
          title="名單管理"
          subtitle="追蹤學生名單與測驗進度，安排後續聯絡與試聽。"
        />
        <FilterBar title="搜尋與篩選">
          <form className="flex flex-1 flex-wrap gap-3" method="get">
            <input
              type="text"
              name="search"
              defaultValue={searchParams.search}
              placeholder="搜尋學生姓名、家長姓名或電話"
              className="w-full max-w-xs rounded-xl border border-slate-200 px-4 py-2 text-sm"
            />
            <select
              name="status"
              defaultValue={searchParams.status || ''}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">依照狀態篩選</option>
              {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              name="followUp"
              defaultValue={searchParams.followUp || ''}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">追蹤提醒</option>
              <option value="today">今天要追蹤</option>
              <option value="overdue">逾期未追蹤</option>
            </select>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              套用
            </button>
          </form>
        </FilterBar>
        <LeadsTable leads={leads} />
      </PageContainer>
    </main>
  );
}

