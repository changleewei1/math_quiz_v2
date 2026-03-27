import PageContainer from '@/components/layout/PageContainer';
import LoginForm from '@/components/auth/LoginForm';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PageContainer className="py-16">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold">後台登入</h1>
          <p className="mt-2 text-sm text-slate-600">
            請使用管理帳號登入，登入後可進行名單追蹤與資料匯出。
          </p>
          <div className="mt-6">
            <Suspense fallback={<div className="text-sm text-slate-500">載入中...</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </PageContainer>
    </main>
  );
}


