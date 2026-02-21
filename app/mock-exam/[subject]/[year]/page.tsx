'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BrandHeader from '@/components/BrandHeader';
import { isAnswerMatch } from '@/lib/answerMatch';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

type ExamQuestion = {
  id: string;
  code: string;
  description: string;
  description_md?: string | null;
  options: string[] | null;
  answer: any;
  answer_md?: string | null;
  explanation?: string | null;
  explanation_md?: string | null;
  question_no?: number | null;
  order_index?: number | null;
};

export default function MockExamSessionPage() {
  const params = useParams<{ subject: string; year: string }>();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const subject = params.subject as 'math' | 'physics';
  const examYear = Number(params.year);

  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedbackMap, setFeedbackMap] = useState<Record<string, 'correct' | 'wrong'>>({});
  const feedbackTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/mock-exam/questions?subject=${subject}&year=${examYear}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || '載入題庫失敗');
          return;
        }
        setQuestions(data.questions || []);
      } catch (err: any) {
        setError(err.message || '載入題庫失敗');
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [subject, examYear]);

  useEffect(() => {
    return () => {
      Object.values(feedbackTimersRef.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const showFeedback = (questionId: string, type: 'correct' | 'wrong') => {
    setFeedbackMap((prev) => ({ ...prev, [questionId]: type }));
    if (feedbackTimersRef.current[questionId]) {
      clearTimeout(feedbackTimersRef.current[questionId]);
    }
    feedbackTimersRef.current[questionId] = setTimeout(() => {
      setFeedbackMap((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }, 1000);
  };

  const result = useMemo(() => {
    if (!submitted) return { correct: 0, total: 0, accuracy: 0 };
    let correct = 0;
    questions.forEach((q) => {
      const userAnswer = answers[q.id] ?? '';
      const expected = Array.isArray(q.answer) ? JSON.stringify(q.answer) : String(q.answer ?? '');
      if (isAnswerMatch(userAnswer, expected)) {
        correct += 1;
      }
    });
    const total = questions.length;
    const accuracy = total === 0 ? 0 : correct / total;
    return { correct, total, accuracy };
  }, [submitted, answers, questions]);

  const wrongQuestions = useMemo(() => {
    if (!submitted) return [];
    return questions.filter((q) => {
      const userAnswer = answers[q.id] ?? '';
      const expected = Array.isArray(q.answer) ? JSON.stringify(q.answer) : String(q.answer ?? '');
      return !isAnswerMatch(userAnswer, expected);
    });
  }, [submitted, answers, questions]);

  const formatAnswer = (value: any) => {
    if (Array.isArray(value) || typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value ?? '');
  };

  const renderMarkdown = (content: string) => (
    <ReactMarkdown
      remarkPlugins={[remarkBreaks]}
      components={{
        img: ({ ...props }) => (
          <img
            {...props}
            alt={props.alt || 'image'}
            className="max-w-full h-auto my-3 rounded border border-gray-200"
          />
        ),
        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
      }}
    >
      {content}
    </ReactMarkdown>
  );

  const handleSubmit = () => {
    if (questions.length === 0) return;
    setSubmitted(true);
  };

  const subjectLabel = subject === 'math' ? '數學' : '理化';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <BrandHeader />
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] py-8 px-4">
        <div className="max-w-5xl w-full">
          <div className="bg-white rounded-lg shadow-xl p-5 sm:p-6 lg:p-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-gray-800">
              會考弱點分析（{subjectLabel}）
            </h2>
            <p className="text-center text-sm text-gray-600 mb-6">
              年份：{examYear} ｜ 模式：會考弱點分析（mock_exam） {sessionId ? `｜Session ${sessionId}` : ''}
            </p>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-6">
                {error}
              </div>
            )}

            {loading && <p className="text-sm text-gray-500">載入中...</p>}

            {!submitted ? (
              <div className="space-y-6">
                {questions.map((q, index) => (
                  <div key={q.id} className="border rounded p-4">
                    <div className="text-sm text-gray-500 mb-2">
                      第 {q.question_no ?? index + 1} 題
                    </div>
                    <div className="text-gray-800 mb-3">
                      {renderMarkdown(q.description_md || q.description || '')}
                    </div>
                    {(() => {
                      const rawOptions = q.options;
                      let options: string[] = [];
                      if (Array.isArray(rawOptions)) {
                        options = rawOptions.map((opt) => String(opt));
                      } else if (typeof rawOptions === 'string') {
                        try {
                          const parsed = JSON.parse(rawOptions);
                          if (Array.isArray(parsed)) {
                            options = parsed.map((opt) => String(opt));
                          }
                        } catch {
                          options = [];
                        }
                      }
                      return options.length > 0 ? (
                        <div className="space-y-2">
                          {options.map((opt, idx) => (
                          <label key={idx} className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              name={`q-${q.id}`}
                              value={opt}
                              checked={answers[q.id] === opt}
                              onChange={(e) => {
                                const value = e.target.value;
                                setAnswers({ ...answers, [q.id]: value });
                                const expected = Array.isArray(q.answer)
                                  ? JSON.stringify(q.answer)
                                  : String(q.answer ?? '');
                                const isCorrect = isAnswerMatch(value, expected);
                                showFeedback(q.id, isCorrect ? 'correct' : 'wrong');
                              }}
                            />
                            <span>{opt}</span>
                          </label>
                          ))}
                        </div>
                      ) : (
                      <input
                        type="text"
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        onBlur={() => {
                          const value = answers[q.id] || '';
                          const expected = Array.isArray(q.answer)
                            ? JSON.stringify(q.answer)
                            : String(q.answer ?? '');
                          if (value.trim()) {
                            const isCorrect = isAnswerMatch(value, expected);
                            showFeedback(q.id, isCorrect ? 'correct' : 'wrong');
                          }
                        }}
                        className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="請輸入答案"
                      />
                      );
                    })()}
                    {feedbackMap[q.id] && (
                      <div className="mt-3 text-sm font-semibold">
                        <span className={feedbackMap[q.id] === 'correct' ? 'text-green-600' : 'text-red-600'}>
                          {feedbackMap[q.id] === 'correct' ? '作答正確！' : '作答錯誤！'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                <button
                  onClick={handleSubmit}
                  className="w-full px-6 py-3 min-h-[48px] bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md"
                >
                  交卷
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-2xl font-semibold text-gray-800">
                  正確率 {Math.round(result.accuracy * 100)}%
                </div>
                <div className="text-gray-600">
                  答對 {result.correct} 題 / 共 {result.total} 題
                </div>
                <div className="text-gray-600">
                  錯題數 {result.total - result.correct} 題
                </div>
                {wrongQuestions.length > 0 && (
                  <div className="text-left mt-6 space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800">錯題整理</h3>
                    {wrongQuestions.map((q, index) => (
                      <div key={q.id} className="border rounded p-4">
                        <div className="text-sm text-gray-500 mb-2">第 {index + 1} 題</div>
                        <div className="text-gray-800 mb-3">
                          {renderMarkdown(q.description_md || q.description || '')}
                        </div>
                        {q.options && q.options.length > 0 && (
                          <div className="text-sm text-gray-600 mb-2">
                            選項：{q.options.join(' / ')}
                          </div>
                        )}
                        <div className="text-sm text-gray-700">
                          你的答案：{formatAnswer(answers[q.id])}
                        </div>
                        <div className="text-sm text-green-700">
                          正確答案：
                          {q.answer_md
                            ? renderMarkdown(q.answer_md)
                            : formatAnswer(q.answer)}
                        </div>
                        {(q.explanation_md || q.explanation) && (
                          <div className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">解析：</span>
                            {renderMarkdown(q.explanation_md || q.explanation || '')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <Link
                  href="/mock-exam"
                  className="inline-block px-6 py-3 min-h-[48px] bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-md transition-colors text-sm font-medium"
                >
                  返回年份選擇
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

