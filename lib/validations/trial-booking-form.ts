import { z } from 'zod';

/** 後台 CRM：與 `trial_bookings` 表對應 */
export const trialBookingSchema = z.object({
  trial_date: z.string().min(1, '請選擇試聽日期'),
  course_name: z.string().min(1, '請輸入課程名稱'),
  status: z.enum(['booked', 'attended', 'absent', 'rescheduled', 'cancelled']),
  notes: z.string().optional(),
});

export type TrialBookingFormValues = z.infer<typeof trialBookingSchema>;
