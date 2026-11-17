import { describe, expect, it } from 'vitest';
import {
  approveConflictFromError,
  canApproveCreate,
  confirmationsLabel,
  parseApproveConflict,
} from './word-request-suggestions';

describe('confirmationsLabel', () => {
  it('shows progress toward the two required confirmations', () => {
    expect(confirmationsLabel(0)).toBe('0 из 2 подтверждений');
    expect(confirmationsLabel(1)).toBe('1 из 2 подтверждений');
    expect(confirmationsLabel(2)).toBe('2 из 2 подтверждений');
  });
});

describe('canApproveCreate', () => {
  it('allows creating the word only with two confirmations', () => {
    expect(canApproveCreate(0)).toBe(false);
    expect(canApproveCreate(1)).toBe(false);
    expect(canApproveCreate(2)).toBe(true);
    expect(canApproveCreate(3)).toBe(true);
  });
});

describe('parseApproveConflict', () => {
  it('maps needs_confirmations', () => {
    expect(parseApproveConflict({ code: 'needs_confirmations' })).toEqual({
      kind: 'needs_confirmations',
    });
  });

  it('maps duplicate with the existing word', () => {
    expect(
      parseApproveConflict({
        code: 'duplicate',
        existing: { id: 7, slug: 'tengeri' },
      }),
    ).toEqual({ kind: 'duplicate', existing: { id: 7, slug: 'tengeri' } });
  });

  it('ignores duplicate without a usable existing word', () => {
    expect(parseApproveConflict({ code: 'duplicate' })).toBeNull();
    expect(
      parseApproveConflict({ code: 'duplicate', existing: { id: '7', slug: 'x' } }),
    ).toBeNull();
  });

  it('ignores unknown codes and non-object bodies', () => {
    expect(parseApproveConflict({ code: 'other' })).toBeNull();
    expect(parseApproveConflict('Conflict')).toBeNull();
    expect(parseApproveConflict(null)).toBeNull();
  });
});

describe('approveConflictFromError', () => {
  it('reads the 409 body of an axios error', () => {
    const error = {
      isAxiosError: true,
      response: { status: 409, data: { code: 'needs_confirmations' } },
    };
    expect(approveConflictFromError(error)).toEqual({ kind: 'needs_confirmations' });
  });

  it('returns null for other statuses and non-axios errors', () => {
    expect(
      approveConflictFromError({
        isAxiosError: true,
        response: { status: 500, data: { code: 'duplicate' } },
      }),
    ).toBeNull();
    expect(approveConflictFromError(new Error('network'))).toBeNull();
  });
});
