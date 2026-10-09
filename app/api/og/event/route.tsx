import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Event } from '@/lib/types/database'
import { isEventUuid } from '@/lib/utils/event-path'
import { reverseGeocode } from '@/lib/utils/geocode'

async function loadLogoDataUrl(): Promise<string> {
  const logoBuffer = await readFile(join(process.cwd(), 'public/icon.jpg'))
  return `data:image/jpeg;base64,${logoBuffer.toString('base64')}`
}

async function loadEventBySlug(slug: string): Promise<Event | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  const supabase = createClient(url, key)
  let query = supabase.from('events').select('*')
  query = isEventUuid(slug) ? query.eq('id', slug) : query.eq('slug', slug)
  const { data } = await query.maybeSingle()

  return (data as Event | null) ?? null
}

function formatOgDate(dateString: string): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateString))
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')?.trim()

  if (!slug) {
    return new Response('Missing slug', { status: 400 })
  }

  const event = await loadEventBySlug(slug)
  if (!event) {
    return new Response('Event not found', { status: 404 })
  }

  const place = await reverseGeocode(event.latitude, event.longitude)
  const placeLabel =
    place?.address ||
    `${event.latitude.toFixed(3)}, ${event.longitude.toFixed(3)}`
  const dateLabel = formatOgDate(event.event_date)
  const logoSrc = await loadLogoDataUrl()
  const width = 1200
  const height = 630
  const photoUrl = event.event_image_url

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          backgroundColor: '#111118',
          fontFamily: 'sans-serif',
          overflow: 'hidden',
        }}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt=''
            width={width}
            height={height}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(145deg, #1c1c24 0%, #111118 50%, #0a0a0f 100%)',
            }}
          />
        )}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.25) 100%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            padding: '48px 56px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt='MyRide'
              width={72}
              height={72}
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                objectFit: 'cover',
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              alignSelf: 'stretch',
              maxWidth: 780,
              padding: '22px 28px',
              borderRadius: 22,
              background: 'rgba(0, 0, 0, 0.48)',
            }}
          >
            <div
              style={{
                display: 'flex',
                color: 'rgba(255,255,255,0.78)',
                fontSize: 22,
                fontWeight: 500,
              }}
            >
              {dateLabel}
            </div>
            <div
              style={{
                display: 'flex',
                color: 'white',
                fontSize: 48,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              {event.title}
            </div>
            <div
              style={{
                display: 'flex',
                color: 'rgba(255,255,255,0.9)',
                fontSize: 24,
                fontWeight: 500,
              }}
            >
              {placeLabel}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    }
  )
}
