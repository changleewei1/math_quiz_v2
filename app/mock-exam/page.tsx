'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BrandHeader from '@/components/BrandHeader';

type YearOption = {
  year: number;
  count: number;
  lastUpdated: string | null;
};

export default function MockExamHome() {
  const router = useRouter();
  const [subject, setSubject] = useState<'math' | 'physics'>('math');
  const [years, setYears] = useState<YearOption[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadYears = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/mock-exam/years?subject=${subject}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || '載入年份失敗');
          return;
        }
        setYears(data.years || []);
        setSelectedYear(data.years?.[0]?.year ?? null);
      } catch (err: any) {
        setError(err.message || '載入年份失敗');
      } finally {
        setLoading(false);
      }
    };
    loadYears();
  }, [subject]);

  const selectedYearInfo = useMemo(
    () => years.find((y) => y.year === selectedYear) || null,
    [years, selectedYear]
  );

  const handleStart = async () => {
    if (!selectedYear) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/mock-exam/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, exam_year: selectedYear }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '建立測驗失敗');
        return;
      }
      const sessionId = data?.session?.id;
      const search = sessionId ? `?sessionId=${sessionId}` : '';
      router.push(`/mock-exam/${subject}/${selectedYear}${search}`);
    } catch (err: any) {
      setError(err.message || '建立測驗失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <BrandHeader />
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] py-8 px-4">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-lg shadow-xl p-5 sm:p-6 lg:p-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-800">
              會考弱點分析（年份選擇）
            </h2>
            <p className="text-center text-sm sm:text-base text-gray-600 mb-6">
              先選科目，再選年份進入測驗
            </p>

            <div className="flex justify-center gap-3 mb-6">
              <button
                type="button"
                onClick={() => setSubject('math')}
                className={`px-4 py-2 rounded ${
                  subject === 'math'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                數學
              </button>
              <button
                type="button"
                onClick={() => setSubject('physics')}
                className={`px-4 py-2 rounded ${
                  subject === 'physics'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                理化
              </button>
            </div>

            {error && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                {error}
              </div>
            )}

            <div className="border rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-2">可選年份</div>
              {loading && <p className="text-sm text-gray-500">載入中...</p>}
              {!loading && years.length === 0 && (
                <p className="text-sm text-gray-500">尚無題庫年份</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {years.map((y) => (
                  <button
                    key={y.year}
                    type="button"
                    onClick={() => setSelectedYear(y.year)}
                    className={`p-3 rounded border text-left ${
                      selectedYear === y.year
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-lg font-semibold">{y.year}</div>
                    <div className="text-xs text-gray-600">題數：{y.count}</div>
                    {y.lastUpdated && (
                      <div className="text-xs text-gray-400">
                        更新：{new Date(y.lastUpdated).toLocaleDateString('zh-TW')}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleStart}
                disabled={!selectedYear || loading}
                className="flex-1 px-6 py-3 min-h-[48px] bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow disabled:opacity-50"
              >
                開始測驗 {selectedYearInfo ? `（${selectedYearInfo.year}）` : ''}
              </button>
              <Link
                href="/"
                className="flex-1 px-6 py-3 min-h-[48px] bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow text-center"
              >
                返回首頁
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

