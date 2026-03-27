import Link from 'next/link';
import type { QuestionListItem } from '@/lib/admin/types';
import { DIFFICULTY_LABELS, DIMENSION_LABELS } from '@/lib/admin/constants';
import { formatDateTime, truncateText } from '@/lib/admin/formatters';
import { deleteQuestion, toggleQuestionActive } from '@/lib/admin/questions';

interface QuestionsTableProps {
  questions: QuestionListItem[];
}

export default function QuestionsTable({ questions }: QuestionsTableProps) {
  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        目前沒有符合條件的題目
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="px-4 py-3">題目摘要</th>
            <th className="px-4 py-3">向度</th>
            <th className="px-4 py-3">難度</th>
            <th className="px-4 py-3">啟用</th>
            <th className="px-4 py-3">排序</th>
            <th className="px-4 py-3">建立時間</th>
            <th className="px-4 py-3">操作</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((question) => (
            <tr key={question.id} className="border-b">
              <td className="px-4 py-3 text-slate-700">
                {truncateText(question.prompt, 48)}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {DIMENSION_LABELS[question.dimension]}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {DIFFICULTY_LABELS[question.difficulty]}
              </td>
              <td className="px-4 py-3">
                <form action={toggleQuestionActive.bind(null, question.id, !question.is_active)}>
                  <button
                    type="submit"
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      question.is_active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {question.is_active ? '啟用中' : '已停用'}
                  </button>
                </form>
              </td>
              <td className="px-4 py-3 text-slate-600">{question.sort_order}</td>
              <td className="px-4 py-3 text-slate-500">{formatDateTime(question.created_at)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/admin/questions/${question.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    編輯
                  </Link>
                  <form action={deleteQuestion.bind(null, question.id)}>
                    <button
                      type="submit"
                      className="text-rose-600 hover:text-rose-700"
                    >
                      刪除
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


