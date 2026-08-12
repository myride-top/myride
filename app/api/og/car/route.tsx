import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Car, Profile } from '@/lib/types/database'

const FORMATS = {
  og: { width: 1200, height: 630 },
  story: { width: 1080, height: 1920 },
} as const

type Format = keyof typeof FORMATS

async function loadLogoDataUrl(): Promise<string> {
  const logoBuffer = await readFile(join(process.cwd(), 'public/icon.jpg'))
  return `data:image/jpeg;base64,${logoBuffer.toString('base64')}`
}

function resolvePhotoUrl(car: Car): string | null {
  if (car.main_photo_url) return car.main_photo_url
  if (!car.photos || car.photos.length === 0) return null
  const first = car.photos[0]
  if (typeof first === 'string') return first
  if (first && typeof first === 'object' && 'url' in first && first.url) {
    return first.url
  }
  return null
}

async function loadCarData(
  username: string,
  slug: string
): Promise<{
  car: Car
  profile: Pick<Profile, 'username' | 'full_name'> | null
} | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  const supabase = createClient(url, key)

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name')
    .eq('username', username)
    .maybeSingle()

  if (!profile) return null

  const { data: car } = await supabase
    .from('cars')
    .select('*')
    .eq('url_slug', slug)
    .eq('user_id', profile.id)
    .maybeSingle()

  if (!car) return null

  return {
    car: car as Car,
    profile: { username: profile.username, full_name: profile.full_name },
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const username = searchParams.get('username')?.trim()
  const slug = searchParams.get('slug')?.trim()
  const formatParam = searchParams.get('format') || 'og'
  const format: Format = formatParam === 'story' ? 'story' : 'og'
  const { width, height } = FORMATS[format]

  if (!username || !slug) {
    return new Response('Missing username or slug', { status: 400 })
  }

  const data = await loadCarData(username, slug)
  if (!data) {
    return new Response('Car not found', { status: 404 })
  }

  const { car, profile } = data
  const photoUrl = resolvePhotoUrl(car)
  const handle = profile?.username || username
  const subtitle = `${car.year} ${car.make} ${car.model}`
  const isStory = format === 'story'
  const logoSrc = await loadLogoDataUrl()
  const logoSize = isStory ? 96 : 72

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
            background: isStory
              ? 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.55) 100%)'
              : 'linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.2) 100%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: isStory ? 'flex-end' : 'space-between',
            width: '100%',
            height: '100%',
            padding: isStory ? '72px 56px' : '48px 56px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: isStory ? 'auto' : 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt='MyRide'
              width={logoSize}
              height={logoSize}
              style={{
                width: logoSize,
                height: logoSize,
                borderRadius: isStory ? 20 : 16,
                objectFit: 'cover',
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isStory ? 16 : 12,
              alignSelf: 'stretch',
              maxWidth: isStory ? 960 : 700,
              padding: isStory ? '28px 32px' : '22px 28px',
              borderRadius: isStory ? 28 : 22,
              background: 'rgba(0, 0, 0, 0.48)',
            }}
          >
            <div
              style={{
                display: 'flex',
                color: 'rgba(255,255,255,0.78)',
                fontSize: isStory ? 28 : 22,
                fontWeight: 500,
              }}
            >
              {subtitle}
            </div>
            <div
              style={{
                display: 'flex',
                color: 'white',
                fontSize: isStory ? 64 : 52,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              {car.name}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 4,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: isStory ? 30 : 24,
                  fontWeight: 500,
                }}
              >
                @{handle}
              </div>
            </div>
            {isStory && (
              <div
                style={{
                  display: 'flex',
                  marginTop: 20,
                  padding: '14px 22px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.14)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  color: 'white',
                  fontSize: 24,
                  fontWeight: 500,
                  alignSelf: 'flex-start',
                }}
              >
                myride.top/u/{handle}/{car.url_slug}
              </div>
            )}
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
