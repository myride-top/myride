import { NextResponse } from 'next/server'

export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers for payment endpoints
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // CSP for payment pages
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com;"
  )

  return response
}

export function createSecureResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status })
  return addSecurityHeaders(response)
}
