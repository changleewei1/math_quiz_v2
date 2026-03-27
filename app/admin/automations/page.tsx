import PageContainer from '@/components/layout/PageContainer';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AutomationRunsTable from '@/components/admin/AutomationRunsTable';
import MessageLogsTable from '@/components/admin/MessageLogsTable';
import { requireRole } from '@/lib/auth/guards';
import { fetchAutomationRuns, fetchMessageLogs } from '@/lib/automations/metrics';

export default async function AdminAutomationsPage() {
  await requireRole(['admin', 'staff']);
  const runs = await fetchAutomationRuns();
  const logs = await fetchMessageLogs();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PageContainer className="py-10 sm:py-14 space-y-6">
        <AdminPageHeader title="自動化任務" subtitle="追蹤自動提醒執行狀況與訊息發送紀錄。" />
        <AutomationRunsTable runs={runs} />
        <MessageLogsTable logs={logs} />
      </PageContainer>
    </main>
  );
}


