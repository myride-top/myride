import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Allow public access to profile/garage pages (/u/[username]) and car detail pages (/u/[username]/[car])
  // Pattern: /u/username (2 path segments) or /u/username/car-slug (3 path segments)
  const pathSegments = pathname.split('/').filter(Boolean)
  const knownRoutes = [
    'browse',
    'create',
    'profile',
    'dashboard',
    'login',
    'register',
    'analytics',
    'premium',
    'buy-car-slot',
    'map',
    'legal',
    'api',
    '_next',
  ]
  const isProfilePage =
    pathSegments.length === 2 &&
    pathSegments[0] === 'u' &&
    !knownRoutes.includes(pathSegments[1]) &&
    !pathSegments[1].startsWith('_') &&
    !pathSegments[1].startsWith('api')
  const isCarDetailPage =
    pathSegments.length === 3 &&
    pathSegments[0] === 'u' &&
    !knownRoutes.includes(pathSegments[1]) &&
    !pathSegments[1].startsWith('_') &&
    !pathSegments[1].startsWith('api')

  // If it's a profile/garage page or car detail page, allow public access
  if (isProfilePage || isCarDetailPage) {
    return supabaseResponse
  }

  // Handle root path redirects
  if (pathname === '/') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/browse', request.url))
    }
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (
    user &&
    (request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/register')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user is not authenticated and trying to access protected pages, redirect to login
  // But allow public access to car detail pages ([username]/[car])
  if (
    !user &&
    (request.nextUrl.pathname.startsWith('/create') ||
      request.nextUrl.pathname.startsWith('/profile') ||
      request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/map') ||
      request.nextUrl.pathname.startsWith('/analytics'))
  ) {
    // Redirect to login for protected routes
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
