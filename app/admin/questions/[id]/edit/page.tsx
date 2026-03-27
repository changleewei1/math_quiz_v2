import { notFound } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import QuestionForm from '@/components/admin/QuestionForm';
import { fetchQuestionById, updateQuestion } from '@/lib/admin/questions';
import { questionFormSchema, type QuestionFormValues } from '@/lib/validations/question-form';
import { requireRole } from '@/lib/auth/guards';

interface EditQuestionPageProps {
  params: { id: string };
}

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
  await requireRole(['admin']);
  const question = await fetchQuestionById(params.id);
  if (!question) {
    notFound();
  }

  const choices = Array.isArray(question.choices) ? question.choices : [];
  const initialValues: QuestionFormValues = {
    prompt: question.prompt ?? '',
    explanation: question.explanation ?? '',
    choice_1: choices[0] ?? '',
    choice_2: choices[1] ?? '',
    choice_3: choices[2] ?? '',
    choice_4: choices[3] ?? '',
    correct_answer: question.correct_answer ?? '',
    dimension: question.dimension,
    difficulty: question.difficulty,
    sort_order: question.sort_order ?? 0,
    is_active: question.is_active ?? true,
  };

  const updateQuestionAction = async (values: QuestionFormValues) => {
    'use server';
    const parsed = questionFormSchema.safeParse(values);
    if (!parsed.success) {
      return { ok: false, message: '請確認題目欄位是否完整。' };
    }
    return updateQuestion(params.id, parsed.data);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PageContainer className="py-10 sm:py-14 space-y-6">
        <AdminPageHeader title="編輯題目" subtitle="調整題目內容與答案設定。" />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <QuestionForm mode="edit" initialValues={initialValues} onSubmitAction={updateQuestionAction} />
        </div>
      </PageContainer>
    </main>
  );
}

