'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { SessionReport } from '@/lib/reportAggregation';

export default function ResultsPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;
  const [report, setReport] = useState<SessionReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/reports/session?sessionId=${sessionId}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || '載入結果失敗');
          return;
        }
        setReport(data.report);
      } catch (err: any) {
        setError(err.message || '載入結果失敗');
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) {
      load();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>載入中...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || '載入失敗'}</p>
          <Link href="/" className="px-4 py-2 bg-gray-500 text-white rounded">
            回到首頁
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">作答結果</h1>
            <p className="text-sm text-gray-500">
              {report.subject || '—'} · {report.mode || '—'}
              {report.examYear ? ` · ${report.examYear}` : ''}
            </p>
          </div>
          <Link href="/" className="px-4 py-2 bg-gray-500 text-white rounded text-sm">
            ← 回到首頁
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">作答題數</p>
            <p className="text-2xl font-semibold">{report.overall.answered}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">答對題數</p>
            <p className="text-2xl font-semibold">{report.overall.correct}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">正確率</p>
            <p className="text-2xl font-semibold">{report.overall.accuracy}%</p>
          </div>
        </div>

        {typeof report.overall.avgTimeSec === 'number' && (
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">平均每題秒數</p>
            <p className="text-xl font-semibold">{report.overall.avgTimeSec} 秒</p>
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">弱點技能 Top 5</h2>
          {report.weakTop5.length === 0 ? (
            <p className="text-sm text-gray-500">資料不足或無弱點技能</p>
          ) : (
            <div className="space-y-3">
              {report.weakTop5.map((s) => (
                <div key={s.skillId} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{s.skillName}</p>
                      <p className="text-sm text-gray-500">題數 {s.total} · 答對 {s.correct}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">正確率</p>
                      <p className="text-lg font-semibold">{s.accuracy}%</p>
                    </div>
                  </div>
                  {typeof s.avgTimeSec === 'number' && (
                    <p className="text-sm text-gray-600 mt-2">平均 {s.avgTimeSec} 秒</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

