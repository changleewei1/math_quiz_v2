import { createSupabaseServerClient } from '@/lib/supabase/server';

function generateToken(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < length; i += 1) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export async function createBindToken(args: {
  targetType: 'lead' | 'profile';
  targetId: string;
  expiresInHours?: number;
}) {
  const supabase = createSupabaseServerClient();
  const expiresIn = args.expiresInHours ?? 24;
  const expiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000).toISOString();

  let token = generateToken();
  for (let i = 0; i < 3; i += 1) {
    const { data: exists } = await supabase
      .from('line_bind_tokens')
      .select('id')
      .eq('token', token)
      .maybeSingle();
    if (!exists) break;
    token = generateToken();
  }

  const { error } = await supabase.from('line_bind_tokens').insert({
    token,
    target_type: args.targetType,
    target_id: args.targetId,
    expires_at: expiresAt,
  });

  if (error) {
    return { ok: false, errorMessage: error.message };
  }

  return { ok: true, token, expiresAt };
}

export async function consumeBindToken(token: string, lineUserId: string) {
  const supabase = createSupabaseServerClient();
  const { data: record } = await supabase
    .from('line_bind_tokens')
    .select('*')
    .eq('token', token)
    .is('used_at', null)
    .maybeSingle();

  if (!record) {
    return { ok: false, message: '綁定碼無效或已使用。' };
  }

  if (new Date(record.expires_at).getTime() < Date.now()) {
    return { ok: false, message: '綁定碼已過期。' };
  }

  await supabase.from('line_bind_tokens').update({ used_at: new Date().toISOString() }).eq('id', record.id);

  await supabase.from('line_identities').upsert({
    line_user_id: lineUserId,
    target_type: record.target_type,
    target_id: record.target_id,
    status: 'active',
  });

  if (record.target_type === 'lead') {
    await supabase.from('leads').update({ line_user_id: lineUserId }).eq('id', record.target_id);
  }
  if (record.target_type === 'profile') {
    await supabase.from('profiles').update({ line_user_id: lineUserId }).eq('id', record.target_id);
  }

  return { ok: true, targetType: record.target_type, targetId: record.target_id };
}


