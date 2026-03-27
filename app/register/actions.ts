'use server';

import { leadFormSchema, type LeadFormValues } from '@/lib/validations/lead-form';
import { createLead, markLeadStartedQuiz } from '@/lib/db/leads';
import { createQuizSession } from '@/lib/db/quiz-sessions';

export interface LeadActionResult {
  ok: boolean;
  sessionId?: string;
  error?: string;
}

export async function createLeadAndSession(rawValues: LeadFormValues): Promise<LeadActionResult> {
  const parsed = leadFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      ok: false,
      error: '請確認表單內容是否完整且格式正確。',
    };
  }

  const values = parsed.data;
  const lead = await createLead({
    student_name: values.student_name,
    parent_name: values.parent_name,
    phone: values.phone,
    elementary_school: values.elementary_school,
    junior_high_school: values.junior_high_school,
  });

  if (!lead) {
    return {
      ok: false,
      error: '建立資料時發生問題，請稍後再試。',
    };
  }

  const session = await createQuizSession(lead.id);
  if (!session) {
    return {
      ok: false,
      error: '已建立名單，但無法開始測驗，請稍後再試。',
    };
  }

  await markLeadStartedQuiz(lead.id);

  return {
    ok: true,
    sessionId: session.id,
  };
}
