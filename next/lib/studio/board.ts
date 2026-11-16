import type { LessonRow, LessonStatus, Missing, StudioUnit, LevelOverview } from '@/lib/api/studio';

export interface BoardFilters {
  status: LessonStatus | '';
  missing: Missing | '';
  q: string;
}

export const NO_FILTERS: BoardFilters = { status: '', missing: '', q: '' };

export function hasFilters(f: BoardFilters): boolean {
  return Boolean(f.status || f.missing || f.q.trim());
}

export function isMissing(row: LessonRow, missing: Missing): boolean {
  switch (missing) {
    case 'audio':
      return row.audio_total > 0 && row.audio_done < row.audio_total;
    case 'exercises':
      return row.exercise_count === 0;
    case 'review':
      return !row.bur_reviewed;
  }
}

export function filterLessons(rows: LessonRow[], f: BoardFilters): LessonRow[] {
  const q = f.q.trim().toLowerCase();
  return rows.filter((r) => {
    if (f.status && r.status !== f.status) return false;
    if (f.missing && !isMissing(r, f.missing)) return false;
    if (q) {
      const hay = `${r.title} ${r.title_bur ?? ''} ${r.slug}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export interface UnitGroup {
  unit: StudioUnit | null;
  lessons: LessonRow[];
}

export function groupByUnit(rows: LessonRow[], units: StudioUnit[], keepEmpty: boolean): UnitGroup[] {
  const byUnit = new Map<number, LessonRow[]>();
  const loose: LessonRow[] = [];
  for (const r of rows) {
    if (r.unit_id === null || !units.some((u) => u.id === r.unit_id)) {
      loose.push(r);
      continue;
    }
    const list = byUnit.get(r.unit_id) ?? [];
    list.push(r);
    byUnit.set(r.unit_id, list);
  }
  const groups: UnitGroup[] = [];
  for (const unit of [...units].sort((a, b) => a.position - b.position || a.id - b.id)) {
    const lessons = byUnit.get(unit.id) ?? [];
    if (lessons.length || keepEmpty) groups.push({ unit, lessons });
  }
  if (loose.length) groups.push({ unit: null, lessons: loose });
  return groups;
}

export function flattenIds(groups: UnitGroup[]): number[] {
  return groups.flatMap((g) => g.lessons.map((l) => l.id));
}

export function moveSelection(ids: number[], current: number | null, delta: 1 | -1): number | null {
  if (!ids.length) return null;
  const idx = current === null ? -1 : ids.indexOf(current);
  if (idx === -1) return (delta === 1 ? ids[0] : ids[ids.length - 1]) ?? null;
  return ids[Math.min(ids.length - 1, Math.max(0, idx + delta))] ?? null;
}

export function neighbourId(ids: number[], current: number, delta: 1 | -1): number | null {
  const idx = ids.indexOf(current);
  if (idx === -1) return null;
  return ids[idx + delta] ?? null;
}

export function levelProgress(o: LevelOverview | undefined): { done: number; total: number } {
  return { done: o?.voiced ?? 0, total: o?.lessons ?? 0 };
}

export function missingBadges(row: LessonRow): { exercises: boolean; audio: boolean; review: boolean } {
  return {
    exercises: row.exercise_count === 0,
    audio: row.audio_total > 0 && row.audio_done < row.audio_total,
    review: !row.bur_reviewed,
  };
}

export function toRow(d: LessonRow): LessonRow {
  return {
    id: d.id,
    slug: d.slug,
    unit_id: d.unit_id,
    level: d.level,
    position: d.position,
    title: d.title,
    title_bur: d.title_bur,
    status: d.status,
    bur_reviewed: d.bur_reviewed,
    is_published: d.is_published,
    exercise_count: d.exercise_count,
    audio_total: d.audio_total,
    audio_done: d.audio_done,
    review_note: d.review_note,
  };
}
