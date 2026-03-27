import { z } from 'zod';

export const contactLogSchema = z.object({
  contact_type: z.enum(['phone', 'line', 'in_person', 'other']),
  contact_result: z.enum([
    'no_answer',
    'interested',
    'not_interested',
    'booked_trial',
    'enrolled',
    'follow_up_later',
  ]),
  summary: z.string().trim().min(5, '摘要至少 5 個字'),
  next_follow_up_at: z.string().optional().or(z.literal('')),
});

export type ContactLogFormValues = z.infer<typeof contactLogSchema>;


