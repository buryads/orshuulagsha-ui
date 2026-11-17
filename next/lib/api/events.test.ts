import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import { finalOpensOn } from './events';

const failure = (status: number, data: unknown) =>
  new AxiosError('x', undefined, undefined, undefined, { status, data } as AxiosResponse);

describe('finalOpensOn', () => {
  it('returns the date of a 403 that carries opens_on', () => {
    expect(finalOpensOn(failure(403, { message: 'Final is not open yet', opens_on: '2027-02-07' }))).toBe('2027-02-07');
  });

  it('ignores other statuses, missing dates and non-axios errors', () => {
    expect(finalOpensOn(failure(500, { opens_on: '2027-02-07' }))).toBeNull();
    expect(finalOpensOn(failure(403, { message: 'nope' }))).toBeNull();
    expect(finalOpensOn(new Error('offline'))).toBeNull();
  });
});
