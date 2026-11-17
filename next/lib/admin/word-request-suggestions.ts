import axios from 'axios';

export const REQUIRED_CONFIRMATIONS = 2;

export function confirmationsLabel(confirmations: number): string {
  return `${confirmations} из ${REQUIRED_CONFIRMATIONS} подтверждений`;
}

export function canApproveCreate(confirmations: number): boolean {
  return confirmations >= REQUIRED_CONFIRMATIONS;
}

export type ApproveConflict =
  | { kind: 'needs_confirmations' }
  | { kind: 'duplicate'; existing: { id: number; slug: string } };

export function parseApproveConflict(body: unknown): ApproveConflict | null {
  if (typeof body !== 'object' || body === null) return null;
  const { code, existing } = body as { code?: unknown; existing?: unknown };
  if (code === 'needs_confirmations') return { kind: 'needs_confirmations' };
  if (code === 'duplicate' && typeof existing === 'object' && existing !== null) {
    const { id, slug } = existing as { id?: unknown; slug?: unknown };
    if (typeof id === 'number' && typeof slug === 'string') {
      return { kind: 'duplicate', existing: { id, slug } };
    }
  }
  return null;
}

export function approveConflictFromError(error: unknown): ApproveConflict | null {
  const response = axios.isAxiosError(error) ? error.response : undefined;
  if (response?.status !== 409) return null;
  return parseApproveConflict(response.data);
}
