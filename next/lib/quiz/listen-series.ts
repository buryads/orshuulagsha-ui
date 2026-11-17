import type { ListenAnswerResult, ListenItem } from '@/lib/api/types';

export const CANT_HEAR_LIMIT = 5;

export type Pending =
  | { kind: 'choice'; choice: number }
  | { kind: 'dont_know' }
  | { kind: 'cant_hear' };

export type Step =
  | { status: 'asking' }
  | { status: 'sending'; pending: Pending }
  | { status: 'failed'; pending: Pending; expired?: boolean }
  | { status: 'revealed'; pending: Pending; result: ListenAnswerResult }
  | { status: 'audioFailed' };

export type Verdict = 'correct' | 'wrong' | 'cantHear';

export interface SeriesState {
  items: ListenItem[];
  index: number;
  verdicts: Verdict[];
  step: Step;
}

export type SeriesAction =
  | { type: 'start'; items: ListenItem[] }
  | { type: 'pick'; pending: Pending }
  | { type: 'answered'; result: ListenAnswerResult }
  | { type: 'failed'; expired?: boolean }
  | { type: 'audioFailed' }
  | { type: 'next' };

export const EMPTY_SERIES: SeriesState = {
  items: [],
  index: 0,
  verdicts: [],
  step: { status: 'asking' },
};

export function countCantHear(verdicts: Verdict[]): number {
  return verdicts.filter((v) => v === 'cantHear').length;
}

export function canPickCantHear(verdicts: Verdict[]): boolean {
  return countCantHear(verdicts) < CANT_HEAR_LIMIT;
}

export function isSeriesFinished(state: SeriesState): boolean {
  return state.index >= state.items.length;
}

export function summarizeSeries(verdicts: Verdict[]): {
  correct: number;
  scored: number;
  cantHear: number;
  listened: number;
} {
  const correct = verdicts.filter((v) => v === 'correct').length;
  const wrong = verdicts.filter((v) => v === 'wrong').length;
  return {
    correct,
    scored: correct + wrong,
    cantHear: countCantHear(verdicts),
    listened: verdicts.length,
  };
}

function verdictOf(pending: Pending, result: ListenAnswerResult): Verdict {
  if (pending.kind === 'cant_hear') return 'cantHear';
  return pending.kind === 'choice' && result.correct ? 'correct' : 'wrong';
}

export function seriesReducer(state: SeriesState, action: SeriesAction): SeriesState {
  switch (action.type) {
    case 'start':
      return { items: action.items, index: 0, verdicts: [], step: { status: 'asking' } };
    case 'pick': {
      const canSend = state.step.status === 'asking' || state.step.status === 'failed';
      if (!canSend) return state;
      if (action.pending.kind === 'cant_hear' && !canPickCantHear(state.verdicts)) return state;
      return { ...state, step: { status: 'sending', pending: action.pending } };
    }
    case 'answered': {
      if (state.step.status !== 'sending') return state;
      const { pending } = state.step;
      return {
        ...state,
        verdicts: [...state.verdicts, verdictOf(pending, action.result)],
        step: { status: 'revealed', pending, result: action.result },
      };
    }
    case 'failed':
      if (state.step.status !== 'sending') return state;
      return {
        ...state,
        step: { status: 'failed', pending: state.step.pending, expired: action.expired },
      };
    case 'audioFailed':
      if (state.step.status !== 'asking') return state;
      return { ...state, step: { status: 'audioFailed' } };
    case 'next': {
      const canAdvance =
        state.step.status === 'revealed' ||
        state.step.status === 'audioFailed' ||
        (state.step.status === 'failed' && state.step.expired === true);
      if (!canAdvance) return state;
      return { ...state, index: state.index + 1, step: { status: 'asking' } };
    }
  }
}
