import { ImageResponse } from 'next/og';
import { loadCard } from '@/lib/cards/load-card';

export const alt = 'buryads.com';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function loadFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=Noto+Sans:wght@700&text=${encodeURIComponent(text)}`,
        { signal: AbortSignal.timeout(3000) },
      )
    ).text();
    const url = /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/.exec(css)?.[1];
    if (!url) return null;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: { id: string } }) {
  const card = await loadCard(params.id);
  const phrase = card?.bur ?? null;
  const font = card ? await loadFont(`${phrase ?? ''}${card.ru}buryads.com`) : null;
  const fonts = font ? [{ name: 'Noto Sans', data: font, weight: 700 as const, style: 'normal' as const }] : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#F5F8FB',
          borderTop: '14px solid #0066B3',
          color: '#002E54',
          fontFamily: 'Noto Sans',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {card && phrase && <div style={{ fontSize: 68, lineHeight: 1.2 }}>{phrase}</div>}
          {card && <div style={{ fontSize: 40, color: '#1A1C1E' }}>{card.ru}</div>}
        </div>
        <div style={{ fontSize: 44, color: '#0066B3' }}>buryads.com</div>
      </div>
    ),
    { ...size, fonts },
  );
}
