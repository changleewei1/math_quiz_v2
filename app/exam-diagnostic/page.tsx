'use client';

import Link from 'next/link';
import BrandHeader from '@/components/BrandHeader';

export default function ExamDiagnosticHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <BrandHeader />
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] py-8 px-4">
        <div className="max-w-5xl w-full">
          <div className="bg-white rounded-lg shadow-xl p-5 sm:p-6 lg:p-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8 text-gray-800">
              會考弱點分析
            </h2>
            <p className="text-center text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
              先選年份再開始測驗（已改為年份優先流程）
            </p>

            <div className="space-y-4">
              <Link
                href="/mock-exam"
                className="block p-6 min-h-[96px] bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
              >
                <h3 className="text-2xl font-semibold mb-2">開始選擇年份</h3>
                <p className="text-orange-100">
                  科目 → 年份 → 測驗
                </p>
              </Link>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-6">
              <Link
                href="/"
                className="px-4 py-3 min-h-[48px] bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-md transition-colors text-sm font-medium text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              >
                返回首頁
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


