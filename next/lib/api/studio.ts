import { apiCall } from './client';

export type Level = 'A0' | 'A1' | 'A2' | 'B1' | 'B2';
export const LEVELS: Level[] = ['A0', 'A1', 'A2', 'B1', 'B2'];

export type LessonStatus = 'draft' | 'text_ready' | 'audio_ready' | 'review' | 'published';
export const STATUSES: LessonStatus[] = ['draft', 'text_ready', 'audio_ready', 'review', 'published'];

export type ExerciseType = 'match' | 'type' | 'listen-pick' | 'image-pick';
export const EXERCISE_TYPES: ExerciseType[] = ['match', 'type', 'listen-pick', 'image-pick'];

export type Missing = 'audio' | 'exercises' | 'review';

export interface StudioMe {
  id: number;
  name: string;
  roles: string[];
  is_admin: boolean;
}

export interface LevelOverview {
  level: Level;
  lessons: number;
  with_exercises: number;
  voiced: number;
  reviewed: number;
  published: number;
}

export interface StudioOverview {
  levels: LevelOverview[];
  statuses: Partial<Record<LessonStatus, number>>;
}

export interface StudioUnit {
  id: number;
  level: Level;
  slug: string;
  title_ru: string;
  title_bur: string | null;
  description_ru: string | null;
  position: number;
  lessons_count: number;
}

export interface LessonRow {
  id: number;
  slug: string;
  unit_id: number | null;
  level: Level | null;
  position: number;
  title: string;
  title_bur: string | null;
  status: LessonStatus;
  bur_reviewed: boolean;
  is_published: boolean;
  exercise_count: number;
  audio_total: number;
  audio_done: number;
  review_note?: string | null;
}

export interface Recording {
  uuid: string;
  url: string;
  mime: string;
  size: number;
  duration_ms: number | null;
  text: string | null;
  source: 'tts' | 'user';
  updated_at: string;
  text_key?: string | null;
}

export interface VocabItem {
  bur: string;
  ru: string;
  source?: string;
  burword_id?: number;
}

export interface PhraseItem {
  bur: string;
  ru: string;
  source?: string;
}

export interface StudioExercise {
  id: number;
  type: ExerciseType;
  prompt: string;
  payload: Record<string, unknown>;
  position: number;
  recording: Recording | null;
  text_key?: string | null;
}

export interface LineRecording {
  line: string;
  line_key: string;
  recording: Recording | null;
}

export interface LessonDetail extends LessonRow {
  description: string | null;
  goal_ru: string | null;
  review_note: string | null;
  grammar: string[];
  vocab: VocabItem[];
  phrases: PhraseItem[];
  audio_lines: string[];
  xp_reward: number | null;
  unit: { id: number; title_ru: string; level: Level } | null;
  exercises: StudioExercise[];
  line_recordings: LineRecording[];
}

export interface LessonFilters {
  level?: Level;
  unit_id?: number;
  status?: LessonStatus;
  missing?: Missing;
  q?: string;
}

export type LessonPatch = Partial<{
  title: string;
  title_bur: string | null;
  description: string | null;
  goal_ru: string | null;
  review_note: string | null;
  grammar: string[];
  vocab: VocabItem[];
  phrases: PhraseItem[];
  audio_lines: string[];
  unit_id: number | null;
  position: number;
  xp_reward: number;
  status: LessonStatus;
  bur_reviewed: boolean;
}>;

export interface Teacher {
  id: number;
  name: string;
  email: string;
}

interface Envelope<T> {
  data: T;
}

const BASE = '/api/studio';

export async function getMe(): Promise<StudioMe> {
  return (await apiCall<Envelope<StudioMe>>('GET', `${BASE}/me`)).data;
}

export async function getOverview(): Promise<StudioOverview> {
  return (await apiCall<Envelope<StudioOverview>>('GET', `${BASE}/overview`)).data;
}

export async function getUnits(level?: Level): Promise<StudioUnit[]> {
  return (await apiCall<Envelope<StudioUnit[]>>('GET', `${BASE}/units`, { params: { level } })).data;
}

