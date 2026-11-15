export interface ShareCardData {
  phrase: string;
  source: string | null;
  meaning: string | null;
  points: string[];
  words: { surface: string; detail: string }[];
  moreWords: string | null;
  wordsTitle: string;
  aiLabel: string | null;
  warning: string | null;
}

const W = 1080;
const PAD = 64;
const INNER = W - PAD * 2;
const MAX_WORDS = 8;
const MAX_POINTS = 5;
const C = {
  bg: '#F5F8FB',
  surface: '#FFFFFF',
  border: '#DDE5EE',
  text: '#1A1C1E',
  muted: '#5C6470',
  primary: '#0066B3',
  primary50: '#E5F0F9',
  primary700: '#004B85',
  primary900: '#002E54',
  warning: '#B82F2F',
};

export const shareCardLimits = { words: MAX_WORDS, points: MAX_POINTS };

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = '';
  const push = (s: string) => lines.push(s);
  for (const word of text.split(/\s+/).filter(Boolean)) {
    let rest = word;
    while (ctx.measureText(rest).width > width) {
      let n = rest.length;
      while (n > 1 && ctx.measureText(rest.slice(0, n)).width > width) n--;
      if (line) {
        push(line);
        line = '';
      }
      push(rest.slice(0, n));
      rest = rest.slice(n);
    }
    const next = line ? `${line} ${rest}` : rest;
    if (ctx.measureText(next).width > width) {
      push(line);
      line = rest;
    } else {
      line = next;
    }
  }
  if (line) push(line);
  if (lines.length <= maxLines) return lines;
  const cut = lines.slice(0, maxLines);
  let last = cut[maxLines - 1] ?? '';
  while (last.length > 1 && ctx.measureText(`${last}…`).width > width) last = last.slice(0, -1);
  cut[maxLines - 1] = `${last}…`;
  return cut;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function paint(ctx: CanvasRenderingContext2D, d: ShareCardData, family: string, draw: boolean): number {
  let y = PAD;
  const font = (weight: number, size: number) => {
    ctx.font = `${weight} ${size}px ${family}`;
  };
  const block = (text: string, weight: number, size: number, color: string, maxLines: number, gap: number, x = PAD, width = INNER) => {
    font(weight, size);
    const lines = wrap(ctx, text, width, maxLines);
    const lh = Math.round(size * 1.3);
    if (draw) {
      ctx.fillStyle = color;
      lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh + size));
    }
    y += lines.length * lh + gap;
  };

  font(700, 26);
  const aiW = d.aiLabel ? ctx.measureText(d.aiLabel).width + 40 : 0;
  if (draw && d.aiLabel) {
    ctx.fillStyle = C.primary50;
    roundRect(ctx, PAD, y - 4, aiW, 46, 23);
    ctx.fill();
    ctx.fillStyle = C.primary700;
    ctx.fillText(d.aiLabel, PAD + 20, y + 29);
  }
  y += d.aiLabel ? 80 : 0;

  if (d.warning) block(d.warning, 700, 32, C.warning, 4, 24);
  if (d.source) block(d.source, 500, 34, C.muted, 3, 20);
  block(d.phrase, 800, 62, C.primary900, 6, 28);
  if (d.meaning) block(d.meaning, 600, 38, C.text, 4, 36);

  if (d.words.length) {
    block(d.wordsTitle, 700, 30, C.muted, 1, 14);
    for (const w of d.words) {
      font(700, 38);
      const head = wrap(ctx, w.surface, INNER - 56, 2);
      font(500, 30);
      const detail = w.detail ? wrap(ctx, w.detail, INNER - 56, 2) : [];
      const h = 28 + head.length * 50 + (detail.length ? 6 + detail.length * 40 : 0) + 24;
      if (draw) {
        ctx.fillStyle = C.surface;
        roundRect(ctx, PAD, y, INNER, h, 24);
        ctx.fill();
        ctx.strokeStyle = C.border;
        ctx.lineWidth = 2;
        ctx.stroke();
        font(700, 38);
        ctx.fillStyle = C.text;
        head.forEach((l, i) => ctx.fillText(l, PAD + 28, y + 28 + i * 50 + 38));
        font(500, 30);
        ctx.fillStyle = C.muted;
        detail.forEach((l, i) => ctx.fillText(l, PAD + 28, y + 28 + head.length * 50 + 6 + i * 40 + 30));
      }
      y += h + 14;
    }
    if (d.moreWords) block(d.moreWords, 600, 30, C.muted, 1, 10);
    y += 22;
  }

  for (const p of d.points) {
    font(500, 32);
    const lines = wrap(ctx, p, INNER - 44, 3);
    if (draw) {
      ctx.fillStyle = C.primary;
      ctx.beginPath();
      ctx.arc(PAD + 10, y + 24, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = C.text;
      lines.forEach((l, i) => ctx.fillText(l, PAD + 44, y + i * 42 + 32));
    }
    y += lines.length * 42 + 16;
  }

  if (draw) {
    font(800, 34);
    ctx.fillStyle = C.primary;
    ctx.fillText('buryads.com', PAD, y + 34);
  }
  return y + 34 + PAD;
}

export async function renderShareCard(d: ShareCardData): Promise<Blob> {
  const family = getComputedStyle(document.body).fontFamily || 'sans-serif';
  const sample = `${d.phrase} ${d.source ?? ''} Аа ү ө һ`;
  await Promise.all([500, 600, 700, 800].map((w) => document.fonts.load(`${w} 40px ${family}`, sample).catch(() => [])));

  const probe = document.createElement('canvas').getContext('2d');
  if (!probe) throw new Error('canvas');
  const height = Math.ceil(paint(probe, d, family, false));

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, height);
  paint(ctx, d, family, true);
  ctx.fillStyle = C.primary;
  ctx.fillRect(0, 0, W, 10);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/png'),
  );
}
