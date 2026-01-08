'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Student {
  id: string;
  name: string;
}

export default function Home() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStudentSession();
  }, []);

  const checkStudentSession = async () => {
    try {
      const res = await fetch('/api/student/me');
      if (res.ok) {
        const data = await res.json();
        setStudent(data.student);
      }
    } catch (err) {
      // 未登入
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/student/logout', { method: 'POST' });
      setStudent(null);
      window.location.reload();
    } catch (err) {
      console.error('登出失敗:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Logo 和補習班名稱區域 */}
      <div className="w-full py-6 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center space-x-4">
              {/* Logo 區域 */}
              <img 
                src="/Black and White Circle Business Logo.png" 
                alt="名貫補習班 Logo" 
                className="w-[115px] h-[115px] object-contain"
              />
              {/* 補習班名稱 */}
              <h1 className="text-[43px] font-bold text-gray-800" style={{ fontFamily: 'var(--font-noto-serif-tc), serif' }}>
                名貫補習班
              </h1>
            </div>
            
            {/* 學生登入狀態 */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="text-sm text-gray-500">載入中...</div>
              ) : student ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">歡迎，{student.name}</span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    登出
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  學生登入
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] py-8">
        <div className="max-w-2xl w-full mx-4">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">
              國一數題庫系統 v2
            </h2>
            <p className="text-center text-gray-600 mb-8">
              一元一次方程式練習系統
            </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/diagnostic"
              className="block p-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-colors text-center"
            >
              <h2 className="text-2xl font-semibold mb-2">弱點分析模式</h2>
              <p className="text-blue-100">
                快速檢測學習弱點，獲得個人化建議
              </p>
            </Link>
            
            <Link
              href="/practice"
              className="block p-6 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-colors text-center"
            >
              <h2 className="text-2xl font-semibold mb-2">題型練習模式</h2>
              <p className="text-green-100">
                針對特定題型進行系統化練習
              </p>
            </Link>
          </div>

          <div className="mt-8 flex justify-center space-x-6">
            <Link
              href="/teacher/login"
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow-md transition-colors text-sm font-medium"
            >
              老師登入
            </Link>
            <Link
              href="/admin/login"
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-md transition-colors text-sm font-medium"
            >
              管理員登入
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}


