import { apiCall } from './client';
import type { DataEnvelope } from '@/lib/api/types';

const RESOURCE = '/api/email-preferences';

export type EmailCategory = 'teacher_reminders' | 'product_news';

export interface EmailPreferences {
  teacher_reminders: boolean;
  product_news: boolean;
  is_teacher: boolean;
  studio_prompt: boolean;
}

export interface EmailPreferencesInput {
  teacher_reminders?: boolean;
  product_news?: boolean;
  locale?: string;
  source?: 'profile' | 'studio_prompt';
}

export interface UnsubscribeResult {
  category: EmailCategory;
  subscribed: boolean;
}

export function isEmailCategory(value: string | null): value is EmailCategory {
  return value === 'teacher_reminders' || value === 'product_news';
}

export async function getEmailPreferences(): Promise<EmailPreferences> {
  const body = await apiCall<DataEnvelope<EmailPreferences>>('GET', RESOURCE);
  return body.data;
}

export async function updateEmailPreferences(
  data: EmailPreferencesInput,
): Promise<EmailPreferences> {
  const body = await apiCall<DataEnvelope<EmailPreferences>>('PUT', RESOURCE, { data });
  return body.data;
}

export async function dismissStudioPrompt(): Promise<void> {
  await apiCall<void>('POST', `${RESOURCE}/studio-prompt/dismiss`);
}

export async function unsubscribe(u: string, c: string, s: string): Promise<UnsubscribeResult> {
  const body = await apiCall<DataEnvelope<UnsubscribeResult>>('POST', '/api/email/unsubscribe', {
    data: { u, c, s },
  });
  return body.data;
}

export async function resubscribe(u: string, c: string, s: string): Promise<UnsubscribeResult> {
  const body = await apiCall<DataEnvelope<UnsubscribeResult>>('POST', '/api/email/resubscribe', {
    data: { u, c, s },
  });
  return body.data;
}
