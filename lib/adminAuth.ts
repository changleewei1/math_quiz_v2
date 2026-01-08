/**
 * Admin 認證輔助函數（Server-side，非 Edge Runtime）
 */

import { cookies } from 'next/headers';
import { signCookie, verifyCookie } from './auth';

const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || 'admin_session';

export async function verifyAdminCookie(): Promise<{ authenticated: boolean }> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  
  if (!cookie) {
    return { authenticated: false };
  }
  
  const verified = verifyCookie(cookie.value);
  return { authenticated: verified === 'authenticated' };
}

