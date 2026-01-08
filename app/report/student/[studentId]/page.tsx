'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TypeStat {
  typeId: string;
  typeCode: string;
  typeName: string;
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;
  priority: number;
  recommendation: string;
}

interface Attempt {
  questionId: string;
  typeId: string;
  difficulty: string;
  qtype: string;
  prompt: string;
  userAnswer: string;
  selectedChoiceIndex: number | null;
  isCorrect: boolean;
  timeSpent: number | null;
}

interface ReportData {
  latestSession: {
    id: string;
    chapterId: string;
    chapterTitle: string;
    startedAt: string;
    endedAt: string | null;
  };
  statsByType: TypeStat[];
  topWeakTypes: TypeStat[];
  totalQuestions: number;
  correctQuestions: number;
  overallAccuracy: number;
  attempts: Attempt[];
}

export default function StudentReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = params.studentId as string;
  const token = searchParams.get('token');

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWrongQuestions, setShowWrongQuestions] = useState(false);

  useEffect(() => {
    if (!studentId || !token) {
      setError('缺少必要參數');
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/reports/student-latest?studentId=${studentId}`, {
          headers: {
            'X-Report-Token': token,
          },
        });
        const data = await res.json();

        if (res.ok) {
          setReport(data);
        } else {
          setError(data.error || '載入報告失敗');
        }
      } catch (err: any) {
        setError(err.message || '載入報告失敗');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [studentId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入報告中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">載入失敗</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          {error.includes('連結已失效') && (
            <p className="text-sm text-gray-500">請向老師索取最新連結</p>
          )}
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  // 準備圖表資料
  const chartData = report.statsByType.map(stat => ({
    name: `${stat.typeCode} ${stat.typeName}`,
    accuracy: Math.round(stat.accuracy * 10) / 10,
  }));

  // 取得錯題
  const wrongAttempts = report.attempts.filter(a => !a.isCorrect);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 標題 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">弱點分析報告</h1>
          <div className="text-gray-600 space-y-1">
            <p><span className="font-semibold">章節：</span>{report.latestSession.chapterTitle}</p>
            <p><span className="font-semibold">測驗時間：</span>
              {new Date(report.latestSession.startedAt).toLocaleString('zh-TW')}
            </p>
          </div>
        </div>

        {/* 總體統計 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">總體統計</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-600 text-sm">總題數</p>
              <p className="text-3xl font-bold text-blue-600">{report.totalQuestions}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-gray-600 text-sm">答對題數</p>
              <p className="text-3xl font-bold text-green-600">{report.correctQuestions}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-gray-600 text-sm">總正確率</p>
              <p className="text-3xl font-bold text-purple-600">
                {Math.round(report.overallAccuracy * 10) / 10}%
              </p>
            </div>
          </div>
        </div>

        {/* 各題型正確率圖表 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">各題型正確率</h2>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  fontSize={12}
                />
                <YAxis 
                  domain={[0, 100]}
                  label={{ value: '正確率 (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  formatter={(value: number | undefined) => value !== undefined ? `${value}%` : '0%'}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar dataKey="accuracy" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 3 弱點 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">主要弱點（Top 3）</h2>
          <div className="space-y-4">
            {report.topWeakTypes.map((weak, idx) => (
              <div key={weak.typeId} className="border-l-4 border-red-500 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {idx + 1}. {weak.typeCode} {weak.typeName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">正確率：{Math.round(weak.accuracy * 10) / 10}%</p>
                    <p className="text-sm text-gray-700 mt-2">{weak.recommendation}</p>
                  </div>
                  <Link
                    href={`/practice?chapterId=${report.latestSession.chapterId}&typeId=${weak.typeId}`}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm whitespace-nowrap"
                  >
                    開始練習
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 錯題清單 */}
        {wrongAttempts.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <button
              onClick={() => setShowWrongQuestions(!showWrongQuestions)}
              className="text-xl font-bold text-gray-800 mb-4 flex items-center"
            >
              錯題清單 ({wrongAttempts.length} 題)
              <span className="ml-2 text-lg">{showWrongQuestions ? '▼' : '▶'}</span>
            </button>
            {showWrongQuestions && (
              <div className="space-y-4">
                {wrongAttempts.map((attempt, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-600">
                        題型：{attempt.typeId} | 難度：{attempt.difficulty}
                      </span>
                      {attempt.timeSpent && (
                        <span className="text-sm text-gray-500">作答時間：{attempt.timeSpent}秒</span>
                      )}
                    </div>
                    <p className="text-gray-800 mb-2">{attempt.prompt}</p>
                    <p className="text-sm text-red-600">
                      您的答案：{attempt.userAnswer || (attempt.selectedChoiceIndex !== null ? `選項 ${attempt.selectedChoiceIndex + 1}` : '未作答')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 返回首頁 */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            返回首頁
          </Link>
        </div>
      </div>
    </div>
  );
}

