import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import { tooShortMinDays } from './studio-events';

const failure = (status: number, data: unknown) =>
  new AxiosError('x', undefined, undefined, undefined, { status, data } as AxiosResponse);

describe('tooShortMinDays', () => {
  it('returns min_days for a too_short 422', () => {
    expect(tooShortMinDays(failure(422, { code: 'too_short', min_days: 7 }))).toBe(7);
  });

  it('ignores other codes and statuses', () => {
    expect(tooShortMinDays(failure(422, { code: 'empty_days', min_days: 7 }))).toBeNull();
    expect(tooShortMinDays(failure(500, { code: 'too_short', min_days: 7 }))).toBeNull();
    expect(tooShortMinDays(new Error('x'))).toBeNull();
  });
});
