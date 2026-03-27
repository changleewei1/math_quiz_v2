import PageContainer from '@/components/layout/PageContainer';
import SectionHeader from '@/components/marketing/SectionHeader';

const steps = [
  {
    step: '01',
    title: '填資料',
    description: '留下學生與家長基本資訊，建立個人化分析檔案。',
  },
  {
    step: '02',
    title: '做測驗',
    description: '10 分鐘完成診斷題，快速掌握升國一前的重點能力。',
  },
  {
    step: '03',
    title: '看報告',
    description: '立即產出分析報告，呈現弱點與補強建議。',
  },
];

export default function ProcessSection() {
  return (
    <section id="process" className="bg-slate-50 py-14 sm:py-16">
      <PageContainer>
        <SectionHeader
          title="3 步驟完成升國一弱點分析"
          subtitle="流程清楚、時間短、重點明確，適合家長快速掌握孩子狀況。"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.step}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="text-sm font-semibold text-indigo-500">{step.step}</div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-3 text-sm text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

