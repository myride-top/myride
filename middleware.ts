import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  buildLocalePath,
  DEFAULT_LOCALE,
  LOCALE_HEADER_NAME,
  LOCALE_COOKIE_NAME,
  isLocale,
  type Locale,
} from '@/lib/i18n/config'

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

const withLocaleCookie = (
  response: NextResponse,
  locale: Locale
): NextResponse => {
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: '/',
    sameSite: 'lax',
    maxAge: ONE_YEAR_SECONDS,
  })

  return response
}

const getRoutingContext = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname
  const pathSegments = pathname.split('/').filter(Boolean)

  const localeFromPath = isLocale(pathSegments[0]) ? pathSegments[0] : null
  const normalizedSegments = localeFromPath ? pathSegments.slice(1) : pathSegments
  const normalizedPathname =
    normalizedSegments.length > 0 ? `/${normalizedSegments.join('/')}` : '/'

  const localeFromCookie = request.cookies.get(LOCALE_COOKIE_NAME)?.value
  const resolvedLocale: Locale = isLocale(localeFromPath)
    ? localeFromPath
    : isLocale(localeFromCookie)
    ? localeFromCookie
    : DEFAULT_LOCALE

  const localePrefix = localeFromPath ? `/${localeFromPath}` : ''

  return {
    normalizedPathname,
    resolvedLocale,
    localePrefix,
  }
}

const shouldBypassLocaleRedirect = (pathname: string): boolean => {
  if (pathname.startsWith('/api')) {
    return true
  }

  // Skip metadata and file-like routes.
  if (
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.webmanifest'
  ) {
    return true
  }

  return /\.[^/]+$/.test(pathname)
}

export async function middleware(request: NextRequest) {
  const { normalizedPathname, resolvedLocale, localePrefix } =
    getRoutingContext(request)

  if (!localePrefix && !shouldBypassLocaleRedirect(normalizedPathname)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = buildLocalePath(resolvedLocale, normalizedPathname)
    const redirectResponse = NextResponse.redirect(redirectUrl)
    return withLocaleCookie(redirectResponse, resolvedLocale)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(LOCALE_HEADER_NAME, resolvedLocale)

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))

          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const authenticatedUser = user || session?.user || null

  if (normalizedPathname === '/') {
    const target = authenticatedUser ? '/dashboard' : '/browse'
    const redirectResponse = NextResponse.redirect(
      new URL(`${localePrefix}${target}`, request.url)
    )
    return withLocaleCookie(redirectResponse, resolvedLocale)
  }

  if (
    authenticatedUser &&
    (normalizedPathname === '/login' || normalizedPathname === '/register')
  ) {
    const redirectResponse = NextResponse.redirect(
      new URL(`${localePrefix}/dashboard`, request.url)
    )
    return withLocaleCookie(redirectResponse, resolvedLocale)
  }

  const isServerSideProtectedRoute =
    normalizedPathname.startsWith('/create') ||
    normalizedPathname.startsWith('/profile') ||
    normalizedPathname.startsWith('/dashboard')

  if (!authenticatedUser && isServerSideProtectedRoute) {
    const redirectResponse = NextResponse.redirect(
      new URL(`${localePrefix}/login`, request.url)
    )
    return withLocaleCookie(redirectResponse, resolvedLocale)
  }

  return withLocaleCookie(supabaseResponse, resolvedLocale)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
