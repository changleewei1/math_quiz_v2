import PageContainer from '@/components/layout/PageContainer';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import FunnelAnalyticsCard from '@/components/admin/FunnelAnalyticsCard';
import SourceAnalyticsTable from '@/components/admin/SourceAnalyticsTable';
import CourseConversionCard from '@/components/admin/CourseConversionCard';
import WeaknessConversionCard from '@/components/admin/WeaknessConversionCard';
import DateRangeFilter from '@/components/admin/DateRangeFilter';
import { getFunnelMetrics } from '@/lib/analytics/funnel';
import { getSourceConversionMetrics } from '@/lib/analytics/sources';
import { getCourseConversionMetrics } from '@/lib/analytics/courses';
import { getWeaknessConversionMetrics } from '@/lib/analytics/weaknesses';
import { requireRole } from '@/lib/auth/guards';

interface AnalyticsPageProps {
  searchParams: { from?: string; to?: string };
}

export default async function AdminAnalyticsPage({ searchParams }: AnalyticsPageProps) {
  await requireRole(['admin', 'staff']);
  const range = { from: searchParams.from, to: searchParams.to };

  const [funnel, sources, courses, weaknesses] = await Promise.all([
    getFunnelMetrics(range),
    getSourceConversionMetrics(range),
    getCourseConversionMetrics(range),
    getWeaknessConversionMetrics(),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PageContainer className="py-10 sm:py-14 space-y-6">
        <AdminPageHeader title="招生轉換分析" subtitle="掌握來源成效、試聽轉換與弱點分布。" />
        <DateRangeFilter />
        <FunnelAnalyticsCard items={funnel} />
        <SourceAnalyticsTable items={sources} />
        <div className="grid gap-6 lg:grid-cols-2">
          <CourseConversionCard items={courses} />
          <WeaknessConversionCard items={weaknesses} />
        </div>
      </PageContainer>
    </main>
  );
}


