interface StudySuggestionsCardProps {
  suggestions: string[];
}

export default function StudySuggestionsCard({ suggestions }: StudySuggestionsCardProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">建議補強方向</h2>
      <p className="mt-1 text-sm text-slate-500">依目前作答狀況整理的補強重點。</p>
      <ul className="mt-4 space-y-3 text-sm text-slate-700">
        {suggestions.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}


