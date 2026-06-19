// TODO(8795-Ф3): сверить с финальным контрактом backend-tl
import { apiCall } from './client';
import type { LessonListItem, LessonDetail, CheckAnswer, CheckResponse } from './types';

interface LessonsApiResponse { data: LessonListItem[]; }
interface LessonDetailApiResponse { data: LessonDetail; }
interface CheckApiResponse { data: CheckResponse; }

export async function getLessons(): Promise<LessonListItem[]> {
  const body = await apiCall<LessonsApiResponse>('GET', '/api/lessons');
  return body.data;
}

export async function getLessonDetail(slug: string): Promise<LessonDetail> {
  const body = await apiCall<LessonDetailApiResponse>('GET', `/api/lessons/${slug}`);
  return body.data;
}

export async function checkLesson(slug: string, answers: CheckAnswer[]): Promise<CheckResponse> {
  const body = await apiCall<CheckApiResponse>('POST', `/api/lessons/${slug}/check`, {
    data: { answers },
  });
  return body.data;
}
