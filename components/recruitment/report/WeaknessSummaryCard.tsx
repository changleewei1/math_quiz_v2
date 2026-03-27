interface WeaknessSummaryCardProps {
  paragraph: string;
}

export default function WeaknessSummaryCard({ paragraph }: WeaknessSummaryCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-['Noto_Serif_TC','Noto_Serif',serif] text-xl font-bold text-slate-900">弱點摘要</h2>
      <p className="mt-2 text-sm text-slate-600">以下為依本次檢測結果整理給家長閱讀的摘要說明。</p>
      <p className="mt-6 text-sm leading-[1.85] text-slate-800 sm:text-[0.9375rem]">{paragraph}</p>
    </section>
  );
}
