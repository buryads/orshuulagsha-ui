export const NAME_LIMIT = 40;

export function clampName(value: string, limit: number = NAME_LIMIT): string {
  const chars = Array.from(value);
  return chars.length > limit ? chars.slice(0, limit).join('') : value;
}

export function nameCounter(value: string, limit: number = NAME_LIMIT): string {
  return `${Math.min(Array.from(value).length, limit)}/${limit}`;
}

export function pickOccasion(occasions: string[], preferred: string | null, fallback: string): string {
  if (preferred && occasions.includes(preferred)) return preferred;
  if (occasions.includes(fallback)) return fallback;
  return occasions[0] ?? fallback;
}
