'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import QuestionRenderer from '@/components/questions/QuestionRenderer';
import { isAnswerMatch } from '@/lib/answerMatch';

type AnswerState = Record<
  string,
  { userAnswer?: string; selectedChoiceIndex?: number; timeSpentMs?: number }
>;

export default function DiagnosticSessionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedbackMap, setFeedbackMap] = useState<Record<string, 'correct' | 'wrong'>>({});
  const feedbackTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const questionStartTimesRef = useRef<Record<string, number>>({});
  const sessionStartTimeRef = useRef<number | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [sessionElapsedMs, setSessionElapsedMs] = useState(0);

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
        sessionStartTimeRef.current = Date.now();
        setSessionElapsedMs(0);
        if (sessionTimerRef.current) {
          clearInterval(sessionTimerRef.current);
        }
        sessionTimerRef.current = setInterval(() => {
          if (sessionStartTimeRef.current !== null) {
            setSessionElapsedMs(Math.max(0, Date.now() - sessionStartTimeRef.current));
          }
        }, 1000);
      } catch (err: any) {
        setError(err.message || '載入診斷失敗');
      }
    };
    loadSession();
  }, [params.id]);

  useEffect(() => {
    return () => {
      Object.values(feedbackTimersRef.current).forEach((timer) => clearTimeout(timer));
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
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

  const answeredStats = useMemo(() => {
    let answeredCount = 0;
    let correctCount = 0;
    questions.forEach((q) => {
      const answerEntry = answers[q.id];
      const hasAnswer =
        typeof answerEntry?.selectedChoiceIndex === 'number' ||
        (answerEntry?.userAnswer && answerEntry.userAnswer.trim().length > 0);
      if (!hasAnswer) return;
      answeredCount += 1;
      const isCorrect =
        q.qtype === 'mcq'
          ? answerEntry?.selectedChoiceIndex === q.correct_choice_index
          : isAnswerMatch(String(answerEntry?.userAnswer || ''), String(q.answer || ''));
      if (isCorrect) correctCount += 1;
    });
    return { answeredCount, correctCount };
  }, [answers, questions]);

  const formatDuration = (timeMs: number) => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
    };
  };

  const ensureQuestionStart = (questionId: string) => {
    if (!questionStartTimesRef.current[questionId]) {
      questionStartTimesRef.current[questionId] = Date.now();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const now = Date.now();
      const payload = questions.map((q) => {
        const answerEntry = answers[q.id];
        const hasAnswer =
          typeof answerEntry?.selectedChoiceIndex === 'number' ||
          (answerEntry?.userAnswer && answerEntry.userAnswer.trim().length > 0);
        return {
          questionId: q.id,
          userAnswer: answerEntry?.userAnswer || '',
          selectedChoiceIndex: answerEntry?.selectedChoiceIndex,
          timeSpentMs:
            hasAnswer && typeof questionStartTimesRef.current[q.id] === 'number'
              ? Math.max(0, Math.round(now - questionStartTimesRef.current[q.id]))
              : null,
        };
      });

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
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
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
                        onChange={() => {
                          ensureQuestionStart(q.id);
                          setAnswers({
                            ...answers,
                            [q.id]: { ...answers[q.id], selectedChoiceIndex: i },
                          });
                          const isCorrect = i === q.correct_choice_index;
                          showFeedback(q.id, isCorrect ? 'correct' : 'wrong');
                          playFeedbackTone(isCorrect ? 'correct' : 'wrong');
                        }}
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
                  onFocus={() => ensureQuestionStart(q.id)}
                  onKeyDown={() => ensureQuestionStart(q.id)}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [q.id]: { ...answers[q.id], userAnswer: e.target.value },
                    })
                  }
                  onBlur={() => {
                    const isCorrect = isAnswerMatch(
                      String(answers[q.id]?.userAnswer || ''),
                      String(q.answer || '')
                    );
                    if (answers[q.id]?.userAnswer?.trim()) {
                      showFeedback(q.id, isCorrect ? 'correct' : 'wrong');
                      playFeedbackTone(isCorrect ? 'correct' : 'wrong');
                    }
                  }}
                  className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                  placeholder="請輸入答案"
                />
              )}
              {feedbackMap[q.id] && (
                <div className="mt-3 text-sm font-semibold">
                  <span
                    className={feedbackMap[q.id] === 'correct' ? 'text-green-600' : 'text-red-600'}
                  >
                    {feedbackMap[q.id] === 'correct' ? '作答正確！' : '作答錯誤！'}
                  </span>
                </div>
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
        <div className="lg:w-64">
          <div className="bg-white rounded-lg shadow p-4 lg:sticky lg:top-6">
            <div className="text-center">
              <div className="bg-lime-500 text-white rounded-t-lg py-3 font-semibold">
                已作答題數
              </div>
              <div className="text-4xl font-bold text-gray-700 py-6 border-x border-b">
                {answeredStats.answeredCount} / {questions.length}
              </div>
              <div className="bg-sky-500 text-white py-3 font-semibold">
                作答時間
              </div>
              <div className="border-x border-b py-4">
                {(() => {
                  const { hours, minutes, seconds } = formatDuration(sessionElapsedMs);
                  return (
                    <div className="flex justify-center gap-2 text-gray-700">
                      <div className="text-center">
                        <div className="px-2 py-1 border rounded text-lg font-semibold">{hours}</div>
                        <div className="text-xs text-gray-400 mt-1">時</div>
                      </div>
                      <div className="text-center">
                        <div className="px-2 py-1 border rounded text-lg font-semibold">{minutes}</div>
                        <div className="text-xs text-gray-400 mt-1">分</div>
                      </div>
                      <div className="text-center">
                        <div className="px-2 py-1 border rounded text-lg font-semibold">{seconds}</div>
                        <div className="text-xs text-gray-400 mt-1">秒</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="bg-orange-500 text-white py-3 font-semibold flex items-center justify-center gap-2">
                得分/100
                <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center">?</span>
              </div>
              <div className="text-4xl font-bold text-gray-700 py-6 border-x border-b rounded-b-lg">
                {answeredStats.answeredCount === 0
                  ? 0
                  : Math.round((answeredStats.correctCount / answeredStats.answeredCount) * 100)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


