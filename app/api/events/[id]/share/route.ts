import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  generalRateLimit,
  createRateLimitResponse,
} from '@/lib/utils/rate-limit'
import { createSecureResponse } from '@/lib/utils/security-headers'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting
  const rateLimitResult = generalRateLimit.isAllowed(request)
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(
      rateLimitResult.remaining,
      rateLimitResult.resetTime
    )
  }

  try {
    const { id: eventId } = await params

    // Validate event ID
    if (!eventId) {
      return createSecureResponse(
        NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
      )
    }

    // Get request body
    const body = await request.json().catch(() => ({}))
    const { platform, metadata } = body

    // Validate platform
    const validPlatforms = [
      'twitter',
      'facebook',
      'instagram',
      'whatsapp',
      'telegram',
      'copy_link',
      'other',
    ]
    if (!platform || !validPlatforms.includes(platform)) {
      return createSecureResponse(
        NextResponse.json(
          { error: 'Valid platform is required' },
          { status: 400 }
        )
      )
    }

    // Authenticate user (optional - anonymous shares are allowed)
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Verify event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return createSecureResponse(
        NextResponse.json({ error: 'Event not found' }, { status: 404 })
      )
    }

    // Get client IP address
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Insert share record
    const { error: insertError } = await supabase.from('event_shares').insert({
      event_id: eventId,
      user_id: user?.id || null,
      share_platform: platform,
      share_url: metadata?.shareUrl || null,
      ip_address: ipAddress,
      user_agent: metadata?.userAgent || request.headers.get('user-agent') || null,
    })

    if (insertError) {
      console.error('Error tracking event share:', insertError)
      return createSecureResponse(
        NextResponse.json(
          { error: 'Failed to track share' },
          { status: 500 }
        )
      )
    }

    return createSecureResponse(
      NextResponse.json({ success: true }, { status: 200 })
    )
  } catch (error) {
    console.error('Error in event share tracking:', error)
    return createSecureResponse(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    )
  }
}

