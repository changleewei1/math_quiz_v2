import type { SourceConversionMetric } from '@/lib/types/analytics';

export default function SourceAnalyticsTable({ items }: { items: SourceConversionMetric[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
      <h2 className="text-lg font-semibold">名單來源分析</h2>
      <table className="mt-4 min-w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="px-3 py-2">來源</th>
            <th className="px-3 py-2">名單數</th>
            <th className="px-3 py-2">完成測驗</th>
            <th className="px-3 py-2">試聽</th>
            <th className="px-3 py-2">報名</th>
            <th className="px-3 py-2">報名率</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.source} className="border-b">
              <td className="px-3 py-2">{row.source}</td>
              <td className="px-3 py-2">{row.leadCount}</td>
              <td className="px-3 py-2">{row.finishedQuiz}</td>
              <td className="px-3 py-2">{row.trialBooked}</td>
              <td className="px-3 py-2">{row.enrolled}</td>
              <td className="px-3 py-2">{row.enrollRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


