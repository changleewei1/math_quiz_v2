'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Question } from '@/types';

export default function EditQuestionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chapterId = searchParams.get('chapterId') || '';
  const typeId = searchParams.get('typeId') || '';
  const insertAfter = searchParams.get('insertAfter') || '';

  const [question, setQuestion] = useState<Partial<Question>>({
    difficulty: 'easy',
    qtype: 'input',
    prompt: '',
    answer: '',
    choices: null,
    correct_choice_index: null,
    equation: null,
    explain: null,
  });
  const [loading, setLoading] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [localInsertAfter, setLocalInsertAfter] = useState(insertAfter);

  useEffect(() => {
    if (params.id !== 'new') {
      loadQuestion();
    } else {
      // 新增模式：載入題目列表以顯示插入位置選項
      loadQuestions();
      // 如果 URL 中有 insertAfter 參數，更新本地狀態
      if (insertAfter && insertAfter !== localInsertAfter) {
        setLocalInsertAfter(insertAfter);
      }
    }
  }, [params.id, insertAfter, chapterId, typeId]);

  const loadQuestion = async () => {
    if (!params.id || params.id === 'new') return;
    
    setLoadingQuestion(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/question?id=${params.id}`);
      const data = await res.json();
      
      if (res.ok && data.data) {
        const q = data.data;
        setQuestion({
          difficulty: q.difficulty,
          qtype: q.qtype,
          prompt: q.prompt || '',
          answer: q.answer || '',
          choices: q.choices || null,
          correct_choice_index: q.correct_choice_index ?? null,
          equation: q.equation || null,
          explain: q.explain || null,
        });
      } else {
        setError(data.error || '載入題目失敗');
      }
    } catch (err: any) {
      setError('載入題目失敗：' + (err.message || '未知錯誤'));
    } finally {
      setLoadingQuestion(false);
    }
  };

  const loadQuestions = async () => {
    if (!chapterId || !typeId) return;
    try {
      const res = await fetch(`/api/admin/questions?chapterId=${chapterId}&typeId=${typeId}`);
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.data);
      }
    } catch (err) {
      // 忽略錯誤
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = params.id === 'new'
        ? '/api/admin/questions'
        : `/api/admin/question?id=${params.id}`;
      const method = params.id === 'new' ? 'POST' : 'PATCH';

      const body: any = {
        chapter_id: chapterId,
        type_id: typeId,
        difficulty: question.difficulty,
        qtype: question.qtype,
        prompt: question.prompt,
        answer: question.answer,
      };

      // 如果是插入模式，設定 created_at 來控制順序
      // 注意：題目是按 created_at 降序排列（最新的在前），所以要插入在某題之後，
      // 需要設定 created_at 比它稍早（減去時間），這樣會排在它後面
      const targetInsertAfter = localInsertAfter || insertAfter;
      if (params.id === 'new' && targetInsertAfter && targetInsertAfter !== 'none') {
        const afterQuestion = questions.find(q => q.id === targetInsertAfter);
        if (afterQuestion && afterQuestion.created_at) {
          // 設定 created_at 為目標題目的時間減去 1 秒（這樣會排在它之後）
          const afterDate = new Date(afterQuestion.created_at);
          afterDate.setSeconds(afterDate.getSeconds() - 1);
          body.created_at = afterDate.toISOString();
        }
      }

      if (question.qtype === 'mcq') {
        body.choices = question.choices;
        body.correct_choice_index = question.correct_choice_index;
      }

      if (question.qtype === 'word') {
        body.equation = question.equation;
      }

      if (question.explain) {
        body.explain = question.explain;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '儲存失敗');
        return;
      }

      router.push(`/admin?chapterId=${chapterId}&typeId=${typeId}`);
    } catch (err) {
      setError('儲存失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChoice = () => {
    const choices = question.choices || [];
    setQuestion({ ...question, choices: [...choices, ''] });
  };

  const handleChoiceChange = (index: number, value: string) => {
    const choices = [...(question.choices || [])];
    choices[index] = value;
    setQuestion({ ...question, choices });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {params.id === 'new' ? '新增題目' : '編輯題目'}
          </h1>
          <button
            onClick={() => {
              if (chapterId && typeId) {
                router.push(`/admin?chapterId=${chapterId}&typeId=${typeId}`);
              } else {
                router.back();
              }
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ← 返回上一頁
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        {loadingQuestion && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
            載入題目內容中...
          </div>
        )}

        {params.id === 'new' && questions.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <label className="block text-sm font-medium mb-2 text-blue-900">
              插入位置（選填）
            </label>
            <select
              value={localInsertAfter}
              onChange={(e) => setLocalInsertAfter(e.target.value)}
              className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">不使用插入（新增到最後）</option>
              {questions.map((q) => (
                <option key={q.id} value={q.id}>
                  插入在「{q.prompt.substring(0, 30)}{q.prompt.length > 30 ? '...' : ''}」之後
                </option>
              ))}
            </select>
            {localInsertAfter && localInsertAfter !== 'none' && (
              <p className="text-xs text-blue-700 mt-2">
                此題目將插入在選定題目之後
              </p>
            )}
          </div>
        )}
        
        {params.id === 'new' && insertAfter && insertAfter !== 'none' && !localInsertAfter && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>插入模式：</strong>此題目將插入在選定題目之後
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">難度</label>
              <select
                value={question.difficulty}
                onChange={(e) => setQuestion({ ...question, difficulty: e.target.value as any })}
                className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="easy">簡單</option>
                <option value="medium">中等</option>
                <option value="hard">困難</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">題型</label>
              <select
                value={question.qtype}
                onChange={(e) => setQuestion({ ...question, qtype: e.target.value as any })}
                className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="input">輸入題</option>
                <option value="mcq">選擇題</option>
                <option value="word">應用題</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">題目內容</label>
            <textarea
              value={question.prompt}
              onChange={(e) => setQuestion({ ...question, prompt: e.target.value })}
              className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
              rows={4}
              required
            />
          </div>

          {question.qtype === 'mcq' && (
            <div>
              <label className="block text-sm font-medium mb-1">選項</label>
              {(question.choices || []).map((choice, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={question.correct_choice_index === index}
                    onChange={() => setQuestion({ ...question, correct_choice_index: index })}
                    className="mr-2"
                  />
                  <input
                    type="text"
                    value={choice}
                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                    className="flex-1 p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                    placeholder={`選項 ${index + 1}`}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddChoice}
                className="mt-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                新增選項
              </button>
            </div>
          )}

          {question.qtype === 'word' && (
            <div>
              <label className="block text-sm font-medium mb-1">方程式（可選）</label>
              <input
                type="text"
                value={question.equation || ''}
                onChange={(e) => setQuestion({ ...question, equation: e.target.value })}
                className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">正確答案</label>
            <input
              type="text"
              value={question.answer}
              onChange={(e) => setQuestion({ ...question, answer: e.target.value })}
              className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">解析（可選）</label>
            <textarea
              value={question.explain || ''}
              onChange={(e) => setQuestion({ ...question, explain: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '儲存中...' : '儲存'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


