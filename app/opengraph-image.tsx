import { ImageResponse } from 'next/og'

export const alt = 'MyRide — Showcase Your Car to the World'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(145deg, #0c0c0c 0%, #171717 45%, #0a0a0a 100%)',
          color: '#fafafa',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 80,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          MyRide
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 30,
            color: '#a3a3a3',
            letterSpacing: '0.01em',
          }}
        >
          Showcase Your Car to the World
        </div>
      </div>
    ),
    { ...size }
  )
}
