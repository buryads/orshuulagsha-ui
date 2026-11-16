import { describe, expect, it } from 'vitest';
import { buildPayload, draftFromPayload, emptyDraft, validatePayload } from './payload';

describe('buildPayload', () => {
  it('match trims pairs', () => {
    expect(buildPayload('match', { pairs: [[' a ', 'б'], ['c', ' d']] })).toEqual({
      pairs: [['a', 'б'], ['c', 'd']],
    });
  });

  it('type omits empty prompt and accept', () => {
    expect(buildPayload('type', { prompt: '', correct_answer: ' сайн ', accept: [' ', ''] })).toEqual({
      correct_answer: 'сайн',
    });
  });

  it('type keeps prompt and accept alternatives', () => {
    expect(buildPayload('type', { prompt: 'привет', correct_answer: 'сайн', accept: ['сайн байна', ' '] })).toEqual({
      prompt: 'привет',
      correct_answer: 'сайн',
      accept: ['сайн байна'],
    });
  });

  it('listen-pick preserves audio_uuid and never invents audio_url', () => {
    const out = buildPayload('listen-pick', {
      audio_text: 'сайн',
      options: ['сайн', 'муу'],
      correct_answer: 'сайн',
      audio_uuid: 'u-1',
    });
    expect(out).toEqual({ audio_uuid: 'u-1', audio_text: 'сайн', options: ['сайн', 'муу'], correct_answer: 'сайн' });
    expect(out).not.toHaveProperty('audio_url');
  });

  it('image-pick normalises empty image_url to null and drops empty hint', () => {
    expect(
      buildPayload('image-pick', {
        options: [
          { label: 'а', image_url: '' },
          { label: 'б', image_url: 'https://x/y.png' },
        ],
        correct_answer: 'а',
        image_hint: ' ',
      }),
    ).toEqual({
      options: [
        { label: 'а', image_url: null },
        { label: 'б', image_url: 'https://x/y.png' },
      ],
      correct_answer: 'а',
    });
  });
});

describe('draftFromPayload', () => {
  it('round-trips each type', () => {
    for (const type of ['match', 'type', 'listen-pick', 'image-pick'] as const) {
      const d = emptyDraft(type);
      expect(draftFromPayload(type, buildPayload(type, d))).toEqual(d);
    }
  });

  it('tolerates junk', () => {
    expect(draftFromPayload('match', { pairs: 'x' })).toEqual({ pairs: [] });
    expect(draftFromPayload('image-pick', { options: [null, 3] })).toMatchObject({ options: [] });
  });
});

describe('validatePayload', () => {
  it('match needs two full pairs', () => {
    expect(validatePayload('match', { pairs: [['a', 'b']] })).toContain('pairsMin');
    expect(validatePayload('match', { pairs: [['a', 'b'], ['c', '']] })).toContain('pairEmpty');
    expect(validatePayload('match', { pairs: [['a', 'b'], ['c', 'd']] })).toEqual([]);
  });

  it('type needs an answer', () => {
    expect(validatePayload('type', { correct_answer: ' ' })).toEqual(['answerEmpty']);
    expect(validatePayload('type', { correct_answer: 'x' })).toEqual([]);
  });

  it('listen-pick checks text, count, duplicates and answer membership', () => {
    const ok = { audio_text: 't', options: ['a', 'b'], correct_answer: 'a' };
    expect(validatePayload('listen-pick', ok)).toEqual([]);
    expect(validatePayload('listen-pick', { ...ok, audio_text: '' })).toContain('audioTextEmpty');
    expect(validatePayload('listen-pick', { ...ok, options: ['a'] })).toContain('optionsRange');
    expect(validatePayload('listen-pick', { ...ok, options: Array(7).fill('x') })).toContain('optionsRange');
    expect(validatePayload('listen-pick', { ...ok, options: ['a', 'a'] })).toContain('optionDup');
    expect(validatePayload('listen-pick', { ...ok, options: ['a', ''] })).toContain('optionEmpty');
    expect(validatePayload('listen-pick', { ...ok, correct_answer: 'z' })).toContain('answerNotInOptions');
  });

  it('image-pick checks the answer is one of the labels', () => {
    const opts = [{ label: 'a', image_url: null }, { label: 'b', image_url: null }];
    expect(validatePayload('image-pick', { options: opts, correct_answer: 'b' })).toEqual([]);
    expect(validatePayload('image-pick', { options: opts, correct_answer: 'c' })).toContain('answerNotInOptions');
  });
});