export async function createUnit(input: {
  level: Level;
  title_ru: string;
  title_bur?: string;
  slug?: string;
  position?: number;
}): Promise<StudioUnit> {
  return (await apiCall<Envelope<StudioUnit>>('POST', `${BASE}/units`, { data: input })).data;
}

export async function updateUnit(
  id: number,
  patch: Partial<Pick<StudioUnit, 'title_ru' | 'title_bur' | 'description_ru' | 'position'>>,
): Promise<StudioUnit> {
  return (await apiCall<Envelope<StudioUnit>>('PATCH', `${BASE}/units/${id}`, { data: patch })).data;
}

export async function getLessons(filters: LessonFilters = {}): Promise<LessonRow[]> {
  const body = await apiCall<Envelope<LessonRow[]>>('GET', `${BASE}/lessons`, { params: filters });
  return body.data;
}

export async function createLesson(input: {
  title: string;
  unit_id?: number | null;
  level?: Level;
  position?: number;
}): Promise<LessonDetail> {
  return (await apiCall<Envelope<LessonDetail>>('POST', `${BASE}/lessons`, { data: input })).data;
}

export async function getLesson(id: number): Promise<LessonDetail> {
  return (await apiCall<Envelope<LessonDetail>>('GET', `${BASE}/lessons/${id}`)).data;
}

export async function updateLesson(id: number, patch: LessonPatch): Promise<LessonDetail> {
  return (await apiCall<Envelope<LessonDetail>>('PATCH', `${BASE}/lessons/${id}`, { data: patch })).data;
}

export async function getNextLesson(
  after?: number,
  opts: { level?: Level; missing?: Missing } = {},
): Promise<LessonRow | null> {
  const body = await apiCall<Envelope<LessonRow | null>>('GET', `${BASE}/lessons/next`, {
    params: { after, ...opts },
  });
  return body.data;
}

export async function deleteLesson(id: number): Promise<void> {
  await apiCall<unknown>('DELETE', `${BASE}/lessons/${id}`);
}

export async function createExercise(
  lessonId: number,
  input: { type: ExerciseType; prompt: string; payload: Record<string, unknown>; position?: number },
): Promise<StudioExercise> {
  return (
    await apiCall<Envelope<StudioExercise>>('POST', `${BASE}/lessons/${lessonId}/exercises`, { data: input })
  ).data;
}

export async function updateExercise(
  id: number,
  patch: { prompt?: string; payload?: Record<string, unknown>; position?: number },
): Promise<StudioExercise> {
  return (await apiCall<Envelope<StudioExercise>>('PATCH', `${BASE}/exercises/${id}`, { data: patch })).data;
}

export async function deleteExercise(id: number): Promise<void> {
  await apiCall<unknown>('DELETE', `${BASE}/exercises/${id}`);
}

export interface UploadAudioInput {
  file: Blob;
  filename?: string;
  ownerType: string;
  ownerId: number;
  lineKey?: string;
  text?: string;
  durationMs?: number;
}

export async function uploadAudio(
  input: UploadAudioInput,
): Promise<Recording & { points?: number }> {
  const form = new FormData();
  form.append('file', input.file, input.filename ?? 'recording');
  form.append('owner_type', input.ownerType);
  form.append('owner_id', String(input.ownerId));
  if (input.lineKey !== undefined) form.append('line_key', input.lineKey);
  if (input.text !== undefined) form.append('text', input.text);
  if (input.durationMs !== undefined) form.append('duration_ms', String(Math.round(input.durationMs)));
  return (
    await apiCall<Envelope<Recording & { points?: number }>>('POST', `${BASE}/audio`, {
      data: form,
    })
  ).data;
}

export async function deleteAudio(uuid: string): Promise<void> {
  await apiCall<unknown>('DELETE', `${BASE}/audio/${uuid}`);
}

export async function getTeachers(): Promise<Teacher[]> {
  return (await apiCall<Envelope<Teacher[]>>('GET', `${BASE}/teachers`)).data;
}

export async function addTeacher(email: string): Promise<Teacher> {
  return (await apiCall<Envelope<Teacher>>('POST', `${BASE}/teachers`, { data: { email } })).data;
}

export async function removeTeacher(userId: number): Promise<void> {
  await apiCall<unknown>('DELETE', `${BASE}/teachers/${userId}`);
}
