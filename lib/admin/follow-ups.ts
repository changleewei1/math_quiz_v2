import { isSameDay, isBefore, parseISO } from 'date-fns';
import type { FollowUpStatus } from '@/lib/admin/crm-types';

export function getFollowUpStatus(nextFollowUpAt?: string | null): FollowUpStatus {
  if (!nextFollowUpAt) return 'none';
  const date = parseISO(nextFollowUpAt);
  const now = new Date();
  if (isSameDay(date, now)) return 'today';
  if (isBefore(date, now)) return 'overdue';
  return 'upcoming';
}

export function followUpLabel(status: FollowUpStatus) {
  switch (status) {
    case 'today':
      return '今日需追蹤';
    case 'overdue':
      return '逾期未追蹤';
    case 'upcoming':
      return '即將追蹤';
    default:
      return '尚未設定';
  }
}


