import { z } from 'zod';

export const MVP_PREFERRED_TIME_OPTIONS = [
  { value: 'weekday_evening', label: '平日晚上' },
  { value: 'wed_afternoon', label: '週三下午' },
  { value: 'sat_morning', label: '週六上午' },
  { value: 'sat_afternoon', label: '週六下午' },
  { value: 'other_contact', label: '其他，可再聯繫安排' },
] as const;

export const mvpTrialBookingSchema = z.object({
  student_name: z.string().trim().min(2, '請填寫學生姓名（至少 2 字）'),
  parent_name: z.string().trim().min(2, '請填寫家長姓名（至少 2 字）'),
  phone: z.string().trim().min(8, '請填寫有效的聯絡電話（至少 8 碼）'),
  preferred_time: z.enum(
    ['weekday_evening', 'wed_afternoon', 'sat_morning', 'sat_afternoon', 'other_contact'],
    { message: '請選擇方便聯繫的時段' }
  ),
  note: z.string().trim().optional(),
});

export type MvpTrialBookingFormValues = z.infer<typeof mvpTrialBookingSchema>;

export function mvpPreferredTimeLabel(value: string): string {
  return MVP_PREFERRED_TIME_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
