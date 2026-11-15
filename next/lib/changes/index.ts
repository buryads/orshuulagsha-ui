import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'content', 'changes');

export type ChangeEntry = {
  slug: string;
  date: string;
  title: string;
  body: string;
  aiTranslated: boolean;
};

function parse(raw: string): { meta: Record<string, string>; body: string } {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
  if (!m) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of (m[1] ?? '').split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m[2] ?? '' };
}

function readLocale(slug: string, locale: string): string | null {
  const file = path.join(ROOT, slug, `${locale}.md`);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
}

export function getChanges(locale: string): ChangeEntry[] {
  if (!fs.existsSync(ROOT)) return [];
  const slugs = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
    .reverse();

  const entries: ChangeEntry[] = [];
  for (const slug of slugs) {
    const own = readLocale(slug, locale);
    const raw = own ?? readLocale(slug, 'ru');
    if (!raw) continue;
    const { meta, body } = parse(raw);
    entries.push({
      slug,
      date: meta.date ?? slug.slice(0, 10),
      title: meta.title ?? slug,
      body,
      aiTranslated: locale === 'bur' && (own === null || meta.bur_reviewed !== 'true'),
    });
  }
  return entries;
}
