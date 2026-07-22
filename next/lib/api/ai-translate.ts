import { apiCall } from './client';
import type { AiTranslateResponse, DataEnvelope } from '@/lib/api/types';

const RESOURCE_AI_TRANSLATE = '/api/ai-translate';

export async function aiTranslate(
  text: string,
  direction?: 'bur2ru' | 'ru2bur',
): Promise<AiTranslateResponse> {
  const body = await apiCall<DataEnvelope<AiTranslateResponse>>(
    'POST',
    RESOURCE_AI_TRANSLATE,
    { data: { text, direction } },
  );
  return body.data;
}

export async function sendAiTranslateFeedback(
  id: number,
  helpful: boolean,
  suggestion?: string,
): Promise<void> {
  await apiCall<void>('POST', `${RESOURCE_AI_TRANSLATE}/${id}/feedback`, {
    data: { helpful, suggestion },
  });
}
