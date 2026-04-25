import { apiCall } from './client';
import type { QuizQuestion, QuizQuestionsResponse } from '@/lib/api/types';

const RESOURCE = '/api/quiz/questions';

interface QuizQuestionsApiResponse {
  data: QuizQuestion[];
  meta: { count: number };
}

export async function getQuizQuestions(): Promise<QuizQuestionsResponse> {
  const body = await apiCall<QuizQuestionsApiResponse>('GET', RESOURCE);
  return {
    questions: body.data,
    count: body.meta.count,
  };
}
