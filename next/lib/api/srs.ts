// Контракт: GET /api/srs/due, POST /api/srs/grade [auth:sanctum]
// Источник: backend-tl (Кабан), борд API-CONTRACTS.
import { apiCall } from './client';
import type { SrsDueItem, SrsDueResponse } from '@/lib/api/types';

const RESOURCE_DUE = '/api/srs/due';
const RESOURCE_GRADE = '/api/srs/grade';

interface SrsDueApiResponse {
  data: SrsDueItem[];
  meta: { count: number };
}

/**
 * Возвращает карточки к повторению на сегодня из паков пользователя.
 * Новые слова (is_new: true, due_at: null) идут первыми — порядок от бэка,
 * не пересортировываем.
 * Требует авторизацию (sanctum); при 401 бросает AxiosError.
 */
export async function getDueCards(): Promise<SrsDueResponse> {
  const body = await apiCall<SrsDueApiResponse>('GET', RESOURCE_DUE);
  return {
    items: body.data,
    count: body.meta.count,
  };
}

/**
 * Отправляет оценку за карточку.
 *
 * UI-маппинг кнопок → grade int (grade < 3 = lapse, reps сбрасываются):
 *   Again = 1  (единственная даёт lapse)
 *   Hard  = 3  (не lapse)
 *   Good  = 4
 *   Easy  = 5
 *
 * Контракт принимает 0–5; 404 — слова нет в паках; 422 — grade вне диапазона.
 */
export async function gradeCard(wordId: number, grade: number): Promise<void> {
  await apiCall<unknown>('POST', RESOURCE_GRADE, {
    data: { word_id: wordId, grade },
  });
}
