'use client';

import { useState } from 'react';
import Link from 'next/link';
import BrandHeader from '@/components/BrandHeader';

export default function Home() {
  const [selectedSubject, setSelectedSubject] = useState<{subject: 'math' | 'physics', grade: number} | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Logo 和補習班名稱區域 */}
      <BrandHeader />

      {/* 主要內容區域 */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] py-8 px-4">
        <div className="max-w-5xl w-full">
          <div className="bg-white rounded-lg shadow-xl p-5 sm:p-6 lg:p-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8 text-gray-800">
              題庫系統 v2
            </h2>
            <p className="text-center text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
              數學與理化練習系統
            </p>

            {/* 科目/年級選擇 */}
            {!selectedSubject ? (
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-center mb-6 text-gray-700">
                  請選擇科目與年級
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* 國一數學 */}
                  <button
                    onClick={() => setSelectedSubject({ subject: 'math', grade: 1 })}
                    className="block p-6 min-h-[96px] bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 text-center"
                  >
                    <h3 className="text-2xl font-bold mb-2">國一數學</h3>
                    <p className="text-blue-100 text-sm">
                      一年級數學
                    </p>
                  </button>
                  
                  {/* 國二數學 */}
                  <button
                    onClick={() => setSelectedSubject({ subject: 'math', grade: 2 })}
                    className="block p-6 min-h-[96px] bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 text-center"
                  >
                    <h3 className="text-2xl font-bold mb-2">國二數學</h3>
                    <p className="text-indigo-100 text-sm">
                      二年級數學
                    </p>
                  </button>
                  
                  {/* 國三數學 */}
                  <button
                    onClick={() => setSelectedSubject({ subject: 'math', grade: 3 })}
                    className="block p-6 min-h-[96px] bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 text-center"
                  >
                    <h3 className="text-2xl font-bold mb-2">國三數學</h3>
                    <p className="text-purple-100 text-sm">
                      三年級數學
                    </p>
                  </button>
                  
                  {/* 國二理化 */}
                  <button
                    onClick={() => setSelectedSubject({ subject: 'physics', grade: 2 })}
                    className="block p-6 min-h-[96px] bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 text-center"
                  >
                    <h3 className="text-2xl font-bold mb-2">國二理化</h3>
                    <p className="text-green-100 text-sm">
                      二年級理化
                    </p>
                  </button>
                  
                  {/* 國三理化 */}
                  <button
                    onClick={() => setSelectedSubject({ subject: 'physics', grade: 3 })}
                    className="block p-6 min-h-[96px] bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 text-center"
                  >
                    <h3 className="text-2xl font-bold mb-2">國三理化</h3>
                    <p className="text-orange-100 text-sm">
                      三年級理化
                    </p>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700">
                      已選擇：{selectedSubject.subject === 'math' ? '數學' : '理化'} {selectedSubject.grade === 1 ? '國一' : selectedSubject.grade === 2 ? '國二' : '國三'}
                    </h3>
                    <button
                      onClick={() => setSelectedSubject(null)}
                      className="text-sm text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded"
                    >
                      重新選擇
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <Link
                    href={`/diagnostic?subject=${selectedSubject.subject}&grade=${selectedSubject.grade}`}
                    className="block p-6 min-h-[96px] bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  >
                    <h2 className="text-2xl font-semibold mb-2">弱點分析模式</h2>
                    <p className="text-blue-100">
                      快速檢測學習弱點，獲得個人化建議
                    </p>
                  </Link>
                  
                  <Link
                    href={`/practice?subject=${selectedSubject.subject}&grade=${selectedSubject.grade}`}
                    className="block p-6 min-h-[96px] bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
                  >
                    <h2 className="text-2xl font-semibold mb-2">題型練習模式</h2>
                    <p className="text-green-100">
                      針對特定題型進行系統化練習
                    </p>
                  </Link>
                </div>
              </div>
            )}

          <div className="mt-8">
            <Link
              href="/exam-diagnostic"
              className="block w-full max-w-xl mx-auto p-6 min-h-[96px] bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-md transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <h2 className="text-2xl font-semibold mb-2">會考弱點分析</h2>
              <p className="text-amber-100">
                針對歷屆會考題型進行診斷
              </p>
            </Link>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-6">
            <Link
              href="/teacher/login"
              className="px-4 py-3 min-h-[48px] bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow-md transition-colors text-sm font-medium text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
            >
              老師登入
            </Link>
            <Link
              href="/login"
              className="px-4 py-3 min-h-[48px] bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-md transition-colors text-sm font-medium text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
            >
              學生登入
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}


