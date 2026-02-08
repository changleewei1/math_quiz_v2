'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Chapter, QuestionTypeData, Question } from '@/types';
import type { GradeId, Term } from '@/types/grade';
import { GRADES, TERMS, getGradeName, getTermName } from '@/types/grade';

function AdminPageContent() {
  const searchParams = useSearchParams();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [types, setTypes] = useState<QuestionTypeData[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 篩選狀態
  const [filterGradeId, setFilterGradeId] = useState<GradeId | ''>('');
  const [filterTerm, setFilterTerm] = useState<Term | ''>('');
  
  // 表單狀態
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterId, setNewChapterId] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterGradeId, setNewChapterGradeId] = useState<GradeId>('J1-MATH');
  const [newChapterTerm, setNewChapterTerm] = useState<Term>('upper');
  const [newChapterSortOrder, setNewChapterSortOrder] = useState(0);
  const [insertChapterAfter, setInsertChapterAfter] = useState<string>(''); // 'none' 或章節 ID
  
  const [showAddType, setShowAddType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCode, setNewTypeCode] = useState('');
  const [newTypeDescription, setNewTypeDescription] = useState('');
  const [newTypeSortOrder, setNewTypeSortOrder] = useState(0);
  const [insertTypeAfter, setInsertTypeAfter] = useState<string>(''); // 'none' 或題型 ID
  
  const [insertQuestionAfter, setInsertQuestionAfter] = useState<string>(''); // 'none' 或題目 ID
  
  // 批次輸入狀態
  const [showBatchInput, setShowBatchInput] = useState(false);
  const [batchInputText, setBatchInputText] = useState('');
  const [batchInputLoading, setBatchInputLoading] = useState(false);
  const [batchInputResult, setBatchInputResult] = useState<{success: number, failed: number, errors?: string[]} | null>(null);
  
  // 批次刪除狀態
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false);
  
  // 編輯狀態
  const [editingChapter, setEditingChapter] = useState<string | null>(null);
  const [editChapterId, setEditChapterId] = useState('');
  const [editChapterTitle, setEditChapterTitle] = useState('');
  const [editChapterGradeId, setEditChapterGradeId] = useState<GradeId>('J1-MATH');
  const [editChapterTerm, setEditChapterTerm] = useState<Term>('upper');
  const [editChapterSortOrder, setEditChapterSortOrder] = useState(0);
  
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editTypeName, setEditTypeName] = useState('');
  const [editTypeCode, setEditTypeCode] = useState('');
  const [editTypeDescription, setEditTypeDescription] = useState('');
  const [editTypeSortOrder, setEditTypeSortOrder] = useState(0);
  const [expandedGroupKeys, setExpandedGroupKeys] = useState<Set<string>>(new Set());
  const [expandedBookKeys, setExpandedBookKeys] = useState<Set<string>>(new Set());
  const [expandedChapterGroupKeys, setExpandedChapterGroupKeys] = useState<Set<string>>(new Set());
  const [expandedChapterId, setExpandedChapterId] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<'math' | 'science' | ''>('');

  // 章節分組（依年級與學期）
  const gradeOrder = new Map(GRADES.map((g, idx) => [g.id, idx]));
  const termOrder = new Map(TERMS.map((t, idx) => [t.id, idx]));
  const groupedChapterList = (() => {
    const groups: Record<string, { label: string; items: Chapter[]; gradeId: GradeId; term: Term }> = {};
    for (const ch of filteredChapters) {
      if (selectedSubject) {
        const isMath = ch.grade_id.endsWith('-MATH');
        if (selectedSubject === 'math' && !isMath) continue;
        if (selectedSubject === 'science' && isMath) continue;
      }
      const key = `${ch.grade_id}|${ch.term}`;
      const termMark = ch.term === 'upper' ? '上' : '下';
      if (!groups[key]) {
        groups[key] = {
          label: `【${termMark}】${getGradeName(ch.grade_id)}`,
          items: [],
          gradeId: ch.grade_id,
          term: ch.term,
        };
      }
      groups[key].items.push(ch);
    }
    return Object.values(groups)
      .map((group) => ({
        ...group,
        items: group.items.sort((a, b) => a.sort_order - b.sort_order),
      }))
      .sort((a, b) => {
        const gA = gradeOrder.get(a.gradeId) ?? 0;
        const gB = gradeOrder.get(b.gradeId) ?? 0;
        if (gA !== gB) return gA - gB;
        const tA = termOrder.get(a.term) ?? 0;
        const tB = termOrder.get(b.term) ?? 0;
        return tA - tB;
      });
  })();

  // 冊別大標題設定（先從國一上學期開始）
  const BOOK_STRUCTURE = [
    {
      gradeId: 'J1-MATH' as GradeId,
      term: 'upper' as Term,
      bookTitle: '第一冊',
      chapters: [
        { title: '第一章_數與數線', sectionIds: ['m1-1-1', 'm1-1-2', 'm1-1-3', 'm1-1-4'] },
        { title: '第二章_標準分解式與分數運算', sectionIds: ['m1-2-1', 'm1-2-2', 'm1-2-3', 'm1-2-4'] },
        { title: '第三章_一元一次方程式', sectionIds: ['m1-3-1', 'm1-3-2', 'm1-3-3'] },
      ],
    },
    {
      gradeId: 'J1-MATH' as GradeId,
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
      gradeId: 'J2-MATH' as GradeId,
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
      gradeId: 'J2-MATH' as GradeId,
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
      gradeId: 'J3-MATH' as GradeId,
      term: 'upper' as Term,
      bookTitle: '第五冊',
      chapters: [
        { title: '第一章_相似形與三角比', sectionIds: ['m3-5-1-1', 'm3-5-1-2', 'm3-5-1-3', 'm3-5-1-4'] },
        { title: '第二章_圓形', sectionIds: ['m3-5-2-1', 'm3-5-2-2'] },
        { title: '第三章_推理證明與三角形的基本性質', sectionIds: ['m3-5-3-1', 'm3-5-3-2'] },
      ],
    },
    {
      gradeId: 'J3-MATH' as GradeId,
      term: 'lower' as Term,
      bookTitle: '第六冊',
      chapters: [
        { title: '第一章_二次函數', sectionIds: ['m3-6-1-1'] },
        { title: '第二章_統計與機率', sectionIds: ['m3-6-2-1', 'm3-6-2-2'] },
        { title: '第三章_立體圖形', sectionIds: ['m3-6-3-1'] },
      ],
    },
    {
      gradeId: 'J2-SCI' as GradeId,
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
      gradeId: 'J2-SCI' as GradeId,
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
      gradeId: 'J3-SCI' as GradeId,
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
      gradeId: 'J3-SCI' as GradeId,
      term: 'lower' as Term,
      bookTitle: '國三理化下學期',
      chapters: [
        { title: '第一章_電的應用', sectionIds: ['p3b-1-1', 'p3b-1-2', 'p3b-1-3', 'p3b-1-4'] },
        { title: '第二章_電流與磁現象', sectionIds: ['p3b-2-1', 'p3b-2-2', 'p3b-2-3', 'p3b-2-4'] },
      ],
    },
  ];

  const bookChapterTree = (() => {
    if (!selectedSubject) return [];
    const subjectGradeSuffix = selectedSubject === 'math' ? '-MATH' : '-SCI';
    const filteredBooks = BOOK_STRUCTURE.filter((book) =>
      book.gradeId.endsWith(subjectGradeSuffix)
    );
    return filteredBooks
      .map((book) => {
        const chapterMap = new Map(
          filteredChapters
            .filter((ch) => ch.grade_id === book.gradeId && ch.term === book.term)
            .map((ch) => [ch.id, ch])
        );
        const sections = book.chapters
          .map((group) => ({
            title: group.title,
            items: group.sectionIds.map((id) => chapterMap.get(id)).filter(Boolean) as Chapter[],
          }))
          .filter((group) => group.items.length > 0);
        return {
          key: `${book.gradeId}|${book.term}|${book.bookTitle}`,
          gradeId: book.gradeId,
          term: book.term,
          title: book.bookTitle,
          sections,
        };
      })
      .filter((book) => book.sections.length > 0);
  })();

  // 從 URL 參數初始化選中的章節和題型
  useEffect(() => {
    const urlChapter = searchParams.get('chapterId') || searchParams.get('chapter');
    const urlType = searchParams.get('typeId') || searchParams.get('type');
    if (urlChapter && urlChapter !== selectedChapter) {
      setSelectedChapter(urlChapter);
    }
    if (urlType && urlType !== selectedType) {
      setSelectedType(urlType);
    }
  }, [searchParams]);

  // 載入章節
  useEffect(() => {
    loadChapters();
  }, []);

  // 載入題型
  useEffect(() => {
    if (selectedChapter) {
      loadTypes(selectedChapter);
      // 只有在章節改變且不是從 URL 參數載入時才重置題型
      const urlChapter = searchParams.get('chapterId') || searchParams.get('chapter');
      if (!urlChapter || urlChapter !== selectedChapter) {
        setSelectedType('');
        setQuestions([]);
      }
    }
  }, [selectedChapter]);

  // 載入題目（當章節或題型改變時，或從編輯頁面返回時）
  useEffect(() => {
    if (selectedChapter && selectedType) {
      loadQuestions(selectedChapter, selectedType);
    }
  }, [selectedChapter, selectedType]);
  
  // 當頁面獲得焦點時重新載入題目（用於從編輯頁面返回後更新）
  useEffect(() => {
    const handleFocus = () => {
      if (selectedChapter && selectedType) {
        loadQuestions(selectedChapter, selectedType);
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [selectedChapter, selectedType]);

  // 讓選中的章節自動展開
  useEffect(() => {
    if (selectedChapter) {
      setExpandedChapterId(selectedChapter);
    }
  }, [selectedChapter]);

  // 預設展開所有群組（依年級/學期）
  useEffect(() => {
    if (!filterTerm) {
      if (expandedGroupKeys.size > 0) {
        setExpandedGroupKeys(new Set());
      }
      return;
    }
    if (expandedGroupKeys.size === 0 && groupedChapterList.length > 0) {
      setExpandedGroupKeys(new Set(groupedChapterList.map((group) => `${group.gradeId}|${group.term}`)));
    }
  }, [groupedChapterList, filterTerm, expandedGroupKeys.size]);

  useEffect(() => {
    if (!selectedChapter || bookChapterTree.length === 0) return;
    const targetBook = bookChapterTree.find((book) =>
      book.sections.some((section) => section.items.some((ch) => ch.id === selectedChapter))
    );
    if (!targetBook) return;
    setExpandedBookKeys((prev) => {
      if (prev.has(targetBook.key)) return prev;
      const next = new Set(prev);
      next.add(targetBook.key);
      return next;
    });
  }, [bookChapterTree, selectedChapter]);

  const loadChapters = async (preserveSelection = false) => {
    try {
      // 建立查詢參數
      const params = new URLSearchParams({ t: Date.now().toString() });
      if (filterGradeId) params.append('gradeId', filterGradeId);
      if (filterTerm) params.append('term', filterTerm);

      const res = await fetch(`/api/admin/chapters?${params.toString()}`, {
        method: 'GET',
        credentials: 'include', // 確保包含 cookies
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: '未知錯誤' }));
        setError('載入章節失敗：' + (errorData.error || `HTTP ${res.status}`));
        console.error('載入章節失敗:', res.status, errorData);
        return;
      }
      
      const data = await res.json();
      if (data.data) {
        const currentSelected = selectedChapter;
        const allChapters = data.data;
        setChapters(allChapters);
        
        // 套用篩選
        let filtered = allChapters;
        if (filterGradeId) {
          filtered = filtered.filter((ch: Chapter) => ch.grade_id === filterGradeId);
        }
        if (filterTerm) {
          filtered = filtered.filter((ch: Chapter) => ch.term === filterTerm);
        }
        setFilteredChapters(filtered);
        
        console.log('載入的章節列表:', allChapters.map((ch: Chapter) => ch.id));
        console.log('篩選後的章節列表:', filtered.map((ch: Chapter) => ch.id));
        
        const urlChapter = searchParams.get('chapter');
        const urlType = searchParams.get('type');
        
        // 從篩選後的列表中選擇章節
        if (filtered.length > 0) {
          if (urlChapter && filtered.find((ch: Chapter) => ch.id === urlChapter)) {
            setSelectedChapter(urlChapter);
          } else if (preserveSelection && currentSelected) {
            // 保留當前選中的章節，如果它仍然存在
            const stillExists = filtered.find((ch: Chapter) => ch.id === currentSelected);
            if (stillExists) {
              setSelectedChapter(currentSelected);
            } else if (filtered.length > 0) {
              // 如果原選中的章節不存在了，選擇第一個
              setSelectedChapter(filtered[0].id);
            }
          } else if (!preserveSelection && !currentSelected) {
            // 只有在沒有選中章節且不需要保留時，才選擇第一個
            setSelectedChapter(filtered[0].id);
          }
        } else {
          // 篩選後沒有章節，清除選中狀態
          setSelectedChapter('');
          setTypes([]);
          setQuestions([]);
        }
      } else {
        setError('載入章節失敗：回應格式錯誤');
        console.error('載入章節失敗：回應資料格式錯誤', data);
      }
    } catch (err: any) {
      setError('載入章節失敗：' + (err.message || '網路錯誤'));
      console.error('載入章節失敗:', err);
    }
  };

  // 當篩選條件改變時重新載入章節
  useEffect(() => {
    loadChapters(true);
  }, [filterGradeId, filterTerm]);

  const loadTypes = async (chapterId: string) => {
    try {
      const res = await fetch(`/api/admin/types?chapterId=${chapterId}`);
      const data = await res.json();
      if (res.ok) {
        setTypes(data.data);
        const urlType = searchParams.get('type');
        
        if (data.data.length > 0) {
          if (urlType && data.data.find((type: QuestionTypeData) => type.id === urlType)) {
            setSelectedType(urlType);
          } else if (!selectedType) {
          setSelectedType(data.data[0].id);
          }
        }
      }
    } catch (err) {
      setError('載入題型失敗');
    }
  };

  const loadQuestions = async (chapterId: string, typeId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/questions?chapterId=${chapterId}&typeId=${typeId}`);
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.data);
        // 清除已選中的題目（因為題目列表已更新）
        setSelectedQuestionIds(new Set());
      } else {
        setError(data.error || '載入題目失敗');
      }
    } catch (err) {
      setError('載入題目失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterId || !newChapterTitle) {
      setError('請填寫章節 ID 和標題');
      return;
    }

    // 檢查章節 ID 是否已存在（前端驗證）
    const existingChapter = filteredChapters.find(ch => ch.id === newChapterId);
    if (existingChapter) {
      setError(`章節 ID "${newChapterId}" 已存在（目前標題：${existingChapter.title}）。請使用不同的 ID 或編輯現有章節。`);
      return;
    }

    try {
      // 計算插入位置
      let calculatedSortOrder = newChapterSortOrder;
      if (insertChapterAfter) {
        if (insertChapterAfter === 'none') {
          // 插入到最後
          const maxSortOrder = filteredChapters.length > 0 
            ? Math.max(...filteredChapters.map(ch => ch.sort_order))
            : 0;
          calculatedSortOrder = maxSortOrder + 1;
        } else {
          // 插入在指定章節之後
          const afterChapter = filteredChapters.find(ch => ch.id === insertChapterAfter);
          if (afterChapter) {
            calculatedSortOrder = afterChapter.sort_order + 1;
            // 調整其他章節的排序
            await fetch('/api/admin/chapters/reorder', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                after_sort_order: afterChapter.sort_order,
                increment: true,
              }),
            });
          }
        }
      }

      const res = await fetch('/api/admin/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newChapterId,
          title: newChapterTitle,
          grade_id: newChapterGradeId,
          term: newChapterTerm,
          sort_order: calculatedSortOrder,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowAddChapter(false);
        setNewChapterId('');
        setNewChapterTitle('');
        setNewChapterSortOrder(0);
        setInsertChapterAfter('');
        setError(''); // 清除錯誤訊息
        loadChapters();
      } else {
        setError(data.error || '新增章節失敗');
      }
    } catch (err: any) {
      setError(err.message || '新增章節失敗');
    }
  };

  const handleDeleteChapter = async (id: string) => {
    if (!confirm('確定要刪除此章節嗎？這會同時刪除該章節下的所有題型和題目！')) return;

    try {
      const res = await fetch(`/api/admin/chapters?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadChapters();
        if (selectedChapter === id) {
          setSelectedChapter('');
          setTypes([]);
          setQuestions([]);
        }
      } else {
        const data = await res.json();
        setError(data.error || '刪除章節失敗');
      }
    } catch (err) {
      setError('刪除章節失敗');
    }
  };

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapter || !newTypeName || !newTypeCode) {
      setError('請選擇章節並填寫題型名稱和代碼');
      return;
    }

    try {
      // 計算插入位置
      let calculatedSortOrder = newTypeSortOrder;
      if (insertTypeAfter) {
        if (insertTypeAfter === 'none') {
          // 插入到最後
          const maxSortOrder = types.length > 0
            ? Math.max(...types.map(type => type.sort_order))
            : 0;
          calculatedSortOrder = maxSortOrder + 1;
        } else {
          // 插入在指定題型之後
          const afterType = types.find(type => type.id === insertTypeAfter);
          if (afterType) {
            calculatedSortOrder = afterType.sort_order + 1;
            // 調整其他題型的排序
            await fetch('/api/admin/types/reorder', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chapter_id: selectedChapter,
                after_sort_order: afterType.sort_order,
                increment: true,
              }),
            });
          }
        }
      }

      const res = await fetch('/api/admin/types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapter_id: selectedChapter,
          name: newTypeName,
          code: newTypeCode,
          description: newTypeDescription || null,
          sort_order: calculatedSortOrder,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowAddType(false);
        setNewTypeName('');
        setNewTypeCode('');
        setNewTypeDescription('');
        setNewTypeSortOrder(0);
        setInsertTypeAfter('');
        loadTypes(selectedChapter);
      } else {
        setError(data.error || '新增題型失敗');
      }
    } catch (err) {
      setError('新增題型失敗');
    }
  };

  const handleDeleteType = async (id: string) => {
    if (!confirm('確定要刪除此題型嗎？這會同時刪除該題型下的所有題目！')) return;

    try {
      const res = await fetch(`/api/admin/type?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadTypes(selectedChapter);
        if (selectedType === id) {
          setSelectedType('');
          setQuestions([]);
        }
      } else {
        const data = await res.json();
        setError(data.error || '刪除題型失敗');
      }
    } catch (err) {
      setError('刪除題型失敗');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('確定要刪除這題嗎？')) return;

    try {
      const res = await fetch(`/api/admin/question?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadQuestions(selectedChapter, selectedType);
        // 如果該題目在選中列表中，移除它
        setSelectedQuestionIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } else {
        const data = await res.json();
        setError(data.error || '刪除失敗');
      }
    } catch (err) {
      setError('刪除失敗');
    }
  };

  // 完成批次輸入更新
  const handleCompleteBatchInput = () => {
    setBatchInputResult(null);
    setBatchInputText('');
    loadQuestions(selectedChapter, selectedType);
  };

  // 切換題目選中狀態
  const handleToggleQuestionSelection = (questionId: string) => {
    setSelectedQuestionIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // 全選/取消全選
  const handleToggleSelectAll = () => {
    if (selectedQuestionIds.size === questions.length) {
      // 全選中，取消全選
      setSelectedQuestionIds(new Set());
    } else {
      // 未全選，全選
      setSelectedQuestionIds(new Set(questions.map((q) => q.id)));
    }
  };

  // 批次刪除題目
  const handleBatchDeleteQuestions = async () => {
    if (selectedQuestionIds.size === 0) {
      alert('請至少選擇一題要刪除的題目');
      return;
    }

    if (!confirm(`確定要刪除選中的 ${selectedQuestionIds.size} 題嗎？此操作無法復原。`)) {
      return;
    }

    setBatchDeleteLoading(true);
    try {
      const res = await fetch('/api/admin/questions/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionIds: Array.from(selectedQuestionIds),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`成功刪除 ${data.deletedCount} 題`);
        setSelectedQuestionIds(new Set());
        loadQuestions(selectedChapter, selectedType);
      } else {
        setError(data.error || '批次刪除失敗');
      }
    } catch (err: any) {
      setError('批次刪除失敗: ' + (err.message || ''));
    } finally {
      setBatchDeleteLoading(false);
    }
  };

  const handleToggleTypeActive = async (type: QuestionTypeData) => {
    try {
      const res = await fetch(`/api/admin/type?id=${type.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !type.is_active }),
      });
      if (res.ok) {
        loadTypes(selectedChapter);
      }
    } catch (err) {
      setError('更新失敗');
    }
  };

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter.id);
    setEditChapterId(chapter.id);
    setEditChapterTitle(chapter.title);
    setEditChapterGradeId(chapter.grade_id || 'J1-MATH');
    setEditChapterTerm(chapter.term || 'upper');
    setEditChapterSortOrder(chapter.sort_order);
    setShowAddChapter(false);
  };

  const handleSaveChapter = async (oldId: string) => {
    if (!editChapterId.trim()) {
      setError('請輸入章節 ID');
      return;
    }
    if (!editChapterTitle.trim()) {
      setError('請輸入章節標題');
      return;
    }

    // 如果 ID 有變更，需要警告用戶
    if (editChapterId !== oldId) {
      const newIdExists = filteredChapters.find(ch => ch.id === editChapterId && ch.id !== oldId);
      if (newIdExists) {
        setError(`章節 ID "${editChapterId}" 已存在。請使用不同的 ID。`);
        return;
      }

      if (!confirm(`確定要將章節 ID 從 "${oldId}" 修改為 "${editChapterId}" 嗎？\n\n此操作會更新所有相關的題型和題目資料。`)) {
        return;
      }
    }

    try {
      const res = await fetch(`/api/admin/chapters?id=${oldId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editChapterId !== oldId ? editChapterId : undefined, // 只有 ID 改變時才傳送
          title: editChapterTitle,
          grade_id: editChapterGradeId,
          term: editChapterTerm,
          sort_order: editChapterSortOrder,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const idChanged = editChapterId !== oldId;
        const newChapterId = editChapterId; // 保存新ID
        
        console.log('章節更新成功:', { oldId, newId: newChapterId, data });
        
        setEditingChapter(null);
        setEditChapterId('');
        setError(''); // 清除錯誤訊息
        
        // 如果 ID 改變了，先設置新的章節ID，然後載入章節列表
        if (idChanged) {
          // 先設置新ID，這樣載入章節時可以保留選擇
          setSelectedChapter(newChapterId);
          
          // 等待一下再載入，確保資料庫更新完成
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // 載入章節列表並保留選擇
          await loadChapters(true);
          
          // 再次確保選中正確的章節（防止 loadChapters 覆蓋）
          setSelectedChapter(newChapterId);
          
          // 等待一下確保章節列表已更新，然後載入題型
          setTimeout(() => {
            setSelectedChapter(newChapterId); // 再次確保
            loadTypes(newChapterId);
          }, 500);
        } else {
          // ID 沒改變，正常載入
          await loadChapters(true);
        }
      } else {
        const errorMsg = data.error || '更新章節失敗';
        setError(errorMsg);
        console.error('更新章節失敗:', data);
        alert(`更新章節失敗：${errorMsg}`);
      }
    } catch (err: any) {
      setError(err.message || '更新章節失敗');
    }
  };

  const handleCancelEditChapter = () => {
    setEditingChapter(null);
    setEditChapterId('');
    setEditChapterTitle('');
    setEditChapterSortOrder(0);
  };

  const handleEditType = (type: QuestionTypeData) => {
    setEditingType(type.id);
    setEditTypeName(type.name);
    setEditTypeCode(type.code);
    setEditTypeDescription(type.description || '');
    setEditTypeSortOrder(type.sort_order);
    setShowAddType(false);
  };

  const handleSaveType = async (id: string) => {
    if (!editTypeName.trim() || !editTypeCode.trim()) {
      setError('請填寫題型名稱和代碼');
      return;
    }

    try {
      const res = await fetch(`/api/admin/type?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editTypeName,
          code: editTypeCode,
          description: editTypeDescription || null,
          sort_order: editTypeSortOrder,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setEditingType(null);
        loadTypes(selectedChapter);
      } else {
        setError(data.error || '更新題型失敗');
      }
    } catch (err) {
      setError('更新題型失敗');
    }
  };

  const handleCancelEditType = () => {
    setEditingType(null);
    setEditTypeName('');
    setEditTypeCode('');
    setEditTypeDescription('');
    setEditTypeSortOrder(0);
  };

  const handleExport = async () => {
    if (!selectedChapter || !selectedType) return;

    try {
      const res = await fetch(`/api/admin/export?chapterId=${selectedChapter}&typeId=${selectedType}`);
      const data = await res.json();
      if (res.ok) {
        const jsonStr = JSON.stringify(data.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `questions_${selectedChapter}_${selectedType}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('匯出失敗');
    }
  };

  const handleBatchInput = async () => {
    if (!selectedChapter || !selectedType) {
      setError('請先選擇章節和題型');
      return;
    }

    if (!batchInputText.trim()) {
      setError('請輸入 JSON 格式的題目資料');
      return;
    }

    setBatchInputLoading(true);
    setError('');
    setBatchInputResult(null);

    try {
      // 解析 JSON
      let questionsData;
      try {
        questionsData = JSON.parse(batchInputText);
      } catch (parseError) {
        setError('JSON 格式錯誤，請檢查輸入的內容');
        setBatchInputLoading(false);
        return;
      }

      // 確保是陣列
      if (!Array.isArray(questionsData)) {
        setError('輸入的資料必須是一個陣列');
        setBatchInputLoading(false);
        return;
      }

      // 驗證每個題目的必要欄位
      const errors: string[] = [];
      questionsData.forEach((q: any, index: number) => {
        if (!q.difficulty || !['easy', 'medium', 'hard'].includes(q.difficulty)) {
          errors.push(`題目 ${index + 1}: 缺少或無效的 difficulty（必須是 easy, medium 或 hard）`);
        }
        if (!q.qtype || !['input', 'mcq', 'word'].includes(q.qtype)) {
          errors.push(`題目 ${index + 1}: 缺少或無效的 qtype（必須是 input, mcq 或 word）`);
        }
        if (!q.prompt || typeof q.prompt !== 'string') {
          errors.push(`題目 ${index + 1}: 缺少或無效的 prompt（必須是字串）`);
        }
        if (!q.answer || typeof q.answer !== 'string') {
          errors.push(`題目 ${index + 1}: 缺少或無效的 answer（必須是字串）`);
        }
        if (q.qtype === 'mcq') {
          if (!Array.isArray(q.choices) || q.choices.length < 2) {
            errors.push(`題目 ${index + 1}: mcq 題型必須提供至少 2 個選項（choices 陣列）`);
          }
          if (typeof q.correct_choice_index !== 'number' || q.correct_choice_index < 0) {
            errors.push(`題目 ${index + 1}: mcq 題型必須提供正確選項索引（correct_choice_index）`);
          }
        }
      });

      if (errors.length > 0) {
        setError(`驗證失敗：\n${errors.join('\n')}`);
        setBatchInputLoading(false);
        return;
      }

      // 發送請求
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: selectedChapter,
          typeId: selectedType,
          questions: questionsData,
          clearFirst: false, // 不刪除現有題目，直接新增
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBatchInputResult({ success: data.count || questionsData.length, failed: 0 });
        // 不立即清空輸入框和重新載入，讓用戶看到結果後點擊「完成更新」
      } else {
        setError(data.error || '批次輸入失敗');
        setBatchInputResult({ success: 0, failed: questionsData.length, errors: [data.error] });
      }
    } catch (err: any) {
      setError(err.message || '批次輸入失敗');
      setBatchInputResult({ success: 0, failed: 1, errors: [err.message] });
    } finally {
      setBatchInputLoading(false);
    }
  };

  const handleLoadExample = () => {
    const example = [
      {
        difficulty: 'easy',
        qtype: 'input',
        prompt: '計算 3 + 5 = ?',
        answer: '8',
        explain: '3 + 5 = 8'
      },
      {
        difficulty: 'medium',
        qtype: 'mcq',
        prompt: '下列哪個選項是正確的？',
        answer: '選項 B',
        choices: ['選項 A', '選項 B', '選項 C', '選項 D'],
        correct_choice_index: 1,
        explain: '正確答案是選項 B'
      },
      {
        difficulty: 'hard',
        qtype: 'word',
        prompt: '小明有 10 元，買了 3 元的糖果，還剩多少？',
        answer: '7',
        equation: '10 - 3 = 7',
        explain: '10 - 3 = 7 元'
      }
    ];
    setBatchInputText(JSON.stringify(example, null, 2));
  };

  // 接收者管理狀態
  const [showRecipients, setShowRecipients] = useState(false);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [newRecipient, setNewRecipient] = useState({
    student_id: '',
    role: 'parent' as 'parent' | 'teacher',
    line_user_id: '',
  });

  const loadRecipients = async () => {
    try {
      const res = await fetch('/api/admin/recipients');
      const data = await res.json();
      if (res.ok && data.data) {
        setRecipients(data.data);
      }
    } catch (err) {
      console.error('載入接收者失敗:', err);
    }
  };

  const handleAddRecipient = async () => {
    if (!newRecipient.student_id || !newRecipient.line_user_id) {
      alert('請填寫學生 ID 和 LINE User ID');
      return;
    }

    try {
      const res = await fetch('/api/admin/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecipient),
      });

      const data = await res.json();
      if (res.ok) {
        setNewRecipient({ student_id: '', role: 'parent', line_user_id: '' });
        loadRecipients();
        alert('新增成功');
      } else {
        alert(data.error || '新增失敗');
      }
    } catch (err) {
      alert('新增失敗');
    }
  };

  const handleToggleRecipientActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/recipients?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (res.ok) {
        loadRecipients();
      } else {
        alert('更新失敗');
      }
    } catch (err) {
      alert('更新失敗');
    }
  };

  const handleDeleteRecipient = async (id: string) => {
    if (!confirm('確定要刪除此接收者嗎？')) return;

    try {
      const res = await fetch(`/api/admin/recipients?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadRecipients();
        alert('刪除成功');
      } else {
        alert('刪除失敗');
      }
    } catch (err) {
      alert('刪除失敗');
    }
  };

  useEffect(() => {
    if (showRecipients) {
      loadRecipients();
    }
  }, [showRecipients]);

  // 學生管理狀態
  const [showStudents, setShowStudents] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [showStudentImport, setShowStudentImport] = useState(false);
  const [studentImportText, setStudentImportText] = useState('');
  const [studentImportLoading, setStudentImportLoading] = useState(false);
  const [studentImportResult, setStudentImportResult] = useState<{successCount: number, errorCount: number, errors?: string[]} | null>(null);
  
  // 單筆新增學生狀態
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentActive, setNewStudentActive] = useState(true);
  const [newStudentClassIds, setNewStudentClassIds] = useState<Set<string>>(new Set());
  const [addingStudent, setAddingStudent] = useState(false);

  // 編輯學生狀態
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentPassword, setEditStudentPassword] = useState('');
  const [editStudentActive, setEditStudentActive] = useState(true);
  const [editStudentClassIds, setEditStudentClassIds] = useState<Set<string>>(new Set());
  const [updatingStudent, setUpdatingStudent] = useState(false);
  const [loadingStudentClasses, setLoadingStudentClasses] = useState<string | null>(null);

  // 班級管理狀態
  const [showClasses, setShowClasses] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassSchoolYear, setNewClassSchoolYear] = useState('');
  const [newClassSemester, setNewClassSemester] = useState('');
  const [addingClass, setAddingClass] = useState(false);
  
  // 編輯班級狀態
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editClassSchoolYear, setEditClassSchoolYear] = useState('');
  const [editClassSemester, setEditClassSemester] = useState('');
  const [updatingClass, setUpdatingClass] = useState(false);

  // 家長連結管理狀態
  const [showParentLinks, setShowParentLinks] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [classMembers, setClassMembers] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [generatingLink, setGeneratingLink] = useState(false);

  // 老師管理狀態
  const [showTeachers, setShowTeachers] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [newTeacherUsername, setNewTeacherUsername] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('');
  const [newTeacherNickname, setNewTeacherNickname] = useState('');
  const [newTeacherActive, setNewTeacherActive] = useState(true);
  const [newTeacherClassIds, setNewTeacherClassIds] = useState<Set<string>>(new Set());
  const [addingTeacher, setAddingTeacher] = useState(false);
  
  // 編輯老師狀態
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [editTeacherUsername, setEditTeacherUsername] = useState('');
  const [editTeacherPassword, setEditTeacherPassword] = useState('');
  const [editTeacherNickname, setEditTeacherNickname] = useState('');
  const [editTeacherActive, setEditTeacherActive] = useState(true);
  const [editTeacherClassIds, setEditTeacherClassIds] = useState<Set<string>>(new Set());
  const [updatingTeacher, setUpdatingTeacher] = useState(false);
  const [loadingTeacherClasses, setLoadingTeacherClasses] = useState<string | null>(null);

  // 會考題庫管理狀態
  const [showExamQuestions, setShowExamQuestions] = useState(false);
  const [examSubjectTab, setExamSubjectTab] = useState<'math' | 'physics'>('math');
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [examLoading, setExamLoading] = useState(false);
  const [examError, setExamError] = useState('');
  const [examDeleteLoading, setExamDeleteLoading] = useState(false);
  const [selectedExamIds, setSelectedExamIds] = useState<Set<string>>(new Set());
  const [examForm, setExamForm] = useState({
    year: '',
    code: '',
    description: '',
    options: '',
    answer: '',
    explanation: '',
    difficulty: '',
    isActive: true,
  });
  const [showExamImport, setShowExamImport] = useState(false);
  const [examImportText, setExamImportText] = useState('');
  const [examImportLoading, setExamImportLoading] = useState(false);
  const [examImportResult, setExamImportResult] = useState<{ successCount: number; errorCount: number; errors?: string[] } | null>(null);

  const loadStudents = async () => {
    try {
      const res = await fetch('/api/admin/students');
      const data = await res.json();
      if (res.ok && data.data) {
        setStudents(data.data);
      }
    } catch (err) {
      console.error('載入學生失敗:', err);
    }
  };

  // 載入班級列表
  const loadClasses = async () => {
    try {
      const res = await fetch('/api/admin/classes');
      const data = await res.json();
      if (res.ok && data.classes) {
        setClasses(data.classes);
        if (data.classes.length > 0 && !selectedClassId) {
          setSelectedClassId(data.classes[0].id);
        }
      }
    } catch (err) {
      console.error('載入班級失敗:', err);
    }
  };

  // 載入班級成員
  const loadClassMembers = async (classId: string) => {
    if (!classId) return;
    try {
      const res = await fetch(`/api/admin/class-members?classId=${classId}`);
      const data = await res.json();
      if (res.ok && data.members) {
        setClassMembers(data.members);
      }
    } catch (err) {
      console.error('載入班級成員失敗:', err);
    }
  };

  useEffect(() => {
    if (showParentLinks) {
      loadClasses();
      loadStudents(); // 確保學生列表已載入
    }
  }, [showParentLinks]);

  useEffect(() => {
    if (showTeachers) {
      loadTeachers();
      loadClasses(); // 載入班級列表（用於選擇管理的班級）
    }
  }, [showTeachers]);

  // 載入班級列表（用於班級管理）
  const loadClassesForManagement = async () => {
    try {
      const res = await fetch('/api/admin/classes');
      const data = await res.json();
      if (res.ok && data.classes) {
        setClasses(data.classes);
      }
    } catch (err) {
      console.error('載入班級失敗:', err);
    }
  };

  // 新增班級
  const handleAddClass = async () => {
    if (!newClassName.trim()) {
      alert('請輸入班級名稱');
      return;
    }

    setAddingClass(true);
    try {
      const res = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClassName.trim(),
          school_year: newClassSchoolYear.trim() || null,
          semester: newClassSemester.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('新增班級成功');
        setNewClassName('');
        setNewClassSchoolYear('');
        setNewClassSemester('');
        setShowAddClass(false);
        loadClassesForManagement();
        loadClasses(); // 同時更新用於其他功能的班級列表
      } else {
        alert(data.error || '新增班級失敗');
      }
    } catch (err: any) {
      alert('新增班級失敗: ' + (err.message || ''));
    } finally {
      setAddingClass(false);
    }
  };

  // 開始編輯班級
  const handleStartEditClass = (cls: any) => {
    setEditingClassId(cls.id);
    setEditClassName(cls.name || '');
    setEditClassSchoolYear(cls.school_year || '');
    setEditClassSemester(cls.semester || '');
  };

  // 取消編輯
  const handleCancelEditClass = () => {
    setEditingClassId(null);
    setEditClassName('');
    setEditClassSchoolYear('');
    setEditClassSemester('');
  };

  // 更新班級
  const handleUpdateClass = async () => {
    if (!editingClassId) return;
    if (!editClassName.trim()) {
      alert('請輸入班級名稱');
      return;
    }

    setUpdatingClass(true);
    try {
      const res = await fetch(`/api/admin/classes?id=${editingClassId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editClassName.trim(),
          school_year: editClassSchoolYear.trim() || null,
          semester: editClassSemester.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('更新班級成功');
        handleCancelEditClass();
        loadClassesForManagement();
        loadClasses(); // 同時更新用於其他功能的班級列表
      } else {
        alert(data.error || '更新班級失敗');
      }
    } catch (err: any) {
      alert('更新班級失敗: ' + (err.message || ''));
    } finally {
      setUpdatingClass(false);
    }
  };

  // 刪除班級
  const handleDeleteClass = async (id: string, name: string) => {
    if (!confirm(`確定要刪除班級「${name}」嗎？此操作無法復原。`)) return;

    try {
      const res = await fetch(`/api/admin/classes?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('刪除班級成功');
        loadClassesForManagement();
        loadClasses(); // 同時更新用於其他功能的班級列表
      } else {
        const data = await res.json();
        alert(data.error || '刪除班級失敗');
      }
    } catch (err: any) {
      alert('刪除班級失敗: ' + (err.message || ''));
    }
  };

  // 切換班級狀態
  const handleToggleClassActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/classes?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (res.ok) {
        loadClassesForManagement();
        loadClasses(); // 同時更新用於其他功能的班級列表
      } else {
        alert('更新失敗');
      }
    } catch (err) {
      alert('更新失敗');
    }
  };

  useEffect(() => {
    if (showClasses) {
      loadClassesForManagement();
    }
  }, [showClasses]);

  useEffect(() => {
    if (selectedClassId) {
      loadClassMembers(selectedClassId);
    }
  }, [selectedClassId]);

  // 產生家長連結
  const handleGenerateParentLink = async () => {
    if (!selectedStudentId) {
      alert('請選擇學生');
      return;
    }

    setGeneratingLink(true);
    setGeneratedLink('');
    try {
      const res = await fetch('/api/reports/create-parent-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudentId }),
      });

      const data = await res.json();
      if (res.ok) {
        setGeneratedLink(data.reportUrl);
        alert(`連結已生成！有效期 7 天。\n學生：${data.studentName}`);
      } else {
        alert(data.error || '產生連結失敗');
      }
    } catch (err: any) {
      alert('產生連結失敗: ' + (err.message || ''));
    } finally {
      setGeneratingLink(false);
    }
  };

  // 複製連結
  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      alert('連結已複製到剪貼簿');
    }
  };

  // 載入老師列表
  const loadTeachers = async () => {
    try {
      const res = await fetch('/api/admin/teachers');
      const data = await res.json();
      if (res.ok && data.data) {
        setTeachers(data.data);
      }
    } catch (err) {
      console.error('載入老師失敗:', err);
    }
  };

  // 載入老師管理的班級
  const loadTeacherClasses = async (teacherId: string) => {
    setLoadingTeacherClasses(teacherId);
    try {
      const res = await fetch(`/api/admin/teacher-classes?teacherId=${teacherId}`);
      const data = await res.json();
      if (res.ok && data.classIds) {
        setEditTeacherClassIds(new Set(data.classIds));
      }
    } catch (err) {
      console.error('載入老師管理的班級失敗:', err);
    } finally {
      setLoadingTeacherClasses(null);
    }
  };

  // 開始編輯老師
  const handleStartEditTeacher = async (teacher: any) => {
    setEditingTeacherId(teacher.id);
    setEditTeacherUsername(teacher.username);
    setEditTeacherPassword(''); // 密碼留空，只有要修改時才填
    setEditTeacherNickname(teacher.nickname);
    setEditTeacherActive(teacher.is_active);
    await loadTeacherClasses(teacher.id);
  };

  // 取消編輯
  const handleCancelEditTeacher = () => {
    setEditingTeacherId(null);
    setEditTeacherUsername('');
    setEditTeacherPassword('');
    setEditTeacherNickname('');
    setEditTeacherActive(true);
    setEditTeacherClassIds(new Set());
  };

  // 更新老師
  const handleUpdateTeacher = async () => {
    if (!editingTeacherId) return;
    if (!editTeacherUsername.trim()) {
      alert('請輸入帳號');
      return;
    }
    if (!editTeacherNickname.trim()) {
      alert('請輸入暱稱');
      return;
    }

    setUpdatingTeacher(true);
    try {
      // 更新老師資料
      const updateData: any = {
        username: editTeacherUsername.trim(),
        nickname: editTeacherNickname.trim(),
        is_active: editTeacherActive,
      };

      // 只有當密碼欄位有值時才更新密碼
      if (editTeacherPassword.trim()) {
        updateData.password = editTeacherPassword;
      }

      const res = await fetch(`/api/admin/teachers?id=${editingTeacherId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '更新老師失敗');
        return;
      }

      // 更新老師管理的班級
      const classRes = await fetch('/api/admin/teacher-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: editingTeacherId,
          classIds: Array.from(editTeacherClassIds),
        }),
      });

      if (!classRes.ok) {
        const classData = await classRes.json();
        alert(`老師資料更新成功，但更新班級失敗：${classData.error || '未知錯誤'}`);
      } else {
        alert('更新成功');
      }

      handleCancelEditTeacher();
      loadTeachers();
    } catch (err: any) {
      alert('更新失敗: ' + (err.message || ''));
    } finally {
      setUpdatingTeacher(false);
    }
  };

  // 新增老師
  const handleAddTeacher = async () => {
    if (!newTeacherUsername.trim()) {
      alert('請輸入帳號');
      return;
    }
    if (!newTeacherPassword.trim()) {
      alert('請輸入密碼');
      return;
    }
    if (!newTeacherNickname.trim()) {
      alert('請輸入暱稱');
      return;
    }

    setAddingTeacher(true);
    try {
      // 先新增老師
      const res = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newTeacherUsername.trim(),
          password: newTeacherPassword,
          nickname: newTeacherNickname.trim(),
          is_active: newTeacherActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '新增老師失敗');
        return;
      }

      // 如果有選擇班級，更新老師管理的班級
      if (newTeacherClassIds.size > 0) {
        const classRes = await fetch('/api/admin/teacher-classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teacherId: data.data.id,
            classIds: Array.from(newTeacherClassIds),
          }),
        });

        if (!classRes.ok) {
          const classData = await classRes.json();
          alert(`老師新增成功，但設定班級失敗：${classData.error || '未知錯誤'}`);
        } else {
          alert('新增老師成功');
        }
      } else {
        alert('新增老師成功');
      }

      setNewTeacherUsername('');
      setNewTeacherPassword('');
      setNewTeacherNickname('');
      setNewTeacherActive(true);
      setNewTeacherClassIds(new Set());
      setShowAddTeacher(false);
      loadTeachers();
    } catch (err: any) {
      alert('新增老師失敗: ' + (err.message || ''));
    } finally {
      setAddingTeacher(false);
    }
  };

  // 切換老師啟用狀態
  const handleToggleTeacherActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/teachers?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (res.ok) {
        loadTeachers();
      } else {
        alert('更新失敗');
      }
    } catch (err) {
      alert('更新失敗');
    }
  };

  // 刪除老師
  const handleDeleteTeacher = async (id: string, username: string) => {
    if (!confirm(`確定要刪除老師「${username}」嗎？此操作無法復原。`)) return;

    try {
      const res = await fetch(`/api/admin/teachers?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadTeachers();
        alert('刪除成功');
      } else {
        alert('刪除失敗');
      }
    } catch (err) {
      alert('刪除失敗');
    }
  };

  useEffect(() => {
    if (showTeachers) {
      loadTeachers();
    }
  }, [showTeachers]);

  const loadExamQuestions = async () => {
    setExamLoading(true);
    setExamError('');
    try {
      const res = await fetch(`/api/admin/exam-questions?subject=${examSubjectTab}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setExamQuestions(data.data);
        setSelectedExamIds(new Set());
      } else {
        setExamError(data.error || '載入題庫失敗');
      }
    } catch (err: any) {
      setExamError(err.message || '載入題庫失敗');
    } finally {
      setExamLoading(false);
    }
  };

  const parseJsonInput = (value: string) => {
    if (!value.trim()) return null;
    return JSON.parse(value);
  };

  const handleAddExamQuestion = async () => {
    setExamError('');
    if (!examForm.code.trim() || !examForm.description.trim() || !examForm.answer.trim()) {
      setExamError('請填寫必填欄位（代碼、題目、答案）');
      return;
    }

    let optionsValue: any = null;
    try {
      optionsValue = parseJsonInput(examForm.options);
      if (optionsValue && !Array.isArray(optionsValue)) {
        setExamError('選項格式需為 JSON 陣列');
        return;
      }
    } catch (err) {
      setExamError('選項格式錯誤，請輸入 JSON 陣列');
      return;
    }

    let answerValue: any = examForm.answer.trim();
    try {
      answerValue = parseJsonInput(examForm.answer);
    } catch (err) {
      answerValue = examForm.answer.trim();
    }

    setExamLoading(true);
    try {
      const res = await fetch('/api/admin/exam-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: examSubjectTab,
          year: examForm.year ? Number(examForm.year) : null,
          code: examForm.code.trim(),
          description: examForm.description.trim(),
          options: optionsValue,
          answer: answerValue,
          explanation: examForm.explanation.trim() || null,
          difficulty: examForm.difficulty.trim() || null,
          is_active: examForm.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setExamError(data.error || '新增失敗');
        return;
      }
      setExamForm({
        year: '',
        code: '',
        description: '',
        options: '',
        answer: '',
        explanation: '',
        difficulty: '',
        isActive: true,
      });
      loadExamQuestions();
    } catch (err: any) {
      setExamError(err.message || '新增失敗');
    } finally {
      setExamLoading(false);
    }
  };

  const handleEditExamQuestion = (q: any) => {
    setExamForm({
      year: q.year ? String(q.year) : '',
      code: q.code || '',
      description: q.description || '',
      options: Array.isArray(q.options) || typeof q.options === 'object' ? JSON.stringify(q.options) : '',
      answer:
        Array.isArray(q.answer) || typeof q.answer === 'object'
          ? JSON.stringify(q.answer)
          : String(q.answer ?? ''),
      explanation: q.explanation || '',
      difficulty: q.difficulty || '',
      isActive: typeof q.is_active === 'boolean' ? q.is_active : true,
    });
  };

  const handleDeleteExamQuestion = async (id: string) => {
    if (!confirm('確定要移除此題目？此操作無法復原。')) return;
    setExamDeleteLoading(true);
    setExamError('');
    try {
      const res = await fetch('/api/admin/exam-questions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setExamError(data.error || '移除失敗');
        return;
      }
      await loadExamQuestions();
    } catch (err: any) {
      setExamError(err.message || '移除失敗');
    } finally {
      setExamDeleteLoading(false);
    }
  };

  const handleBatchDeleteExamQuestions = async () => {
    if (selectedExamIds.size === 0) {
      alert('請至少選擇一題要移除');
      return;
    }
    if (!confirm(`確定要批次移除 ${selectedExamIds.size} 題？此操作無法復原。`)) return;
    setExamDeleteLoading(true);
    setExamError('');
    try {
      const res = await fetch('/api/admin/exam-questions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedExamIds), subject: examSubjectTab }),
      });
      const data = await res.json();
      if (!res.ok) {
        setExamError(data.error || '批次移除失敗');
        return;
      }
      await loadExamQuestions();
    } catch (err: any) {
      setExamError(err.message || '批次移除失敗');
    } finally {
      setExamDeleteLoading(false);
    }
  };

  const handleExamImport = async () => {
    if (!examImportText.trim()) {
      setExamError('請輸入 CSV 內容');
      return;
    }
    setExamImportLoading(true);
    setExamError('');
    setExamImportResult(null);
    try {
      const parseCsvLine = (line: string) => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            const next = line[i + 1];
            if (inQuotes && next === '"') {
              current += '"';
              i++;
              continue;
            }
            inQuotes = !inQuotes;
            continue;
          }
          if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
            continue;
          }
          current += char;
        }
        result.push(current);
        return result.map((value) => value.trim());
      };

      const lines = examImportText.trim().split(/\r?\n/);
      if (lines.length < 2) {
        setExamError('CSV 內容至少需要一列標題與一列資料');
        return;
      }
      const headers = parseCsvLine(lines[0]);
      const rows = lines.slice(1).map((line) => {
        if (!line.trim()) return null;
        const cols = parseCsvLine(line);
        const row: any = {};
        headers.forEach((h, idx) => {
          row[h] = cols[idx] ?? '';
        });
        if (row.options) {
          try {
            row.options = JSON.parse(row.options);
          } catch (err) {
            row.options = row.options;
          }
        }
        if (row.answer) {
          try {
            row.answer = JSON.parse(row.answer);
          } catch (err) {
            row.answer = row.answer;
          }
        }
        if (row.year) {
          row.year = Number(row.year);
        }
        if (row.is_active !== undefined && row.is_active !== '') {
          row.is_active = row.is_active === 'true' || row.is_active === '1';
        }
        return row;
      }).filter(Boolean);

      const res = await fetch('/api/admin/exam-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: examSubjectTab, records: rows }),
      });
      const data = await res.json();
      if (!res.ok) {
        setExamError(data.error || '匯入失敗');
        return;
      }
      setExamImportResult({
        successCount: data.successCount,
        errorCount: data.errorCount,
        errors: data.errors,
      });
      setExamImportText('');
      loadExamQuestions();
    } catch (err: any) {
      setExamError(err.message || '匯入失敗');
    } finally {
      setExamImportLoading(false);
    }
  };

  useEffect(() => {
    if (showExamQuestions) {
      loadExamQuestions();
    }
  }, [showExamQuestions, examSubjectTab]);

  const handleStudentImport = async () => {
    if (!studentImportText.trim()) {
      alert('請輸入 JSON 格式的學生資料');
      return;
    }

    setStudentImportLoading(true);
    setError('');
    setStudentImportResult(null);

    try {
      let studentsData;
      try {
        studentsData = JSON.parse(studentImportText);
      } catch (parseError) {
        alert('JSON 格式錯誤，請檢查輸入的內容');
        setStudentImportLoading(false);
        return;
      }

      if (!Array.isArray(studentsData)) {
        alert('輸入的資料必須是一個陣列');
        setStudentImportLoading(false);
        return;
      }

      const res = await fetch('/api/admin/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: studentsData }),
      });

      const data = await res.json();
      if (res.ok) {
        setStudentImportResult({
          successCount: data.successCount,
          errorCount: data.errorCount,
          errors: data.errors,
        });
        setStudentImportText('');
        loadStudents();
        alert(`成功匯入 ${data.successCount} 名學生${data.errorCount > 0 ? `，失敗 ${data.errorCount} 名` : ''}`);
      } else {
        alert(data.error || '批次匯入失敗');
      }
    } catch (err: any) {
      alert('批次匯入失敗: ' + (err.message || ''));
    } finally {
      setStudentImportLoading(false);
    }
  };

  const handleLoadStudentExample = () => {
    const example = [
      {
        name: '王小明',
        password: 'Wang2024!'
      },
      {
        name: '李小華',
        password: 'Li2024@'
      },
      {
        name: '張小美',
        password: 'Zhang2024#'
      }
    ];
    setStudentImportText(JSON.stringify(example, null, 2));
  };

  const handleToggleStudentActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/students?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (res.ok) {
        loadStudents();
      } else {
        alert('更新失敗');
      }
    } catch (err) {
      alert('更新失敗');
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`確定要刪除學生「${name}」嗎？此操作無法復原。`)) return;

    try {
      const res = await fetch(`/api/admin/students?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadStudents();
        alert('刪除成功');
      } else {
        alert('刪除失敗');
      }
    } catch (err) {
      alert('刪除失敗');
    }
  };

  const handleAddStudent = async () => {
    if (!newStudentName.trim()) {
      alert('請輸入學生姓名');
      return;
    }
    if (!newStudentPassword.trim()) {
      alert('請輸入學生密碼');
      return;
    }

    setAddingStudent(true);
    try {
      // 先新增學生
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStudentName.trim(),
          password: newStudentPassword,
          is_active: newStudentActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '新增學生失敗');
        return;
      }

      // 如果有選擇班級，更新學生所屬的班級
      if (newStudentClassIds.size > 0) {
        const classRes = await fetch('/api/admin/student-classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: data.data.id,
            classIds: Array.from(newStudentClassIds),
          }),
        });

        if (!classRes.ok) {
          const classData = await classRes.json();
          alert(`學生新增成功，但設定班級失敗：${classData.error || '未知錯誤'}`);
        } else {
          alert('新增學生成功');
        }
      } else {
        alert('新增學生成功');
      }

      setNewStudentName('');
      setNewStudentPassword('');
      setNewStudentActive(true);
      setNewStudentClassIds(new Set());
      setShowAddStudent(false);
      loadStudents();
    } catch (err: any) {
      alert('新增學生失敗: ' + (err.message || ''));
    } finally {
      setAddingStudent(false);
    }
  };

  useEffect(() => {
    if (showStudents) {
      loadStudents();
      loadClasses(); // 載入班級列表（用於選擇學生的班級）
    }
  }, [showStudents]);

  // 載入學生所屬的班級
  const loadStudentClasses = async (studentId: string) => {
    setLoadingStudentClasses(studentId);
    try {
      const res = await fetch(`/api/admin/student-classes?studentId=${studentId}`);
      const data = await res.json();
      if (res.ok && data.classIds) {
        setEditStudentClassIds(new Set(data.classIds));
      }
    } catch (err) {
      console.error('載入學生所屬的班級失敗:', err);
    } finally {
      setLoadingStudentClasses(null);
    }
  };

  // 開始編輯學生
  const handleStartEditStudent = async (student: any) => {
    setEditingStudentId(student.id);
    setEditStudentName(student.name);
    setEditStudentPassword(''); // 密碼留空，只有要修改時才填
    setEditStudentActive(student.is_active);
    await loadStudentClasses(student.id);
  };

  // 取消編輯
  const handleCancelEditStudent = () => {
    setEditingStudentId(null);
    setEditStudentName('');
    setEditStudentPassword('');
    setEditStudentActive(true);
    setEditStudentClassIds(new Set());
  };

  // 更新學生
  const handleUpdateStudent = async () => {
    if (!editingStudentId) return;
    if (!editStudentName.trim()) {
      alert('請輸入學生姓名');
      return;
    }

    setUpdatingStudent(true);
    try {
      // 更新學生資料
      const updateData: any = {
        name: editStudentName.trim(),
        is_active: editStudentActive,
      };

      // 只有當密碼欄位有值時才更新密碼
      if (editStudentPassword.trim()) {
        updateData.password = editStudentPassword;
      }

      const res = await fetch(`/api/admin/students?id=${editingStudentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '更新學生失敗');
        return;
      }

      // 更新學生所屬的班級
      const classRes = await fetch('/api/admin/student-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: editingStudentId,
          classIds: Array.from(editStudentClassIds),
        }),
      });

      if (!classRes.ok) {
        const classData = await classRes.json();
        alert(`學生資料更新成功，但更新班級失敗：${classData.error || '未知錯誤'}`);
      } else {
        alert('更新成功');
      }

      handleCancelEditStudent();
      loadStudents();
    } catch (err: any) {
      alert('更新失敗: ' + (err.message || ''));
    } finally {
      setUpdatingStudent(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">題庫管理</h1>
          <div className="flex space-x-2">
            <Link
              href="/admin/brand"
              className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
            >
              品牌設定
            </Link>
            <button
              onClick={() => {
                setShowStudents(!showStudents);
                setShowRecipients(false);
                setShowExamQuestions(false);
              }}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              {showStudents ? '隱藏學生管理' : '學生管理'}
            </button>
            <button
              onClick={() => {
                setShowRecipients(!showRecipients);
                setShowStudents(false);
                setShowParentLinks(false);
                setShowExamQuestions(false);
              }}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              {showRecipients ? '隱藏接收者管理' : '接收者管理'}
            </button>
            <button
              onClick={() => {
                setShowParentLinks(!showParentLinks);
                setShowStudents(false);
                setShowRecipients(false);
                setShowTeachers(false);
                setShowExamQuestions(false);
              }}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {showParentLinks ? '隱藏家長連結' : '家長連結'}
            </button>
            <button
              onClick={() => {
                setShowTeachers(!showTeachers);
                setShowStudents(false);
                setShowRecipients(false);
                setShowParentLinks(false);
                setShowClasses(false);
                setShowExamQuestions(false);
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              {showTeachers ? '隱藏老師管理' : '老師管理'}
            </button>
            <button
              onClick={() => {
                setShowClasses(!showClasses);
                setShowStudents(false);
                setShowRecipients(false);
                setShowParentLinks(false);
                setShowTeachers(false);
                setShowExamQuestions(false);
              }}
              className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
            >
              {showClasses ? '隱藏班級管理' : '班級管理'}
            </button>
            <button
              onClick={() => {
                setShowExamQuestions(!showExamQuestions);
                setShowStudents(false);
                setShowRecipients(false);
                setShowParentLinks(false);
                setShowTeachers(false);
                setShowClasses(false);
              }}
              className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
            >
              {showExamQuestions ? '隱藏會考題庫' : '會考弱點分析題庫'}
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              ← 返回首頁
            </Link>
          </div>
        </div>

        {/* 會考弱點分析題庫 */}
        {showExamQuestions && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">會考弱點分析題庫</h2>

            <div className="flex space-x-2 mb-4">
              <button
                type="button"
                onClick={() => setExamSubjectTab('math')}
                className={`px-3 py-2 rounded text-sm ${
                  examSubjectTab === 'math'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                數學會考題庫
              </button>
              <button
                type="button"
                onClick={() => setExamSubjectTab('physics')}
                className={`px-3 py-2 rounded text-sm ${
                  examSubjectTab === 'physics'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                理化會考題庫
              </button>
            </div>

            {examError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {examError}
              </div>
            )}

            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-semibold mb-3">新增題目（單筆）</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">年度（可選）</label>
                  <input
                    type="number"
                    value={examForm.year}
                    onChange={(e) => setExamForm({ ...examForm, year: e.target.value })}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">題目代碼（必填）</label>
                  <input
                    type="text"
                    value={examForm.code}
                    onChange={(e) => setExamForm({ ...examForm, code: e.target.value })}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如 EXAM-001"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">題目內容（必填）</label>
                  <textarea
                    value={examForm.description}
                    onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="請輸入題目描述"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">選項（JSON 陣列，可選）</label>
                  <textarea
                    value={examForm.options}
                    onChange={(e) => setExamForm({ ...examForm, options: e.target.value })}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                    rows={3}
                    placeholder='例如 ["A", "B", "C", "D"]'
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">答案（必填）</label>
                  <textarea
                    value={examForm.answer}
                    onChange={(e) => setExamForm({ ...examForm, answer: e.target.value })}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="可輸入文字或 JSON"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">解析（可選）</label>
                  <textarea
                    value={examForm.explanation}
                    onChange={(e) => setExamForm({ ...examForm, explanation: e.target.value })}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="解析/說明"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">難度（可選）</label>
                  <input
                    type="text"
                    value={examForm.difficulty}
                    onChange={(e) => setExamForm({ ...examForm, difficulty: e.target.value })}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="easy / medium / hard"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={examForm.isActive}
                    onChange={(e) => setExamForm({ ...examForm, isActive: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">啟用</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddExamQuestion}
                  disabled={examLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {examLoading ? '處理中...' : '插入/更新題目'}
                </button>
                <button
                  onClick={() =>
                    setExamForm({
                      year: '',
                      code: '',
                      description: '',
                      options: '',
                      answer: '',
                      explanation: '',
                      difficulty: '',
                      isActive: true,
                    })
                  }
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  清除
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                代碼重複會自動更新（upsert）。
              </p>
            </div>

            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">批次匯入（CSV）</h3>
                <button
                  onClick={() => setShowExamImport(!showExamImport)}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {showExamImport ? '隱藏匯入' : '顯示匯入'}
                </button>
              </div>
              {showExamImport && (
                <>
                  <div className="mb-3 text-xs text-gray-600">
                    欄位：code,description,answer,year,options,explanation,difficulty,is_active
                  </div>
                  <div className="mb-3 text-xs text-gray-600">
                    範例（會依目前 Tab 科目匯入）：
                  </div>
                  <pre className="mb-3 rounded border border-gray-200 bg-white p-3 text-xs text-gray-700 overflow-x-auto">
{`code,description,answer,year,options,explanation,difficulty,is_active
M-2022-01,"已知直角三角形兩邊 3,4，求斜邊長","5",2022,"[""3"",""4"",""5"",""6""]","依畢氏定理，斜邊=5",easy,true
M-2022-02,"解二元一次聯立方程式：x+y=7, x-y=1","x=4, y=3",2022,,相加消去 y,easy,true
P-2021-05,"下列何者屬於氧化反應？","鐵生鏽",2021,"[""鐵生鏽"",""冰融化"",""鹽溶於水"",""水蒸發""]","氧化為與氧反應",easy,true`}
                  </pre>
                  <textarea
                    value={examImportText}
                    onChange={(e) => setExamImportText(e.target.value)}
                    className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
                    rows={8}
                    placeholder={`code,description,answer,year,options,explanation,difficulty,is_active
M-2022-01,"已知直角三角形兩邊 3,4，求斜邊長","5",2022,"[""3"",""4"",""5"",""6""]","依畢氏定理，斜邊=5",easy,true
M-2022-02,"解二元一次聯立方程式：x+y=7, x-y=1","x=4, y=3",2022,,相加消去 y,easy,true
P-2021-05,"下列何者屬於氧化反應？","鐵生鏽",2021,"[""鐵生鏽"",""冰融化"",""鹽溶於水"",""水蒸發""]","氧化為與氧反應",easy,true`}
                  />

                  {examImportResult && (
                    <div className={`mb-3 p-3 rounded ${
                      examImportResult.successCount > 0
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className={`font-semibold ${
                        examImportResult.successCount > 0 ? 'text-green-900' : 'text-red-900'
                      }`}>
                        成功匯入 {examImportResult.successCount} 筆
                        {examImportResult.errorCount > 0 && `，失敗 ${examImportResult.errorCount} 筆`}
                      </p>
                      {examImportResult.errors && examImportResult.errors.length > 0 && (
                        <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                          {examImportResult.errors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={handleExamImport}
                      disabled={examImportLoading || !examImportText.trim()}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {examImportLoading ? '匯入中...' : '開始匯入'}
                    </button>
                    <button
                      onClick={() => {
                        setShowExamImport(false);
                        setExamImportText('');
                        setExamImportResult(null);
                      }}
                      className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                    >
                      取消
                    </button>
                  </div>
                </>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">題庫列表</h3>
                <button
                  onClick={handleBatchDeleteExamQuestions}
                  disabled={examDeleteLoading || selectedExamIds.size === 0}
                  className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {examDeleteLoading ? '移除中...' : `批次移除${selectedExamIds.size ? ` (${selectedExamIds.size})` : ''}`}
                </button>
              </div>
              {examLoading ? (
                <p className="text-sm text-gray-500">載入中...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-center p-2">
                          <input
                            type="checkbox"
                            checked={examQuestions.length > 0 && selectedExamIds.size === examQuestions.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExamIds(new Set(examQuestions.map((q) => q.id)));
                              } else {
                                setSelectedExamIds(new Set());
                              }
                            }}
                          />
                        </th>
                        <th className="text-left p-2">代碼</th>
                        <th className="text-left p-2">題目</th>
                        <th className="text-center p-2">年度</th>
                        <th className="text-center p-2">狀態</th>
                        <th className="text-center p-2">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examQuestions.map((q) => (
                        <tr key={q.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 text-center">
                            <input
                              type="checkbox"
                              checked={selectedExamIds.has(q.id)}
                              onChange={() => {
                                setSelectedExamIds((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(q.id)) {
                                    next.delete(q.id);
                                  } else {
                                    next.add(q.id);
                                  }
                                  return next;
                                });
                              }}
                            />
                          </td>
                          <td className="p-2 font-medium">{q.code}</td>
                          <td className="p-2 text-xs text-gray-700">{q.description}</td>
                          <td className="p-2 text-center text-xs text-gray-600">{q.year || '-'}</td>
                          <td className="p-2 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              q.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {q.is_active ? '啟用' : '停用'}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditExamQuestion(q)}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                              >
                                編輯
                              </button>
                              <button
                                onClick={() => handleDeleteExamQuestion(q.id)}
                                disabled={examDeleteLoading}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                              >
                                移除
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {examQuestions.length === 0 && (
                    <p className="text-center text-gray-500 py-4">尚無題目</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 學生管理區塊 */}
        {showStudents && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">學生管理</h2>
            
            {/* 功能按鈕 */}
            <div className="mb-6 flex space-x-4">
              <button
                onClick={() => {
                  setShowAddStudent(!showAddStudent);
                  setShowStudentImport(false);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {showAddStudent ? '隱藏新增學生' : '新增學生'}
              </button>
              <button
                onClick={() => {
                  setShowStudentImport(!showStudentImport);
                  setShowAddStudent(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {showStudentImport ? '隱藏批次匯入' : '批次匯入學生'}
              </button>
            </div>

            {/* 單筆新增學生 */}
            {showAddStudent && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded-lg">
                <h3 className="font-semibold mb-3">新增學生帳號</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      學生姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="請輸入學生姓名"
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      學生密碼 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={newStudentPassword}
                      onChange={(e) => setNewStudentPassword(e.target.value)}
                      placeholder="請輸入學生密碼"
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">帳號狀態</label>
                    <select
                      value={newStudentActive ? 'true' : 'false'}
                      onChange={(e) => setNewStudentActive(e.target.value === 'true')}
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="true">啟用</option>
                      <option value="false">停用</option>
                    </select>
                  </div>
                </div>
                
                {/* 選擇所屬的班級 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">所屬的班級（可多選）</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-3 bg-white">
                    {classes.map((cls) => (
                      <label key={cls.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newStudentClassIds.has(cls.id)}
                          onChange={(e) => {
                            const newSet = new Set(newStudentClassIds);
                            if (e.target.checked) {
                              newSet.add(cls.id);
                            } else {
                              newSet.delete(cls.id);
                            }
                            setNewStudentClassIds(newSet);
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {cls.name} {cls.school_year ? `(${cls.school_year})` : ''}
                        </span>
                      </label>
                    ))}
                  </div>
                  {classes.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">尚無班級，請先建立班級</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleAddStudent}
                    disabled={addingStudent || !newStudentName.trim() || !newStudentPassword.trim()}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingStudent ? '新增中...' : '新增學生'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddStudent(false);
                      setNewStudentName('');
                      setNewStudentPassword('');
                      setNewStudentActive(true);
                      setNewStudentClassIds(new Set());
                    }}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* 編輯學生表單 */}
            {editingStudentId && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-300 rounded-lg">
                <h3 className="font-semibold mb-3">編輯學生資料</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      學生姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editStudentName}
                      onChange={(e) => setEditStudentName(e.target.value)}
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      密碼 <span className="text-gray-500 text-xs">（留空則不修改）</span>
                    </label>
                    <input
                      type="password"
                      value={editStudentPassword}
                      onChange={(e) => setEditStudentPassword(e.target.value)}
                      placeholder="留空則不修改密碼"
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">帳號狀態</label>
                    <select
                      value={editStudentActive ? 'true' : 'false'}
                      onChange={(e) => setEditStudentActive(e.target.value === 'true')}
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="true">啟用</option>
                      <option value="false">停用</option>
                    </select>
                  </div>
                </div>

                {/* 選擇所屬的班級 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">所屬的班級（可多選）</label>
                  {loadingStudentClasses === editingStudentId ? (
                    <p className="text-sm text-gray-500">載入中...</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-3 bg-white">
                      {classes.map((cls) => (
                        <label key={cls.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editStudentClassIds.has(cls.id)}
                            onChange={(e) => {
                              const newSet = new Set(editStudentClassIds);
                              if (e.target.checked) {
                                newSet.add(cls.id);
                              } else {
                                newSet.delete(cls.id);
                              }
                              setEditStudentClassIds(newSet);
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">
                            {cls.name} {cls.school_year ? `(${cls.school_year})` : ''}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  {classes.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">尚無班級，請先建立班級</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateStudent}
                    disabled={updatingStudent || !editStudentName.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingStudent ? '更新中...' : '儲存修改'}
                  </button>
                  <button
                    onClick={handleCancelEditStudent}
                    disabled={updatingStudent}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 disabled:opacity-50"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
            
            {/* 批次匯入 */}
            {showStudentImport && (
            <div className="mb-6">
                <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
                  <h3 className="font-semibold mb-3">批次匯入學生帳號</h3>
                  
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="font-semibold text-blue-900 mb-2">📋 輸入格式說明</h4>
                    <div className="text-sm text-blue-800 space-y-2">
                      <p><strong>格式：</strong>JSON 陣列格式，每個元素代表一名學生</p>
                      <p><strong>必要欄位：</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li><code>name</code>: 學生姓名（必須唯一）</li>
                        <li><code>password</code>: 學生密碼（會自動加密儲存）</li>
                      </ul>
                      <p><strong>可選欄位：</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li><code>is_active</code>: 是否啟用（預設 true）</li>
                      </ul>
                      <button
                        onClick={handleLoadStudentExample}
                        className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                      >
                        載入範例
                      </button>
                      <div className="mt-2">
                        <Link
                          href="/STUDENT_IMPORT_FORMAT.md"
                          target="_blank"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          查看完整格式說明 →
                        </Link>
                      </div>
                    </div>
                  </div>

                  <textarea
                    value={studentImportText}
                    onChange={(e) => setStudentImportText(e.target.value)}
                    className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                    rows={12}
                    placeholder='[\n  {\n    "name": "王小明",\n    "password": "Wang2024!"\n  },\n  {\n    "name": "李小華",\n    "password": "Li2024@"\n  }\n]'
                  />

                  {studentImportResult && (
                    <div className={`mb-4 p-3 rounded ${
                      studentImportResult.successCount > 0 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className={`font-semibold ${
                        studentImportResult.successCount > 0 ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {studentImportResult.successCount > 0 ? '✓' : '✗'} 
                        成功匯入 {studentImportResult.successCount} 名學生
                        {studentImportResult.errorCount > 0 && `，失敗 ${studentImportResult.errorCount} 名`}
                      </p>
                      {studentImportResult.errors && studentImportResult.errors.length > 0 && (
                        <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                          {studentImportResult.errors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={handleStudentImport}
                      disabled={studentImportLoading || !studentImportText.trim()}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {studentImportLoading ? '處理中...' : '批次匯入'}
                    </button>
                    <button
                      onClick={() => {
                        setShowStudentImport(false);
                        setStudentImportText('');
                        setStudentImportResult(null);
                      }}
                      className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                    >
                      取消
                    </button>
                  </div>
                </div>
            </div>
            )}

            {/* 學生列表 */}
            <div>
              <h3 className="font-semibold mb-3">學生列表</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">姓名</th>
                      <th className="text-center p-2">狀態</th>
                      <th className="text-left p-2">建立時間</th>
                      <th className="text-center p-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id} className={`border-b hover:bg-gray-50 ${editingStudentId === s.id ? 'bg-blue-50' : ''}`}>
                        <td className="p-2 font-medium">{s.name}</td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {s.is_active ? '啟用' : '停用'}
                          </span>
                        </td>
                        <td className="p-2 text-xs text-gray-600">
                          {new Date(s.created_at).toLocaleDateString('zh-TW')}
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex justify-center space-x-2">
                            {editingStudentId === s.id ? (
                              <span className="text-xs text-blue-600 font-medium">編輯中...</span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEditStudent(s)}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                >
                                  編輯
                                </button>
                                <button
                                  onClick={() => handleToggleStudentActive(s.id, s.is_active)}
                                  className={`px-2 py-1 text-xs rounded ${
                                    s.is_active
                                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                                >
                                  {s.is_active ? '停用' : '啟用'}
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(s.id, s.name)}
                                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                  刪除
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {students.length === 0 && (
                  <p className="text-center text-gray-500 py-4">尚無學生</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 家長連結管理區塊 */}
        {showParentLinks && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">家長連結管理</h2>
            <p className="text-gray-600 mb-4">產生分享連結，讓家長可以查看學生的弱點分析報告（7天有效）</p>
            
            {/* 選擇班級和學生 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3">選擇學生</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">選擇班級</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">請選擇班級</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} {cls.school_year ? `(${cls.school_year})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">選擇學生</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!selectedClassId}
                  >
                    <option value="">請先選擇班級</option>
                    {classMembers.map((member) => {
                      const student = (member.students as any);
                      return (
                        <option key={member.student_id} value={member.student_id}>
                          {student?.name || member.student_id}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleGenerateParentLink}
                disabled={!selectedStudentId || generatingLink}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {generatingLink ? '產生中...' : '產生家長連結'}
              </button>
            </div>

            {/* 顯示生成的連結 */}
            {generatedLink && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold mb-2 text-green-800">連結已生成（有效期 7 天）</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    複製連結
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">可以將此連結分享給家長，他們可以查看該學生的弱點分析報告</p>
              </div>
            )}

            {/* 或直接選擇學生（不透過班級） */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold mb-3">或直接選擇學生（不透過班級）</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">選擇學生</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">請選擇學生</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGenerateParentLink}
                disabled={!selectedStudentId || generatingLink}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {generatingLink ? '產生中...' : '產生家長連結'}
              </button>
            </div>
          </div>
        )}

        {/* 班級管理區塊 */}
        {showClasses && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">班級管理</h2>
            
            {/* 功能按鈕 */}
            <div className="mb-6">
              <button
                onClick={() => {
                  setShowAddClass(!showAddClass);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {showAddClass ? '隱藏新增班級' : '新增班級'}
              </button>
            </div>

            {/* 新增班級表單 */}
            {showAddClass && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded-lg">
                <h3 className="font-semibold mb-3">新增班級</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      班級名稱 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder="例如：一年級A班"
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">學年度</label>
                    <input
                      type="text"
                      value={newClassSchoolYear}
                      onChange={(e) => setNewClassSchoolYear(e.target.value)}
                      placeholder="例如：2024"
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">學期</label>
                    <input
                      type="text"
                      value={newClassSemester}
                      onChange={(e) => setNewClassSemester(e.target.value)}
                      placeholder="例如：上學期"
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddClass}
                      disabled={addingClass || !newClassName.trim()}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingClass ? '新增中...' : '新增班級'}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddClass(false);
                    setNewClassName('');
                    setNewClassSchoolYear('');
                    setNewClassSemester('');
                  }}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  取消
                </button>
              </div>
            )}

            {/* 編輯班級表單 */}
            {editingClassId && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-300 rounded-lg">
                <h3 className="font-semibold mb-3">編輯班級</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      班級名稱 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editClassName}
                      onChange={(e) => setEditClassName(e.target.value)}
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">學年度</label>
                    <input
                      type="text"
                      value={editClassSchoolYear}
                      onChange={(e) => setEditClassSchoolYear(e.target.value)}
                      placeholder="例如：2024"
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">學期</label>
                    <input
                      type="text"
                      value={editClassSemester}
                      onChange={(e) => setEditClassSemester(e.target.value)}
                      placeholder="例如：上學期"
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-end space-x-2">
                    <button
                      onClick={handleUpdateClass}
                      disabled={updatingClass || !editClassName.trim()}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingClass ? '更新中...' : '儲存修改'}
                    </button>
                    <button
                      onClick={handleCancelEditClass}
                      disabled={updatingClass}
                      className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 disabled:opacity-50"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 班級列表 */}
            <div>
              <h3 className="font-semibold mb-3">班級列表</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">班級名稱</th>
                      <th className="text-left p-2">學年度</th>
                      <th className="text-left p-2">學期</th>
                      <th className="text-center p-2">狀態</th>
                      <th className="text-left p-2">建立時間</th>
                      <th className="text-center p-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((cls) => (
                      <tr key={cls.id} className={`border-b hover:bg-gray-50 ${editingClassId === cls.id ? 'bg-blue-50' : ''}`}>
                        <td className="p-2 font-medium">{cls.name}</td>
                        <td className="p-2">{cls.school_year || '-'}</td>
                        <td className="p-2">{cls.semester || '-'}</td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            cls.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {cls.is_active ? '啟用' : '停用'}
                          </span>
                        </td>
                        <td className="p-2 text-xs text-gray-600">
                          {new Date(cls.created_at).toLocaleDateString('zh-TW')}
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex justify-center space-x-2">
                            {editingClassId === cls.id ? (
                              <span className="text-xs text-blue-600 font-medium">編輯中...</span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEditClass(cls)}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                >
                                  編輯
                                </button>
                                <button
                                  onClick={() => handleToggleClassActive(cls.id, cls.is_active)}
                                  className={`px-2 py-1 text-xs rounded ${
                                    cls.is_active
                                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                                >
                                  {cls.is_active ? '停用' : '啟用'}
                                </button>
                                <button
                                  onClick={() => handleDeleteClass(cls.id, cls.name)}
                                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                  刪除
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {classes.length === 0 && (
                  <p className="text-center text-gray-500 py-4">尚無班級</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 接收者管理區塊 */}
        {showRecipients && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">接收者管理（LINE 訊息接收者）</h2>
            
            {/* 新增表單 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3">新增接收者</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="學生 ID"
                  value={newRecipient.student_id}
                  onChange={(e) => setNewRecipient({ ...newRecipient, student_id: e.target.value })}
                  className="p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newRecipient.role}
                  onChange={(e) => setNewRecipient({ ...newRecipient, role: e.target.value as 'parent' | 'teacher' })}
                  className="p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="parent">家長</option>
                  <option value="teacher">老師</option>
                </select>
                <input
                  type="text"
                  placeholder="LINE User ID"
                  value={newRecipient.line_user_id}
                  onChange={(e) => setNewRecipient({ ...newRecipient, line_user_id: e.target.value })}
                  className="p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddRecipient}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  新增
                </button>
              </div>
            </div>

            {/* 接收者列表 */}
            <div>
              <h3 className="font-semibold mb-3">接收者列表</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">學生 ID</th>
                      <th className="text-left p-2">角色</th>
                      <th className="text-left p-2">LINE User ID</th>
                      <th className="text-center p-2">狀態</th>
                      <th className="text-center p-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipients.map((r) => (
                      <tr key={r.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{r.student_id}</td>
                        <td className="p-2">{r.role === 'parent' ? '家長' : '老師'}</td>
                        <td className="p-2 font-mono text-xs">{r.line_user_id}</td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            r.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {r.is_active ? '啟用' : '停用'}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleToggleRecipientActive(r.id, r.is_active)}
                              className={`px-2 py-1 text-xs rounded ${
                                r.is_active
                                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {r.is_active ? '停用' : '啟用'}
                            </button>
                            <button
                              onClick={() => handleDeleteRecipient(r.id)}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              刪除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {recipients.length === 0 && (
                  <p className="text-center text-gray-500 py-4">尚無接收者</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 老師管理區塊 */}
        {showTeachers && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">老師管理</h2>
            
            {/* 功能按鈕 */}
            <div className="mb-6">
              <button
                onClick={() => {
                  setShowAddTeacher(!showAddTeacher);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {showAddTeacher ? '隱藏新增老師' : '新增老師'}
              </button>
            </div>

            {/* 單筆新增老師 */}
            {showAddTeacher && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded-lg">
                <h3 className="font-semibold mb-3">新增老師帳號</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      帳號 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTeacherUsername}
                      onChange={(e) => setNewTeacherUsername(e.target.value)}
                      placeholder="請輸入帳號"
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      密碼 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={newTeacherPassword}
                      onChange={(e) => setNewTeacherPassword(e.target.value)}
                      placeholder="請輸入密碼"
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      暱稱 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTeacherNickname}
                      onChange={(e) => setNewTeacherNickname(e.target.value)}
                      placeholder="請輸入暱稱"
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">帳號狀態</label>
                    <select
                      value={newTeacherActive ? 'true' : 'false'}
                      onChange={(e) => setNewTeacherActive(e.target.value === 'true')}
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="true">啟用</option>
                      <option value="false">停用</option>
                    </select>
                  </div>
                </div>
                
                {/* 選擇管理的班級 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">管理的班級（可多選）</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-3 bg-white">
                    {classes.map((cls) => (
                      <label key={cls.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newTeacherClassIds.has(cls.id)}
                          onChange={(e) => {
                            const newSet = new Set(newTeacherClassIds);
                            if (e.target.checked) {
                              newSet.add(cls.id);
                            } else {
                              newSet.delete(cls.id);
                            }
                            setNewTeacherClassIds(newSet);
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {cls.name} {cls.school_year ? `(${cls.school_year})` : ''}
                        </span>
                      </label>
                    ))}
                  </div>
                  {classes.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">尚無班級，請先建立班級</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleAddTeacher}
                    disabled={addingTeacher || !newTeacherUsername.trim() || !newTeacherPassword.trim() || !newTeacherNickname.trim()}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingTeacher ? '新增中...' : '新增老師'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddTeacher(false);
                      setNewTeacherUsername('');
                      setNewTeacherPassword('');
                      setNewTeacherNickname('');
                      setNewTeacherActive(true);
                      setNewTeacherClassIds(new Set());
                    }}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* 編輯老師表單 */}
            {editingTeacherId && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-300 rounded-lg">
                <h3 className="font-semibold mb-3">編輯老師資料</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      帳號 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editTeacherUsername}
                      onChange={(e) => setEditTeacherUsername(e.target.value)}
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      密碼 <span className="text-gray-500 text-xs">（留空則不修改）</span>
                    </label>
                    <input
                      type="password"
                      value={editTeacherPassword}
                      onChange={(e) => setEditTeacherPassword(e.target.value)}
                      placeholder="留空則不修改密碼"
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      暱稱 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editTeacherNickname}
                      onChange={(e) => setEditTeacherNickname(e.target.value)}
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">帳號狀態</label>
                    <select
                      value={editTeacherActive ? 'true' : 'false'}
                      onChange={(e) => setEditTeacherActive(e.target.value === 'true')}
                      className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="true">啟用</option>
                      <option value="false">停用</option>
                    </select>
                  </div>
                </div>

                {/* 選擇管理的班級 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">管理的班級（可多選）</label>
                  {loadingTeacherClasses === editingTeacherId ? (
                    <p className="text-sm text-gray-500">載入中...</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-3 bg-white">
                      {classes.map((cls) => (
                        <label key={cls.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editTeacherClassIds.has(cls.id)}
                            onChange={(e) => {
                              const newSet = new Set(editTeacherClassIds);
                              if (e.target.checked) {
                                newSet.add(cls.id);
                              } else {
                                newSet.delete(cls.id);
                              }
                              setEditTeacherClassIds(newSet);
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">
                            {cls.name} {cls.school_year ? `(${cls.school_year})` : ''}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  {classes.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">尚無班級，請先建立班級</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateTeacher}
                    disabled={updatingTeacher || !editTeacherUsername.trim() || !editTeacherNickname.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingTeacher ? '更新中...' : '儲存修改'}
                  </button>
                  <button
                    onClick={handleCancelEditTeacher}
                    disabled={updatingTeacher}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 disabled:opacity-50"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* 老師列表 */}
            <div>
              <h3 className="font-semibold mb-3">老師列表</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">帳號</th>
                      <th className="text-left p-2">暱稱</th>
                      <th className="text-center p-2">狀態</th>
                      <th className="text-left p-2">建立時間</th>
                      <th className="text-center p-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((t) => (
                      <tr key={t.id} className={`border-b hover:bg-gray-50 ${editingTeacherId === t.id ? 'bg-blue-50' : ''}`}>
                        <td className="p-2 font-medium">{t.username}</td>
                        <td className="p-2">{t.nickname}</td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            t.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {t.is_active ? '啟用' : '停用'}
                          </span>
                        </td>
                        <td className="p-2 text-xs text-gray-600">
                          {new Date(t.created_at).toLocaleDateString('zh-TW')}
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex justify-center space-x-2">
                            {editingTeacherId === t.id ? (
                              <span className="text-xs text-blue-600 font-medium">編輯中...</span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEditTeacher(t)}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                >
                                  編輯
                                </button>
                                <button
                                  onClick={() => handleToggleTeacherActive(t.id, t.is_active)}
                                  className={`px-2 py-1 text-xs rounded ${
                                    t.is_active
                                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                                >
                                  {t.is_active ? '停用' : '啟用'}
                                </button>
                                <button
                                  onClick={() => handleDeleteTeacher(t.id, t.username)}
                                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                  刪除
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {teachers.length === 0 && (
                  <p className="text-center text-gray-500 py-4">尚無老師</p>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-2 text-red-900 font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：章節與題型 */}
          <div className="bg-white p-4 rounded-lg shadow">
            {/* 章節區塊 */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">章節</h2>
              <div className="space-x-2">
                <button
                  onClick={() => setShowAddChapter(!showAddChapter)}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  {showAddChapter ? '取消' : '新增'}
                </button>
              </div>
            </div>

            {showAddChapter && (
              <form onSubmit={handleAddChapter} className="mb-4 p-3 bg-gray-50 rounded">
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">章節 ID</label>
                  <input
                    type="text"
                    value={newChapterId}
                    onChange={(e) => setNewChapterId(e.target.value)}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例如：3-1"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">章節標題</label>
                  <input
                    type="text"
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例如：一元一次式化簡"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">年級（科目）</label>
                  <select
                    value={newChapterGradeId}
                    onChange={(e) => setNewChapterGradeId(e.target.value as GradeId)}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {GRADES.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">學期</label>
                  <select
                    value={newChapterTerm}
                    onChange={(e) => setNewChapterTerm(e.target.value as Term)}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {TERMS.map((term) => (
                      <option key={term.id} value={term.id}>
                        {term.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">插入位置</label>
                  <select
                    value={insertChapterAfter}
                    onChange={(e) => {
                      setInsertChapterAfter(e.target.value);
                      if (e.target.value === 'none') {
                        // 插入到最後
                        const maxSortOrder = filteredChapters.length > 0 
                          ? Math.max(...filteredChapters.map(ch => ch.sort_order))
                          : 0;
                        setNewChapterSortOrder(maxSortOrder + 1);
                      } else if (e.target.value) {
                        // 插入在指定章節之後
                        const afterChapter = filteredChapters.find(ch => ch.id === e.target.value);
                        if (afterChapter) {
                          setNewChapterSortOrder(afterChapter.sort_order + 1);
                        }
                      }
                    }}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">不使用插入（手動設定排序）</option>
                    <option value="none">插入到最後</option>
                    {groupedChapterList.map((group) => (
                      <optgroup key={`${group.gradeId}-${group.term}`} label={group.label}>
                        {group.items.map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            插入在「{ch.id} - {ch.title}」之後
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">
                    排序順序{insertChapterAfter ? '（自動計算）' : ''}
                  </label>
                  <input
                    type="number"
                    value={newChapterSortOrder}
                    onChange={(e) => setNewChapterSortOrder(parseInt(e.target.value) || 0)}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={insertChapterAfter !== ''}
                    placeholder={insertChapterAfter ? '將根據插入位置自動計算' : '手動設定'}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  {insertChapterAfter && insertChapterAfter !== 'none' ? '插入章節' : '新增章節'}
                </button>
              </form>
            )}

            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">科目</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubject('math');
                    setSelectedChapter('');
                    setSelectedType('');
                    setTypes([]);
                    setQuestions([]);
                  }}
                  className={`px-3 py-2 text-sm rounded border ${
                    selectedSubject === 'math'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  數學
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubject('science');
                    setSelectedChapter('');
                    setSelectedType('');
                    setTypes([]);
                    setQuestions([]);
                  }}
                  className={`px-3 py-2 text-sm rounded border ${
                    selectedSubject === 'science'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  理化
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  const confirmed = window.confirm(
                    '確定要清除科目選擇嗎？\n\n影響：目前選擇的科目、章節與題型會被清空，題目列表也會重置。'
                  );
                  if (!confirmed) return;
                  setSelectedSubject('');
                  setSelectedChapter('');
                  setSelectedType('');
                  setTypes([]);
                  setQuestions([]);
                }}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
              >
                清除科目選擇
              </button>
            </div>

            <div className="mb-2">
              <div
                className={`w-full p-2 border rounded text-left ${
                  selectedSubject ? 'bg-white text-gray-900 border-gray-300' : 'bg-gray-100 text-gray-400 border-gray-200'
                }`}
              >
                {selectedSubject ? '請選擇章節' : '請先選擇科目'}
              </div>
              <div className={`mt-2 border rounded bg-white ${!selectedSubject ? 'opacity-60' : ''}`}>
                {!selectedSubject ? (
                  <div className="p-3 text-sm text-gray-500">請先選擇科目</div>
                ) : bookChapterTree.length > 0 ? (
                  bookChapterTree.map((book) => {
                    const bookOpen = expandedBookKeys.has(book.key);
                    return (
                      <div key={book.key} className="border-b last:border-b-0">
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedBookKeys((prev) => {
                              const next = new Set(prev);
                              if (next.has(book.key)) {
                                next.delete(book.key);
                              } else {
                                next.add(book.key);
                              }
                              return next;
                            });
                          }}
                          className="w-full text-left px-3 py-2 text-sm font-semibold bg-gray-50 text-gray-800"
                        >
                          {bookOpen ? '[-] ' : '[+] '} {book.title}
                        </button>
                        {bookOpen && (
                          <div className="pl-4 py-1">
                            {book.sections.map((section) => {
                              const sectionKey = `${book.key}|${section.title}`;
                              const sectionOpen = expandedChapterGroupKeys.has(sectionKey);
                              return (
                                <div key={sectionKey} className="border-l border-gray-200">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setExpandedChapterGroupKeys((prev) => {
                                        const next = new Set(prev);
                                        if (next.has(sectionKey)) {
                                          next.delete(sectionKey);
                                        } else {
                                          next.add(sectionKey);
                                        }
                                        return next;
                                      });
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-gray-50"
                                  >
                                    {sectionOpen ? '[-] ' : '[+] '} {section.title}
                                  </button>
                                  {sectionOpen && (
                                    <div className="pl-4 py-1">
                                      {section.items.map((ch) => {
                                        const isExpanded = expandedChapterId === ch.id;
                                        const sectionCode = ch.id.replace(/^[a-z]\d+-/i, '');
                                        return (
                                          <div key={ch.id}>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setSelectedChapter(ch.id);
                                                setEditingChapter(null);
                                                setExpandedChapterId((prev) => (prev === ch.id ? '' : ch.id));
                                              }}
                                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                                                ch.id === selectedChapter ? 'bg-gray-100 font-medium' : ''
                                              }`}
                                            >
                                              {isExpanded ? '[-] ' : '[+] '} {sectionCode} {ch.title}
                                            </button>
                                            {isExpanded && selectedChapter === ch.id && (
                                              <div className="pl-6 py-2 border-l border-gray-200">
                                                {types.length === 0 ? (
                                                  <div className="text-xs text-gray-500">尚無題型</div>
                                                ) : (
                                                  <div className="space-y-1">
                                                    {types.map((type) => (
                                                      <button
                                                        key={type.id}
                                                        type="button"
                                                        onClick={() => setSelectedType(type.id)}
                                                        className={`w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-100 ${
                                                          type.id === selectedType ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                                                        }`}
                                                      >
                                                        {type.code} - {type.name}
                                                      </button>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : groupedChapterList.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">尚無章節</div>
                ) : (
                  groupedChapterList.map((group) => {
                    const groupKey = `${group.gradeId}|${group.term}`;
                    const groupOpen = expandedGroupKeys.has(groupKey);
                    return (
                      <div key={groupKey} className="border-b last:border-b-0">
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedGroupKeys((prev) => {
                              const next = new Set(prev);
                              if (next.has(groupKey)) {
                                next.delete(groupKey);
                              } else {
                                next.add(groupKey);
                              }
                              return next;
                            });
                          }}
                          className={`w-full text-left px-3 py-2 text-sm font-semibold ${
                            group.term === 'upper'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {groupOpen ? '[-] ' : '[+] '} {group.label}
                        </button>
                        {groupOpen && (
                          <div className="pl-4 py-1">
                            {group.items.map((ch) => {
                              const isExpanded = expandedChapterId === ch.id;
                              return (
                                <div key={ch.id}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedChapter(ch.id);
                                      setEditingChapter(null);
                                      setExpandedChapterId((prev) => (prev === ch.id ? '' : ch.id));
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                                      ch.id === selectedChapter ? 'bg-gray-100 font-medium' : ''
                                    }`}
                                  >
                                    {isExpanded ? '[-] ' : '[+] '} {ch.title}
                                  </button>
                                  {isExpanded && selectedChapter === ch.id && (
                                    <div className="pl-6 py-2 border-l border-gray-200">
                                      {types.length === 0 ? (
                                        <div className="text-xs text-gray-500">尚無題型</div>
                                      ) : (
                                        <div className="space-y-1">
                                          {types.map((type) => (
                                            <button
                                              key={type.id}
                                              type="button"
                                              onClick={() => setSelectedType(type.id)}
                                              className={`w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-100 ${
                                                type.id === selectedType ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                                              }`}
                                            >
                                              {type.code} - {type.name}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {selectedChapter && (
              <div className="space-y-2 mb-6">
                {editingChapter === selectedChapter ? (
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="mb-2">
                      <label className="block text-sm font-medium mb-1">章節 ID</label>
                      <input
                        type="text"
                        value={editChapterId}
                        onChange={(e) => setEditChapterId(e.target.value)}
                        className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      {editChapterId !== editingChapter && (
                        <p className="text-xs text-orange-600 mt-1">
                          ⚠️ 修改 ID 會更新所有相關的題型和題目資料
                        </p>
                      )}
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium mb-1">章節標題</label>
                      <input
                        type="text"
                        value={editChapterTitle}
                        onChange={(e) => setEditChapterTitle(e.target.value)}
                        className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium mb-1">年級（科目）</label>
                      <select
                        value={editChapterGradeId}
                        onChange={(e) => setEditChapterGradeId(e.target.value as GradeId)}
                        className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        {GRADES.map((grade) => (
                          <option key={grade.id} value={grade.id}>
                            {grade.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium mb-1">學期</label>
                      <select
                        value={editChapterTerm}
                        onChange={(e) => setEditChapterTerm(e.target.value as Term)}
                        className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        {TERMS.map((term) => (
                          <option key={term.id} value={term.id}>
                            {term.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium mb-1">排序順序</label>
                      <input
                        type="number"
                        value={editChapterSortOrder}
                        onChange={(e) => setEditChapterSortOrder(parseInt(e.target.value) || 0)}
                        className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSaveChapter(selectedChapter)}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        儲存
                      </button>
                      <button
                        onClick={handleCancelEditChapter}
                        className="flex-1 px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        const chapter = filteredChapters.find(ch => ch.id === selectedChapter);
                        if (chapter) handleEditChapter(chapter);
                      }}
                      className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      編輯章節
                    </button>
                    <button
                      onClick={() => handleDeleteChapter(selectedChapter)}
                      className="w-full px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      刪除章節
                    </button>
                  </>
                )}
              </div>
            )}

            {/* 題型區塊 */}
            <div className="flex justify-between items-center mb-4 mt-6">
              <h2 className="text-xl font-semibold">題型</h2>
              {selectedChapter && (
                <button
                  onClick={() => setShowAddType(!showAddType)}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  {showAddType ? '取消' : '新增'}
                </button>
              )}
            </div>

            {showAddType && selectedChapter && (
              <form onSubmit={handleAddType} className="mb-4 p-3 bg-gray-50 rounded">
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">題型名稱</label>
                  <input
                    type="text"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例如：變數與常數概念"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">題型代碼</label>
                  <input
                    type="text"
                    value={newTypeCode}
                    onChange={(e) => setNewTypeCode(e.target.value)}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例如：S01"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">描述（選填）</label>
                  <textarea
                    value={newTypeDescription}
                    onChange={(e) => setNewTypeDescription(e.target.value)}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">插入位置</label>
                  <select
                    value={insertTypeAfter}
                    onChange={(e) => {
                      setInsertTypeAfter(e.target.value);
                      if (e.target.value === 'none') {
                        // 插入到最後
                        const maxSortOrder = types.length > 0
                          ? Math.max(...types.map(type => type.sort_order))
                          : 0;
                        setNewTypeSortOrder(maxSortOrder + 1);
                      } else if (e.target.value) {
                        // 插入在指定題型之後
                        const afterType = types.find(type => type.id === e.target.value);
                        if (afterType) {
                          setNewTypeSortOrder(afterType.sort_order + 1);
                        }
                      }
                    }}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">不使用插入（手動設定排序）</option>
                    <option value="none">插入到最後</option>
                    {types.map((type) => (
                      <option key={type.id} value={type.id}>
                        插入在「{type.code} - {type.name}」之後
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">
                    排序順序{insertTypeAfter ? '（自動計算）' : ''}
                  </label>
                  <input
                    type="number"
                    value={newTypeSortOrder}
                    onChange={(e) => setNewTypeSortOrder(parseInt(e.target.value) || 0)}
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={insertTypeAfter !== ''}
                    placeholder={insertTypeAfter ? '將根據插入位置自動計算' : '手動設定'}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  {insertTypeAfter && insertTypeAfter !== 'none' ? '插入題型' : '新增題型'}
                </button>
              </form>
            )}

            <div className="space-y-2">
              {types.map((type) => (
                <div
                  key={type.id}
                  className={`p-2 border rounded ${
                    selectedType === type.id ? 'bg-blue-100' : ''
                  } ${!type.is_active ? 'opacity-50' : ''}`}
                >
                  {editingType === type.id ? (
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="mb-2">
                        <label className="block text-xs font-medium mb-1">題型名稱</label>
                        <input
                          type="text"
                          value={editTypeName}
                          onChange={(e) => setEditTypeName(e.target.value)}
                          className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block text-xs font-medium mb-1">題型代碼</label>
                        <input
                          type="text"
                          value={editTypeCode}
                          onChange={(e) => setEditTypeCode(e.target.value)}
                          className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block text-xs font-medium mb-1">描述</label>
                        <textarea
                          value={editTypeDescription}
                          onChange={(e) => setEditTypeDescription(e.target.value)}
                          className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block text-xs font-medium mb-1">排序順序</label>
                        <input
                          type="number"
                          value={editTypeSortOrder}
                          onChange={(e) => setEditTypeSortOrder(parseInt(e.target.value) || 0)}
                          className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveType(type.id)}
                          className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          儲存
                        </button>
                        <button
                          onClick={handleCancelEditType}
                          className="flex-1 px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer"
                      onClick={() => setSelectedType(type.id)}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">
                      {type.code} - {type.name}
                    </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditType(type);
                            }}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            編輯
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteType(type.id);
                            }}
                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            刪除
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">{type.description || ''}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleTypeActive(type);
                      }}
                      className={`text-xs px-2 py-1 rounded ${
                        type.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {type.is_active ? '啟用' : '停用'}
                    </button>
                  </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 右側：題目列表 */}
          <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">題目列表</h2>
              <div className="space-x-2">
                <button
                  onClick={handleExport}
                  disabled={!selectedChapter || !selectedType}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  匯出 JSON
                </button>
                <button
                  onClick={() => setShowBatchInput(!showBatchInput)}
                  disabled={!selectedChapter || !selectedType}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showBatchInput ? '關閉批次輸入' : '批次輸入'}
                </button>
                <Link
                  href={`/admin/question/new?chapterId=${selectedChapter}&typeId=${selectedType}`}
                  className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ${
                    !selectedChapter || !selectedType ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  新增題目
                </Link>
              </div>
            </div>

            {/* 批次輸入表單 */}
            {showBatchInput && selectedChapter && selectedType && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">批次輸入題目</h3>
                
                {/* 格式說明 */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="font-semibold text-blue-900 mb-2">📋 輸入格式說明</h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p><strong>格式：</strong>JSON 陣列格式，每個元素代表一道題目</p>
                    <p><strong>必要欄位：</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li><code>difficulty</code>: "easy" | "medium" | "hard"（難度）</li>
                      <li><code>qtype</code>: "input" | "mcq" | "word"（題型）</li>
                      <li><code>prompt</code>: 題目內容（字串）</li>
                      <li><code>answer</code>: 正確答案（字串）</li>
                    </ul>
                    <p><strong>可選欄位：</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li><code>choices</code>: 選項陣列（mcq 題型需要，至少 2 個選項）</li>
                      <li><code>correct_choice_index</code>: 正確選項索引（mcq 題型需要，從 0 開始）</li>
                      <li><code>equation</code>: 方程式（word 題型可選）</li>
                      <li><code>explain</code>: 解析說明（可選）</li>
                      <li><code>tags</code>: 標籤陣列（可選）</li>
                      <li><code>video_url</code>: 影片連結（可選）</li>
                    </ul>
                    <button
                      onClick={handleLoadExample}
                      className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      載入範例
                    </button>
                  </div>
                </div>

                {/* JSON 輸入框 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    題目資料（JSON 格式）
                  </label>
                  <textarea
                    value={batchInputText}
                    onChange={(e) => setBatchInputText(e.target.value)}
                    className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={12}
                    placeholder='[\n  {\n    "difficulty": "easy",\n    "qtype": "input",\n    "prompt": "計算 3 + 5 = ?",\n    "answer": "8",\n    "explain": "3 + 5 = 8"\n  }\n]'
                  />
                </div>

                {/* 結果顯示 */}
                {batchInputResult && (
                  <div className={`mb-4 p-3 rounded ${batchInputResult.success > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`font-semibold ${batchInputResult.success > 0 ? 'text-green-900' : 'text-red-900'}`}>
                      {batchInputResult.success > 0 ? '✓' : '✗'} 
                      成功新增 {batchInputResult.success} 題
                      {batchInputResult.failed > 0 && `，失敗 ${batchInputResult.failed} 題`}
                    </p>
                    {batchInputResult.errors && batchInputResult.errors.length > 0 && (
                      <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                        {batchInputResult.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    )}
                    {batchInputResult.success > 0 && (
                      <button
                        onClick={handleCompleteBatchInput}
                        className="mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        完成更新
                      </button>
                    )}
                  </div>
                )}

                {/* 操作按鈕 */}
                <div className="flex space-x-2">
                  <button
                    onClick={handleBatchInput}
                    disabled={batchInputLoading || !batchInputText.trim()}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {batchInputLoading ? '處理中...' : '批次新增題目'}
                  </button>
                  <button
                    onClick={() => {
                      setShowBatchInput(false);
                      setBatchInputText('');
                      setBatchInputResult(null);
                    }}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {!selectedChapter || !selectedType ? (
              <div className="text-center py-8 text-gray-500">
                請選擇章節和題型以查看題目
              </div>
            ) : loading ? (
              <div className="text-center py-8">載入中...</div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">尚無題目</div>
            ) : (
              <div className="space-y-4">
                {/* 批次刪除工具列 */}
                <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg mb-4">
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedQuestionIds.size === questions.length && questions.length > 0}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {selectedQuestionIds.size === questions.length && questions.length > 0
                          ? '取消全選'
                          : '全選'}
                      </span>
                    </label>
                    <span className="text-sm text-gray-600">
                      已選擇 {selectedQuestionIds.size} 題
                    </span>
                  </div>
                  {selectedQuestionIds.size > 0 && (
                    <button
                      onClick={handleBatchDeleteQuestions}
                      disabled={batchDeleteLoading}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {batchDeleteLoading ? '刪除中...' : `批次刪除 (${selectedQuestionIds.size})`}
                    </button>
                  )}
                </div>

                {/* 題目列表 */}
                {questions.map((q) => (
                  <div key={q.id} className="border rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedQuestionIds.has(q.id)}
                          onChange={() => handleToggleQuestionSelection(q.id)}
                          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <span className="text-sm text-gray-500">
                            {q.difficulty} | {q.qtype}
                          </span>
                          <p className="text-gray-800 mt-1">{q.prompt}</p>
                          <p className="text-sm text-gray-600 mt-2">答案: {q.answer}</p>
                        </div>
                      </div>
                      <div className="space-x-2 ml-4">
                        <Link
                          href={`/admin/question/${q.id}?chapterId=${selectedChapter}&typeId=${selectedType}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          編輯
                        </Link>
                        <Link
                          href={`/admin/question/new?chapterId=${selectedChapter}&typeId=${selectedType}&insertAfter=${q.id}`}
                          className="text-purple-600 hover:underline text-sm"
                        >
                          在此之後插入
                        </Link>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center"><p>載入中...</p></div>}>
      <AdminPageContent />
    </Suspense>
  );
}


