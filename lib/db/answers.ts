import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { FunnelAnswerInsert } from '@/types/database';

const TABLE = 'funnel_answers';

export async function saveQuizAnswers(sessionId: string, rows: FunnelAnswerInsert[]): Promise<boolean> {
  const supabase = createSupabaseServerClient();
  const { error: delErr } = await supabase.from(TABLE).delete().eq('session_id', sessionId);
  if (delErr) {
    console.error('saveQuizAnswers delete', delErr);
    return false;
  }
  if (rows.length === 0) return true;

  const { error: insErr } = await supabase.from(TABLE).insert(rows);
  if (insErr) {
    console.error('saveQuizAnswers insert', insErr);
    return false;
  }
  return true;
}
