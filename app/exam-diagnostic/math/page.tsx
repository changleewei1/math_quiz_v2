'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import BrandHeader from '@/components/BrandHeader';
import { isAnswerMatch } from '@/lib/answerMatch';

type ExamQuestion = {
  id: string;
  code: string;
  description: string;
  options: string[] | null;
  answer: any;
  explanation?: string | null;
};

export default function ExamDiagnosticMathPage() {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedbackMap, setFeedbackMap] = useState<Record<string, 'correct' | 'wrong'>>({});
  const feedbackTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  const loadQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/exam-diagnostic?subject=math');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '載入題庫失敗');
        return;
      }
      setQuestions(data.questions || []);
      setMissing(Boolean(data.missing));
    } catch (err: any) {
      setError(err.message || '載入題庫失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    return () => {
      Object.values(feedbackTimersRef.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const playFeedbackTone = (type: 'correct' | 'wrong') => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = type === 'correct' ? 880 : 220;
      gain.gain.value = 0.15;
      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 180);
    } catch {
      // Ignore audio errors
    }
  };

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

  const handleSubmit = () => {
    if (questions.length === 0) return;
    setSubmitted(true);
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <BrandHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)] py-8 px-4">
          <div className="max-w-4xl w-full">
            <div className="bg-white rounded-lg shadow-xl p-5 sm:p-6 lg:p-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8 text-gray-800">
                數學會考弱點分析
              </h2>
              <p className="text-center text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                歷屆會考測試（MVP）
              </p>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-6">
                  {error}
                </div>
              )}

              {missing && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm mb-6">
                  題庫不足，將以現有題目進行測驗。
                </div>
              )}

              <div className="space-y-4">
                <button
                  type="button"
                  disabled={loading || questions.length === 0}
                  onClick={() => setStarted(true)}
                  className="w-full px-6 py-3 min-h-[48px] bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '載入中...' : '開始測驗'}
                </button>
                <Link
                  href="/exam-diagnostic"
                  className="block text-center px-6 py-3 min-h-[48px] bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-md transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                >
                  返回選擇
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <BrandHeader />
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] py-8 px-4">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-lg shadow-xl p-5 sm:p-6 lg:p-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8 text-gray-800">
              數學會考弱點分析
            </h2>

            {questions.length === 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm mb-6">
                目前題庫不足，請稍後再試。
              </div>
            )}

            {!submitted ? (
              <div className="space-y-6">
                {questions.map((q, index) => (
                  <div key={q.id} className="border rounded p-4">
                    <div className="text-sm text-gray-500 mb-2">第 {index + 1} 題</div>
                    <p className="text-gray-800 mb-3">{q.description}</p>
                    {q.options && q.options.length > 0 ? (
                      <div className="space-y-2">
                        {q.options.map((opt, idx) => (
                          <label key={idx} className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              name={`q-${q.id}`}
                              value={opt}
                              checked={answers[q.id] === opt}
                              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
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
                        className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="請輸入答案"
                      />
                    )}
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const userAnswer = answers[q.id] ?? '';
                          const expected = Array.isArray(q.answer)
                            ? JSON.stringify(q.answer)
                            : String(q.answer ?? '');
                          const isCorrect = isAnswerMatch(userAnswer, expected);
                          showFeedback(q.id, isCorrect ? 'correct' : 'wrong');
                          playFeedbackTone(isCorrect ? 'correct' : 'wrong');
                        }}
                        disabled={!answers[q.id]?.trim()}
                        className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                      >
                        檢查答案
                      </button>
                      {feedbackMap[q.id] && (
                        <span
                          className={`text-sm font-semibold ${
                            feedbackMap[q.id] === 'correct' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {feedbackMap[q.id] === 'correct' ? '作答正確！' : '作答錯誤！'}
                        </span>
                      )}
                    </div>
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
                        <p className="text-gray-800 mb-3">{q.description}</p>
                        {q.options && q.options.length > 0 && (
                          <div className="text-sm text-gray-600 mb-2">
                            選項：{q.options.join(' / ')}
                          </div>
                        )}
                        <div className="text-sm text-gray-700">
                          你的答案：{formatAnswer(answers[q.id])}
                        </div>
                        <div className="text-sm text-green-700">
                          正確答案：{formatAnswer(q.answer)}
                        </div>
                        {q.explanation && (
                          <div className="text-sm text-gray-600 mt-2">
                            解析：{q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <Link
                  href="/exam-diagnostic"
                  className="inline-block px-6 py-3 min-h-[48px] bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-md transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                >
                  返回選擇
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


