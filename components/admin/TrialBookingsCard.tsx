import { formatDateTime } from '@/lib/admin/formatters';
import type { TrialBooking } from '@/lib/admin/crm-types';

interface TrialBookingsCardProps {
  bookings: TrialBooking[];
}

const STATUS_LABELS: Record<string, string> = {
  booked: '已預約',
  attended: '已出席',
  absent: '未出席',
  rescheduled: '改期',
  cancelled: '取消',
};

export default function TrialBookingsCard({ bookings }: TrialBookingsCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">試聽預約紀錄</h2>
      {bookings.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          尚無試聽預約
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-900">{booking.course_name}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                  {STATUS_LABELS[booking.status]}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                試聽時間：{formatDateTime(booking.trial_date)}
              </p>
              {booking.notes ? (
                <p className="mt-2 text-sm text-slate-600">{booking.notes}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


