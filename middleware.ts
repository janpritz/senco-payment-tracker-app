import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('admin_token')?.value;
    const role = request.cookies.get('admin_role')?.value; 
    const { pathname } = request.nextUrl;

    const isLoginPage = pathname === '/admin/login';
    const isPublicDisplay = pathname === '/queue/display';

    // 1. PUBLIC ACCESS
    // Allow anyone to see the queue display without a token
    if (isPublicDisplay) {
        return NextResponse.next();
    }

    // 2. GUEST CHECK
    // If no token, and trying to access protected queue or admin paths
    if (!token && !isLoginPage) {
        if (pathname.startsWith('/admin') || pathname.startsWith('/queue')) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // 3. AUTHENTICATED REDIRECT (Login Page logic)
    if (token && isLoginPage) {
        if (role === 'Staff') {
            return NextResponse.redirect(new URL('/queue/register', request.url));
        }
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // 4. ROLE-BASED ACCESS CONTROL
    if (token) {
        // STAFF LIMITATIONS
        if (role === 'Staff') {
            // Staff cannot access /admin panel or dashboard
            if (pathname.startsWith('/admin')) {
                return NextResponse.redirect(new URL('/queue/register', request.url));
            }
        }

        // ADMIN/ADVISER LIMITATIONS
        const restrictedAdminPaths = ['/admin/accounts', '/admin/masterlist'];
        if (restrictedAdminPaths.some(path => pathname.startsWith(path))) {
            if (role === 'Adviser' || role === 'Staff') {
                const fallback = role === 'Staff' ? '/queue/record' : '/admin/dashboard';
                return NextResponse.redirect(new URL(fallback, request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*', 
        '/queue/:path*' 
    ],
};