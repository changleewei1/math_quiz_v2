interface WeaknessSummaryCardProps {
  summary: string;
}

export default function WeaknessSummaryCard({ summary }: WeaknessSummaryCardProps) {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-indigo-900 shadow-sm">
      <h3 className="text-lg font-semibold">弱點摘要</h3>
      <p className="mt-3 text-sm leading-relaxed">{summary}</p>
    </div>
  );
}


