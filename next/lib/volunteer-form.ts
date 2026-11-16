const TELEGRAM_RE = /^[A-Za-z0-9_]{4,32}$/;

export interface VolunteerFormValues {
  name: string;
  telegram: string;
  helpTypes: string[];
  about: string;
  consent: boolean;
}

export type VolunteerFormErrors = Partial<
  Record<'name' | 'telegram' | 'help' | 'about' | 'consent', true>
>;

export function normalizeTelegram(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^t\.me\//i, '')
    .replace(/^@/, '')
    .replace(/[/?].*$/, '');
}

export function validateVolunteerForm(values: VolunteerFormValues): VolunteerFormErrors {
  const errors: VolunteerFormErrors = {};
  if (values.name.trim().length < 2) errors.name = true;
  if (!TELEGRAM_RE.test(normalizeTelegram(values.telegram))) errors.telegram = true;
  if (values.helpTypes.length === 0) errors.help = true;
  if (values.about.length > 1000) errors.about = true;
  if (!values.consent) errors.consent = true;
  return errors;
}
