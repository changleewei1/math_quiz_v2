import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().email('請輸入正確的 Email'),
  password: z.string().min(6, '密碼至少 6 碼'),
  redirect: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;


