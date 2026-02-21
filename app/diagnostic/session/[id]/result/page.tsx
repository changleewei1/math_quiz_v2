'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

export default function DiagnosticResultPage() {
  const params = useParams<{ id: string }>();
  const [result, setResult] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [chapters, setChapters] = useState<Record<string, any>>({});
  const [answers, setAnswers] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadResult = async () => {
      try {
        const res = await fetch(`/api/diagnostic/session/${params.id}/result`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || '載入結果失敗');
          return;
        }
        setResult(data.result);
        setSession(data.session);
        setAnswers(data.answers || []);
      } catch (err: any) {
        setError(err.message || '載入結果失敗');
      }
    };
    loadResult();
  }, [params.id]);

  useEffect(() => {
    if (!result) return;
    const loadChapters = async () => {
      const res = await fetch('/api/chapters');
      const data = await res.json();
      if (res.ok && data.data) {
        const map: Record<string, any> = {};
        data.data.forEach((ch: any) => {
          map[ch.id] = ch;
        });
        setChapters(map);
      }
    };
    loadChapters();
  }, [result]);

  const chapterSummary = useMemo(() => {
    if (!result?.chapter_summary) return [];
    return result.chapter_summary as any[];
  }, [result]);

  const formatTime = (timeMs: number | null) => {
    if (typeof timeMs !== 'number' || Number.isNaN(timeMs)) return '—';
    if (timeMs >= 60000) {
      const totalSeconds = Math.round(timeMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${String(seconds).padStart(2, '0')}`;
    }
    return `${(timeMs / 1000).toFixed(1)} 秒`;
  };

  const timingSummary = useMemo(() => {
    const times = answers
      .map((a) => (typeof a.time_spent_ms === 'number' ? a.time_spent_ms : null))
      .filter((t: number | null) => typeof t === 'number') as number[];
    const avgTimeMs = times.length > 0 ? times.reduce((sum, t) => sum + t, 0) / times.length : null;
    const slowestAnswers = [...answers]
      .filter((a) => typeof a.time_spent_ms === 'number')
      .sort((a, b) => (b.time_spent_ms || 0) - (a.time_spent_ms || 0))
      .slice(0, 3);
    return { avgTimeMs, slowestAnswers };
  }, [answers]);

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

  const formatAnswer = (value: any) => {
    if (value === null || value === undefined) return '—';
    if (Array.isArray(value) || typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
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

  if (!result || !session) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <p>載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">弱點分析結果</h1>
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

        <div className="mb-6 p-4 bg-gray-50 rounded border">
          <p className="text-sm text-gray-600">整體正確率</p>
          <p className="text-2xl font-semibold">
            {Math.round((result.overall_summary?.accuracy || 0) * 100)}%
          </p>
        </div>

        <div className="space-y-3">
          {chapterSummary.map((item) => (
            <div key={item.chapter_id} className="p-4 border rounded">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {chapters[item.chapter_id]?.title || item.chapter_id}
                  </p>
                  <p className="text-sm text-gray-500">
                    正確 {item.correct} / {item.total}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    item.level === 'high'
                      ? 'bg-red-100 text-red-700'
                      : item.level === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                  }`}
                >
                  {item.level === 'high' ? '高風險' : item.level === 'medium' ? '待補強' : '穩定'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg border p-6">
          <h2 className="text-xl font-bold mb-4">作答速度</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">平均每題</p>
              <p className="text-2xl font-semibold">{formatTime(timingSummary.avgTimeMs)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600 mb-2">最慢題目 Top 3</p>
              <div className="space-y-2 text-sm text-gray-700">
                {timingSummary.slowestAnswers.length === 0 && <p>—</p>}
                {timingSummary.slowestAnswers.map((a, idx) => (
                  <div key={a.id || a.question_id} className="flex justify-between gap-2">
                    <span className="truncate">
                      {idx + 1}. {a.question?.prompt || a.question_id}
                    </span>
                    <span className="whitespace-nowrap text-gray-500">
                      {formatTime(a.time_spent_ms ?? null)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg border p-6">
          <h2 className="text-xl font-bold mb-4">每題作答時間</h2>
          <div className="space-y-4">
            {answers.length === 0 && <p className="text-sm text-gray-500">—</p>}
            {answers.map((a, idx) => (
              <div key={a.id || a.question_id} className="border rounded p-4">
                <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
                  <span>第 {idx + 1} 題</span>
                  <span>作答時間：{formatTime(a.time_spent_ms ?? null)}</span>
                </div>
                <p className="text-gray-800 mb-2">{a.question?.prompt || a.question_id}</p>
                <p className={`text-sm ${a.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                  {a.is_correct ? '答對' : '答錯'}
                </p>
                <div className="text-sm text-gray-700 mt-2">
                  正確答案：
                  {a.question?.answer_md
                    ? renderMarkdown(a.question.answer_md)
                    : formatAnswer(a.question?.answer)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


