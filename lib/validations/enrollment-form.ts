import { z } from 'zod';

export const enrollmentSchema = z.object({
  enrolled_course: z.string().trim().min(2, '請填寫報名課程'),
  tuition_amount: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((value) => value === '' || !Number.isNaN(Number(value)), {
      message: '學費需為數字',
    }),
  enrolled_at: z.string().min(1, '請選擇報名日期'),
  notes: z.string().trim().optional().or(z.literal('')),
});

export type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;


