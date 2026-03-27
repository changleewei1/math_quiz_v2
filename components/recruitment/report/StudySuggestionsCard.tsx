interface StudySuggestionsCardProps {
  items: string[];
}

export default function StudySuggestionsCard({ items }: StudySuggestionsCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-['Noto_Serif_TC','Noto_Serif',serif] text-xl font-bold text-slate-900">具體學習建議</h2>
      <p className="mt-2 text-sm text-slate-600">以下建議可直接融入暑假每週安排，重點在「做法具體」而非口號。</p>
      <ul className="mt-6 space-y-4">
        {items.map((s) => (
          <li key={s} className="flex gap-3 text-sm leading-relaxed text-slate-800 sm:text-[0.9375rem]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
