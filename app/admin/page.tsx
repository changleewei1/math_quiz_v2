import Link from 'next/link';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatsCards from '@/components/admin/AdminStatsCards';
import FunnelCard from '@/components/admin/FunnelCard';
import WeaknessChartCard from '@/components/admin/WeaknessChartCard';
import RecentSessionsCard from '@/components/admin/RecentSessionsCard';
import ActionSuggestionsCard from '@/components/admin/ActionSuggestionsCard';
import PageContainer from '@/components/layout/PageContainer';
import {
  buildActionSuggestions,
  buildFunnel,
  fetchDashboardStats,
  fetchRecentSessions,
  fetchWeaknessStats,
} from '@/lib/admin/dashboard';
import { requireRole } from '@/lib/auth/guards';

export default async function AdminDashboardPage() {
  await requireRole(['admin', 'staff']);
  const stats = await fetchDashboardStats();
  const funnel = buildFunnel(stats);
  const weaknessStats = await fetchWeaknessStats();
  const recentSessions = await fetchRecentSessions();
  const suggestions = await buildActionSuggestions(stats);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PageContainer className="py-10 sm:py-14">
        <div className="space-y-8">
          <AdminPageHeader
            title="招生與弱點分析儀表板"
            subtitle="快速掌握目前名單、測驗完成狀況與弱點分布"
          />
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/admin/funnel-leads"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-indigo-700 shadow-sm hover:bg-slate-50"
            >
              漏斗名單（唯讀）
            </Link>
            <Link
              href="/admin/funnel-bookings"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-indigo-700 shadow-sm hover:bg-slate-50"
            >
              漏斗試聽預約（唯讀）
            </Link>
          </div>
          <AdminStatsCards stats={stats} />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <FunnelCard stages={funnel} />
            <WeaknessChartCard data={weaknessStats} />
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <RecentSessionsCard sessions={recentSessions} />
            <ActionSuggestionsCard suggestions={suggestions} />
          </div>
        </div>
      </PageContainer>
    </main>
  );
}

