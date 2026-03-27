import PageContainer from '@/components/layout/PageContainer';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import FilterBar from '@/components/admin/FilterBar';
import SessionsTable from '@/components/admin/SessionsTable';
import { fetchSessions } from '@/lib/admin/sessions';
import { DIMENSION_LABELS } from '@/lib/admin/constants';
import { requireRole } from '@/lib/auth/guards';

interface SessionsPageProps {
  searchParams: {
    search?: string;
    overallLevel?: string;
    completed?: string;
    weakDimension?: string;
  };
}

export default async function AdminSessionsPage({ searchParams }: SessionsPageProps) {
  await requireRole(['admin', 'staff']);
  const sessions = await fetchSessions({
    search: searchParams.search,
    overallLevel: searchParams.overallLevel,
    completed: searchParams.completed,
    weakDimension: searchParams.weakDimension as any,
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PageContainer className="py-10 sm:py-14 space-y-6">
        <AdminPageHeader
          title="測驗紀錄管理"
          subtitle="查看學生測驗結果摘要與弱點分布。"
        />
        <FilterBar title="搜尋與篩選">
          <form className="flex flex-1 flex-wrap gap-3" method="get">
            <input
              type="text"
              name="search"
              defaultValue={searchParams.search}
              placeholder="搜尋學生姓名"
              className="w-full max-w-xs rounded-xl border border-slate-200 px-4 py-2 text-sm"
            />
            <select
              name="overallLevel"
              defaultValue={searchParams.overallLevel || ''}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">依程度篩選</option>
              <option value="A">A 級</option>
              <option value="B">B 級</option>
              <option value="C">C 級</option>
              <option value="D">D 級</option>
            </select>
            <select
              name="completed"
              defaultValue={searchParams.completed || ''}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">完成狀態</option>
              <option value="true">已完成</option>
              <option value="false">未完成</option>
            </select>
            <select
              name="weakDimension"
              defaultValue={searchParams.weakDimension || ''}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">弱點向度</option>
              {Object.entries(DIMENSION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              套用
            </button>
          </form>
        </FilterBar>
        <SessionsTable sessions={sessions} />
      </PageContainer>
    </main>
  );
}

