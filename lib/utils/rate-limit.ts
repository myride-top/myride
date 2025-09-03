import { NextRequest } from 'next/server'

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private windowMs: number
  private maxRequests: number
  private keyGenerator: (request: NextRequest) => string

  constructor(options: RateLimitOptions) {
    this.windowMs = options.windowMs
    this.maxRequests = options.maxRequests
    this.keyGenerator = options.keyGenerator || this.defaultKeyGenerator
  }

  private defaultKeyGenerator(request: NextRequest): string {
    // Use IP address as default key
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
    return ip
  }

  isAllowed(request: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.keyGenerator(request)
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Clean up expired entries
    for (const [k, v] of this.requests.entries()) {
      if (v.resetTime < now) {
        this.requests.delete(k)
      }
    }

    const current = this.requests.get(key)

    if (!current || current.resetTime < now) {
      // First request or window expired
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      })
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs,
      }
    }

    if (current.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
      }
    }

    // Increment count
    current.count++
    this.requests.set(key, current)

    return {
      allowed: true,
      remaining: this.maxRequests - current.count,
      resetTime: current.resetTime,
    }
  }
}

// Create rate limiters for different endpoints
export const paymentRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 requests per 15 minutes
})

export const webhookRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
})

export const generalRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
})

export function createRateLimitResponse(
  remaining: number,
  resetTime: number
): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetTime.toString(),
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
      },
    }
  )
}
