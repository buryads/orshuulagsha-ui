import { apiCall } from './client';
import type {
  DataEnvelope,
  ExplainFrom,
  ExplainResponse,
} from '@/lib/api/types';

export async function explainText(
  text: string,
  from: ExplainFrom,
  locale: string,
): Promise<ExplainResponse> {
  const body = await apiCall<DataEnvelope<ExplainResponse>>(
    'POST',
    '/api/explain',
    { data: { text, from, locale } },
  );
  return body.data;
}
