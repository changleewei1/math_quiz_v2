'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import type { Question } from '@/types';
import type { MediaBlock } from '@/types/media';
import { isImageMedia } from '@/types/media';
import QuestionRenderer from '@/components/questions/QuestionRenderer';
import RichTextEditor from '@/components/editor/RichTextEditor';
import RichContentRenderer from '@/components/editor/RichContentRenderer';
import { getPlainTextFromContent, type RichTextContent } from '@/lib/richContent';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

export default function EditQuestionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeParams = useParams<{ id: string }>();
  const questionId = typeof routeParams?.id === 'string' ? routeParams.id : '';
  const chapterId = searchParams.get('chapterId') || '';
  const typeId = searchParams.get('typeId') || '';
  const insertAfter = searchParams.get('insertAfter') || '';

  const [question, setQuestion] = useState<Partial<Question>>({
    difficulty: 'easy',
    qtype: 'input',
    prompt: '',
    prompt_md: '',
    prompt_content: null,
    answer: '',
    answer_md: '',
    choices: null,
    choices_content: null,
    correct_choice_index: null,
    equation: null,
    explain: null,
    explain_md: '',
    explain_content: null,
    media: null,
  });
  const [loading, setLoading] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [localInsertAfter, setLocalInsertAfter] = useState(insertAfter);
  
  // 圖片上傳相關狀態
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageCaption, setImageCaption] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showAnswerPreview, setShowAnswerPreview] = useState(false);
  const [uploadingMdImage, setUploadingMdImage] = useState(false);
  const answerRef = useRef<HTMLTextAreaElement | null>(null);
  const answerFileRef = useRef<HTMLInputElement | null>(null);

  const toContentFromText = (text: string): RichTextContent => ({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: text ? [{ type: 'text', text }] : [],
      },
    ],
  });

  useEffect(() => {
    if (questionId && questionId !== 'new') {
      loadQuestion();
    } else {
      // 新增模式：載入題目列表以顯示插入位置選項
      loadQuestions();
      // 如果 URL 中有 insertAfter 參數，更新本地狀態
      if (insertAfter && insertAfter !== localInsertAfter) {
        setLocalInsertAfter(insertAfter);
      }
    }
  }, [questionId, insertAfter, chapterId, typeId]);

  const loadQuestion = async () => {
    if (!questionId || questionId === 'new') return;
    
    setLoadingQuestion(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/question?id=${questionId}`);
      const data = await res.json();
      
      if (res.ok && data.data) {
        const q = data.data;
        const resolvedPromptContent =
          q.prompt_content ||
          (q.prompt_md || q.prompt ? toContentFromText(q.prompt_md || q.prompt || '') : null);
        const resolvedExplainContent =
          q.explain_content ||
          (q.explain_md || q.explain ? toContentFromText(q.explain_md || q.explain || '') : null);
        const resolvedChoicesContent =
          q.choices_content ||
          (Array.isArray(q.choices)
            ? q.choices.map((choice: string) => toContentFromText(choice || ''))
            : null);
        setQuestion({
          difficulty: q.difficulty,
          qtype: q.qtype,
          prompt: q.prompt || '',
          prompt_md: q.prompt_md || '',
          prompt_content: resolvedPromptContent,
          answer: q.answer || '',
          answer_md: q.answer_md || '',
          choices: q.choices || null,
          choices_content: resolvedChoicesContent,
          correct_choice_index: q.correct_choice_index ?? null,
          equation: q.equation || null,
          explain: q.explain || null,
          explain_md: q.explain_md || '',
          explain_content: resolvedExplainContent,
          media: q.media || null,
        });
        
        // 如果有圖片媒體，設定預覽和 caption
        if (q.media && isImageMedia(q.media)) {
          setImagePreview(q.media.url);
          setImageCaption(q.media.caption || '');
        } else {
          setImagePreview(null);
          setImageCaption('');
        }
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
      const url = questionId === 'new'
        ? '/api/admin/questions'
        : `/api/admin/question?id=${questionId}`;
      const method = questionId === 'new' ? 'POST' : 'PATCH';

      const resolvedPromptContent = question.prompt_content as RichTextContent | null;
      const resolvedExplainContent = question.explain_content as RichTextContent | null;
      const resolvedPromptFallback =
        resolvedPromptContent ? getPlainTextFromContent(resolvedPromptContent) : question.prompt_md?.trim() || question.prompt || '';
      const resolvedExplainFallback =
        resolvedExplainContent ? getPlainTextFromContent(resolvedExplainContent) : question.explain_md?.trim() || question.explain || null;
      const body: any = {
        chapter_id: chapterId,
        type_id: typeId,
        difficulty: question.difficulty,
        qtype: question.qtype,
        prompt: resolvedPromptFallback || '',
        prompt_md: question.prompt_md?.trim() || null,
        prompt_content: resolvedPromptContent,
        answer: question.answer,
        answer_md: question.answer_md?.trim() || null,
        explain_content: resolvedExplainContent,
      };

      // 如果是插入模式，設定 created_at 來控制順序
      // 注意：題目是按 created_at 降序排列（最新的在前），所以要插入在某題之後，
      // 需要設定 created_at 比它稍早（減去時間），這樣會排在它後面
      const targetInsertAfter = localInsertAfter || insertAfter;
      if (questionId === 'new' && targetInsertAfter && targetInsertAfter !== 'none') {
        const afterQuestion = questions.find(q => q.id === targetInsertAfter);
        if (afterQuestion && afterQuestion.created_at) {
          // 設定 created_at 為目標題目的時間減去 1 秒（這樣會排在它之後）
          const afterDate = new Date(afterQuestion.created_at);
          afterDate.setSeconds(afterDate.getSeconds() - 1);
          body.created_at = afterDate.toISOString();
        }
      }

      if (question.qtype === 'mcq') {
        const choicesContent = (question.choices_content || []) as Array<RichTextContent | null>;
        const choicesFallback = choicesContent.length
          ? choicesContent.map((choice) => getPlainTextFromContent(choice))
          : question.choices || [];
        body.choices_content = choicesContent.length ? choicesContent : null;
        body.choices = choicesFallback;
        body.correct_choice_index = question.correct_choice_index;
      }

      if (question.qtype === 'word') {
        body.equation = question.equation;
      }

      if (resolvedExplainFallback) {
        body.explain = resolvedExplainFallback;
      }
      if (question.explain_md?.trim()) {
        body.explain_md = question.explain_md.trim();
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
    const choicesContent = [...(question.choices_content || [])];
    choicesContent.push(toContentFromText(''));
    setQuestion({
      ...question,
      choices_content: choicesContent,
    });
  };

  const handleChoiceContentChange = (index: number, value: RichTextContent) => {
    const choicesContent = [...(question.choices_content || [])];
    choicesContent[index] = value;
    setQuestion({ ...question, choices_content: choicesContent });
  };

  const insertAtCursor = (
    ref: React.RefObject<HTMLTextAreaElement>,
    value: string,
    field: 'answer_md'
  ) => {
    const target = ref.current;
    if (!target) {
      setQuestion((prev) => ({ ...prev, [field]: `${(prev[field] as string) || ''}\n${value}` }));
      return;
    }
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? target.value.length;
    const nextValue = `${target.value.slice(0, start)}${value}${target.value.slice(end)}`;
    setQuestion((prev) => ({ ...prev, [field]: nextValue }));
    requestAnimationFrame(() => {
      target.focus();
      const cursor = start + value.length;
      target.setSelectionRange(cursor, cursor);
    });
  };

  const uploadAdminImage = async (file: File, bucket: string, path: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    formData.append('path', path);

    const res = await fetch('/api/admin/upload-image', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || '上傳失敗');
    }

    if (!data?.url) {
      throw new Error('無法取得圖片 URL');
    }

    return data.url as string;
  };

  const uploadMarkdownImage = async (file: File, field: 'answer_md') => {
    if (!chapterId || !typeId) {
      setError('缺少章節或題型資訊');
      return;
    }
    setUploadingMdImage(true);
    setError('');
    try {
      const ext = file.name.split('.').pop() || 'png';
      const key = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now().toString();
      const path = `questions/${chapterId}/${typeId}/${key}.${ext}`;
      const publicUrl = await uploadAdminImage(file, 'question-assets', path);
      const markdown = `![image](${publicUrl})`;
      insertAtCursor(answerRef, markdown, field);
    } catch (err: any) {
      setError(err.message || '上傳失敗');
    } finally {
      setUploadingMdImage(false);
      if (field === 'answer_md' && answerFileRef.current) answerFileRef.current.value = '';
    }
  };

  // 處理圖片上傳
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 驗證檔案類型
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('不支援的檔案格式，請上傳 PNG、JPEG 或 WebP 圖片');
      return;
    }

    // 驗證檔案大小（2MB）
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setError('檔案大小超過 2MB，請縮小圖片後再上傳');
      return;
    }

    // 如果題目尚未儲存，需要先建立題目
    if (questionId === 'new') {
      setError('請先儲存題目，再上傳圖片');
      return;
    }

    if (!chapterId || !typeId) {
      setError('缺少章節或題型資訊');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      // 1. 上傳圖片到 Supabase Storage
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${questionId}.${fileExt}`;
      const filePath = `${chapterId}/${typeId}/${fileName}`;
      const publicUrl = await uploadAdminImage(file, 'question-media', filePath);

      // 3. 建立 media 物件
      const media: MediaBlock = {
        type: 'image',
        url: publicUrl,
        caption: imageCaption.trim() || undefined,
      };

      // 4. 更新題目的 media 欄位
      const updateRes = await fetch(`/api/admin/question?id=${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media }),
      });

      const updateData = await updateRes.json();

      if (!updateRes.ok) {
        throw new Error(updateData.error || '更新題目失敗');
      }

      // 5. 更新本地狀態
      setQuestion({ ...question, media });
      setImagePreview(publicUrl);
      setError(''); // 清除錯誤訊息
    } catch (err: any) {
      console.error('圖片上傳失敗:', err);
      setError(err.message || '圖片上傳失敗');
    } finally {
      setUploadingImage(false);
      // 清除 input 值，允許重新選擇相同檔案
      e.target.value = '';
    }
  };

  // 移除圖片
  const handleRemoveImage = async () => {
    if (!questionId || questionId === 'new') return;

    if (!confirm('確定要移除圖片嗎？')) return;

    setUploadingImage(true);
    setError('');

    try {
      // 更新題目的 media 欄位為 null
      const updateRes = await fetch(`/api/admin/question?id=${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media: null }),
      });

      const updateData = await updateRes.json();

      if (!updateRes.ok) {
        throw new Error(updateData.error || '移除圖片失敗');
      }

      // 更新本地狀態
      setQuestion({ ...question, media: null });
      setImagePreview(null);
      setImageCaption('');
    } catch (err: any) {
      console.error('移除圖片失敗:', err);
      setError(err.message || '移除圖片失敗');
    } finally {
      setUploadingImage(false);
    }
  };

  const displayChoicesContent = (question.choices_content ||
    (Array.isArray(question.choices)
      ? question.choices.map((choice) => toContentFromText(choice || ''))
      : [])) as RichTextContent[];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {questionId === 'new' ? '新增題目' : '編輯題目'}
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

        {questionId === 'new' && questions.length > 0 && (
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
              {questions.map((q) => {
                const title = (q.prompt_md || q.prompt || '').substring(0, 30);
                const full = q.prompt_md || q.prompt || '';
                return (
                <option key={q.id} value={q.id}>
                  插入在「{title}{full.length > 30 ? '...' : ''}」之後
                </option>
              )})}
            </select>
            {localInsertAfter && localInsertAfter !== 'none' && (
              <p className="text-xs text-blue-700 mt-2">
                此題目將插入在選定題目之後
              </p>
            )}
          </div>
        )}
        
        {questionId === 'new' && insertAfter && insertAfter !== 'none' && !localInsertAfter && (
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">題目內容（富文字）</label>
              <RichTextEditor
                value={(question.prompt_content as RichTextContent) || null}
                onChange={(content) => setQuestion({ ...question, prompt_content: content })}
                placeholder="輸入題目內容，可插入圖片"
                minHeight="260px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                即時預覽
              </label>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg min-h-[260px]">
                {question.prompt_content ? (
                  <RichContentRenderer
                    content={question.prompt_content as RichTextContent}
                    fallbackMarkdown={question.prompt_md || question.prompt || '（題目內容預覽）'}
                  />
                ) : (
                  <QuestionRenderer
                    prompt={question.prompt_md || question.prompt || '（題目內容預覽）'}
                    media={question.media || null}
                  />
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                學生端顯示效果
              </p>
            </div>
          </div>

          {/* 題目圖片上傳區塊 */}
          <div className="border-t pt-4 mt-4">
            <label className="block text-sm font-medium mb-2">題目圖片（可選）</label>
            
            {/* 目前圖片預覽 */}
            {imagePreview && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-4">
                  <img
                    src={imagePreview}
                    alt="題目圖片預覽"
                    className="max-w-[300px] max-h-[300px] object-contain rounded border border-gray-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.png';
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">目前圖片</p>
                    {isImageMedia(question.media || { type: 'image', url: imagePreview }) && (
                      <p className="text-sm text-gray-700 mb-2">
                        說明：{question.media?.caption || '（無說明）'}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={uploadingImage}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingImage ? '處理中...' : '移除圖片'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 上傳新圖片或更新現有圖片 */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">圖片說明（選填）</label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="例如：圖一、座標圖、統計圖表"
                  className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                  disabled={uploadingImage || questionId === 'new'}
                />
              </div>

              {questionId === 'new' ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    請先儲存題目後，才能上傳圖片
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    <div className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer text-center inline-block disabled:opacity-50 disabled:cursor-not-allowed">
                      {uploadingImage ? '上傳中...' : imagePreview ? '更新圖片' : '上傳圖片'}
                    </div>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    支援 PNG、JPEG、WebP 格式，檔案大小不超過 2MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {question.qtype === 'mcq' && (
            <div>
              <label className="block text-sm font-medium mb-1">選項</label>
              {displayChoicesContent.map((choice, index) => (
                <div key={index} className="border rounded p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={question.correct_choice_index === index}
                      onChange={() => setQuestion({ ...question, correct_choice_index: index })}
                      className="mr-1"
                    />
                    <span className="text-sm text-gray-600">選項 {index + 1}</span>
                  </div>
                  <RichTextEditor
                    value={choice}
                    onChange={(content) => handleChoiceContentChange(index, content)}
                    placeholder={`輸入選項 ${index + 1}`}
                    minHeight="120px"
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">答案顯示（Markdown，可選）</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAnswerPreview((prev) => !prev)}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                >
                  {showAnswerPreview ? '編輯' : '預覽'}
                </button>
                <button
                  type="button"
                  onClick={() => answerFileRef.current?.click()}
                  disabled={uploadingMdImage}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded disabled:opacity-50"
                >
                  {uploadingMdImage ? '上傳中...' : '上傳圖片'}
                </button>
              </div>
            </div>
            {!showAnswerPreview ? (
              <textarea
                ref={answerRef}
                value={question.answer_md || ''}
                onChange={(e) => setQuestion({ ...question, answer_md: e.target.value })}
                className="w-full p-2 border rounded font-mono text-sm"
                rows={3}
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
                  {question.answer_md || ''}
                </ReactMarkdown>
              </div>
            )}
            <input
              ref={answerFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadMarkdownImage(file, 'answer_md');
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">解析（富文字，可選）</label>
            <RichTextEditor
              value={(question.explain_content as RichTextContent) || null}
              onChange={(content) => setQuestion({ ...question, explain_content: content })}
              placeholder="輸入解析內容，可插入圖片"
              minHeight="180px"
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


