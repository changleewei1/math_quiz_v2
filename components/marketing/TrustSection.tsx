import PageContainer from '@/components/layout/PageContainer';
import SectionHeader from '@/components/marketing/SectionHeader';

const highlights = [
  {
    title: '測驗時間約 10 分鐘',
    description: '題量精簡、流程清楚，孩子完成測驗不會有負擔。',
  },
  {
    title: '做完立即看到結果',
    description: '完成作答後馬上產出分析報告，家長不需等待。',
  },
  {
    title: '報告包含弱點與建議方向',
    description: '清楚呈現各向度分數、弱點摘要與補強建議。',
  },
];

export default function TrustSection() {
  return (
    <section className="bg-white py-14 sm:py-16">
      <PageContainer>
        <SectionHeader
          title="家長安心說明"
          subtitle="測驗流程精簡、結果清楚，讓家長安心掌握孩子的升國一準備狀況。"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

