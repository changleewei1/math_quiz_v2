import type { AutomationRun } from '@/lib/types/automations';
import { formatDateTime } from '@/lib/admin/formatters';

export default function AutomationRunsTable({ runs }: { runs: AutomationRun[] }) {
  if (runs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        尚無自動任務執行紀錄
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="px-4 py-3">任務</th>
            <th className="px-4 py-3">狀態</th>
            <th className="px-4 py-3">掃描</th>
            <th className="px-4 py-3">發送</th>
            <th className="px-4 py-3">跳過</th>
            <th className="px-4 py-3">錯誤</th>
            <th className="px-4 py-3">開始時間</th>
            <th className="px-4 py-3">結束時間</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.id} className="border-b">
              <td className="px-4 py-3 font-semibold">{run.job_name}</td>
              <td className="px-4 py-3">{run.status}</td>
              <td className="px-4 py-3">{run.scanned_count}</td>
              <td className="px-4 py-3">{run.sent_count}</td>
              <td className="px-4 py-3">{run.skipped_count}</td>
              <td className="px-4 py-3">{run.error_count}</td>
              <td className="px-4 py-3">{formatDateTime(run.started_at)}</td>
              <td className="px-4 py-3">{formatDateTime(run.finished_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


