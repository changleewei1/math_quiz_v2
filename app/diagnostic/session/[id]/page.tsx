'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import QuestionRenderer from '@/components/questions/QuestionRenderer';

type AnswerState = Record<
  string,
  { userAnswer?: string; selectedChoiceIndex?: number; timeSpent?: number }
>;

export default function DiagnosticSessionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch(`/api/diagnostic/session/${params.id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || '載入診斷失敗');
          return;
        }
        setSession(data.session);
        setQuestions(data.questions || []);
      } catch (err: any) {
        setError(err.message || '載入診斷失敗');
      }
    };
    loadSession();
  }, [params.id]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        userAnswer: answers[q.id]?.userAnswer || '',
        selectedChoiceIndex: answers[q.id]?.selectedChoiceIndex,
        timeSpent: answers[q.id]?.timeSpent || 0,
      }));

      const res = await fetch(`/api/diagnostic/session/${params.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: payload }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '提交失敗');
        return;
      }

      router.push(`/diagnostic/session/${params.id}/result`);
    } catch (err: any) {
      setError(err.message || '提交失敗');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="px-4 py-2 bg-gray-500 text-white rounded">
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <p>載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">弱點分析測驗</h1>
            <p className="text-lg text-gray-600 mt-2">
              {session.subject === 'math' ? '數學' : '理化'}
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            ← 回到首頁
          </Link>
        </div>

        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4">
                <span className="text-sm text-gray-500">
                  第 {index + 1} 題 | {q.difficulty}
                </span>
              </div>
              <QuestionRenderer prompt={q.prompt} media={q.media} />

              {q.qtype === 'mcq' && q.choices ? (
                <div className="space-y-2">
                  {q.choices.map((choice: string, i: number) => (
                    <label
                      key={i}
                      className="flex items-center p-2 border rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={i}
                        checked={answers[q.id]?.selectedChoiceIndex === i}
                        onChange={() =>
                          setAnswers({
                            ...answers,
                            [q.id]: { ...answers[q.id], selectedChoiceIndex: i },
                          })
                        }
                        className="mr-2"
                      />
                      {choice}
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={answers[q.id]?.userAnswer || ''}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [q.id]: { ...answers[q.id], userAnswer: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                  placeholder="請輸入答案"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? '提交中...' : '提交作答'}
          </button>
        </div>
      </div>
    </div>
  );
}


