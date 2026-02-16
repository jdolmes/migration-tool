import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if accessing /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to login page without authentication
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Check for session cookie
    const sessionCookie = request.cookies.get('admin_session')

    if (!sessionCookie || sessionCookie.value !== 'true') {
      // No valid session - redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: '/admin/:path*',
}
