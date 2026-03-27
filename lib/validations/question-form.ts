import { z } from 'zod';
import { QUESTION_DIMENSIONS, QUESTION_DIFFICULTIES } from '@/lib/constants/status';

export const questionFormSchema = z
  .object({
    prompt: z.string().trim().min(5, '請輸入題目內容'),
    explanation: z.string().trim().optional().or(z.literal('')),
    choice_1: z.string().trim().min(1, '選項一必填'),
    choice_2: z.string().trim().min(1, '選項二必填'),
    choice_3: z.string().trim().min(1, '選項三必填'),
    choice_4: z.string().trim().min(1, '選項四必填'),
    correct_answer: z.string().trim().min(1, '請選擇正確答案'),
    dimension: z.enum(QUESTION_DIMENSIONS),
    difficulty: z.enum(QUESTION_DIFFICULTIES),
    sort_order: z.coerce.number().int().min(0, '排序需為 0 或正整數'),
    is_active: z.coerce.boolean(),
  })
  .refine(
    (data) =>
      [data.choice_1, data.choice_2, data.choice_3, data.choice_4].includes(data.correct_answer),
    {
      message: '正確答案必須是四個選項其中之一',
      path: ['correct_answer'],
    }
  );

export type QuestionFormInputValues = z.input<typeof questionFormSchema>;
export type QuestionFormValues = z.output<typeof questionFormSchema>;


