interface StudyOrderCardProps {
  steps: string[];
}

export default function StudyOrderCard({ steps }: StudyOrderCardProps) {
  if (!steps.length) return null;
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50/80 to-white p-6 shadow-sm sm:p-8">
      <h2 className="font-['Noto_Serif_TC','Noto_Serif',serif] text-xl font-bold text-slate-900">建議學習順序</h2>
      <p className="mt-2 text-sm text-slate-600">依本次向度表現，建議可參考以下 1～3 步的補強順序（可依家庭時間微調）。</p>
      <ol className="mt-6 list-decimal space-y-4 pl-5 text-sm leading-relaxed text-slate-800 sm:text-[0.9375rem]">
        {steps.map((step) => (
          <li key={step} className="pl-1 marker:font-bold marker:text-sky-700">
            {step}
          </li>
        ))}
      </ol>
    </section>
  );
}
