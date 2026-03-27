import { formatDateTime } from '@/lib/admin/formatters';
import type { EnrollmentRecord } from '@/lib/admin/crm-types';

interface EnrollmentRecordCardProps {
  records: EnrollmentRecord[];
}

export default function EnrollmentRecordCard({ records }: EnrollmentRecordCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">報名紀錄</h2>
      {records.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          尚無報名紀錄
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {records.map((record) => (
            <div key={record.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-900">{record.enrolled_course}</span>
                <span className="text-xs text-slate-500">
                  {formatDateTime(record.enrolled_at)}
                </span>
              </div>
              {record.tuition_amount !== null ? (
                <p className="mt-2 text-sm text-slate-600">學費：{record.tuition_amount}</p>
              ) : null}
              {record.notes ? (
                <p className="mt-2 text-sm text-slate-600">{record.notes}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


