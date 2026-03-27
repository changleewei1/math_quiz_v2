import type { FunnelBookingListItem } from '@/lib/db/funnel-bookings';
import { formatDateTime } from '@/lib/admin/formatters';
import { DIMENSION_LABEL, type Dimension } from '@/lib/questions';

interface FunnelBookingsTableProps {
  rows: FunnelBookingListItem[];
}

function formatWeakDimensions(value: unknown): string {
  if (value == null) return '—';
  if (Array.isArray(value)) {
    const labels = value
      .filter((x): x is string => typeof x === 'string')
      .map((d) => DIMENSION_LABEL[d as Dimension] ?? d);
    return labels.length ? labels.join('、') : '—';
  }
  return String(value);
}

export default function FunnelBookingsTable({ rows }: FunnelBookingsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        目前沒有符合條件的試聽預約
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[1000px] w-full text-sm">
        <thead>
          <tr className="border-b bg-slate-50 text-left text-slate-600">
            <th className="px-3 py-3 font-semibold">學生姓名</th>
            <th className="px-3 py-3 font-semibold">家長姓名</th>
            <th className="px-3 py-3 font-semibold">電話</th>
            <th className="px-3 py-3 font-semibold">可上課時段</th>
            <th className="px-3 py-3 font-semibold">備註</th>
            <th className="px-3 py-3 font-semibold">等級</th>
            <th className="px-3 py-3 font-semibold">弱項向度</th>
            <th className="px-3 py-3 font-semibold">推薦課程</th>
            <th className="px-3 py-3 font-semibold">建立時間</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/80">
              <td className="px-3 py-3 font-medium text-slate-800">{r.student_name}</td>
              <td className="px-3 py-3 text-slate-600">{r.parent_name}</td>
              <td className="px-3 py-3 whitespace-nowrap text-slate-600">{r.phone}</td>
              <td className="max-w-[160px] px-3 py-3 text-slate-700">{r.preferred_time}</td>
              <td className="max-w-[200px] px-3 py-3 text-slate-600" title={r.note ?? ''}>
                {r.note?.trim() ? <span className="line-clamp-2">{r.note}</span> : '—'}
              </td>
              <td className="px-3 py-3 text-slate-700">{r.overall_level || '—'}</td>
              <td className="max-w-[220px] px-3 py-3 text-slate-600">{formatWeakDimensions(r.weak_dimensions)}</td>
              <td className="max-w-[200px] truncate px-3 py-3 text-slate-600" title={r.recommended_course ?? ''}>
                {r.recommended_course || '—'}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-slate-500">{formatDateTime(r.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
