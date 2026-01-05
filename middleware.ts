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
  // Try to get session first (more lenient than getUser)
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  // Also try getUser as a fallback
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  // Use user from session or getUser
  const authenticatedUser = user || session?.user || null

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
    if (authenticatedUser) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/browse', request.url))
    }
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (
    authenticatedUser &&
    (request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/register')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // For client-side routes that use ProtectedRoute, let the client handle authentication
  // This prevents race conditions where middleware doesn't see the session but client does
  const isClientSideProtectedRoute = 
    request.nextUrl.pathname.startsWith('/map') ||
    request.nextUrl.pathname.startsWith('/analytics')
  
  const isServerSideProtectedRoute =
    request.nextUrl.pathname.startsWith('/create') ||
    request.nextUrl.pathname.startsWith('/profile') ||
    request.nextUrl.pathname.startsWith('/dashboard')

  // For server-side routes, redirect immediately if not authenticated
  if (!authenticatedUser && isServerSideProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // For client-side routes, always let them through and let ProtectedRoute handle redirects
  // This fixes the issue where middleware redirects even when user is authenticated
  // The client-side ProtectedRoute component will handle the redirect if needed
  // This prevents race conditions with cookie/session timing in middleware

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
