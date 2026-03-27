interface ParentAdviceCardProps {
  paragraphs: string[];
}

export default function ParentAdviceCard({ paragraphs }: ParentAdviceCardProps) {
  return (
    <section className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-6 shadow-sm sm:p-8">
      <h2 className="font-['Noto_Serif_TC','Noto_Serif',serif] text-xl font-bold text-slate-900">給家長的建議</h2>
      <p className="mt-2 text-sm text-slate-600">從家庭陪伴角度，我們建議您可優先留意以下幾點。</p>
      <div className="mt-6 space-y-5">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm leading-[1.85] text-slate-800 sm:text-[0.9375rem]">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
