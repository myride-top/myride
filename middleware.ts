import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Developer bypass - only in development mode
  const isDevMode = process.env.NODE_ENV === 'development'

  // Allow developer access only in development
  if (isDevMode) {
    return NextResponse.next()
  }

  // Allow access to coming-soon page
  if (pathname === '/coming-soon') {
    return NextResponse.next()
  }

  // Allow access to static assets (images, CSS, JS, etc.)
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/logo')
  ) {
    return NextResponse.next()
  }

  // Redirect everything else to coming soon
  return NextResponse.redirect(new URL('/coming-soon', request.url))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
