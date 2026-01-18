'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Chapter } from '@/types';

type ScopeType = 'chapter' | 'book' | 'exam';
type Term = 'upper' | 'lower';

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

export default function DiagnosticPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subject = searchParams.get('subject'); // 'math' 或 'physics'
  const grade = searchParams.get('grade'); // '1', '2', 或 '3'

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<Term | ''>('');
  const [scopeType, setScopeType] = useState<ScopeType>('chapter');
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedChapterGroupKeys, setExpandedChapterGroupKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!subject || !grade || (subject !== 'math' && subject !== 'physics')) {
      router.push('/');
    }
  }, [subject, grade, router]);

  useEffect(() => {
    setSelectedChapter('');
    setExpandedChapterGroupKeys(new Set());
    setError('');
  }, [scopeType, selectedTerm]);

  const gradeId = useMemo(() => {
    if (!grade) return '';
    return `J${grade}-${subject === 'math' ? 'MATH' : 'SCI'}`;
  }, [grade, subject]);

  const subjectName = subject === 'math' ? '數學' : '理化';
  const gradeName = grade === '1' ? '國一' : grade === '2' ? '國二' : '國三';

  useEffect(() => {
    if (!subject || !grade) return;

    const loadChapters = async () => {
      try {
        const res = await fetch(`/api/chapters?t=${Date.now()}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (res.ok && data.data) {
          const filtered = data.data.filter((ch: Chapter) => {
            if (!gradeId || ch.grade_id !== gradeId) return false;
            if (selectedTerm && ch.term !== selectedTerm) return false;
            return true;
          });
          setChapters(data.data);
          setFilteredChapters(filtered);
        } else {
          setError(data.error || '載入章節失敗');
        }
      } catch (err: any) {
        setError(err.message || '載入章節失敗');
      }
    };

    loadChapters();
  }, [subject, grade, gradeId, selectedTerm]);

  const chapterGroups = useMemo(() => {
    if (!gradeId || !selectedTerm) return [];
    const books = PRACTICE_BOOK_STRUCTURE.filter(
      (book) => book.gradeId === gradeId && book.term === selectedTerm
    );
    const chapterMap = new Map(filteredChapters.map((ch) => [ch.id, ch]));
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
  }, [filteredChapters, gradeId, selectedTerm]);

  const handleStart = async () => {
    setError('');
    setLoading(true);
    try {
      const scopeRef: Record<string, any> = {};
      if (scopeType === 'chapter') {
        if (!selectedChapter) {
          setError('請先選擇章節');
          setLoading(false);
          return;
        }
        scopeRef.chapter_id = selectedChapter;
      }
      if (scopeType === 'book') {
        if (!selectedTerm) {
          setError('請先選擇學期');
          setLoading(false);
          return;
        }
        scopeRef.grade_id = gradeId;
        scopeRef.term = selectedTerm;
        scopeRef.grade = Number(grade);
        scopeRef.book = selectedTerm === 'upper' ? '上' : '下';
      }
      if (scopeType === 'exam') {
        scopeRef.grade = Number(grade);
      }

      const res = await fetch('/api/diagnostic/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject === 'math' ? 'math' : 'science',
          scope_type: scopeType,
          scope_ref: scopeRef,
          total_questions: totalQuestions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '建立診斷失敗');
        return;
      }

      if (data.missing) {
        alert('目前題數不足，系統將以可用題目進行診斷。');
      }

      router.push(`/diagnostic/session/${data.session.id}`);
    } catch (err: any) {
      setError(err.message || '建立診斷失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">弱點分析模式</h1>
            <p className="text-lg text-gray-600 mt-2">
              {subjectName} {gradeName}
            </p>
          </div>
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
            <label className="block text-sm font-medium mb-2">選擇分析範圍</label>
            <div className="grid grid-cols-3 gap-2">
              {(['chapter', 'book', 'exam'] as ScopeType[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScopeType(value)}
                  className={`px-3 py-2 text-sm rounded border ${
                    scopeType === value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {value === 'chapter'
                    ? '單一章節'
                    : value === 'book'
                      ? '單冊'
                      : '會考'}
                </button>
              ))}
            </div>
          </div>

          {(scopeType === 'chapter' || scopeType === 'book') && (
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
          )}

          {scopeType === 'chapter' && (
            <div>
              <label className="block text-sm font-medium mb-2">選擇章節</label>
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
                                        onClick={() => setSelectedChapter(ch.id)}
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
                  <div className="p-3 text-sm text-gray-500">章節尚未建立</div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">題數</label>
            <input
              type="number"
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Math.max(1, Number(e.target.value) || 1))}
              className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={1}
            />
          </div>

          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? '建立中...' : '開始診斷'}
          </button>
        </div>
      </div>
    </div>
  );
}


