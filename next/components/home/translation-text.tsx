import type { ReactElement } from 'react';

const NO_TRANSLATION_MARKERS = [
  'фразы/слова не найдены',
  'не найдено',
  'не найден',
  'мэдүүлэл/үгэ олдобо үгы',
  'олдобо үгы',
  '-',
];

export function isNoTranslation(name: string | undefined): boolean {
  if (!name) return true;
  const t = name.trim();
  // All-parenthetical names are explanatory remarks ("(AI translation, …)"),
  // not real translations.
  if (/^\(.*\)$/.test(t)) return true;
  const norm = t.toLowerCase().replace(/[.!?]+$/, '');
  return NO_TRANSLATION_MARKERS.some((m) => norm === m || norm.startsWith(`${m} `));
}

export function hasUsefulTranslation(item: { translations?: Array<{ name: string }> }): boolean {
  return (item.translations ?? []).some((t) => !isNoTranslation(t.name));
}

// AI-generated translations sometimes return enumerated lists like
// "1) hello; 2) hi there; 3) greetings". Split into individual entries so the
// dictionary tab can render each as its own card. Returns null when the input
// isn't a recognisable list (fewer than 2 enumerated markers).
export function splitEnumerated(text: string): string[] | null {
  const trimmed = text.trim();
  const matches = [...trimmed.matchAll(/(?:^|[\s;,])\s*(\d+)[\)\.]\s+/g)];
  if (matches.length < 2) return null;
  const parts: string[] = [];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]!;
    const start = m.index! + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1]!.index! : trimmed.length;
    const piece = trimmed.slice(start, end).replace(/[;,\s]+$/, '').trim();
    if (piece) parts.push(piece);
  }
  return parts.length >= 2 ? parts : null;
}

// Splits "main text (remark)" into the main string and an optional remark
// captured from the trailing parenthesised group. Backend payloads frequently
// embed source attributions like "Мэндээ ямар байнаш? - м (Google translation)".
export function splitRemark(text: string): { main: string; remark: string | null } {
  const trimmed = text.trim();
  const m = trimmed.match(/^(.+?)\s*\(([^()]+)\)\s*$/);
  if (!m) return { main: trimmed, remark: null };
  return { main: m[1]!.trim(), remark: m[2]!.trim() };
}

export function TranslationText({
  text,
  remarkInline = false,
  remarkSize = 12,
}: {
  text: string;
  remarkInline?: boolean;
  remarkSize?: number;
}): ReactElement {
  const { main, remark } = splitRemark(text);
  if (!remark) return <>{main}</>;
  return (
    <>
      {main}
      {remarkInline ? ' ' : <br />}
      <span
        style={{
          fontSize: remarkSize,
          color: 'var(--text-muted)',
          fontWeight: 400,
          opacity: 0.85,
          marginTop: remarkInline ? 0 : 2,
          display: remarkInline ? 'inline' : 'inline-block',
          fontStyle: 'italic',
        }}
      >
        {remark}
      </span>
    </>
  );
}
