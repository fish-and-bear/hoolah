import { ImageResponse } from 'next/og';

// Required for static export. The OG card has no per-request input;
// pre-render it once at build time and serve as a flat PNG.
export const dynamic = 'force-static';

export const alt = 'hoolah, a daily Filipino word game';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Static OG card. Wordmark on ivory, a row of five empty tiles, the
// tagline. No date stamp here; OG images bake at build time and the
// 'day' of a static-exported page is whenever it was deployed, which
// would lie in cache for hours after midnight. A timeless brand card
// reads more honestly.
export default function OG() {
  const tile = {
    width: 110,
    height: 110,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid rgba(14, 14, 14, 0.18)',
    fontFamily: 'serif',
    fontWeight: 700,
    fontSize: 64,
    color: '#0E0E0E',
    background: '#F4EDE3',
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#F4EDE3',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px',
          color: '#0E0E0E',
        }}
      >
        <div
          style={{
            fontFamily: 'serif',
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: 240,
            color: '#5B0E11',
            letterSpacing: 0,
            lineHeight: 1,
            marginBottom: 24,
          }}
        >
          hoolah
        </div>
        <div
          style={{
            fontFamily: 'sans-serif',
            fontSize: 30,
            color: 'rgba(14, 14, 14, 0.65)',
            marginBottom: 56,
            letterSpacing: 0,
            textTransform: 'lowercase',
          }}
        >
          guess the Filipino word
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ ...tile, background: '#4F7942', color: '#fff', borderColor: '#4F7942' }}>H</div>
          <div style={{ ...tile, background: '#C8A04C', color: '#fff', borderColor: '#C8A04C' }}>O</div>
          <div style={tile}>O</div>
          <div style={tile}>L</div>
          <div style={tile}>A</div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            right: 48,
            fontFamily: 'sans-serif',
            fontSize: 20,
            color: 'rgba(14, 14, 14, 0.55)',
          }}
        >
          hoolah.hapinas.net
        </div>
      </div>
    ),
    { ...size }
  );
}
