import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { LeadRow } from '@/types/database';

export type CreateLeadInput = {
  student_name: string;
  parent_name: string;
  phone: string;
  elementary_school: string;
  junior_high_school?: string | null;
};

export async function createLead(data: CreateLeadInput): Promise<LeadRow | null> {
  const supabase = createSupabaseServerClient();
  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      student_name: data.student_name.trim(),
      parent_name: data.parent_name.trim(),
      phone: data.phone.trim(),
      elementary_school: data.elementary_school.trim(),
      junior_high_school: data.junior_high_school?.trim() || null,
      status: 'new',
    })
    .select('id, student_name, parent_name, phone, elementary_school, junior_high_school, created_at, status')
    .single();

  if (error || !lead) {
    console.error('createLead', error);
    return null;
  }
  return lead as LeadRow;
}

export async function getLeadById(id: string): Promise<LeadRow | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('leads')
    .select('id, student_name, parent_name, phone, elementary_school, junior_high_school, created_at, status')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as LeadRow;
}

export async function markLeadStartedQuiz(leadId: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  await supabase.from('leads').update({ status: 'started_quiz' }).eq('id', leadId);
}

export async function markLeadFinishedQuiz(leadId: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  await supabase.from('leads').update({ status: 'finished_quiz' }).eq('id', leadId);
}
