import { cookies } from 'next/headers';
import crypto from 'crypto';

const STUDENT_COOKIE_NAME = process.env.STUDENT_COOKIE_NAME || 'student_session';
const STUDENT_COOKIE_SECRET = process.env.STUDENT_COOKIE_SECRET || process.env.ADMIN_COOKIE_SECRET || '';
const STUDENT_COOKIE_SECURE = process.env.STUDENT_COOKIE_SECURE === 'true' || process.env.ADMIN_COOKIE_SECURE === 'true';

if (!STUDENT_COOKIE_SECRET || STUDENT_COOKIE_SECRET.length < 32) {
  throw new Error('STUDENT_COOKIE_SECRET or ADMIN_COOKIE_SECRET must be at least 32 characters');
}

export function signStudentCookie(value: string): string {
  const hmac = crypto.createHmac('sha256', STUDENT_COOKIE_SECRET);
  hmac.update(value);
  const signature = hmac.digest('hex');
  return `${value}.${signature}`;
}

export function verifyStudentCookie(signedValue: string): string | null {
  const [value, signature] = signedValue.split('.');
  if (!value || !signature) return null;

  const expectedSignature = crypto
    .createHmac('sha256', STUDENT_COOKIE_SECRET)
    .update(value)
    .digest('hex');

  if (signature !== expectedSignature) {
    return null;
  }

  return value;
}

export async function getStudentSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(STUDENT_COOKIE_NAME);
  
  if (!cookie) return null;
  
  const verified = verifyStudentCookie(cookie.value);
  return verified; // verified 是 student_id
}

export async function setStudentSession(studentId: string) {
  const cookieStore = await cookies();
  const signedValue = signStudentCookie(studentId);
  
  cookieStore.set(STUDENT_COOKIE_NAME, signedValue, {
    httpOnly: true,
    secure: STUDENT_COOKIE_SECURE,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

export async function clearStudentSession() {
  const cookieStore = await cookies();
  cookieStore.delete(STUDENT_COOKIE_NAME);
}

