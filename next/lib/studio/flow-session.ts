export interface SessionState {
  count: number;
  streak: number;
  bestStreak: number;
  skipped: number;
  uploaded: number;
  pending: string[];
  failed: string[];
}

export type SessionAction =
  | { type: 'accept' }
  | { type: 'skip' }
  | { type: 'upload-start'; id: string }
  | { type: 'upload-ok'; id: string }
  | { type: 'upload-fail'; id: string };

export const INITIAL_SESSION: SessionState = {
  count: 0,
  streak: 0,
  bestStreak: 0,
  skipped: 0,
  uploaded: 0,
  pending: [],
  failed: [],
};

const without = (list: string[], id: string): string[] => list.filter((x) => x !== id);

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'accept': {
      const streak = state.streak + 1;
      return {
        ...state,
        count: state.count + 1,
        streak,
        bestStreak: Math.max(state.bestStreak, streak),
      };
    }
    case 'skip':
      return { ...state, streak: 0, skipped: state.skipped + 1 };
    case 'upload-start':
      return {
        ...state,
        pending: state.pending.includes(action.id) ? state.pending : [...state.pending, action.id],
        failed: without(state.failed, action.id),
      };
    case 'upload-ok': {
      const known = state.pending.includes(action.id) || state.failed.includes(action.id);
      return {
        ...state,
        pending: without(state.pending, action.id),
        failed: without(state.failed, action.id),
        uploaded: known ? state.uploaded + 1 : state.uploaded,
      };
    }
    case 'upload-fail':
      return {
        ...state,
        pending: without(state.pending, action.id),
        failed: state.failed.includes(action.id) ? state.failed : [...state.failed, action.id],
      };
  }
}
