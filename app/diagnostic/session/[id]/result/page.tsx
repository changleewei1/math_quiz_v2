'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function DiagnosticResultPage() {
  const params = useParams<{ id: string }>();
  const [result, setResult] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [chapters, setChapters] = useState<Record<string, any>>({});
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
      </div>
    </div>
  );
}


