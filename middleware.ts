import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || 'admin_session';
const TEACHER_COOKIE_NAME = process.env.TEACHER_COOKIE_NAME || 'teacher_session';
const STUDENT_COOKIE_NAME = process.env.STUDENT_COOKIE_NAME || 'student_session';
const ADMIN_COOKIE_SECRET = process.env.ADMIN_COOKIE_SECRET || '';
const TEACHER_COOKIE_SECRET = process.env.TEACHER_COOKIE_SECRET || process.env.ADMIN_COOKIE_SECRET || '';
const STUDENT_COOKIE_SECRET = process.env.STUDENT_COOKIE_SECRET || process.env.ADMIN_COOKIE_SECRET || '';

// Edge Runtime 版本的 verifyCookie，使用 Web Crypto API
async function verifyCookie(signedValue: string, secret: string): Promise<string | null> {
  const [value, signature] = signedValue.split('.');
  if (!value || !signature) return null;

  try {
    // 將 secret 轉換為 ArrayBuffer
    const encoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // 簽名 value
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      secretKey,
      encoder.encode(value)
    );

    // 將簽名轉換為 hex
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== expectedSignature) {
      return null;
    }

    return value;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 保護 /admin/* 和 /api/admin/*
  if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
    // 登入頁面和登入 API 不需要驗證
    if (path === '/admin/login' || path === '/api/admin/login') {
      return NextResponse.next();
    }

    const cookie = request.cookies.get(ADMIN_COOKIE_NAME);
    
    if (!cookie) {
      if (path.startsWith('/api/admin')) {
        return NextResponse.json(
          { error: '未授權，請先登入' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const verified = await verifyCookie(cookie.value, ADMIN_COOKIE_SECRET);
    
    if (verified !== 'authenticated') {
      if (path.startsWith('/api/admin')) {
        return NextResponse.json(
          { error: '未授權，請先登入' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 保護 /teacher/* 路由（使用老師認證）
  if (path.startsWith('/teacher')) {
    // 登入頁面不需要驗證
    if (path === '/teacher/login') {
      return NextResponse.next();
    }

    const cookie = request.cookies.get(TEACHER_COOKIE_NAME);
    
    if (!cookie) {
      return NextResponse.redirect(new URL('/teacher/login', request.url));
    }

    const verified = await verifyCookie(cookie.value, TEACHER_COOKIE_SECRET);
    
    if (!verified || !verified.startsWith('teacher:')) {
      return NextResponse.redirect(new URL('/teacher/login', request.url));
    }
  }

  // 保護 /api/teacher/* API 路由
  if (path.startsWith('/api/teacher')) {
    // 登入/登出 API 不需要驗證
    if (path === '/api/teacher/login' || path === '/api/teacher/logout') {
      return NextResponse.next();
    }

    const cookie = request.cookies.get(TEACHER_COOKIE_NAME);
    
    if (!cookie) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      );
    }

    const verified = await verifyCookie(cookie.value, TEACHER_COOKIE_SECRET);
    
    if (!verified || !verified.startsWith('teacher:')) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      );
    }
  }

  // 保護學生頁面與 API
  const isStudentPage =
    path.startsWith('/practice') ||
    path.startsWith('/diagnostic') ||
    path.startsWith('/mock-exam');
  const isStudentApi =
    path.startsWith('/api/practice') ||
    path.startsWith('/api/diagnostic') ||
    path.startsWith('/api/mock-exam') ||
    path.startsWith('/api/student');

  if (isStudentPage || isStudentApi) {
    if (path === '/api/student/login') {
      return NextResponse.next();
    }

    const cookie = request.cookies.get(STUDENT_COOKIE_NAME);
    if (!cookie) {
      if (isStudentApi) {
        return NextResponse.json(
          { error: '未授權，請先登入' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }

    const verified = await verifyCookie(cookie.value, STUDENT_COOKIE_SECRET);
    if (!verified) {
      if (isStudentApi) {
        return NextResponse.json(
          { error: '未授權，請先登入' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/teacher/:path*',
    '/api/teacher/:path*',
    '/practice/:path*',
    '/diagnostic/:path*',
    '/mock-exam/:path*',
    '/api/practice/:path*',
    '/api/diagnostic/:path*',
    '/api/mock-exam/:path*',
    '/api/student/:path*',
  ],
};


