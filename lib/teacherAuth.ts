/**
 * 老師認證輔助函數（Server-side，非 Edge Runtime）
 */

import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = process.env.TEACHER_COOKIE_NAME || 'teacher_session';
const COOKIE_SECRET = process.env.TEACHER_COOKIE_SECRET || process.env.ADMIN_COOKIE_SECRET || '';
const COOKIE_SECURE = process.env.TEACHER_COOKIE_SECURE === 'true' || process.env.ADMIN_COOKIE_SECURE === 'true';

if (!COOKIE_SECRET || COOKIE_SECRET.length < 32) {
  throw new Error('TEACHER_COOKIE_SECRET or ADMIN_COOKIE_SECRET must be at least 32 characters');
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

export async function getTeacherSession(): Promise<{ authenticated: boolean; teacherId?: string }> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  
  if (!cookie) {
    return { authenticated: false };
  }
  
  const verified = verifyCookie(cookie.value);
  if (verified && verified.startsWith('teacher:')) {
    const teacherId = verified.replace('teacher:', '');
    return { authenticated: true, teacherId };
  }
  
  return { authenticated: false };
}

export async function setTeacherSession(teacherId: string) {
  const cookieStore = await cookies();
  const signedValue = signCookie(`teacher:${teacherId}`);
  
  cookieStore.set(COOKIE_NAME, signedValue, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearTeacherSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

