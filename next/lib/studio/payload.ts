import type { ExerciseType } from '@/lib/api/studio';

export type PayloadError =
  | 'pairsMin'
  | 'pairEmpty'
  | 'answerEmpty'
  | 'optionsRange'
  | 'optionEmpty'
  | 'optionDup'
  | 'answerNotInOptions'
  | 'audioTextEmpty';

export interface MatchDraft {
  pairs: [string, string][];
}
export interface TypeDraft {
  prompt: string;
  correct_answer: string;
  accept: string[];
}
export interface ListenPickDraft {
  audio_text: string;
  options: string[];
  correct_answer: string;
  audio_uuid?: string;
  audio_url?: string;
}
export interface ImageOption {
  label: string;
  image_url: string | null;
}
export interface ImagePickDraft {
  options: ImageOption[];
  correct_answer: string;
  image_hint: string;
}

export type ExerciseDraft = MatchDraft | TypeDraft | ListenPickDraft | ImagePickDraft;

export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 6;

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const strList = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

export function emptyDraft(type: ExerciseType): ExerciseDraft {
  switch (type) {
    case 'match':
      return { pairs: [['', ''], ['', '']] };
    case 'type':
      return { prompt: '', correct_answer: '', accept: [] };
    case 'listen-pick':
      return { audio_text: '', options: ['', ''], correct_answer: '' };
    case 'image-pick':
      return {
        options: [
          { label: '', image_url: null },
          { label: '', image_url: null },
        ],
        correct_answer: '',
        image_hint: '',
      };
  }
}

export function draftFromPayload(type: ExerciseType, payload: Record<string, unknown>): ExerciseDraft {
  switch (type) {
    case 'match': {
      const raw = Array.isArray(payload.pairs) ? payload.pairs : [];
      const pairs = raw
        .filter((p): p is unknown[] => Array.isArray(p))
        .map((p): [string, string] => [str(p[0]), str(p[1])]);
      return { pairs };
    }
    case 'type':
      return {
        prompt: str(payload.prompt),
        correct_answer: str(payload.correct_answer),
        accept: strList(payload.accept),
      };
    case 'listen-pick':
      return {
        audio_text: str(payload.audio_text),
        options: strList(payload.options),
        correct_answer: str(payload.correct_answer),
        ...(str(payload.audio_uuid) ? { audio_uuid: str(payload.audio_uuid) } : {}),
        ...(str(payload.audio_url) ? { audio_url: str(payload.audio_url) } : {}),
      };
    case 'image-pick': {
      const raw = Array.isArray(payload.options) ? payload.options : [];
      const options = raw
        .filter((o): o is Record<string, unknown> => typeof o === 'object' && o !== null)
        .map((o): ImageOption => ({
          label: str(o.label),
          image_url: str(o.image_url) || null,
        }));
      return { options, correct_answer: str(payload.correct_answer), image_hint: str(payload.image_hint) };
    }
  }
}

const trim = (s: string): string => s.trim();

export function buildPayload(type: ExerciseType, draft: ExerciseDraft): Record<string, unknown> {
  switch (type) {
    case 'match':
      return { pairs: (draft as MatchDraft).pairs.map(([a, b]) => [trim(a), trim(b)]) };
    case 'type': {
      const d = draft as TypeDraft;
      const accept = d.accept.map(trim).filter(Boolean);
      return {
        ...(trim(d.prompt) ? { prompt: trim(d.prompt) } : {}),
        correct_answer: trim(d.correct_answer),
        ...(accept.length ? { accept } : {}),
      };
    }
    case 'listen-pick': {
      const d = draft as ListenPickDraft;
      return {
        ...(d.audio_uuid ? { audio_uuid: d.audio_uuid } : {}),
        ...(d.audio_url ? { audio_url: d.audio_url } : {}),
        audio_text: trim(d.audio_text),
        options: d.options.map(trim),
        correct_answer: trim(d.correct_answer),
      };
    }
    case 'image-pick': {
      const d = draft as ImagePickDraft;
      return {
        options: d.options.map((o) => ({ label: trim(o.label), image_url: o.image_url?.trim() || null })),
        correct_answer: trim(d.correct_answer),
        ...(trim(d.image_hint) ? { image_hint: trim(d.image_hint) } : {}),
      };
    }
  }
}

function checkOptions(labels: string[], answer: string): PayloadError | null {
  if (labels.length < MIN_OPTIONS || labels.length > MAX_OPTIONS) return 'optionsRange';
  if (labels.some((l) => !l)) return 'optionEmpty';
  if (new Set(labels).size !== labels.length) return 'optionDup';
  if (!labels.includes(answer)) return 'answerNotInOptions';
  return null;
}

export function validatePayload(type: ExerciseType, payload: Record<string, unknown>): PayloadError[] {
  const errors: PayloadError[] = [];
  const draft = draftFromPayload(type, payload);
  switch (type) {
    case 'match': {
      const { pairs } = draft as MatchDraft;
      if (pairs.length < 2) errors.push('pairsMin');
      if (pairs.some(([a, b]) => !a.trim() || !b.trim())) errors.push('pairEmpty');
      break;
    }
    case 'type':
      if (!(draft as TypeDraft).correct_answer.trim()) errors.push('answerEmpty');
      break;
    case 'listen-pick': {
      const d = draft as ListenPickDraft;
      if (!d.audio_text.trim()) errors.push('audioTextEmpty');
      const e = checkOptions(d.options.map(trim), trim(d.correct_answer));
      if (e) errors.push(e);
      break;
    }
    case 'image-pick': {
      const d = draft as ImagePickDraft;
      const e = checkOptions(d.options.map((o) => trim(o.label)), trim(d.correct_answer));
      if (e) errors.push(e);
      break;
    }
  }
  return errors;
}

export const DEFAULT_PROMPTS: Record<ExerciseType, string> = {
  match: 'Соедините пары',
  type: 'Переведите',
  'listen-pick': 'Послушайте и выберите',
  'image-pick': 'Выберите картинку',
};

export function effectivePrompt(type: ExerciseType, prompt: string): string {
  return prompt.trim() || DEFAULT_PROMPTS[type];
}
