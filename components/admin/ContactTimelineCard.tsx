import { formatDateTime } from '@/lib/admin/formatters';
import type { LeadContactLog } from '@/lib/admin/crm-types';

interface ContactTimelineCardProps {
  logs: LeadContactLog[];
}

const CONTACT_TYPE_LABELS: Record<string, string> = {
  phone: '電話',
  line: 'LINE',
  in_person: '面談',
  other: '其他',
};

const CONTACT_RESULT_LABELS: Record<string, string> = {
  no_answer: '未接通',
  interested: '有興趣',
  not_interested: '無興趣',
  booked_trial: '已預約試聽',
  enrolled: '已報名',
  follow_up_later: '稍後追蹤',
};

export default function ContactTimelineCard({ logs }: ContactTimelineCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">聯絡追蹤時間軸</h2>
      {logs.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          尚無聯絡紀錄
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{CONTACT_TYPE_LABELS[log.contact_type]}</span>
                <span>·</span>
                <span>{CONTACT_RESULT_LABELS[log.contact_result]}</span>
                <span>·</span>
                <span>{formatDateTime(log.created_at)}</span>
                {log.created_by_profile?.full_name ? (
                  <>
                    <span>·</span>
                    <span>{log.created_by_profile.full_name}</span>
                  </>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-slate-700">{log.summary}</p>
              {log.next_follow_up_at ? (
                <p className="mt-2 text-xs text-amber-700">
                  下次追蹤：{formatDateTime(log.next_follow_up_at)}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


