export interface IcsInput {
  uid: string;
  start: Date;
  now: Date;
  title: string;
  description: string;
  url: string;
  durationMinutes?: number;
}

const pad = (n: number): string => String(n).padStart(2, '0');

export function formatIcsUtc(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

export function escapeIcsText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

const encoder = new TextEncoder();

function fold(line: string): string[] {
  const out: string[] = [];
  let current = '';
  let size = 0;
  let limit = 75;
  for (const ch of line) {
    const n = encoder.encode(ch).length;
    if (size + n > limit) {
      out.push(current);
      current = ' ';
      size = 1;
      limit = 75;
    }
    current += ch;
    size += n;
  }
  out.push(current);
  return out;
}

export function buildIcs(input: IcsInput): string {
  const end = new Date(input.start.getTime() + (input.durationMinutes ?? 15) * 60_000);
  const title = escapeIcsText(input.title);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//buryads.com//studio reminder//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${input.uid}`,
    `DTSTAMP:${formatIcsUtc(input.now)}`,
    `DTSTART:${formatIcsUtc(input.start)}`,
    `DTEND:${formatIcsUtc(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${escapeIcsText(`${input.description}\n${input.url}`)}`,
    `URL:${input.url}`,
    'BEGIN:VALARM',
    'TRIGGER:PT0S',
    'ACTION:DISPLAY',
    `DESCRIPTION:${title}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.flatMap(fold).join('\r\n') + '\r\n';
}
