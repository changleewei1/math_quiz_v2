import { z } from 'zod';

const phoneRegex = /^[0-9\-+()\s]{8,}$/;

export const leadFormSchema = z.object({
  student_name: z.string().trim().min(2, '請填寫至少 2 個字的學生姓名'),
  parent_name: z.string().trim().min(2, '請填寫至少 2 個字的家長姓名'),
  phone: z
    .string()
    .trim()
    .min(8, '請填寫至少 8 碼的聯絡電話')
    .regex(phoneRegex, '聯絡電話格式不正確'),
  elementary_school: z
    .string()
    .trim()
    .min(2, '請填寫至少 2 個字的畢業國小'),
  junior_high_school: z.string().trim().optional().or(z.literal('')),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

