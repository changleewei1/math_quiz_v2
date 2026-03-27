import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';
import QuizCard from '@/components/QuizCard';
import { QUESTIONS } from '@/lib/questions';
import { getLeadById } from '@/lib/db/leads';
import { getQuizSessionById } from '@/lib/db/quiz-sessions';

interface QuizPageProps {
  /** Next.js 15+ 為 Promise，需 await 才拿得到 sessionId */
  params: Promise<{ sessionId: string }>;
}

const uuidSchema = z.string().uuid();

export default async function QuizPage({ params }: QuizPageProps) {
  const { sessionId } = await params;
  if (!uuidSchema.safeParse(sessionId).success) {
    notFound();
  }

  const session = await getQuizSessionById(sessionId);
  if (!session) {
    notFound();
  }

  if (session.completed_at) {
    redirect(`/report/${sessionId}`);
  }

  const lead = await getLeadById(session.lead_id);

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 py-8 text-slate-900 sm:py-12">
      <div className="mx-auto max-w-5xl px-4">
        <QuizCard
          sessionId={sessionId}
          questions={QUESTIONS}
          studentNameFromLead={lead?.student_name}
        />
      </div>
    </main>
  );
}
