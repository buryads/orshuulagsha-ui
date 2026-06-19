// Контракт: GET /api/srs/due, POST /api/srs/grade [auth:sanctum]
// Источник: backend-tl (Кабан), борд API-CONTRACTS.
import { apiCall } from './client';
import type { SrsDueItem, SrsDueResponse, SrsGradeResponse, SrsGradeValue } from '@/lib/api/types';

const RESOURCE_DUE = '/api/srs/due';
const RESOURCE_GRADE = '/api/srs/grade';

interface SrsDueApiResponse {
  data: SrsDueItem[];
  meta: { count: number };
}

interface SrsGradeApiResponse {
  data: SrsGradeResponse;
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
    cards: body.data,
    count: body.meta.count,
  };
}

/**
 * Отправляет оценку за карточку.
 *
 * Маппинг кнопок → числовой grade (grade < 3 = lapse):
 *   Again = 1  (lapse: reps сбрасываются)
 *   Hard  = 3  (не lapse)
 *   Good  = 4
 *   Easy  = 5
 *
 * 404 — слова нет в паках юзера.
 * 422 — grade вне допустимого диапазона 0-5.
 */
export async function gradeCard(
  wordId: number,
  grade: SrsGradeValue,
): Promise<SrsGradeResponse> {
  const body = await apiCall<SrsGradeApiResponse>('POST', RESOURCE_GRADE, {
    data: { word_id: wordId, grade },
  });
  return body.data;
}
