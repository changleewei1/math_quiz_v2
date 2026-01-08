import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || 'admin_session';
const COOKIE_SECRET = process.env.ADMIN_COOKIE_SECRET || '';
const COOKIE_SECURE = process.env.ADMIN_COOKIE_SECURE === 'true';

if (!COOKIE_SECRET || COOKIE_SECRET.length < 32) {
  throw new Error('ADMIN_COOKIE_SECRET must be at least 32 characters');
}

export function signCookie(value: string): string {
  const hmac = crypto.createHmac('sha256', COOKIE_SECRET);
  hmac.update(value);
  const signature = hmac.digest('hex');
  return `${value}.${signature}`;
}

export function verifyCookie(signedValue: string): string | null {
  const [value, signature] = signedValue.split('.');
  if (!value || !signature) return null;

  const expectedSignature = crypto
    .createHmac('sha256', COOKIE_SECRET)
    .update(value)
    .digest('hex');

  if (signature !== expectedSignature) {
    return null;
  }

  return value;
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  
  if (!cookie) return false;
  
  const verified = verifyCookie(cookie.value);
  return verified === 'authenticated';
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  const signedValue = signCookie('authenticated');
  
  cookieStore.set(COOKIE_NAME, signedValue, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}


