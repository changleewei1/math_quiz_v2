'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Chapter, Question, DiagnosticAnalysis } from '@/types';

export default function DiagnosticPage() {
  const router = useRouter();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [paper, setPaper] = useState<(Question & { type_name: string; type_code: string })[]>([]);
  const [answers, setAnswers] = useState<Record<string, { userAnswer?: string; selectedChoiceIndex?: number; timeSpent?: number }>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [analysis, setAnalysis] = useState<DiagnosticAnalysis[]>([]);
  const [student, setStudent] = useState<{ id: string; name: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // 檢查學生登入狀態
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/student/me');
        if (res.ok) {
          const data = await res.json();
          setStudent(data.student);
        } else {
          // 未登入，導向登入頁
          router.push('/login?redirect=/diagnostic');
        }
      } catch (err) {
        router.push('/login?redirect=/diagnostic');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!student) return; // 等待登入確認

    // 頁面載入時立即載入章節列表
    loadChapters();
    
    // 當頁面獲得焦點時重新載入章節列表（以便獲取最新更新）
    const handleFocus = () => {
      loadChapters();
    };
    
    // 當頁面可見性改變時也重新載入
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadChapters();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [student]);

  const loadChapters = async () => {
    try {
      // 添加時間戳以確保獲取最新資料
      const res = await fetch(`/api/chapters?t=${Date.now()}`, {
        cache: 'no-store', // 強制不緩存
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      const data = await res.json();
      if (res.ok && data.data) {
        const chapterIds = data.data.map((ch: Chapter) => ch.id);
        console.log('載入的章節列表:', chapterIds);
        console.log('章節詳細資訊:', data.data.map((ch: Chapter) => `${ch.id} - ${ch.title} (is_active: ${ch.is_active})`));
        setChapters(data.data);
        // 如果當前選中的章節仍然存在，保持選中狀態
        if (selectedChapter) {
          const updatedChapter = data.data.find((ch: Chapter) => ch.id === selectedChapter);
          if (!updatedChapter) {
            // 章節不存在了，清除選中狀態
            console.log('原選中的章節不存在，清除選擇');
            setSelectedChapter('');
          } else {
            console.log('保留選中的章節:', selectedChapter);
          }
        }
      } else {
        console.error('載入章節失敗:', data.error);
        alert('載入章節失敗: ' + (data.error || '未知錯誤'));
      }
    } catch (err: any) {
      console.error('載入章節失敗', err);
      alert('載入章節失敗，請檢查連線: ' + (err.message || ''));
    }
  };

  const handleStart = async () => {
    if (!selectedChapter) return;

    setLoading(true);
    try {
      const res = await fetch('/api/diagnostic/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId: selectedChapter }),
      });

      const data = await res.json();
      if (res.ok) {
        setPaper(data.paper);
        if (data.warnings && data.warnings.length > 0) {
          alert('警告：' + data.warnings.join('\n'));
        }
      } else {
        alert(data.error || '建立試卷失敗');
      }
    } catch (err) {
      alert('建立試卷失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedChapter || paper.length === 0) return;

    setLoading(true);
    try {
      const answerArray = paper.map((q) => ({
        questionId: q.id,
        typeId: q.type_id,
        typeName: q.type_name,
        typeCode: q.type_code,
        difficulty: q.difficulty,
        qtype: q.qtype,
        prompt: q.prompt,
        userAnswer: answers[q.id]?.userAnswer || '',
        selectedChoiceIndex: answers[q.id]?.selectedChoiceIndex,
        timeSpent: answers[q.id]?.timeSpent || 0,
      }));

      const res = await fetch('/api/diagnostic/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: selectedChapter,
          answers: answerArray,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAnalysis(data.analysis);
        setSubmitted(true);
        
        // 嘗試生成報告並發送 LINE 訊息
        try {
          const reportRes = await fetch('/api/reports/diagnostic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: data.sessionId }),
          });
          
          const reportData = await reportRes.json();
          if (reportRes.ok && reportData.sentTo > 0) {
            alert(`已成功發送報告給 ${reportData.sentTo} 位接收者（家長/老師）`);
          } else if (reportRes.ok && reportData.totalRecipients === 0) {
            alert('尚未設定接收者（LINE User ID），請到後台補上');
          } else if (reportRes.ok) {
            console.warn('報告生成成功，但發送失敗:', reportData.errors);
          }
        } catch (err) {
          console.error('生成報告失敗:', err);
          // 不顯示錯誤給用戶，因為這不是主要功能
        }
      } else {
        alert(data.error || '提交失敗');
      }
    } catch (err) {
      alert('提交失敗');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">檢查登入狀態...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return null; // 會導向登入頁
  }

  if (submitted && analysis.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">弱點分析結果</h1>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              ← 回到首頁
            </Link>
          </div>

          <div className="space-y-4">
            {analysis.map((item) => (
              <div
                key={item.type_id}
                className={`p-4 rounded-lg border-2 ${
                  item.priority === 'high'
                    ? 'border-red-500 bg-red-50'
                    : item.priority === 'medium'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-green-500 bg-green-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {item.type_code} - {item.type_name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      答錯 {item.wrong_count} / {item.total_count} 題
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      item.priority === 'high'
                        ? 'bg-red-200 text-red-800'
                        : item.priority === 'medium'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-green-200 text-green-800'
                    }`}
                  >
                    {item.priority === 'high' ? '主要弱點' : item.priority === 'medium' ? '待加強' : '表現良好'}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{item.recommendation}</p>
                <button
                  onClick={() =>
                    router.push(
                      `/practice?chapterId=${selectedChapter}&typeId=${item.type_id}&difficulty=${item.recommended_difficulty}`
                    )
                  }
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  開始練習 {item.type_code}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setSubmitted(false);
                setPaper([]);
                setAnswers({});
                setAnalysis([]);
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              重新測驗
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paper.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">弱點分析模式</h1>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              ← 回到首頁
            </Link>
          </div>
          <p className="text-gray-600 mb-6">
            選擇章節後，系統會為您建立一份診斷試卷，幫助您找出學習弱點。
          </p>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">選擇章節</label>
              <button
                onClick={() => loadChapters()}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
                type="button"
              >
                刷新列表
              </button>
            </div>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              onFocus={() => loadChapters()}
              className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">請選擇章節</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.id} - {ch.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStart}
            disabled={!selectedChapter || loading}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '建立試卷中...' : '開始測驗'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">弱點分析測驗</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            ← 回到首頁
          </Link>
        </div>

        <div className="space-y-6">
          {paper.map((q, index) => (
            <div key={q.id} className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4">
                <span className="text-sm text-gray-500">
                  第 {index + 1} 題 | {q.type_code} | {q.difficulty}
                </span>
              </div>
              <p className="text-lg mb-4">{q.prompt}</p>

              {q.qtype === 'mcq' && q.choices ? (
                <div className="space-y-2">
                  {q.choices.map((choice, i) => (
                    <label key={i} className="flex items-center p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={i}
                        checked={answers[q.id]?.selectedChoiceIndex === i}
                        onChange={() =>
                          setAnswers({
                            ...answers,
                            [q.id]: { ...answers[q.id], selectedChoiceIndex: i },
                          })
                        }
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
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [q.id]: { ...answers[q.id], userAnswer: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                  placeholder="請輸入答案"
                />
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
            {loading ? '提交中...' : '提交答案'}
          </button>
        </div>
      </div>
    </div>
  );
}

