export function pickOccasion(occasions: string[], preferred: string | null, fallback: string): string {
  if (preferred && occasions.includes(preferred)) return preferred;
  if (occasions.includes(fallback)) return fallback;
  return occasions[0] ?? fallback;
}
