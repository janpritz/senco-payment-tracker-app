import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Check for the admin_token cookie we set in your handleLogin hook
  const token = request.cookies.get('admin_token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  // 2. REDIRECT: If user is logged in and tries to access /admin/login
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // 3. PROTECTION: If user is NOT logged in and tries to access /admin/* (except login)
  if (!token && request.nextUrl.pathname.startsWith('/admin') && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

// Ensure this only runs on admin routes to save performance
export const config = {
  matcher: ['/admin/:path*'],
};