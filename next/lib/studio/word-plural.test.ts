import { describe, expect, it } from 'vitest';
import { enForm, ruForm } from './word-plural';

describe('ruForm', () => {
  it.each([
    [1, 'one'],
    [21, 'one'],
    [101, 'one'],
    [2, 'few'],
    [4, 'few'],
    [22, 'few'],
    [24, 'few'],
    [5, 'many'],
    [11, 'many'],
    [12, 'many'],
    [14, 'many'],
    [20, 'many'],
    [25, 'many'],
    [111, 'many'],
    [0, 'many'],
  ] as const)('%i -> %s', (n, form) => {
    expect(ruForm(n)).toBe(form);
  });
});

describe('enForm', () => {
  it('uses singular only for 1', () => {
    expect(enForm(1)).toBe('one');
    expect(enForm(0)).toBe('other');
    expect(enForm(2)).toBe('other');
  });
});
