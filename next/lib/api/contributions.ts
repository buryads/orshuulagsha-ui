import { apiCall } from './client';
import type {
  Contribution,
  ContributionType,
  ContribPayload,
  DataEnvelope,
  ModerationContribution,
  ModerationListResponse,
} from './types';

// --- User-facing ---

export interface SubmitContributionInput {
  type: ContributionType;
  payload: ContribPayload;
}

/** POST /api/contributions [auth] */
export async function submitContribution(
  input: SubmitContributionInput,
): Promise<Contribution> {
  const body = await apiCall<DataEnvelope<Contribution>>(
    'POST',
    '/api/contributions',
    { data: input },
  );
  return body.data;
}

/** GET /api/contributions/mine [auth] */
export async function getMyContributions(): Promise<Contribution[]> {
  const body = await apiCall<DataEnvelope<Contribution[]>>(
    'GET',
    '/api/contributions/mine',
  );
  return body.data;
}

// --- Moderation (admin | moderator role) ---

export interface ModerationListParams {
  status?: 'pending' | 'approved' | 'rejected';
  limit?: number;
}

/** GET /api/moderation/contributions?status=pending&limit [auth:admin|moderator] */
export async function getModerationQueue(
  params: ModerationListParams = {},
): Promise<ModerationListResponse> {
  return apiCall<ModerationListResponse>(
    'GET',
    '/api/moderation/contributions',
    { params },
  );
}

export interface ApproveContributionInput {
  note?: string;
}

/** POST /api/moderation/contributions/{id}/approve [auth:admin|moderator] */
export async function approveContribution(
  id: number,
  input: ApproveContributionInput = {},
): Promise<ModerationContribution> {
  const body = await apiCall<DataEnvelope<ModerationContribution>>(
    'POST',
    `/api/moderation/contributions/${id}/approve`,
    { data: input },
  );
  return body.data;
}

export interface RejectContributionInput {
  note: string; // ОБЯЗАТЕЛЕН
}

/** POST /api/moderation/contributions/{id}/reject [auth:admin|moderator] */
export async function rejectContribution(
  id: number,
  input: RejectContributionInput,
): Promise<ModerationContribution> {
  const body = await apiCall<DataEnvelope<ModerationContribution>>(
    'POST',
    `/api/moderation/contributions/${id}/reject`,
    { data: input },
  );
  return body.data;
}
