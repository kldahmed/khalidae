import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Khalid Ae - Developer & Creator'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 'bold', color: '#ffffff', letterSpacing: '-2px', marginBottom: 16 }}>
          Khalid Ae
        </div>
        <div style={{ fontSize: 32, color: '#a1a1aa', fontWeight: 400 }}>
          Developer & Digital Creator
        </div>
        <div style={{ position: 'absolute', bottom: 40, fontSize: 22, color: '#52525b' }}>
          khalidae.com
        </div>
      </div>
    ),
    { ...size }
  )
}
