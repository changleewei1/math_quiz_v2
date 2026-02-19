'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

type ExamQuestion = {
  id: string;
  subject: 'math' | 'physics';
  exam_year: number | null;
  year?: number | null;
  code: string;
  description: string;
  options: any;
  answer: any;
  explanation?: string | null;
  difficulty?: string | null;
  question_no?: number | null;
  order_index?: number | null;
  is_active: boolean;
};

export default function AdminCapPage() {
  const [subject, setSubject] = useState<'math' | 'physics'>('math');
  const [years, setYears] = useState<Array<{ year: number; count: number; lastUpdated: string | null }>>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    code: '',
    description: '',
    options: '',
    answer: '',
    explanation: '',
    difficulty: '',
    questionNo: '',
    orderIndex: '',
    isActive: true,
  });
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [showExplainPreview, setShowExplainPreview] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement | null>(null);
  const explainRef = useRef<HTMLTextAreaElement | null>(null);
  const promptFileRef = useRef<HTMLInputElement | null>(null);
  const explainFileRef = useRef<HTMLInputElement | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importText, setImportText] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ successCount: number; errorCount: number; errors?: string[] } | null>(null);

  const loadYears = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/exam-questions/years?subject=${subject}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '載入年份失敗');
        return;
      }
      setYears(data.years || []);
      setSelectedYear(data.years?.[0]?.year ?? null);
    } catch (err: any) {
      setError(err.message || '載入年份失敗');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    if (!selectedYear) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/exam-questions?subject=${subject}&year=${selectedYear}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '載入題庫失敗');
        return;
      }
      setQuestions(data.data || []);
      setSelectedIds(new Set());
    } catch (err: any) {
      setError(err.message || '載入題庫失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadYears();
  }, [subject]);

  useEffect(() => {
    if (selectedYear) {
      loadQuestions();
    }
  }, [selectedYear]);

  const parseJsonInput = (value: string) => {
    if (!value.trim()) return null;
    return JSON.parse(value);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      code: '',
      description: '',
      options: '',
      answer: '',
      explanation: '',
      difficulty: '',
      questionNo: '',
      orderIndex: '',
      isActive: true,
    });
    setShowPromptPreview(false);
    setShowExplainPreview(false);
  };

  const handleSave = async () => {
    setError('');
    if (!selectedYear) {
      setError('請先選擇年份');
      return;
    }
    if (!form.code.trim() || !form.description.trim() || !form.answer.trim()) {
      setError('請填寫必填欄位（代碼、題目、答案）');
      return;
    }

    let optionsValue: any = null;
    try {
      optionsValue = parseJsonInput(form.options);
      if (optionsValue && !Array.isArray(optionsValue)) {
        setError('選項格式需為 JSON 陣列');
        return;
      }
    } catch {
      setError('選項格式錯誤，請輸入 JSON 陣列');
      return;
    }

    let answerValue: any = form.answer.trim();
    try {
      answerValue = parseJsonInput(form.answer);
    } catch {
      answerValue = form.answer.trim();
    }

    const payload: any = {
      subject,
      exam_year: selectedYear,
      year: selectedYear,
      code: form.code.trim(),
      description: form.description.trim(),
      description_md: form.description.trim() || null,
      options: optionsValue,
      answer: answerValue,
      explanation: form.explanation.trim() || null,
      explanation_md: form.explanation.trim() || null,
      difficulty: form.difficulty.trim() || null,
      question_no: form.questionNo ? Number(form.questionNo) : null,
      order_index: form.orderIndex ? Number(form.orderIndex) : null,
      is_active: form.isActive,
    };

    const res = await fetch('/api/admin/exam-questions', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingId ? { ...payload, id: editingId } : payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || (editingId ? '更新失敗' : '新增失敗'));
      return;
    }
    resetForm();
    loadQuestions();
  };

  const handleEdit = (q: ExamQuestion) => {
    setEditingId(q.id);
    setForm({
      code: q.code || '',
      description: q.description_md || q.description || '',
      options: Array.isArray(q.options) || typeof q.options === 'object' ? JSON.stringify(q.options) : '',
      answer:
        Array.isArray(q.answer) || typeof q.answer === 'object'
          ? JSON.stringify(q.answer)
          : String(q.answer ?? ''),
      explanation: q.explanation_md || q.explanation || '',
      difficulty: q.difficulty || '',
      questionNo: q.question_no ? String(q.question_no) : '',
      orderIndex: q.order_index ? String(q.order_index) : '',
      isActive: q.is_active ?? true,
    });
    setShowPromptPreview(false);
    setShowExplainPreview(false);
  };

  const handleInsert = (q: ExamQuestion) => {
    setEditingId(null);
    setForm({
      code: '',
      description: q.description_md || q.description || '',
      options: Array.isArray(q.options) || typeof q.options === 'object' ? JSON.stringify(q.options) : '',
      answer:
        Array.isArray(q.answer) || typeof q.answer === 'object'
          ? JSON.stringify(q.answer)
          : String(q.answer ?? ''),
      explanation: q.explanation_md || q.explanation || '',
      difficulty: q.difficulty || '',
      questionNo: q.question_no ? String(q.question_no) : '',
      orderIndex: q.order_index ? String(q.order_index) : '',
      isActive: q.is_active ?? true,
    });
    setShowPromptPreview(false);
    setShowExplainPreview(false);
  };

  const insertAtCursor = (ref: React.RefObject<HTMLTextAreaElement>, value: string, field: 'description' | 'explanation') => {
    const target = ref.current;
    if (!target) {
      setForm((prev) => ({ ...prev, [field]: `${prev[field] || ''}\n${value}` }));
      return;
    }
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? target.value.length;
    const nextValue = `${target.value.slice(0, start)}${value}${target.value.slice(end)}`;
    setForm((prev) => ({ ...prev, [field]: nextValue }));
    requestAnimationFrame(() => {
      target.focus();
      const cursor = start + value.length;
      target.setSelectionRange(cursor, cursor);
    });
  };

  const uploadImage = async (file: File, field: 'description' | 'explanation') => {
    if (!selectedYear) {
      setError('請先選擇年份');
      return;
    }
    setUploadingImage(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subject', subject);
      formData.append('exam_year', String(selectedYear));
      formData.append('question_no', form.questionNo || 'unknown');
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '上傳失敗');
        return;
      }
      const markdown = `![image](${data.url})`;
      insertAtCursor(field === 'description' ? promptRef : explainRef, markdown, field);
    } catch (err: any) {
      setError(err.message || '上傳失敗');
    } finally {
      setUploadingImage(false);
      if (field === 'description' && promptFileRef.current) promptFileRef.current.value = '';
      if (field === 'explanation' && explainFileRef.current) explainFileRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要移除此題目？')) return;
    const res = await fetch('/api/admin/exam-questions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || '移除失敗');
      return;
    }
    loadQuestions();
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) {
      alert('請至少選擇一題要移除');
      return;
    }
    if (!confirm(`確定要批次移除 ${selectedIds.size} 題？`)) return;
    const res = await fetch('/api/admin/exam-questions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selectedIds), subject }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || '批次移除失敗');
      return;
    }
    loadQuestions();
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      setError('請輸入 CSV 內容');
      return;
    }
    if (!selectedYear) {
      setError('請先選擇年份');
      return;
    }
    setImportLoading(true);
    setImportResult(null);
    setError('');
    try {
      const lines = importText.trim().split(/\r?\n/);
      if (lines.length < 2) {
        setError('CSV 內容至少需要一列標題與一列資料');
        return;
      }
      const headers = lines[0].split(',').map((h) => h.trim());
      const rows = lines.slice(1).map((line) => {
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) => c.replace(/^"|"$/g, '').replace(/""/g, '"'));
        const row: any = {};
        headers.forEach((h, idx) => {
          row[h] = cols[idx] ?? '';
        });
        return row;
      });
      const res = await fetch('/api/admin/exam-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, exam_year: selectedYear, records: rows }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '匯入失敗');
        return;
      }
      setImportResult(data);
      setImportText('');
      loadQuestions();
    } catch (err: any) {
      setError(err.message || '匯入失敗');
    } finally {
      setImportLoading(false);
    }
  };

  const subjectLabel = subject === 'math' ? '數學' : '理化';
  const selectedYearLabel = selectedYear ? `${selectedYear}` : '未選擇';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">會考題庫管理（年份分層）</h1>
          <Link href="/admin" className="px-4 py-2 bg-gray-500 text-white rounded">
            返回管理後台
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">科目</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as 'math' | 'physics')}
                className="p-2 border rounded"
              >
                <option value="math">數學</option>
                <option value="physics">理化</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">年份</label>
              <select
                value={selectedYear || ''}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="p-2 border rounded"
              >
                <option value="">請選擇年份</option>
                {years.map((y) => (
                  <option key={y.year} value={y.year}>
                    {y.year}（{y.count} 題）
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-600 flex items-end">
              {subjectLabel} / {selectedYearLabel}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">
            {editingId ? '編輯題目' : '新增題目'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">代碼 *</label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="例如：M-2024-01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">題號（question_no）</label>
              <input
                value={form.questionNo}
                onChange={(e) => setForm({ ...form, questionNo: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">題目（Markdown）*</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPromptPreview((prev) => !prev)}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {showPromptPreview ? '編輯' : '預覽'}
                  </button>
                  <button
                    type="button"
                    onClick={() => promptFileRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded disabled:opacity-50"
                  >
                    {uploadingImage ? '上傳中...' : '上傳圖片'}
                  </button>
                </div>
              </div>
              {!showPromptPreview ? (
                <textarea
                  ref={promptRef}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2 border rounded font-mono text-sm"
                  rows={6}
                  placeholder="支援 Markdown，例如：![image](url)"
                />
              ) : (
                <div className="w-full p-3 border rounded bg-gray-50">
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
                    {form.description || ''}
                  </ReactMarkdown>
                </div>
              )}
              <input
                ref={promptFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file, 'description');
                }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">選項（JSON 陣列）</label>
              <textarea
                value={form.options}
                onChange={(e) => setForm({ ...form, options: e.target.value })}
                className="w-full p-2 border rounded font-mono text-sm"
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">答案 *</label>
              <textarea
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                className="w-full p-2 border rounded font-mono text-sm"
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">解析（Markdown）</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowExplainPreview((prev) => !prev)}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {showExplainPreview ? '編輯' : '預覽'}
                  </button>
                  <button
                    type="button"
                    onClick={() => explainFileRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded disabled:opacity-50"
                  >
                    {uploadingImage ? '上傳中...' : '上傳圖片'}
                  </button>
                </div>
              </div>
              {!showExplainPreview ? (
                <textarea
                  ref={explainRef}
                  value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  className="w-full p-2 border rounded font-mono text-sm"
                  rows={4}
                  placeholder="支援 Markdown，例如：![image](url)"
                />
              ) : (
                <div className="w-full p-3 border rounded bg-gray-50">
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
                    {form.explanation || ''}
                  </ReactMarkdown>
                </div>
              )}
              <input
                ref={explainFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file, 'explanation');
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">難度</label>
              <input
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="easy / medium / hard"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">排序（order_index）</label>
              <input
                value={form.orderIndex}
                onChange={(e) => setForm({ ...form, orderIndex: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <span className="text-sm">啟用</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded"
              disabled={loading}
            >
              {editingId ? '更新題目' : '新增題目'}
            </button>
            <button onClick={resetForm} className="px-4 py-2 bg-gray-400 text-white rounded">
              清除
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="font-semibold mb-3">批次匯入（CSV）</h3>
          <div className="text-xs text-gray-600 mb-2">
            欄位：code,description,answer,year,options,explanation,difficulty,is_active,question_no,order_index
          </div>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="w-full p-3 border rounded font-mono text-sm mb-3"
            rows={6}
            placeholder={`code,description,answer,year,options,explanation,difficulty,is_active,question_no,order_index
M-2024-01,"題目示例","5",2024,"[""1"",""2"",""3"",""5""]","解析",easy,true,1,1`}
          />
          {importResult && (
            <div className="mb-3 text-sm">
              成功 {importResult.successCount} 筆，失敗 {importResult.errorCount} 筆
            </div>
          )}
          <button
            onClick={handleImport}
            disabled={importLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {importLoading ? '匯入中...' : '開始匯入'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">題庫列表</h3>
            <button
              onClick={handleBatchDelete}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded"
            >
              批次移除（{selectedIds.size}）
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500">載入中...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-center p-2">
                      <input
                        type="checkbox"
                        checked={questions.length > 0 && selectedIds.size === questions.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(new Set(questions.map((q) => q.id)));
                          } else {
                            setSelectedIds(new Set());
                          }
                        }}
                      />
                    </th>
                    <th className="text-left p-2">題號</th>
                    <th className="text-left p-2">代碼</th>
                    <th className="text-left p-2">題目</th>
                    <th className="text-center p-2">狀態</th>
                    <th className="text-center p-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q.id} className="border-b">
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(q.id)}
                          onChange={() => {
                            setSelectedIds((prev) => {
                              const next = new Set(prev);
                              if (next.has(q.id)) next.delete(q.id);
                              else next.add(q.id);
                              return next;
                            });
                          }}
                        />
                      </td>
                      <td className="p-2">{q.question_no ?? q.order_index ?? '-'}</td>
                      <td className="p-2">{q.code}</td>
                      <td className="p-2 text-xs text-gray-700">{q.description}</td>
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
                            onClick={() => handleInsert(q)}
                            className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                          >
                            插入
                          </button>
                          <button
                            onClick={() => handleEdit(q)}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            編輯
                          </button>
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            移除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {questions.length === 0 && (
                <p className="text-center text-gray-500 py-4">尚無題目</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

