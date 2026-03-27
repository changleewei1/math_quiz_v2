import { notFound } from 'next/navigation';
import { z } from 'zod';
import ReportCard from '@/components/ReportCard';
import { getQuizReportBySessionId } from '@/lib/db/quiz-sessions';

interface ReportPageProps {
  params: Promise<{ sessionId: string }>;
}

const uuidSchema = z.string().uuid();

export default async function ReportPage({ params }: ReportPageProps) {
  const { sessionId } = await params;
  if (!uuidSchema.safeParse(sessionId).success) {
    notFound();
  }

  const bundle = await getQuizReportBySessionId(sessionId);
  if (!bundle) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50/40 py-8 text-slate-900 sm:py-12">
      <ReportCard sessionId={sessionId} initialReport={bundle.report} leadId={bundle.lead.id} />
    </main>
  );
}
