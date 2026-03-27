import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import InfoBadgeRow from '@/components/marketing/InfoBadgeRow';
import MetricPreviewCard from '@/components/marketing/MetricPreviewCard';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <PageContainer className="py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-600">
              免費 AI 數學弱點分析
            </div>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl lg:text-5xl">
              10 分鐘找出孩子升國一數學弱點
            </h1>
            <p className="text-base text-slate-600 sm:text-lg">
              透過線上診斷，快速了解孩子在升國一前需要補強的數學基礎，
              並提供個人化建議，讓家長一看就懂。
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
              >
                立即開始檢測
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#process"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              >
                了解檢測流程
              </a>
            </div>
            <InfoBadgeRow />
          </div>
          <MetricPreviewCard />
        </div>
      </PageContainer>
    </section>
  );
}

