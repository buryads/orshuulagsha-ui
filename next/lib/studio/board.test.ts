import { describe, expect, it } from 'vitest';
import type { LessonRow, StudioUnit } from '@/lib/api/studio';
import {
  filterLessons,
  flattenIds,
  groupByUnit,
  levelProgress,
  missingBadges,
  moveSelection,
  neighbourId,
  NO_FILTERS,
  toRow,
} from './board';

const row = (over: Partial<LessonRow>): LessonRow => ({
  id: 1,
  slug: 's',
  unit_id: 1,
  level: 'A1',
  position: 1,
  title: 'Привет',
  title_bur: null,
  status: 'draft',
  bur_reviewed: false,
  is_published: false,
  exercise_count: 0,
  audio_total: 0,
  audio_done: 0,
  ...over,
});

const unit = (id: number, position: number): StudioUnit => ({
  id,
  level: 'A1',
  slug: `u${id}`,
  title_ru: `U${id}`,
  title_bur: null,
  description_ru: null,
  position,
  lessons_count: 0,
});

describe('filterLessons', () => {
  const rows = [
    row({ id: 1, title: 'Привет', exercise_count: 2, audio_total: 2, audio_done: 2, bur_reviewed: true, status: 'review' }),
    row({ id: 2, title: 'Семья', title_bur: 'Гэр бүлэ', audio_total: 3, audio_done: 1 }),
  ];

  it('returns everything without filters', () => {
    expect(filterLessons(rows, NO_FILTERS)).toHaveLength(2);
  });

  it('filters by status', () => {
    expect(filterLessons(rows, { ...NO_FILTERS, status: 'review' }).map((r) => r.id)).toEqual([1]);
  });

  it('filters by missing kind like the server', () => {
    expect(filterLessons(rows, { ...NO_FILTERS, missing: 'audio' }).map((r) => r.id)).toEqual([2]);
    expect(filterLessons(rows, { ...NO_FILTERS, missing: 'exercises' }).map((r) => r.id)).toEqual([2]);
    expect(filterLessons(rows, { ...NO_FILTERS, missing: 'review' }).map((r) => r.id)).toEqual([2]);
  });

  it('searches title, title_bur and slug case-insensitively', () => {
    expect(filterLessons(rows, { ...NO_FILTERS, q: 'сем' }).map((r) => r.id)).toEqual([2]);
    expect(filterLessons(rows, { ...NO_FILTERS, q: 'БҮЛЭ' }).map((r) => r.id)).toEqual([2]);
  });
});

describe('groupByUnit', () => {
  const units = [unit(2, 2), unit(1, 1)];
  const rows = [row({ id: 10, unit_id: 2 }), row({ id: 11, unit_id: 1 }), row({ id: 12, unit_id: null })];

  it('orders by unit position and puts loose lessons last', () => {
    const groups = groupByUnit(rows, units, false);
    expect(groups.map((g) => g.unit?.id ?? null)).toEqual([1, 2, null]);
    expect(flattenIds(groups)).toEqual([11, 10, 12]);
  });

  it('keeps empty units only when asked', () => {
    expect(groupByUnit([], units, false)).toEqual([]);
    expect(groupByUnit([], units, true)).toHaveLength(2);
  });
});

describe('selection helpers', () => {
  const ids = [5, 6, 7];

  it('moves and clamps', () => {
    expect(moveSelection(ids, null, 1)).toBe(5);
    expect(moveSelection(ids, null, -1)).toBe(7);
    expect(moveSelection(ids, 6, 1)).toBe(7);
    expect(moveSelection(ids, 7, 1)).toBe(7);
    expect(moveSelection(ids, 5, -1)).toBe(5);
    expect(moveSelection([], null, 1)).toBeNull();
  });

  it('finds neighbours', () => {
    expect(neighbourId(ids, 6, 1)).toBe(7);
    expect(neighbourId(ids, 7, 1)).toBeNull();
    expect(neighbourId(ids, 99, 1)).toBeNull();
  });
});

describe('progress and badges', () => {
  it('counts voiced over lessons', () => {
    expect(levelProgress({ level: 'A1', lessons: 300, with_exercises: 0, voiced: 120, reviewed: 0, published: 0 })).toEqual({
      done: 120,
      total: 300,
    });
    expect(levelProgress(undefined)).toEqual({ done: 0, total: 0 });
  });

  it('flags missing parts', () => {
    expect(missingBadges(row({ exercise_count: 1, audio_total: 2, audio_done: 2, bur_reviewed: true }))).toEqual({
      exercises: false,
      audio: false,
      review: false,
    });
  });
});

describe('toRow', () => {
  it('drops detail-only fields', () => {
    const detail = { ...row({ id: 3 }), exercises: [1], vocab: [2] } as unknown as LessonRow;
    expect(toRow(detail)).not.toHaveProperty('exercises');
    expect(toRow(detail).id).toBe(3);
  });
});
