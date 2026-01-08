'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Teacher {
  id: string;
  username: string;
  nickname: string;
}

interface ClassSummary {
  typeId: string;
  typeCode: string;
  typeName: string;
  avgAccuracy: number;
  weakCount: number;
  avgWrong: number;
  priority: number;
}

interface Student {
  studentId: string;
  studentName: string;
  overallAccuracy: number;
  topWeaknesses: Array<{ typeCode: string; typeName: string }>;
  hasReport: boolean;
  latestSessionDate: string | null;
}

interface OverviewData {
  classInfo: {
    id: string;
    name: string;
    schoolYear: string | null;
    semester: string | null;
  };
  range: 'latest' | '30d';
  classSummaryByType: ClassSummary[];
  topWeakTypes: ClassSummary[];
  students: Student[];
}

interface RemedialStudent {
  studentId: string;
  studentName: string;
  remedialTypes: Array<{ typeCode: string; typeName: string }>;
  overallAccuracy: number;
  latestSessionDate: string | null;
}

interface ParentLink {
  studentId: string;
  studentName: string;
  url: string;
  expiresAt: string;
}

export default function ClassOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<'latest' | '30d'>('latest');
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  // 補救名單狀態
  const [showRemedialList, setShowRemedialList] = useState(false);
  const [selectedTypeIds, setSelectedTypeIds] = useState<Set<string>>(new Set());
  const [remedialStudents, setRemedialStudents] = useState<RemedialStudent[]>([]);
  const [loadingRemedial, setLoadingRemedial] = useState(false);

  // 家長連結狀態
  const [showParentLinks, setShowParentLinks] = useState(false);
  const [parentLinks, setParentLinks] = useState<ParentLink[]>([]);
  const [loadingParentLinks, setLoadingParentLinks] = useState(false);
  const [singleLinkUrl, setSingleLinkUrl] = useState<{ studentId: string; url: string } | null>(null);
  const [generatingSingleLink, setGeneratingSingleLink] = useState<string | null>(null);

  // 檢查老師登入狀態
  useEffect(() => {
    const checkTeacherAuth = async () => {
      try {
        const res = await fetch('/api/teacher/me');
        if (res.ok) {
          const data = await res.json();
          setTeacher(data.teacher);
        } else {
          router.push('/teacher/login');
        }
      } catch (err) {
        router.push('/teacher/login');
      }
    };
    checkTeacherAuth();
  }, [router]);

  // 載入班級總覽
  const fetchOverview = async (rangeParam: 'latest' | '30d') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/class-overview?classId=${classId}&range=${rangeParam}`);
      const data = await res.json();

      if (res.ok) {
        setOverview(data);
        // 預設勾選 top3 弱點題型
        if (data.topWeakTypes && data.topWeakTypes.length > 0) {
          const top3Ids = data.topWeakTypes.slice(0, 3).map((t: ClassSummary) => t.typeId);
          setSelectedTypeIds(new Set(top3Ids));
        }
      } else {
        setError(data.error || '載入班級總覽失敗');
      }
    } catch (err: any) {
      setError(err.message || '載入班級總覽失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      fetchOverview(range);
    }
  }, [classId, range]);

  // 產生補救名單
  const handleGenerateRemedialList = async () => {
    if (selectedTypeIds.size === 0) {
      alert('請至少選擇一個題型');
      return;
    }

    setLoadingRemedial(true);
    try {
      const res = await fetch('/api/reports/remedial-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          range,
          selectedTypeIds: Array.from(selectedTypeIds),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRemedialStudents(data.remedialStudents);
        setShowRemedialList(true);
      } else {
        alert(data.error || '產生補救名單失敗');
      }
    } catch (err: any) {
      alert('產生補救名單失敗: ' + (err.message || ''));
    } finally {
      setLoadingRemedial(false);
    }
  };

  // 匯出補救名單 CSV
  const handleExportRemedialCSV = async () => {
    if (remedialStudents.length === 0) {
      alert('沒有補救名單可匯出');
      return;
    }

    try {
      const res = await fetch('/api/reports/remedial-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          range,
          selectedTypeIds: Array.from(selectedTypeIds),
        }),
      });

      const data = await res.json();
      if (res.ok && data.csvText) {
        const blob = new Blob(['\uFEFF' + data.csvText], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const className = overview?.classInfo.name || 'class';
        const rangeStr = range === 'latest' ? '最近一次' : '最近30天';
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        link.download = `補救名單_${className}_${rangeStr}_${dateStr}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        alert('匯出失敗');
      }
    } catch (err: any) {
      alert('匯出失敗: ' + (err.message || ''));
    }
  };

  // 產生單一學生家長連結
  const handleGenerateSingleParentLink = async (studentId: string) => {
    setGeneratingSingleLink(studentId);
    try {
      const res = await fetch('/api/reports/create-parent-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });

      const data = await res.json();
      if (res.ok) {
        setSingleLinkUrl({ studentId, url: data.url });
      } else {
        alert(data.error || '產生連結失敗');
      }
    } catch (err: any) {
      alert('產生連結失敗: ' + (err.message || ''));
    } finally {
      setGeneratingSingleLink(null);
    }
  };

  // 批次產生家長連結
  const handleGenerateBatchParentLinks = async () => {
    setLoadingParentLinks(true);
    try {
      const res = await fetch('/api/reports/parent-links-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, range }),
      });

      const data = await res.json();
      if (res.ok) {
        setParentLinks(data.items);
        setShowParentLinks(true);
      } else {
        alert(data.error || '批次產生連結失敗');
      }
    } catch (err: any) {
      alert('批次產生連結失敗: ' + (err.message || ''));
    } finally {
      setLoadingParentLinks(false);
    }
  };

  // 匯出家長連結 CSV
  const handleExportParentLinksCSV = () => {
    if (parentLinks.length === 0) {
      alert('沒有連結可匯出');
      return;
    }

    const csvRows = [
      ['學生ID', '學生姓名', '家長連結', '到期時間'].join(','),
      ...parentLinks.map(link => [
        link.studentId,
        link.studentName,
        link.url,
        new Date(link.expiresAt).toLocaleString('zh-TW'),
      ].join(',')),
    ];

    const csvText = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const className = overview?.classInfo.name || 'class';
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    link.download = `家長連結_${className}_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 複製連結
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('連結已複製到剪貼簿');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入班級總覽中...</p>
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">載入失敗</h1>
          <p className="text-gray-700 mb-4">{error || '找不到班級資料'}</p>
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

  // 準備圖表資料
  const accuracyChartData = overview.classSummaryByType.map(summary => ({
    name: `${summary.typeCode} ${summary.typeName}`,
    accuracy: Math.round(summary.avgAccuracy * 10) / 10,
  }));

  const weakCountChartData = overview.topWeakTypes.map(summary => ({
    name: `${summary.typeCode} ${summary.typeName}`,
    weakCount: summary.weakCount,
  }));

  // 計算班級平均正確率
  const classAvgAccuracy = overview.students
    .filter(s => s.hasReport)
    .reduce((sum, s) => sum + s.overallAccuracy, 0) / overview.students.filter(s => s.hasReport).length || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 標題 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{overview.classInfo.name}</h1>
              <div className="text-gray-600">
                {overview.classInfo.schoolYear && (
                  <span className="mr-4">學年：{overview.classInfo.schoolYear}</span>
                )}
                {overview.classInfo.semester && (
                  <span>學期：{overview.classInfo.semester}</span>
                )}
                {teacher && (
                  <span className="ml-4">| {teacher.nickname} 老師</span>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                href="/teacher"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                老師首頁
              </Link>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                返回
              </button>
            </div>
          </div>

          {/* 時間範圍切換 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">統計範圍</label>
            <div className="flex space-x-4">
              <button
                onClick={() => setRange('latest')}
                className={`px-4 py-2 rounded ${
                  range === 'latest'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                最近一次
              </button>
              <button
                onClick={() => setRange('30d')}
                className={`px-4 py-2 rounded ${
                  range === '30d'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                最近30天
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              目前顯示：{range === 'latest' ? '最近一次' : '最近30天'}
            </p>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-lg font-semibold text-gray-800">
              班級平均正確率：{Math.round(classAvgAccuracy * 10) / 10}%
            </p>
          </div>
        </div>

        {/* 功能按鈕區 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => {
              setShowRemedialList(!showRemedialList);
              setShowParentLinks(false);
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            {showRemedialList ? '隱藏補救名單' : '補救名單'}
          </button>
          <button
            onClick={() => {
              setShowParentLinks(!showParentLinks);
              setShowRemedialList(false);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {showParentLinks ? '隱藏家長連結' : '家長連結'}
          </button>
        </div>

        {/* 補救名單區塊 */}
        {showRemedialList && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">補救名單</h2>
            
            {/* 題型選擇 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">選擇弱點題型</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded p-3">
                {overview.classSummaryByType.map(type => (
                  <label key={type.typeId} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTypeIds.has(type.typeId)}
                      onChange={(e) => {
                        const newSet = new Set(selectedTypeIds);
                        if (e.target.checked) {
                          newSet.add(type.typeId);
                        } else {
                          newSet.delete(type.typeId);
                        }
                        setSelectedTypeIds(newSet);
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {type.typeCode} {type.typeName}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-4 mb-4">
              <button
                onClick={handleGenerateRemedialList}
                disabled={loadingRemedial || selectedTypeIds.size === 0}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loadingRemedial ? '產生中...' : '產生補救名單'}
              </button>
              {remedialStudents.length > 0 && (
                <button
                  onClick={handleExportRemedialCSV}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  匯出 CSV
                </button>
              )}
            </div>

            {/* 補救名單列表 */}
            {remedialStudents.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">學生姓名</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">需要補救的題型</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">總正確率</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">最新測驗日期</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {remedialStudents.map((student) => (
                      <tr key={student.studentId}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.studentName}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {student.remedialTypes.map(t => t.typeCode).join('、')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {Math.round(student.overallAccuracy * 10) / 10}%
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.latestSessionDate
                            ? new Date(student.latestSessionDate).toLocaleDateString('zh-TW')
                            : '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/teacher/class/${classId}/student/${student.studentId}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            開啟個別報告
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 家長連結區塊 */}
        {showParentLinks && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">家長連結</h2>
            <div className="mb-4 flex space-x-4">
              <button
                onClick={handleGenerateBatchParentLinks}
                disabled={loadingParentLinks}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                {loadingParentLinks ? '產生中...' : '批次產生本班全部學生連結'}
              </button>
              {parentLinks.length > 0 && (
                <button
                  onClick={handleExportParentLinksCSV}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  匯出 CSV
                </button>
              )}
            </div>

            {parentLinks.length > 0 && (
              <div className="space-y-4">
                {parentLinks.map((link) => (
                  <div key={link.studentId} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{link.studentName}</p>
                        <p className="text-sm text-gray-600 mt-1 break-all">{link.url}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          到期時間：{new Date(link.expiresAt).toLocaleString('zh-TW')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopyLink(link.url)}
                        className="ml-4 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        複製
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 全班各題型平均正確率圖表 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">全班各題型平均正確率</h2>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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

        {/* Top 5 弱點題型 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">主要弱點題型（Top 5）</h2>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">弱點人數分布</h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weakCountChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    fontSize={12}
                  />
                  <YAxis 
                    label={{ value: '弱點人數', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: number | undefined) => value !== undefined ? `${value} 人` : '0 人'}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Bar dataKey="weakCount" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-2">
            {overview.topWeakTypes.map((weak, idx) => (
              <div key={weak.typeId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <span className="font-semibold text-gray-800">
                    {idx + 1}. {weak.typeCode} {weak.typeName}
                  </span>
                  <span className="ml-4 text-sm text-gray-600">
                    平均正確率：{Math.round(weak.avgAccuracy * 10) / 10}% | 
                    弱點人數：{weak.weakCount} 人 | 
                    平均錯題：{Math.round(weak.avgWrong * 10) / 10} 題
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 學生清單 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">學生清單</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    學生姓名
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    總正確率
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    主要弱點
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最新測驗日期
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {overview.students.map((student) => (
                  <tr key={student.studentId} className={!student.hasReport ? 'bg-gray-50' : ''}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.studentName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.hasReport ? (
                        <span className={`font-semibold ${
                          student.overallAccuracy >= 80 ? 'text-green-600' :
                          student.overallAccuracy >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {Math.round(student.overallAccuracy * 10) / 10}%
                        </span>
                      ) : (
                        <span className="text-gray-400">未測</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {student.hasReport && student.topWeaknesses.length > 0 ? (
                        <div className="space-y-1">
                          {student.topWeaknesses.slice(0, 2).map((weak, idx) => (
                            <div key={idx} className="text-xs">
                              {weak.typeCode} {weak.typeName}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.latestSessionDate
                        ? new Date(student.latestSessionDate).toLocaleDateString('zh-TW')
                        : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                      {student.hasReport ? (
                        <>
                          <Link
                            href={`/teacher/class/${classId}/student/${student.studentId}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            查看詳情
                          </Link>
                          <button
                            onClick={() => handleGenerateSingleParentLink(student.studentId)}
                            disabled={generatingSingleLink === student.studentId}
                            className="ml-2 text-green-600 hover:text-green-800 disabled:text-gray-400"
                          >
                            {generatingSingleLink === student.studentId
                              ? '產生中...'
                              : singleLinkUrl?.studentId === student.studentId
                              ? '已產生'
                              : '產生家長連結'}
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 單一連結顯示 */}
          {singleLinkUrl && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-semibold text-green-800 mb-2">家長連結已產生</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={singleLinkUrl.url}
                  readOnly
                  className="flex-1 p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => handleCopyLink(singleLinkUrl.url)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  複製連結
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
