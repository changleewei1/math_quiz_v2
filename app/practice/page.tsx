'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Chapter, QuestionTypeData, Question } from '@/types';

type Difficulty = 'easy' | 'medium' | 'hard';

export default function PracticePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialChapterId = searchParams.get('chapterId') || '';
  const initialTypeId = searchParams.get('typeId') || '';
  const initialDifficulty = (searchParams.get('difficulty') as Difficulty) || 'easy';

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>(initialChapterId);
  const [types, setTypes] = useState<QuestionTypeData[]>([]);
  const [selectedType, setSelectedType] = useState<string>(initialTypeId);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [streak, setStreak] = useState(0);
  const [streak10, setStreak10] = useState(0);
  const [hardStreak, setHardStreak] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
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
          router.push('/login?redirect=/practice');
        }
      } catch (err) {
        router.push('/login?redirect=/practice');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!student) return; // 等待登入確認

    // 頁面載入時立即載入章節列表
    loadChapters(false);
    
    // 當頁面獲得焦點時重新載入章節列表（以便獲取最新更新）
    const handleFocus = () => {
      loadChapters(false);
    };
    
    // 當頁面可見性改變時也重新載入
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadChapters(false);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student]);

  useEffect(() => {
    if (selectedChapter) {
      loadTypes(selectedChapter);
    }
  }, [selectedChapter]);

  const loadChapters = async (preserveSelection = true) => {
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
        const currentSelectedChapter = selectedChapter;
        const chapterIds = data.data.map((ch: Chapter) => ch.id);
        console.log('載入的章節列表:', chapterIds);
        console.log('章節詳細資訊:', data.data.map((ch: Chapter) => `${ch.id} - ${ch.title} (is_active: ${ch.is_active})`));
        setChapters(data.data);
        
        // 檢查當前選中的章節是否在新列表中
        if (currentSelectedChapter) {
          const updatedChapter = data.data.find((ch: Chapter) => ch.id === currentSelectedChapter);
          if (!updatedChapter) {
            // 章節不存在了，清除選中狀態
            console.log('原選中的章節不存在，清除選擇');
            setSelectedChapter('');
            setSelectedType('');
            setTypes([]);
          } else if (preserveSelection) {
            console.log('保留選中的章節:', currentSelectedChapter);
          }
        }
      } else {
        console.error('載入章節失敗:', data.error);
        setError('載入章節失敗: ' + (data.error || '未知錯誤'));
      }
    } catch (err: any) {
      console.error('載入章節失敗', err);
      setError('載入章節失敗，請檢查連線: ' + (err.message || ''));
    }
  };

  const loadTypes = async (chapterId: string) => {
    if (!chapterId) return;
    
    try {
      const res = await fetch(`/api/types?chapterId=${chapterId}&t=${Date.now()}`, {
        cache: 'no-store', // 強制不緩存
      });
      const data = await res.json();
      if (res.ok && data.data) {
        console.log(`載入章節 ${chapterId} 的題型:`, data.data.map((t: any) => `${t.id} - ${t.name}`));
        setTypes(data.data);
        // 如果當前選中的題型不在新列表中，清除選擇
        if (selectedType) {
          const typeExists = data.data.find((t: any) => t.id === selectedType);
          if (!typeExists) {
            console.log('原選中的題型不存在，清除選擇');
            setSelectedType('');
          }
        }
      } else {
        console.error('載入題型失敗:', data.error);
        setError('載入題型失敗: ' + (data.error || '未知錯誤'));
        setTypes([]);
      }
    } catch (err: any) {
      console.error('載入題型失敗', err);
      setError('載入題型失敗，請檢查連線: ' + (err.message || ''));
      setTypes([]);
    }
  };

  const startPractice = async () => {
    if (!selectedChapter || !selectedType) return;

    setLoading(true);
    try {
      // 建立 session
      const sessionRes = await fetch('/api/practice/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: selectedChapter,
          typeId: selectedType,
        }),
      });

      const sessionData = await sessionRes.json();
      if (!sessionRes.ok) {
        setError(sessionData.error || '建立練習階段失敗');
        return;
      }

      setSessionId(sessionData.session.id);
      setStarted(true);
      loadNextQuestion();
    } catch (err) {
      setError('啟動失敗');
    } finally {
      setLoading(false);
    }
  };

  const loadNextQuestion = async () => {
    if (!selectedChapter || !selectedType) return;

    setLoading(true);
    try {
      const res = await fetch('/api/practice/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: selectedChapter,
          typeId: selectedType,
          difficulty,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.question) {
          setCurrentQuestion(data.question);
          setUserAnswer('');
          setSelectedChoiceIndex(null);
        } else {
          setError(data.error || '題庫不足，請至後台補題');
        }
      } else {
        setError(data.error || '取得題目失敗');
      }
    } catch (err) {
      setError('取得題目失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !sessionId) return;

    // 判斷答案
    let isCorrect = false;
    if (currentQuestion.qtype === 'mcq') {
      isCorrect = selectedChoiceIndex === currentQuestion.correct_choice_index;
    } else {
      isCorrect = userAnswer.trim() === currentQuestion.answer.trim();
    }

    // 提交作答記錄
    try {
      await fetch('/api/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          chapterId: selectedChapter,
          typeId: selectedType,
          difficulty: currentQuestion.difficulty,
          qtype: currentQuestion.qtype,
          prompt: currentQuestion.prompt,
          userAnswer: userAnswer || null,
          selectedChoiceIndex: selectedChoiceIndex || null,
          isCorrect,
          timeSpent: 0, // 簡化，實際可計算時間
        }),
      });
    } catch (err) {
      console.error('提交失敗', err);
    }

    // 狀態機邏輯
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);

      if (difficulty === 'easy') {
        if (newStreak >= 3) {
          setDifficulty('medium');
          setStreak(0);
        }
      } else if (difficulty === 'medium') {
        if (newStreak >= 3) {
          setDifficulty('hard');
          setStreak(0);
        }
      } else if (difficulty === 'hard') {
        const newHardStreak = hardStreak + 1;
        setHardStreak(newHardStreak);
        if (newHardStreak >= 4) {
          // hard 階段完成
        }
      }

      const newStreak10 = streak10 + 1;
      setStreak10(newStreak10);
      if (newStreak10 >= 10) {
        setCompleted(true);
        return;
      }
    } else {
      // 答錯
      if (difficulty === 'easy' || difficulty === 'medium') {
        setDifficulty('easy');
        setStreak(0);
      } else if (difficulty === 'hard') {
        setDifficulty('medium');
        setHardStreak(0);
        setStreak(0);
      }
    }

    // 載入下一題
    setTimeout(() => {
      loadNextQuestion();
    }, 1000);
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

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md relative">
          <div className="absolute top-4 right-4">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              ← 回到首頁
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-green-600">恭喜完成！</h1>
          <p className="text-gray-600 mb-6">
            您已連續答對 10 題，完成此題型的練習！
          </p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => {
                setCompleted(false);
                setStarted(false);
                setStreak10(0);
                setStreak(0);
                setHardStreak(0);
                setDifficulty('easy');
              }}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              重新開始
            </button>
            <Link
              href="/"
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 inline-block"
            >
              回到首頁
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">題型練習模式</h1>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              ← 回到首頁
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
          )}

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">選擇章節</label>
                <button
                  onClick={() => loadChapters(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                  type="button"
                >
                  刷新列表
                </button>
              </div>
              <select
                value={selectedChapter}
                onChange={(e) => {
                  setSelectedChapter(e.target.value);
                  setSelectedType('');
                }}
                onFocus={() => loadChapters(true)}
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

            {selectedChapter && (
              <div>
                <label className="block text-sm font-medium mb-2">選擇題型</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">請選擇題型</option>
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.code} - {type.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={startPractice}
              disabled={!selectedChapter || !selectedType || loading}
              className="w-full px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? '啟動中...' : '開始練習'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          {loading ? (
            <p className="text-xl">載入題目中...</p>
          ) : (
            <>
              <p className="text-xl text-red-600 mb-4">{error || '無法載入題目'}</p>
              <button
                onClick={() => {
                  setStarted(false);
                  setError('');
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                返回
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow mb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">題型練習</h1>
              <div className="text-sm text-gray-600">
                連續答對: {streak10} / 10 | 難度: {difficulty === 'easy' ? '簡單' : difficulty === 'medium' ? '中等' : '困難'}
              </div>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm whitespace-nowrap ml-4"
            >
              ← 回到首頁
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <span className="text-sm text-gray-500">
              {currentQuestion.difficulty} | {currentQuestion.qtype}
            </span>
          </div>
          <p className="text-lg mb-6">{currentQuestion.prompt}</p>

          {currentQuestion.qtype === 'mcq' && currentQuestion.choices ? (
            <div className="space-y-2 mb-6">
              {currentQuestion.choices.map((choice, i) => (
                <label
                  key={i}
                  className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="answer"
                    checked={selectedChoiceIndex === i}
                    onChange={() => setSelectedChoiceIndex(i)}
                    className="mr-3"
                  />
                  {choice}
                </label>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
              placeholder="請輸入答案"
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || (currentQuestion.qtype === 'mcq' ? selectedChoiceIndex === null : !userAnswer.trim())}
            className="w-full px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? '提交中...' : '提交答案'}
          </button>
        </div>
      </div>
    </div>
  );
}

