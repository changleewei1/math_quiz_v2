'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Question } from '@/types';
import type { MediaBlock } from '@/types/media';
import { isImageMedia } from '@/types/media';
import { supabaseClient } from '@/lib/supabaseClient';
import QuestionRenderer from '@/components/questions/QuestionRenderer';

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
    if (params.id === 'new') {
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
      const fileName = `${params.id}.${fileExt}`;
      const filePath = `${chapterId}/${typeId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('question-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // 覆蓋舊檔案
        });

      if (uploadError) {
        throw new Error(`上傳失敗: ${uploadError.message}`);
      }

      // 2. 取得公開 URL
      const { data: publicUrlData } = supabaseClient.storage
        .from('question-media')
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error('無法取得圖片 URL');
      }

      // 3. 建立 media 物件
      const media: MediaBlock = {
        type: 'image',
        url: publicUrlData.publicUrl,
        caption: imageCaption.trim() || undefined,
      };

      // 4. 更新題目的 media 欄位
      const updateRes = await fetch(`/api/admin/question?id=${params.id}`, {
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
      setImagePreview(publicUrlData.publicUrl);
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
    if (!params.id || params.id === 'new') return;

    if (!confirm('確定要移除圖片嗎？')) return;

    setUploadingImage(true);
    setError('');

    try {
      // 更新題目的 media 欄位為 null
      const updateRes = await fetch(`/api/admin/question?id=${params.id}`, {
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
            <p className="mt-1 text-xs text-gray-500">
              提示：可使用換行符號（Enter）分隔段落
            </p>
          </div>

          {/* 題目預覽區塊 */}
          {(question.prompt || question.media) && (
            <div className="border-t pt-4 mt-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                預覽效果
              </label>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <QuestionRenderer 
                  prompt={question.prompt || '（題目內容預覽）'} 
                  media={question.media || null}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                這是題目在前台的顯示效果預覽
              </p>
            </div>
          )}

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
                  disabled={uploadingImage || params.id === 'new'}
                />
              </div>

              {params.id === 'new' ? (
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


