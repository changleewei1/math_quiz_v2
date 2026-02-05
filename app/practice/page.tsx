'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Chapter, QuestionTypeData, Question } from '@/types';
import QuestionRenderer from '@/components/questions/QuestionRenderer';
import { isAnswerMatch } from '@/lib/answerMatch';

type Difficulty = 'easy' | 'medium' | 'hard';
type Term = 'upper' | 'lower';

function PracticePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subject = searchParams.get('subject'); // 'math' 或 'physics'
  const grade = searchParams.get('grade'); // '1', '2', 或 '3'
  const initialChapterId = searchParams.get('chapterId') || '';
  const initialTypeId = searchParams.get('typeId') || '';
  const initialSkillId = searchParams.get('skillId') || '';
  const initialDifficulty = (searchParams.get('difficulty') as Difficulty) || 'easy';

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>(initialChapterId);
  const [types, setTypes] = useState<QuestionTypeData[]>([]);
  const [selectedType, setSelectedType] = useState<string>(initialTypeId);
  const [skillId, setSkillId] = useState<string>(initialSkillId);
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
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; message: string } | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const sessionStartTimeRef = useRef<number | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [sessionElapsedMs, setSessionElapsedMs] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [attempts, setAttempts] = useState<
    Array<{
      id: string;
      question_id: string | null;
      prompt_snapshot: string | null;
      time_spent_ms: number | null;
      is_correct: boolean;
    }>
  >([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [attemptsError, setAttemptsError] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<'1' | '2' | '3'>(() =>
    grade === '1' || grade === '2' || grade === '3' ? grade : '1'
  );
  const [selectedTerm, setSelectedTerm] = useState<Term | ''>('');
  const [expandedChapterGroupKeys, setExpandedChapterGroupKeys] = useState<Set<string>>(new Set());

  const PRACTICE_BOOK_STRUCTURE = [
    {
      gradeId: 'J1-MATH',
      term: 'upper' as Term,
      bookTitle: '第一冊',
      chapters: [
        { title: '第一章_數與數線', sectionIds: ['m1-1-1', 'm1-1-2', 'm1-1-3', 'm1-1-4'] },
        { title: '第二章_標準分解式與分數運算', sectionIds: ['m1-2-1', 'm1-2-2', 'm1-2-3', 'm1-2-4'] },
        { title: '第三章_一元一次方程式', sectionIds: ['m1-3-1', 'm1-3-2', 'm1-3-3'] },
      ],
    },
    {
      gradeId: 'J1-MATH',
      term: 'lower' as Term,
      bookTitle: '第二冊',
      chapters: [
        { title: '第一章_二元一次聯立方程式', sectionIds: ['m1-1-1-l', 'm1-1-2-l', 'm1-1-3-l'] },
        { title: '第二章_直角坐標與二元一次方程式的圖形', sectionIds: ['m1-2-1-l', 'm1-2-2-l'] },
        { title: '第三章_比例', sectionIds: ['m1-3-1-l', 'm1-3-2-l'] },
        { title: '第四章_一元一次不等式', sectionIds: ['m1-4-1-l', 'm1-4-2-l'] },
        { title: '第五章_統計圖表與統計數據', sectionIds: ['m1-5-1-l'] },
        { title: '第六章_垂直、線對稱與三視圖', sectionIds: ['m1-6-1-l'] },
      ],
    },
    {
      gradeId: 'J2-MATH',
      term: 'upper' as Term,
      bookTitle: '第三冊',
      chapters: [
        { title: '第一章_乘法公式與多項式', sectionIds: ['m2-1-1', 'm2-1-2', 'm2-1-3'] },
        { title: '第二章_二次方根與畢氏定理', sectionIds: ['m2-2-1', 'm2-2-2', 'm2-2-3'] },
        { title: '第三章_因式分解', sectionIds: ['m2-3-1', 'm2-3-2'] },
        { title: '第四章_一元二次方程式', sectionIds: ['m2-4-1', 'm2-4-2', 'm2-4-3'] },
        { title: '第五章_統計資料處理', sectionIds: ['m2-5-1'] },
      ],
    },
    {
      gradeId: 'J2-MATH',
      term: 'lower' as Term,
      bookTitle: '第四冊',
      chapters: [
        { title: '第一章_數列與級數', sectionIds: ['m2-1-1-l', 'm2-1-2-l', 'm2-1-3-l'] },
        { title: '第二章_線型函數與其圖形', sectionIds: ['m2-2-1-l'] },
        { title: '第三章_三角形的基本性質', sectionIds: ['m2-3-1-l', 'm2-3-2-l', 'm2-3-3-l', 'm2-3-4-l', 'm2-3-5-l'] },
        { title: '第四章_平行與四邊形', sectionIds: ['m2-4-1-l', 'm2-4-2-l', 'm2-4-3-l'] },
      ],
    },
    {
      gradeId: 'J3-MATH',
      term: 'upper' as Term,
      bookTitle: '第五冊',
      chapters: [
        { title: '第一章_相似形與三角比', sectionIds: ['m3-5-1-1', 'm3-5-1-2', 'm3-5-1-3', 'm3-5-1-4'] },
        { title: '第二章_圓形', sectionIds: ['m3-5-2-1', 'm3-5-2-2'] },
        { title: '第三章_推理證明與三角形的基本性質', sectionIds: ['m3-5-3-1', 'm3-5-3-2'] },
      ],
    },
    {
      gradeId: 'J3-MATH',
      term: 'lower' as Term,
      bookTitle: '第六冊',
      chapters: [
        { title: '第一章_二次函數', sectionIds: ['m3-6-1-1'] },
        { title: '第二章_統計與機率', sectionIds: ['m3-6-2-1', 'm3-6-2-2'] },
        { title: '第三章_立體圖形', sectionIds: ['m3-6-3-1'] },
      ],
    },
    {
      gradeId: 'J2-SCI',
      term: 'upper' as Term,
      bookTitle: '國二理化上學期',
      chapters: [
        { title: '第一章_基本測量', sectionIds: ['p2-1-1', 'p2-1-2'] },
        { title: '第二章_物質的世界', sectionIds: ['p2-2-1', 'p2-2-2', 'p2-2-3', 'p2-2-4'] },
        { title: '第三章_波動與聲音', sectionIds: ['p2-3-1', 'p2-3-2', 'p2-3-3', 'p2-3-4'] },
        { title: '第四章_光', sectionIds: ['p2-4-1', 'p2-4-2', 'p2-4-3', 'p2-4-4'] },
        { title: '第五章_溫度與熱', sectionIds: ['p2-5-1', 'p2-5-2', 'p2-5-3', 'p2-5-4'] },
        { title: '第六章_探索物質組成', sectionIds: ['p2-6-1', 'p2-6-2', 'p2-6-3', 'p2-6-4'] },
      ],
    },
    {
      gradeId: 'J2-SCI',
      term: 'lower' as Term,
      bookTitle: '國二理化下學期',
      chapters: [
        { title: '第一章_化學反應', sectionIds: ['p2-1-1-l', 'p2-1-2-l'] },
        { title: '第二章_氧化與還原', sectionIds: ['p2-2-1-l', 'p2-2-2-l'] },
        { title: '第三章_電解質及酸鹼', sectionIds: ['p2-3-1-l', 'p2-3-2-l', 'p2-3-3-l', 'p2-3-4-l'] },
        { title: '第四章_反應速率與平衡', sectionIds: ['p2-4-1-l', 'p2-4-2-l'] },
        { title: '第五章_有機化合物', sectionIds: ['p2-5-1-l', 'p2-5-2-l', 'p2-5-3-l', 'p2-5-4-l'] },
        { title: '第六章_力學', sectionIds: ['p2-6-1-l', 'p2-6-2-l', 'p2-6-3-l', 'p2-6-4-l'] },
      ],
    },
    {
      gradeId: 'J3-SCI',
      term: 'upper' as Term,
      bookTitle: '國三理化上學期',
      chapters: [
        { title: '第一章_直線運動', sectionIds: ['p3-1-1', 'p3-1-2', 'p3-1-3', 'p3-1-4'] },
        { title: '第二章_力與運動', sectionIds: ['p3-2-1', 'p3-2-2', 'p3-2-3', 'p3-2-4'] },
        { title: '第三章_功與能', sectionIds: ['p3-3-1', 'p3-3-2', 'p3-3-3', 'p3-3-4'] },
        { title: '第四章_基本的靜電現象與電路', sectionIds: ['p3-4-1', 'p3-4-2', 'p3-4-3', 'p3-4-4'] },
      ],
    },
    {
      gradeId: 'J3-SCI',
      term: 'lower' as Term,
      bookTitle: '國三理化下學期',
      chapters: [
        { title: '第一章_電的應用', sectionIds: ['p3b-1-1', 'p3b-1-2', 'p3b-1-3', 'p3b-1-4'] },
        { title: '第二章_電流與磁現象', sectionIds: ['p3b-2-1', 'p3b-2-2', 'p3b-2-3', 'p3b-2-4'] },
      ],
    },
  ];

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
    // 檢查是否有 subject 和 grade 參數
    if (!subject || !grade || (subject !== 'math' && subject !== 'physics') || !['1', '2', '3'].includes(grade)) {
      // 缺少必要參數，導回首頁
      router.push('/');
      return;
    }
  }, [subject, grade, router]);

  useEffect(() => {
    if (grade === '1' || grade === '2' || grade === '3') {
      setSelectedGrade(grade);
    }
  }, [grade]);

  useEffect(() => {
    setSelectedChapter('');
    setSelectedType('');
    setTypes([]);
    setExpandedChapterGroupKeys(new Set());
  }, [selectedGrade, selectedTerm, subject]);

  useEffect(() => {
    if (!student || !subject || !grade) return; // 等待登入確認和參數

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
  }, [student, subject, grade]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!completed || !sessionId) return;
    const loadAttempts = async () => {
      setAttemptsLoading(true);
      setAttemptsError('');
      try {
        const res = await fetch(`/api/practice/session/${sessionId}/result`);
        const data = await res.json();
        if (!res.ok) {
          setAttemptsError(data.error || '載入練習結果失敗');
          return;
        }
        setAttempts(data.attempts || []);
      } catch (err: any) {
        setAttemptsError(err.message || '載入練習結果失敗');
      } finally {
        setAttemptsLoading(false);
      }
    };
    loadAttempts();
  }, [completed, sessionId]);

  useEffect(() => {
    if (!skillId && selectedChapter) {
      loadTypes(selectedChapter);
    }
  }, [selectedChapter, skillId]);

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
        setChapters(data.data);
        
        const gradeId =
          subject === 'math'
            ? `J${selectedGrade}-MATH`
            : subject === 'physics'
              ? `J${selectedGrade}-SCI`
              : '';
        const filtered = data.data.filter((ch: Chapter) => {
          if (!gradeId || ch.grade_id !== gradeId) return false;
          if (selectedTerm && ch.term !== selectedTerm) return false;
          return true;
        });
        
        setFilteredChapters(filtered);
        
        const chapterIds = filtered.map((ch: Chapter) => ch.id);
        const subjectName = subject === 'math' ? '數學' : '理化';
        const gradeName = selectedGrade === '1' ? '國一' : selectedGrade === '2' ? '國二' : '國三';
        const termName = selectedTerm === 'upper' ? '上學期' : selectedTerm === 'lower' ? '下學期' : '';
        console.log(`載入的${gradeName}${subjectName}${termName}章節列表:`, chapterIds);
        console.log('章節詳細資訊:', filtered.map((ch: Chapter) => `${ch.id} - ${ch.title} (is_active: ${ch.is_active})`));
        
        // 檢查當前選中的章節是否在新列表中
        if (selectedChapter) {
          const updatedChapter = filtered.find((ch: Chapter) => ch.id === selectedChapter);
          if (!updatedChapter) {
            // 章節不存在了，清除選中狀態
            console.log('原選中的章節不存在，清除選擇');
            setSelectedChapter('');
            setSelectedType('');
            setTypes([]);
          } else if (preserveSelection) {
            console.log('保留選中的章節:', selectedChapter);
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
    if (!skillId && (!selectedChapter || !selectedType)) return;

    setLoading(true);
    try {
      // 建立 session
      const sessionRes = await fetch('/api/practice/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: selectedChapter,
          typeId: selectedType,
          skillId,
        }),
      });

      const sessionData = await sessionRes.json();
      if (!sessionRes.ok) {
        setError(sessionData.error || '建立練習階段失敗');
        return;
      }

      setSessionId(sessionData.session.id);
      setStarted(true);
      setAnsweredCount(0);
      setCorrectCount(0);
      sessionStartTimeRef.current = Date.now();
      setSessionElapsedMs(0);
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
      sessionTimerRef.current = setInterval(() => {
        if (sessionStartTimeRef.current !== null) {
          setSessionElapsedMs(Math.max(0, Date.now() - sessionStartTimeRef.current));
        }
      }, 1000);
      loadNextQuestion();
    } catch (err) {
      setError('啟動失敗');
    } finally {
      setLoading(false);
    }
  };

  const loadNextQuestion = async () => {
    if (!skillId && (!selectedChapter || !selectedType)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/practice/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: selectedChapter,
          typeId: selectedType,
          skillId,
          difficulty,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.question) {
          setCurrentQuestion(data.question);
          if (data.question.chapter_id) {
            setSelectedChapter(data.question.chapter_id);
          }
          if (data.question.type_id) {
            setSelectedType(data.question.type_id);
          }
          setUserAnswer('');
          setSelectedChoiceIndex(null);
          questionStartTimeRef.current = Date.now();
          setElapsedMs(0);
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
          timerIntervalRef.current = setInterval(() => {
            if (questionStartTimeRef.current !== null) {
              setElapsedMs(Math.max(0, Date.now() - questionStartTimeRef.current));
            }
          }, 200);
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

  const playFeedbackTone = (type: 'correct' | 'wrong') => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = type === 'correct' ? 880 : 220;
      gain.gain.value = 0.15;
      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 180);
    } catch {
      // Ignore audio errors (autoplay policy, etc.)
    }
  };

  const showFeedback = (type: 'correct' | 'wrong') => {
    setFeedback({
      type,
      message: type === 'correct' ? '作答正確！' : '作答錯誤！',
    });
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback(null);
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !sessionId) return;
    const now = Date.now();
    const timeSpentMs =
      questionStartTimeRef.current !== null
        ? Math.max(0, Math.round(now - questionStartTimeRef.current))
        : null;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // 判斷答案
    let isCorrect = false;
    if (currentQuestion.qtype === 'mcq') {
      isCorrect = selectedChoiceIndex === currentQuestion.correct_choice_index;
    } else {
      isCorrect = isAnswerMatch(userAnswer, currentQuestion.answer);
    }

    // 提交作答記錄
    try {
      await fetch('/api/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          chapterId: currentQuestion.chapter_id || selectedChapter,
          typeId: currentQuestion.type_id || selectedType,
          difficulty: currentQuestion.difficulty,
          qtype: currentQuestion.qtype,
          prompt: currentQuestion.prompt,
          userAnswer: userAnswer || null,
          selectedChoiceIndex: selectedChoiceIndex || null,
          isCorrect,
          timeSpentMs,
        }),
      });
    } catch (err) {
      console.error('提交失敗', err);
    }

    // 狀態機邏輯
    showFeedback(isCorrect ? 'correct' : 'wrong');
    playFeedbackTone(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
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
      setAnsweredCount((prev) => prev + 1);
      if (newStreak10 >= 10) {
        setCompleted(true);
        if (sessionTimerRef.current) {
          clearInterval(sessionTimerRef.current);
          sessionTimerRef.current = null;
        }
        return;
      }
    } else {
      setAnsweredCount((prev) => prev + 1);
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

  const formatTime = (timeMs: number) => {
    if (timeMs >= 60000) {
      const totalSeconds = Math.round(timeMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${String(seconds).padStart(2, '0')}`;
    }
    return `${(timeMs / 1000).toFixed(1)} 秒`;
  };

  const formatAttemptTime = (timeMs: number | null) => {
    if (typeof timeMs !== 'number') return '—';
    return formatTime(timeMs);
  };

  const formatDuration = (timeMs: number) => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
    };
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

  // 檢查 subject 和 grade 參數
  if (!subject || !grade || (subject !== 'math' && subject !== 'physics') || !['1', '2', '3'].includes(grade)) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-red-600">錯誤</h1>
          <p className="text-gray-600 mb-6">
            請先選擇科目與年級
          </p>
          <Link
            href="/"
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            回到首頁選擇
          </Link>
        </div>
      </div>
    );
  }

  // 定義科目和年級名稱（在檢查之後，確保參數有效）
  const subjectName = subject === 'math' ? '數學' : '理化';
  const gradeName = selectedGrade === '1' ? '國一' : selectedGrade === '2' ? '國二' : '國三';
  const termName = selectedTerm === 'upper' ? '上學期' : selectedTerm === 'lower' ? '下學期' : '';
  const selectedGradeId =
    subject === 'math'
      ? `J${selectedGrade}-MATH`
      : subject === 'physics'
        ? `J${selectedGrade}-SCI`
        : '';

  const chapterGroups = (() => {
    if (!selectedGradeId || !selectedTerm) return [];
    const books = PRACTICE_BOOK_STRUCTURE.filter(
      (book) => book.gradeId === selectedGradeId && book.term === selectedTerm
    );
    const chapterMap = new Map(
      filteredChapters.map((ch) => [ch.id, ch])
    );
    return books
      .map((book) => ({
        bookTitle: book.bookTitle,
        groups: book.chapters
          .map((group) => ({
            title: group.title,
            items: group.sectionIds.map((id) => chapterMap.get(id)).filter(Boolean) as Chapter[],
          }))
          .filter((group) => group.items.length > 0),
      }))
      .filter((book) => book.groups.length > 0);
  })();

  if (completed) {
    const timedAttempts = attempts.filter((a) => typeof a.time_spent_ms === 'number');
    const averageTimeMs =
      timedAttempts.length > 0
        ? timedAttempts.reduce((sum, a) => sum + (a.time_spent_ms || 0), 0) / timedAttempts.length
        : null;
    const slowestAttempts = [...timedAttempts]
      .sort((a, b) => (b.time_spent_ms || 0) - (a.time_spent_ms || 0))
      .slice(0, 3);

    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-2xl w-full relative">
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
          <div className="text-left bg-gray-50 border rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">本次練習耗時</h2>
            {attemptsLoading && <p className="text-sm text-gray-500">載入中...</p>}
            {attemptsError && <p className="text-sm text-red-600">{attemptsError}</p>}
            {!attemptsLoading && !attemptsError && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">平均每題</p>
                    <p className="text-xl font-semibold">
                      {averageTimeMs === null ? '—' : formatTime(averageTimeMs)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">最慢 Top 3</p>
                    <div className="space-y-1 text-sm text-gray-700">
                      {slowestAttempts.length === 0 && <p>—</p>}
                      {slowestAttempts.map((attempt, idx) => (
                        <div key={attempt.id} className="flex justify-between gap-2">
                          <span className="truncate">
                            {idx + 1}. {attempt.prompt_snapshot || attempt.question_id}
                          </span>
                          <span className="whitespace-nowrap text-gray-500">
                            {formatAttemptTime(attempt.time_spent_ms)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-700 max-h-60 overflow-y-auto border-t pt-3">
                  {attempts.length === 0 && <p>—</p>}
                  {attempts.map((attempt, idx) => (
                    <div key={attempt.id} className="flex justify-between gap-2">
                      <span className="truncate">
                        第 {idx + 1} 題：{attempt.prompt_snapshot || attempt.question_id}
                      </span>
                      <span className="whitespace-nowrap text-gray-500">
                        {formatAttemptTime(attempt.time_spent_ms)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => {
                setCompleted(false);
                setStarted(false);
                setStreak10(0);
                setStreak(0);
                setHardStreak(0);
                setDifficulty('easy');
                setAttempts([]);
                setAttemptsError('');
                setAnsweredCount(0);
                setCorrectCount(0);
                setSessionElapsedMs(0);
                sessionStartTimeRef.current = null;
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
            <div>
              <h1 className="text-3xl font-bold">{skillId ? '技能練習模式' : '題型練習模式'}</h1>
              <p className="text-lg text-gray-600 mt-2">
                {subjectName} {gradeName}{termName ? ` ${termName}` : ''}
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              ← 回到首頁
            </Link>
          </div>

            {!skillId && filteredChapters.length === 0 && selectedTerm && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                {subjectName} {gradeName} {termName}的章節尚未建立，請聯繫管理員。
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
          )}

          <div className="space-y-4">
            {skillId ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">
                  目前練習技能：{skillId}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  系統會依此技能隨機出題。
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">選擇年級</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['1', '2', '3'] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          if (value !== selectedGrade) return;
                          setSelectedGrade(value);
                          setSelectedTerm('');
                        }}
                        disabled={value !== selectedGrade}
                        className={`px-3 py-2 text-sm rounded border ${
                          selectedGrade === value
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        {value === '1' ? '國一' : value === '2' ? '國二' : '國三'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">選擇學期</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['upper', 'lower'] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSelectedTerm(value)}
                        className={`px-3 py-2 text-sm rounded border ${
                          selectedTerm === value
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {value === 'upper' ? '上學期' : '下學期'}
                      </button>
                    ))}
                  </div>
                </div>

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
                  <div className={`border rounded bg-white ${!selectedTerm ? 'opacity-60' : ''}`}>
                    {!selectedTerm ? (
                      <div className="p-3 text-sm text-gray-500">請先選擇學期</div>
                    ) : chapterGroups.length > 0 ? (
                      chapterGroups.map((book) => (
                        <div key={book.bookTitle} className="border-b last:border-b-0">
                          <div className="px-3 py-2 text-sm font-semibold bg-gray-50 text-gray-800">
                            {book.bookTitle}
                          </div>
                          <div className="pl-4 py-1">
                            {book.groups.map((group) => {
                              const groupKey = `${book.bookTitle}|${group.title}`;
                              const groupOpen = expandedChapterGroupKeys.has(groupKey);
                              return (
                                <div key={groupKey} className="border-l border-gray-200">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setExpandedChapterGroupKeys((prev) => {
                                        const next = new Set(prev);
                                        if (next.has(groupKey)) {
                                          next.delete(groupKey);
                                        } else {
                                          next.add(groupKey);
                                        }
                                        return next;
                                      });
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-gray-50"
                                  >
                                    {groupOpen ? '[-] ' : '[+] '} {group.title}
                                  </button>
                                  {groupOpen && (
                                    <div className="pl-4 py-1">
                                      {group.items.map((ch) => {
                                        const sectionCode = ch.id
                                          .replace(/^[a-z]\d+[a-z]?-/i, '')
                                          .replace(/-l$/, '');
                                        return (
                                          <button
                                            key={ch.id}
                                            type="button"
                                            onClick={() => {
                                              setSelectedChapter(ch.id);
                                              setSelectedType('');
                                              setTypes([]);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                                              ch.id === selectedChapter ? 'bg-gray-100 font-medium' : ''
                                            }`}
                                          >
                                            {sectionCode} {ch.title}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-gray-500">
                        章節結構尚未建立，請聯繫管理員。
                      </div>
                    )}
                  </div>
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
              </>
            )}

            <button
              onClick={startPractice}
              disabled={skillId ? loading : (!selectedChapter || !selectedType || loading)}
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
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
        <div className="bg-white p-6 rounded-lg shadow mb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">題型練習</h1>
              <div className="text-sm text-gray-600">
                {subjectName} {gradeName}{termName ? ` ${termName}` : ''} | 連續答對: {streak10} / 10 | 難度: {difficulty === 'easy' ? '簡單' : difficulty === 'medium' ? '中等' : '困難'}
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
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {currentQuestion.difficulty} | {currentQuestion.qtype}
            </span>
            <span className="text-sm text-gray-600">
              本題計時：{formatTime(elapsedMs)}
            </span>
          </div>
          <QuestionRenderer prompt={currentQuestion.prompt} media={currentQuestion.media} className="mb-6" />
          {feedback && (
            <div
              className={`mb-4 rounded px-4 py-2 text-sm font-semibold ${
                feedback.type === 'correct'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {feedback.message}
            </div>
          )}

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
        <div className="lg:w-64">
          <div className="bg-white rounded-lg shadow p-4 lg:sticky lg:top-6">
            <div className="text-center">
              <div className="bg-lime-500 text-white rounded-t-lg py-3 font-semibold">
                Questions answered
              </div>
              <div className="text-4xl font-bold text-gray-700 py-6 border-x border-b">
                {answeredCount}
              </div>
              <div className="bg-sky-500 text-white py-3 font-semibold">
                Time elapsed
              </div>
              <div className="border-x border-b py-4">
                {(() => {
                  const { hours, minutes, seconds } = formatDuration(sessionElapsedMs);
                  return (
                    <div className="flex justify-center gap-2 text-gray-700">
                      <div className="text-center">
                        <div className="px-2 py-1 border rounded text-lg font-semibold">{hours}</div>
                        <div className="text-xs text-gray-400 mt-1">HR</div>
                      </div>
                      <div className="text-center">
                        <div className="px-2 py-1 border rounded text-lg font-semibold">{minutes}</div>
                        <div className="text-xs text-gray-400 mt-1">MIN</div>
                      </div>
                      <div className="text-center">
                        <div className="px-2 py-1 border rounded text-lg font-semibold">{seconds}</div>
                        <div className="text-xs text-gray-400 mt-1">SEC</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="bg-orange-500 text-white py-3 font-semibold flex items-center justify-center gap-2">
                SmartScore out of 100
                <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center">?</span>
              </div>
              <div className="text-4xl font-bold text-gray-700 py-6 border-x border-b rounded-b-lg">
                {answeredCount === 0 ? 0 : Math.round((correctCount / answeredCount) * 100)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center"><p>載入中...</p></div>}>
      <PracticePageContent />
    </Suspense>
  );
}

