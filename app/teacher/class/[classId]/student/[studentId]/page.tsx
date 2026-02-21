'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getQuizModeName, getSubjectName } from '@/types/quizMode';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

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

interface StudentReport {
  latestSession: {
    id: string;
    chapterId: string;
    chapterTitle: string;
    subject?: string;
    quizMode?: string;
    startedAt: string;
    endedAt: string | null;
  };
  statsByType: TypeStat[];
  topWeakTypes: TypeStat[];
  totalQuestions: number;
  correctQuestions: number;
  overallAccuracy: number;
  attempts?: Array<{
    questionId: string;
    typeId: string;
    difficulty: string;
    qtype: string;
    prompt: string;
    userAnswer: string | null;
    selectedChoiceIndex: number | null;
    isCorrect: boolean;
    timeSpent: number | null;
    correctAnswer?: string | null;
    correctAnswerMd?: string | null;
  }>;
}

interface ClassAvg {
  typeId: string;
  typeCode: string;
  typeName: string;
  avgAccuracy: number;
}

interface ReportData {
  studentReport: StudentReport;
  classAvgByType: ClassAvg[];
}

export default function ClassStudentReportPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const studentId = params.studentId as string;

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>('');
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
    const fetchReport = async () => {
      try {
        // 取得學生姓名
        const studentRes = await fetch(`/api/admin/students`);
        if (studentRes.ok) {
          const studentData = await studentRes.json();
          const student = studentData.students?.find((s: any) => s.id === studentId);
          if (student) {
            setStudentName(student.name);
          }
        }

        // 取得報表資料
        const res = await fetch(`/api/reports/class-student?classId=${classId}&studentId=${studentId}`);
        const data = await res.json();

        if (res.ok) {
          setReport(data);
        } else {
          setError(data.error || '載入報表失敗');
        }
      } catch (err: any) {
        setError(err.message || '載入報表失敗');
      } finally {
        setLoading(false);
      }
    };

    if (classId && studentId) {
      fetchReport();
    }
  }, [classId, studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入報表中...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">載入失敗</h1>
          <p className="text-gray-700 mb-4">{error || '找不到報表資料'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  const { studentReport, classAvgByType } = report;

  // 準備圖表資料（學生 vs 班平均）
  const comparisonChartData = studentReport.statsByType.map(studentStat => {
    const classStat = classAvgByType.find(c => c.typeId === studentStat.typeId);
    return {
      name: `${studentStat.typeCode} ${studentStat.typeName}`,
      學生: Math.round(studentStat.accuracy * 10) / 10,
      班平均: classStat ? Math.round(classStat.avgAccuracy * 10) / 10 : 0,
    };
  });

  // 找出相對班平均偏弱的題型
  const weakerTypes = studentReport.statsByType.filter(studentStat => {
    const classStat = classAvgByType.find(c => c.typeId === studentStat.typeId);
    if (!classStat) return false;
    return studentStat.accuracy < classStat.avgAccuracy - 10; // 低於班平均 10% 以上
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 標題 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {studentName || '學生'} - 弱點分析報告
              </h1>
              <p className="text-gray-600 mt-1">
                <span className="font-semibold">科目：</span>
                {studentReport.latestSession.subject ? getSubjectName(studentReport.latestSession.subject as any) : '數學'}
                {' · '}
                <span className="font-semibold">模式：</span>
                {studentReport.latestSession.quizMode ? getQuizModeName(studentReport.latestSession.quizMode as any) : '平常'}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">章節：</span>{studentReport.latestSession.chapterTitle}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">測驗時間：</span>
                {new Date(studentReport.latestSession.startedAt).toLocaleDateString('zh-TW', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              返回
            </button>
          </div>
        </div>

        {/* 總體統計 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">總體統計</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-600 text-sm">總題數</p>
              <p className="text-3xl font-bold text-blue-600">{studentReport.totalQuestions}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-gray-600 text-sm">答對題數</p>
              <p className="text-3xl font-bold text-green-600">{studentReport.correctQuestions}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-gray-600 text-sm">總正確率</p>
              <p className="text-3xl font-bold text-purple-600">
                {Math.round(studentReport.overallAccuracy * 10) / 10}%
              </p>
            </div>
          </div>
        </div>

        {/* 與班平均對照圖 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">與班平均對照</h2>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                <Legend />
                <Bar dataKey="學生" fill="#3B82F6" />
                <Bar dataKey="班平均" fill="#94A3B8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* 相對班平均偏弱的題型 */}
          {weakerTypes.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <h3 className="font-semibold text-gray-800 mb-2">相對班平均偏弱的題型：</h3>
              <ul className="list-disc list-inside space-y-1">
                {weakerTypes.map(weak => {
                  const classStat = classAvgByType.find(c => c.typeId === weak.typeId);
                  return (
                    <li key={weak.typeId} className="text-sm text-gray-700">
                      {weak.typeCode} {weak.typeName}：
                      學生 {Math.round(weak.accuracy * 10) / 10}% vs 
                      班平均 {classStat ? Math.round(classStat.avgAccuracy * 10) / 10 : 0}%
                      （差距 {Math.round((classStat ? classStat.avgAccuracy : 0) - weak.accuracy)}%）
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Top 3 弱點 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">主要弱點（Top 3）</h2>
          <div className="space-y-4">
            {studentReport.topWeakTypes.map((weak, idx) => (
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
                    href={`/practice?chapterId=${studentReport.latestSession.chapterId}&typeId=${weak.typeId}`}
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
        {studentReport.attempts && studentReport.attempts.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <button
              onClick={() => setShowWrongQuestions(!showWrongQuestions)}
              className="text-xl font-bold text-gray-800 mb-4 flex items-center"
            >
              錯題清單 ({studentReport.attempts.length} 題)
              <span className="ml-2 text-lg">{showWrongQuestions ? '▼' : '▶'}</span>
            </button>
            {showWrongQuestions && (
              <div className="space-y-4">
                {studentReport.attempts.map((attempt, idx) => (
                  <div key={`${attempt.questionId}-${idx}`} className="border border-gray-200 rounded-lg p-4">
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
                      學生答案：
                      {attempt.userAnswer ||
                        (attempt.selectedChoiceIndex !== null ? `選項 ${attempt.selectedChoiceIndex + 1}` : '未作答')}
                    </p>
                    <div className="text-sm text-green-700 mt-2">
                      正確答案：
                      {attempt.correctAnswerMd
                        ? renderMarkdown(attempt.correctAnswerMd)
                        : formatAnswer(attempt.correctAnswer)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

