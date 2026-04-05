import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('admin_token')?.value;
    const role = request.cookies.get('admin_role')?.value;
    const { pathname } = request.nextUrl;

    const isLoginPage = pathname === '/admin/login';

    // 1. PUBLIC ACCESS: If not logged in and trying to access admin area
    if (!token && pathname.startsWith('/admin') && !isLoginPage) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // 2. AUTHENTICATED REDIRECT: If logged in but hitting the login page
    if (token && isLoginPage) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // 3. ROLE-BASED PROTECTION: Block specific URLs for restricted roles
    const restrictedPaths = ['/admin/accounts'];
    const isTryingToAccessRestricted = restrictedPaths.some(path => pathname.startsWith(path));

    if (isTryingToAccessRestricted) {
        const hasPermission = role === 'Admin';

        if (!hasPermission) {
            // Redirect unauthorized users back to the dashboard
            const url = new URL('/admin/dashboard', request.url);
            // Optional: add a query param to show a toast on the dashboard
            url.searchParams.set('error', 'unauthorized');
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

// Ensure the middleware only runs on relevant routes
export const config = {
    matcher: [
        '/admin/:path*', 
    ],
};