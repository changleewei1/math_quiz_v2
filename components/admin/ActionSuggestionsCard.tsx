interface ActionSuggestionsCardProps {
  suggestions: string[];
}

export default function ActionSuggestionsCard({ suggestions }: ActionSuggestionsCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
      <h2 className="text-lg font-semibold">行動建議</h2>
      <p className="mt-1 text-sm text-slate-200">根據目前數據提供優先追蹤方向。</p>
      <ul className="mt-4 space-y-3 text-sm text-slate-100">
        {suggestions.map((item, index) => (
          <li key={index} className="rounded-xl bg-slate-800 px-4 py-3">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}


