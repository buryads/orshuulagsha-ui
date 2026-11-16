export type KonamiInput = 'up' | 'down' | 'left' | 'right' | 'b' | 'a';

const SEQUENCE: KonamiInput[] = [
  'up',
  'up',
  'down',
  'down',
  'left',
  'right',
  'left',
  'right',
  'b',
  'a',
];

export const KONAMI_START = 0;

const ARROWS: Record<string, KonamiInput> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

export function konamiInput(e: { key: string; code?: string }): KonamiInput | null {
  const arrow = ARROWS[e.key];
  if (arrow) return arrow;
  if (e.code === 'KeyB') return 'b';
  if (e.code === 'KeyA') return 'a';
  const k = e.key.toLowerCase();
  if (k === 'b' || k === 'и') return 'b';
  if (k === 'a' || k === 'ф') return 'a';
  return null;
}

export function feedKonami(
  progress: number,
  input: KonamiInput | null,
): { progress: number; done: boolean } {
  if (input === null) return { progress: 0, done: false };
  if (SEQUENCE[progress] === input) {
    const next = progress + 1;
    return next === SEQUENCE.length ? { progress: 0, done: true } : { progress: next, done: false };
  }
  if (input === SEQUENCE[0]) return { progress: progress === 2 ? 2 : 1, done: false };
  return { progress: 0, done: false };
}

export function swallowsArrow(progress: number, input: KonamiInput | null): boolean {
  return (
    progress >= 3 && (input === 'up' || input === 'down' || input === 'left' || input === 'right')
  );
}
