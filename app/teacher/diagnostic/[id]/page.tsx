'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TeacherDiagnosticDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [actionType, setActionType] = useState('practice');
  const [actionPayload, setActionPayload] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/teacher/diagnostic/${params.id}`);
        const payload = await res.json();
        if (res.status === 401) {
          router.push('/teacher/login');
          return;
        }
        if (!res.ok) {
          setError(payload.error || '載入失敗');
          return;
        }
        setData(payload);
      } catch (err: any) {
        setError(err.message || '載入失敗');
      }
    };
    load();
  }, [params.id, router]);

  const handleAssign = async () => {
    if (!data?.session?.student_id || !chapterId) {
      setError('請填寫章節 ID');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/teacher/diagnostic/${params.id}/remediation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: data.session.student_id,
          chapter_id: chapterId,
          action_type: actionType,
          action_payload: actionPayload ? { note: actionPayload } : {},
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error || '指派失敗');
        return;
      }
      setData((prev: any) => ({
        ...prev,
        remediation: [payload.data, ...(prev?.remediation || [])],
      }));
      setChapterId('');
      setActionPayload('');
    } catch (err: any) {
      setError(err.message || '指派失敗');
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/teacher/diagnostic" className="text-sm text-gray-600">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <p>載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">診斷詳情</h1>
          <Link href="/teacher/diagnostic" className="text-sm text-gray-600">
            返回列表
          </Link>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-500">學生</p>
          <p className="text-lg font-medium">{data.session.student_id}</p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-500">整體正確率</p>
          <p className="text-2xl font-semibold">
            {Math.round((data.result?.overall_summary?.accuracy || 0) * 100)}%
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">章節弱點</h2>
          <div className="space-y-2">
            {(data.result?.chapter_summary || []).map((item: any) => (
              <div key={item.chapter_id} className="border rounded p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.chapter_id}</p>
                    <p className="text-sm text-gray-500">
                      正確 {item.correct} / {item.total}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">{item.level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">指派補救</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <input
              type="text"
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              placeholder="章節 ID"
              className="w-full p-2 border rounded"
            />
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="practice">practice</option>
              <option value="video">video</option>
              <option value="worksheet">worksheet</option>
              <option value="custom">custom</option>
            </select>
            <input
              type="text"
              value={actionPayload}
              onChange={(e) => setActionPayload(e.target.value)}
              placeholder="備註 / 連結"
              className="w-full p-2 border rounded md:col-span-2"
            />
          </div>
          <button
            onClick={handleAssign}
            disabled={saving}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? '指派中...' : '指派補救'}
          </button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">補救紀錄</h2>
          <div className="space-y-2">
            {(data.remediation || []).map((item: any) => (
              <div key={item.id} className="border rounded p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.chapter_id}</p>
                    <p className="text-sm text-gray-500">{item.action_type}</p>
                  </div>
                  <span className="text-xs text-gray-500">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


