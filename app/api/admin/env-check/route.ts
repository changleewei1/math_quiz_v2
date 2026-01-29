import { NextResponse } from 'next/server';
import { verifyAdminCookie } from '@/lib/adminAuth';

export async function GET() {
  const adminAuth = await verifyAdminCookie();
  if (!adminAuth.authenticated) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  return NextResponse.json({
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasSupabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceRoleKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 6)
      : null,
  });
}

