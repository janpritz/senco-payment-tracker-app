import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('admin_token')?.value;
    const role = request.cookies.get('admin_role')?.value; // e.g., "Adviser", "Admin", "Super Admin"
    const { pathname } = request.nextUrl;

    const isLoginPage = pathname === '/admin/login';

    // 1. PUBLIC ACCESS
    if (!token && pathname.startsWith('/admin') && !isLoginPage) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // 2. AUTHENTICATED REDIRECT
    if (token && isLoginPage) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // 3. ROLE-BASED PROTECTION
    const restrictedPaths = ['/admin/accounts', '/admin/masterlist'];
    const isTryingToAccessRestricted = restrictedPaths.some(path => pathname.startsWith(path));

    if (isTryingToAccessRestricted) {
        // Only "Super Admin" (or whatever your top-level role is) can pass.
        // If the role is "Admin" OR "Adviser", they are blocked.
        const forbiddenRoles = ['Adviser'];
        const isForbidden = forbiddenRoles.includes(role || '');

        if (isForbidden) {
            const url = new URL('/admin/dashboard', request.url);
            url.searchParams.set('error', 'unauthorized_access');
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};