'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TeacherDiagnosticListPage() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/teacher/diagnostic');
        const data = await res.json();
        if (res.status === 401) {
          router.push('/teacher/login');
          return;
        }
        if (!res.ok) {
          setError(data.error || '載入失敗');
          return;
        }
        setRows(data.data || []);
      } catch (err: any) {
        setError(err.message || '載入失敗');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">診斷列表</h1>
          <Link href="/teacher" className="text-sm text-gray-600 hover:text-gray-800">
            返回老師首頁
          </Link>
        </div>

        {loading && <p>載入中...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && rows.length === 0 && (
          <p className="text-gray-500">目前沒有診斷資料</p>
        )}

        <div className="space-y-3">
          {rows.map((row) => (
            <Link
              key={row.id}
              href={`/teacher/diagnostic/${row.id}`}
              className="block border rounded p-4 hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {row.student?.name || row.student_id || '未知學生'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {row.subject === 'math' ? '數學' : '理化'} | {row.scope_type}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {row.started_at ? new Date(row.started_at).toLocaleString() : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


