'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Teacher {
  id: string;
  username: string;
  nickname: string;
}

interface Class {
  id: string;
  name: string;
  school_year: string | null;
  semester: string | null;
}

export default function TeacherPage() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkTeacherSession();
  }, []);

  const checkTeacherSession = async () => {
    try {
      const res = await fetch('/api/teacher/me');
      if (res.ok) {
        const data = await res.json();
        setTeacher(data.teacher);
        loadClasses();
      } else {
        router.push('/teacher/login');
      }
    } catch (err) {
      router.push('/teacher/login');
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const res = await fetch('/api/teacher/classes');
      const data = await res.json();
      if (res.ok && data.classes) {
        setClasses(data.classes);
      } else {
        setError(data.error || '載入班級列表失敗');
      }
    } catch (err: any) {
      setError(err.message || '載入班級列表失敗');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/teacher/logout', { method: 'POST' });
      router.push('/teacher/login');
    } catch (err) {
      console.error('登出失敗:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 標題列 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                老師管理系統
              </h1>
              <p className="text-gray-600">
                歡迎，{teacher.nickname}（{teacher.username}）
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                返回首頁
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                登出
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
            {error}
          </div>
        )}

        {/* 班級列表 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">班級列表</h2>
          {classes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>目前沒有可管理的班級</p>
              <p className="text-sm mt-2">請聯繫管理員新增班級</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls) => (
                <Link
                  key={cls.id}
                  href={`/teacher/class/${cls.id}/overview`}
                  className="block p-6 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {cls.name}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    {cls.school_year && (
                      <p>學年：{cls.school_year}</p>
                    )}
                    {cls.semester && (
                      <p>學期：{cls.semester}</p>
                    )}
                  </div>
                  <div className="mt-4 text-blue-600 text-sm font-medium">
                    查看班級總覽 →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

