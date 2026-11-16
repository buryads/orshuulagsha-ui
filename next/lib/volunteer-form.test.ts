import { describe, expect, it } from 'vitest';
import { normalizeTelegram, validateVolunteerForm, type VolunteerFormValues } from './volunteer-form';

const valid: VolunteerFormValues = {
  name: 'Аюр',
  telegram: '@ayur_bur',
  helpTypes: ['voice'],
  about: '',
  consent: true,
};

describe('validateVolunteerForm', () => {
  it('accepts a complete form with consent', () => {
    expect(validateVolunteerForm(valid)).toEqual({});
  });

  it('blocks submit without consent', () => {
    expect(validateVolunteerForm({ ...valid, consent: false })).toEqual({ consent: true });
  });

  it('reports every missing field', () => {
    const errors = validateVolunteerForm({ name: '', telegram: 'ab', helpTypes: [], about: 'x'.repeat(1001), consent: false });
    expect(Object.keys(errors).sort()).toEqual(['about', 'consent', 'help', 'name', 'telegram']);
  });
});

describe('normalizeTelegram', () => {
  it.each(['@ayur_bur', 't.me/ayur_bur', 'https://t.me/ayur_bur', 'https://t.me/ayur_bur/?start=1'])('%s', (input) => {
    expect(normalizeTelegram(input)).toBe('ayur_bur');
  });
});
