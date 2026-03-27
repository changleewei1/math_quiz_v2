import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import FilterBar from '@/components/admin/FilterBar';
import QuestionsTable from '@/components/admin/QuestionsTable';
import { fetchQuestions } from '@/lib/admin/questions';
import { DIMENSION_LABELS, DIFFICULTY_LABELS } from '@/lib/admin/constants';
import { requireRole } from '@/lib/auth/guards';

interface QuestionsPageProps {
  searchParams: {
    search?: string;
    dimension?: string;
    difficulty?: string;
    isActive?: string;
  };
}

export default async function AdminQuestionsPage({ searchParams }: QuestionsPageProps) {
  await requireRole(['admin']);
  const questions = await fetchQuestions({
    search: searchParams.search,
    dimension: searchParams.dimension,
    difficulty: searchParams.difficulty,
    isActive: searchParams.isActive,
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PageContainer className="py-10 sm:py-14 space-y-6">
        <AdminPageHeader
          title="題庫管理"
          subtitle="管理升國一診斷題庫，維護題目品質。"
          actions={
            <Link
              href="/admin/questions/new"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              新增題目
            </Link>
          }
        />
        <FilterBar title="搜尋與篩選">
          <form className="flex flex-1 flex-wrap gap-3" method="get">
            <input
              type="text"
              name="search"
              defaultValue={searchParams.search}
              placeholder="搜尋題目文字"
              className="w-full max-w-xs rounded-xl border border-slate-200 px-4 py-2 text-sm"
            />
            <select
              name="dimension"
              defaultValue={searchParams.dimension || ''}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">向度篩選</option>
              {Object.entries(DIMENSION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              name="difficulty"
              defaultValue={searchParams.difficulty || ''}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">難度篩選</option>
              {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              name="isActive"
              defaultValue={searchParams.isActive || ''}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">啟用狀態</option>
              <option value="true">啟用中</option>
              <option value="false">已停用</option>
            </select>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              套用
            </button>
          </form>
        </FilterBar>
        <QuestionsTable questions={questions} />
      </PageContainer>
    </main>
  );
}

