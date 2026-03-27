'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { loginFormSchema } from '@/lib/validations/login-form';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function loginAction(formData: FormData) {
  const parsed = loginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    redirect: formData.get('redirect') || undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: '請確認帳號密碼格式是否正確。' };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.session) {
    return { ok: false, message: '登入失敗，請確認帳號密碼。' };
  }

  const cookieStore = await cookies();
  cookieStore.set('sb-access-token', data.session.access_token, {
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'lax',
  });
  cookieStore.set('sb-refresh-token', data.session.refresh_token, {
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'lax',
  });

  redirect(parsed.data.redirect || '/admin');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set('sb-access-token', '', { path: '/', maxAge: 0 });
  cookieStore.set('sb-refresh-token', '', { path: '/', maxAge: 0 });
  redirect('/login');
}


