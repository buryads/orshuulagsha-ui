import { describe, expect, it } from 'vitest';
import type { ListenAnswerResult, ListenItem } from '@/lib/api/types';
import {
  CANT_HEAR_LIMIT,
  EMPTY_SERIES,
  seriesReducer,
  summarizeSeries,
  type SeriesAction,
  type SeriesState,
  type Verdict,
} from './listen-series';

const items: ListenItem[] = Array.from({ length: 3 }, (_, i) => ({
  token: `t${i}`,
  audioUrl: `https://example.test/${i}.mp3`,
  options: ['a', 'b', 'c', 'd'],
}));

const result = (correct: boolean): ListenAnswerResult => ({
  correct,
  correctIndex: 0,
  correctText: 'ab',
  ru: null,
});

const run = (...actions: SeriesAction[]): SeriesState =>
  actions.reduce(seriesReducer, { ...EMPTY_SERIES, items });

describe('seriesReducer', () => {
  it('records correct and wrong choices and advances on next', () => {
    const s = run(
      { type: 'pick', pending: { kind: 'choice', choice: 1 } },
      { type: 'answered', result: result(true) },
      { type: 'next' },
      { type: 'pick', pending: { kind: 'choice', choice: 2 } },
      { type: 'answered', result: result(false) },
    );
    expect(s.verdicts).toEqual(['correct', 'wrong']);
    expect(s.index).toBe(1);
    expect(s.step.status).toBe('revealed');
  });

  it('counts dont_know as wrong even when the server reports correct', () => {
    const s = run(
      { type: 'pick', pending: { kind: 'dont_know' } },
      { type: 'answered', result: result(true) },
    );
    expect(s.verdicts).toEqual(['wrong']);
  });

  it('keeps the pending choice on failure and resends it on retry', () => {
    const failed = run(
      { type: 'pick', pending: { kind: 'choice', choice: 3 } },
      { type: 'failed' },
    );
    expect(failed.step).toEqual({ status: 'failed', pending: { kind: 'choice', choice: 3 } });
    const retried = seriesReducer(failed, { type: 'pick', pending: { kind: 'choice', choice: 3 } });
    expect(retried.step.status).toBe('sending');
    expect(retried.verdicts).toEqual([]);
  });

  it('advances after an audio failure without recording a verdict', () => {
    const s = run({ type: 'audioFailed' }, { type: 'next' });
    expect(s.verdicts).toEqual([]);
    expect(s.index).toBe(1);
    expect(s.step.status).toBe('asking');
  });

  it('ignores cant_hear once the per-series limit is reached', () => {
    const full: Verdict[] = Array.from({ length: CANT_HEAR_LIMIT }, () => 'cantHear');
    const s = { ...EMPTY_SERIES, items, verdicts: full };
    expect(seriesReducer(s, { type: 'pick', pending: { kind: 'cant_hear' } })).toBe(s);
  });

  it('ignores actions that do not apply to the current step', () => {
    const s = { ...EMPTY_SERIES, items };
    expect(seriesReducer(s, { type: 'answered', result: result(true) })).toBe(s);
    expect(seriesReducer(s, { type: 'next' })).toBe(s);
    expect(seriesReducer(s, { type: 'failed' })).toBe(s);
  });

  it('restarts the series on start', () => {
    const s = run(
      { type: 'audioFailed' },
      { type: 'next' },
      { type: 'start', items: items.slice(0, 1) },
    );
    expect(s).toEqual({
      items: items.slice(0, 1),
      index: 0,
      verdicts: [],
      step: { status: 'asking' },
    });
  });
});

describe('summarizeSeries', () => {
  it('separates scored answers from cant_hear and reports the listened total', () => {
    expect(summarizeSeries(['correct', 'wrong', 'cantHear', 'correct'])).toEqual({
      correct: 2,
      scored: 3,
      cantHear: 1,
      listened: 4,
    });
  });
});
