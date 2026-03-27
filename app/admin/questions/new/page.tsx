import PageContainer from '@/components/layout/PageContainer';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import QuestionForm from '@/components/admin/QuestionForm';
import { createQuestion } from '@/lib/admin/questions';
import { questionFormSchema, type QuestionFormValues } from '@/lib/validations/question-form';
import { requireRole } from '@/lib/auth/guards';

export default async function NewQuestionPage() {
  await requireRole(['admin']);
  const initialValues: QuestionFormValues = {
    prompt: '',
    explanation: '',
    choice_1: '',
    choice_2: '',
    choice_3: '',
    choice_4: '',
    correct_answer: '',
    dimension: 'number_sense',
    difficulty: 'easy',
    sort_order: 0,
    is_active: true,
  };

  const createQuestionAction = async (values: QuestionFormValues) => {
    'use server';
    const parsed = questionFormSchema.safeParse(values);
    if (!parsed.success) {
      return { ok: false, message: '請確認題目欄位是否完整。' };
    }
    return createQuestion(parsed.data);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PageContainer className="py-10 sm:py-14 space-y-6">
        <AdminPageHeader title="新增題目" subtitle="建立新的升國一診斷題。" />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <QuestionForm mode="create" initialValues={initialValues} onSubmitAction={createQuestionAction} />
        </div>
      </PageContainer>
    </main>
  );
}

