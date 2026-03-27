import { notFound } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import LeadDetailHeader from '@/components/admin/LeadDetailHeader';
import LeadBasicInfoCard from '@/components/admin/LeadBasicInfoCard';
import LeadQuizSummaryCard from '@/components/admin/LeadQuizSummaryCard';
import LineBindTokenCard from '@/components/admin/LineBindTokenCard';
import ContactTimelineCard from '@/components/admin/ContactTimelineCard';
import ContactLogForm from '@/components/admin/ContactLogForm';
import TrialBookingsCard from '@/components/admin/TrialBookingsCard';
import TrialBookingForm from '@/components/admin/TrialBookingForm';
import EnrollmentRecordCard from '@/components/admin/EnrollmentRecordCard';
import EnrollmentForm from '@/components/admin/EnrollmentForm';
import { fetchLeadDetail } from '@/lib/admin/lead-detail';
import { requireRole } from '@/lib/auth/guards';

interface LeadDetailPageProps {
  params: { id: string };
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  await requireRole(['admin', 'staff']);
  const lead = await fetchLeadDetail(params.id);
  if (!lead) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PageContainer className="py-10 sm:py-14 space-y-6">
        <LeadDetailHeader leadId={lead.id} studentName={lead.student_name} status={lead.status} />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <LeadBasicInfoCard lead={lead} />
          <div className="space-y-6">
            <LeadQuizSummaryCard lead={lead} />
            <LineBindTokenCard leadId={lead.id} />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <ContactTimelineCard logs={lead.contact_logs} />
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">新增聯絡紀錄</h2>
            <div className="mt-4">
              <ContactLogForm leadId={lead.id} />
            </div>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <TrialBookingsCard bookings={lead.trial_bookings} />
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">新增試聽預約</h2>
            <div className="mt-4">
              <TrialBookingForm leadId={lead.id} />
            </div>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <EnrollmentRecordCard records={lead.enrollment_records} />
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">新增報名紀錄</h2>
            <div className="mt-4">
              <EnrollmentForm leadId={lead.id} />
            </div>
          </div>
        </div>
      </PageContainer>
    </main>
  );
}

