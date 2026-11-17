import { apiCall } from './client';
import type {
  ListenAnswerResult,
  ListenSeriesMeta,
  ListenSeriesResponse,
  QuizQuestion,
  QuizQuestionsResponse,
} from '@/lib/api/types';

const RESOURCE = '/api/quiz/questions';
const LISTEN_RESOURCE = '/api/quiz/listen';
const LISTEN_ANSWERS_RESOURCE = '/api/quiz/listen/answers';

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

interface ListenSeriesApiResponse {
  data: { token: string; audio_url: string; options: string[] }[];
  meta: ListenSeriesMeta;
}

export async function getListenSeries(session: string): Promise<ListenSeriesResponse> {
  const body = await apiCall<ListenSeriesApiResponse>('GET', LISTEN_RESOURCE, {
    params: { session },
  });
  return {
    items: body.data.map((item) => ({
      token: item.token,
      audioUrl: item.audio_url,
      options: item.options,
    })),
    meta: body.meta,
  };
}

export type ListenAnswerInput =
  | { session: string; token: string; choice: number }
  | { session: string; token: string; cant_hear: true }
  | { session: string; token: string; dont_know: true };

interface ListenAnswerApiResponse {
  data: { correct: boolean; correct_index: number; correct_text: string; ru: string | null };
}

export async function postListenAnswer(input: ListenAnswerInput): Promise<ListenAnswerResult> {
  const body = await apiCall<ListenAnswerApiResponse>('POST', LISTEN_ANSWERS_RESOURCE, {
    data: input,
  });
  return {
    correct: body.data.correct,
    correctIndex: body.data.correct_index,
    correctText: body.data.correct_text,
    ru: body.data.ru,
  };
}
