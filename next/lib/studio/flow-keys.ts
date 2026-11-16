interface KeyEventLike {
  key: string;
  code?: string;
}

const CYRILLIC: Record<'r' | 's', string> = { r: 'к', s: 'ы' };

export function isLetterKey(e: KeyEventLike, letter: 'r' | 's'): boolean {
  if (e.code === `Key${letter.toUpperCase()}`) return true;
  const k = e.key.toLowerCase();
  return k === letter || k === CYRILLIC[letter];
}

export function isSpaceKey(e: KeyEventLike): boolean {
  return e.code === 'Space' || e.key === ' ';
}
