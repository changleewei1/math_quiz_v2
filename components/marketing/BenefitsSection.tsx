import { BrainCircuit, BookOpenCheck, GraduationCap } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import SectionHeader from '@/components/marketing/SectionHeader';

const benefits = [
  {
    icon: BrainCircuit,
    title: '找出弱點',
    description: '五大能力向度一次定位，讓家長快速掌握孩子最需要補強的基礎。',
  },
  {
    icon: BookOpenCheck,
    title: '看懂分析',
    description: '清楚呈現各向度分數與狀態，讓報告不只是分數而是可行動的建議。',
  },
  {
    icon: GraduationCap,
    title: '提前補強',
    description: '依弱點提供補強方向與課程推薦，幫助銜接國中更安心。',
  },
];

export default function BenefitsSection() {
  return (
    <section className="bg-white py-14 sm:py-16">
      <PageContainer>
        <SectionHeader
          title="不只是測驗，而是升國一準備指南"
          subtitle="用簡單好懂的分析，幫家長看見孩子的強弱與下一步補強方向。"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {benefits.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                  <Icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-slate-600">{item.description}</p>
              </div>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}

