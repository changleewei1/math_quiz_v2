import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import type { UserRole } from '@/lib/auth/roles';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get('sb-access-token')?.value;
}

export async function getCurrentUser() {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
  const { data } = await supabase.auth.getUser(accessToken);
  return data.user ?? null;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, role, is_active')
    .eq('id', user.id)
    .single();
  return data ?? null;
}

export async function requireAdminAuth(redirectTo = '/login') {
  const profile = await getCurrentProfile();
  if (!profile || !profile.is_active) {
    redirect(`${redirectTo}?redirect=${encodeURIComponent('/admin')}`);
  }
  return profile;
}

export async function requireRole(roles: UserRole[], redirectTo = '/login') {
  const profile = await getCurrentProfile();
  if (!profile || !profile.is_active) {
    redirect(`${redirectTo}?redirect=${encodeURIComponent('/admin')}`);
  }
  if (!roles.includes(profile.role as UserRole)) {
    redirect('/admin?error=permission');
  }
  return profile;
}


