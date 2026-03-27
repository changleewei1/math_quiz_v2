import PageContainer from '@/components/layout/PageContainer';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ExportPanel from '@/components/admin/ExportPanel';
import { requireRole } from '@/lib/auth/guards';

export default async function AdminExportPage() {
  await requireRole(['admin']);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PageContainer className="py-10 sm:py-14 space-y-6">
        <AdminPageHeader
          title="資料匯出"
          subtitle="匯出名單與測驗結果，提供行政整理與後續分析。"
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">名單匯出</h2>
            <p className="mt-1 text-sm text-slate-500">可依狀態與日期篩選名單。</p>
            <div className="mt-4">
              <ExportPanel type="leads" />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">測驗結果匯出</h2>
            <p className="mt-1 text-sm text-slate-500">匯出測驗成績與弱點分析摘要。</p>
            <div className="mt-4">
              <ExportPanel type="sessions" />
            </div>
          </div>
        </div>
      </PageContainer>
    </main>
  );
}


