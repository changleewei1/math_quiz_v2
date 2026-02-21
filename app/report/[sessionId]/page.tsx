'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { TypeStatistics } from '@/lib/analysis';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

interface ReportData {
  sessionId: string;
  chapterId?: string;
  chapterTitle: string;
  date: string;
  totalQuestions: number;
  correctQuestions: number;
  overallAccuracy: number;
  imageUrl: string;
  typeStatistics: TypeStatistics[];
  topWeaknesses: TypeStatistics[];
  summary: string;
  attempts?: Array<{
    questionId: string;
    typeId: string;
    difficulty: string;
    qtype: string;
    prompt: string;
    promptMd?: string | null;
    userAnswer: string | null;
    selectedChoiceIndex: number | null;
    isCorrect: boolean;
    timeSpent: number | null;
    correctAnswer?: string | null;
    correctAnswerMd?: string | null;
    explain?: string | null;
    explainMd?: string | null;
  }>;
}

export default function ReportPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWrongQuestions, setShowWrongQuestions] = useState(false);

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

  useEffect(() => {
    if (!sessionId) return;

    const loadReport = async () => {
      try {
        const res = await fetch(`/api/reports/diagnostic?sessionId=${sessionId}`, {
          method: 'GET',
        });
        const data = await res.json();
        
        if (res.ok) {
          setReport(data);
        } else {
          setError(data.error || '載入報告失敗');
        }
      } catch (err: any) {
        setError('載入報告失敗: ' + (err.message || ''));
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">載入報告中...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">載入失敗</h1>
            <p className="text-gray-600 mb-6">{error || '找不到報告'}</p>
            <Link
              href="/"
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              回到首頁
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 標題區 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">弱點分析報告</h1>
              <p className="text-lg text-gray-600">{report.chapterTitle}</p>
              <p className="text-sm text-gray-500 mt-1">{report.date}</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              ← 回到首頁
            </Link>
          </div>

          {/* 總體統計 */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-1">總題數</p>
              <p className="text-2xl font-bold text-blue-600">{report.totalQuestions}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-1">正確題數</p>
              <p className="text-2xl font-bold text-green-600">{report.correctQuestions}</p>
            </div>
            <div className={`p-4 rounded-lg text-center ${
              report.overallAccuracy >= 80 ? 'bg-green-50' :
              report.overallAccuracy >= 60 ? 'bg-yellow-50' : 'bg-red-50'
            }`}>
              <p className="text-sm text-gray-600 mb-1">總正確率</p>
              <p className={`text-2xl font-bold ${
                report.overallAccuracy >= 80 ? 'text-green-600' :
                report.overallAccuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {report.overallAccuracy.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* 統計圖 */}
        {report.imageUrl && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">各題型正確率分析</h2>
            <img
              src={report.imageUrl}
              alt="正確率分析圖"
              className="w-full h-auto rounded"
            />
          </div>
        )}

        {/* 詳細統計表格 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">各題型詳細統計</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">題型代碼</th>
                  <th className="text-left p-2">題型名稱</th>
                  <th className="text-center p-2">總題數</th>
                  <th className="text-center p-2">正確數</th>
                  <th className="text-center p-2">錯誤數</th>
                  <th className="text-center p-2">正確率</th>
                  <th className="text-left p-2">建議</th>
                </tr>
              </thead>
              <tbody>
                {report.typeStatistics.map((stat) => (
                  <tr key={stat.typeId} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-xs">{stat.typeCode}</td>
                    <td className="p-2">{stat.typeName}</td>
                    <td className="p-2 text-center">{stat.total}</td>
                    <td className="p-2 text-center text-green-600">{stat.correct}</td>
                    <td className="p-2 text-center text-red-600">{stat.wrong}</td>
                    <td className={`p-2 text-center font-bold ${
                      stat.accuracy >= 80 ? 'text-green-600' :
                      stat.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {stat.accuracy.toFixed(1)}%
                    </td>
                    <td className="p-2 text-xs text-gray-600">{stat.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 主要弱點 */}
        {report.topWeaknesses.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">主要弱點 Top 3</h2>
            <div className="space-y-4">
              {report.topWeaknesses.map((weakness, index) => (
                <div
                  key={weakness.typeId}
                  className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-sm font-bold text-red-600">#{index + 1}</span>
                      <span className="ml-2 font-mono text-xs text-gray-600">{weakness.typeCode}</span>
                      <span className="ml-2 font-semibold">{weakness.typeName}</span>
                    </div>
                    <span className={`text-lg font-bold ${
                      weakness.accuracy >= 80 ? 'text-green-600' :
                      weakness.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {weakness.accuracy.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{weakness.recommendation}</p>
                  <Link
                    href={`/practice?chapterId=${report.chapterId || ''}&typeId=${weakness.typeId}`}
                    className="inline-block mt-3 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    開始練習 →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 錯題清單 */}
        {report.attempts && report.attempts.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <button
              onClick={() => setShowWrongQuestions(!showWrongQuestions)}
              className="text-xl font-bold text-gray-800 mb-4 flex items-center"
            >
              錯題清單 ({report.attempts.length} 題)
              <span className="ml-2 text-lg">{showWrongQuestions ? '▼' : '▶'}</span>
            </button>
            {showWrongQuestions && (
              <div className="space-y-4">
                {report.attempts.map((attempt, idx) => (
                  <div key={`${attempt.questionId}-${idx}`} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-600">
                        題型：{attempt.typeId} | 難度：{attempt.difficulty}
                      </span>
                      {attempt.timeSpent && (
                        <span className="text-sm text-gray-500">作答時間：{attempt.timeSpent}秒</span>
                      )}
                    </div>
                    <div className="text-gray-800 mb-2">
                      {attempt.promptMd ? renderMarkdown(attempt.promptMd) : attempt.prompt}
                    </div>
                    <p className="text-sm text-red-600">
                      您的答案：
                      {attempt.userAnswer ||
                        (attempt.selectedChoiceIndex !== null ? `選項 ${attempt.selectedChoiceIndex + 1}` : '未作答')}
                    </p>
                    <div className="text-sm text-green-700 mt-2">
                      正確答案：
                      {attempt.correctAnswerMd
                        ? renderMarkdown(attempt.correctAnswerMd)
                        : formatAnswer(attempt.correctAnswer)}
                    </div>
                    {(attempt.explainMd || attempt.explain) && (
                      <div className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">解析：</span>
                        {attempt.explainMd
                          ? renderMarkdown(attempt.explainMd)
                          : attempt.explain}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 摘要 */}
        <div className="bg-blue-50 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">分析摘要</h2>
          <p className="text-gray-700 leading-relaxed">{report.summary}</p>
        </div>
      </div>
    </div>
  );
}

