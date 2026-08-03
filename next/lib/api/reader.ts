// Контракт Reader (Ф4 8795):
// GET  /api/texts           [auth] → {"data":[TextListItem]}
// GET  /api/texts/{slug}    [auth] → {"data":TextDetail}
// POST /api/known-words          [auth] body {burword_id} → {"data":KnownWordResponse}
// DELETE /api/known-words/{burword_id} [auth] → 204
// POST /api/srs/words        [auth] body {burword_id} → {"data":SrsAddWordResponse}
import { apiCall } from './client';
import type {
  DataEnvelope,
  KnownWordResponse,
  SrsAddWordResponse,
  TextDetail,
  TextListItem,
} from './types';

const TEXTS = '/api/texts';
const KNOWN_WORDS = '/api/known-words';
const SRS_WORDS = '/api/srs/words';

/** Список текстов для ридера */
export async function getTexts(): Promise<TextListItem[]> {
  const body = await apiCall<DataEnvelope<TextListItem[]>>('GET', TEXTS);
  return body.data;
}

/** Текст с токенами (предрасчитанные статусы known) */
export async function getTextBySlug(slug: string): Promise<TextDetail> {
  const body = await apiCall<DataEnvelope<TextDetail>>(
    'GET',
    `${TEXTS}/${slug}`,
  );
  return body.data;
}

/** Отметить слово как известное */
export async function markWordKnown(
  burwordId: number,
): Promise<KnownWordResponse> {
  const body = await apiCall<DataEnvelope<KnownWordResponse>>(
    'POST',
    KNOWN_WORDS,
    { data: { burword_id: burwordId } },
  );
  return body.data;
}

/** Снять отметку «знаю» */
export async function unmarkWordKnown(burwordId: number): Promise<void> {
  await apiCall<unknown>('DELETE', `${KNOWN_WORDS}/${burwordId}`);
}

/** Добавить слово в SRS-очередь */
export async function addWordToSrs(
  burwordId: number,
): Promise<SrsAddWordResponse> {
  const body = await apiCall<DataEnvelope<SrsAddWordResponse>>(
    'POST',
    SRS_WORDS,
    { data: { burword_id: burwordId } },
  );
  return body.data;
}
