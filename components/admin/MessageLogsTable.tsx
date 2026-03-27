import type { LineMessageLog } from '@/lib/types/line';
import { formatDateTime } from '@/lib/admin/formatters';

export default function MessageLogsTable({ logs }: { logs: LineMessageLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        尚無訊息發送紀錄
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="px-4 py-3">類型</th>
            <th className="px-4 py-3">狀態</th>
            <th className="px-4 py-3">對象</th>
            <th className="px-4 py-3">內容</th>
            <th className="px-4 py-3">時間</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b">
              <td className="px-4 py-3">{log.message_type}</td>
              <td className="px-4 py-3">{log.send_status}</td>
              <td className="px-4 py-3">{log.target_type}</td>
              <td className="px-4 py-3 text-slate-600">{log.message_body}</td>
              <td className="px-4 py-3">{formatDateTime(log.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


