// Shared API types ported from orshuulagsha-ui/repository.
// Mirrors the Laravel backend response shapes consumed by the legacy Nuxt client.

export type TranslationLanguage = 'bur' | 'ru';
export type TranslationType = 'ru2bur' | 'bur2ru';
export type Locales = 'ru' | 'bur' | 'en';

export interface WordImage {
  id: number;
  filepath: string;
  ruword_id?: number;
  burword_id?: number;
  url: string;
}

export interface WordVoiceActing {
  id: number;
  filepath: string;
  ruword_id?: number;
  burword_id?: number;
  url: string;
}

export interface Translation {
  id: number;
  name: string;
}

export interface RuWord {
  id: number;
  name: string;
}

export interface WordPivot {
  bur_word_image_id: number | null;
  burword_id: number;
  pack_id: number;
}

export interface Word {
  id: number;
  slug: string | null;
  name: string;
  images: WordImage[];
  speechs: WordVoiceActing[];
  translations: Translation[];
  ru_words: RuWord[];
  pivot?: WordPivot;
}

// Alias used by some callers — Bur-language word entries reuse the same shape.
export type BurWord = Word;

export interface MetaResponse {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: MetaResponse;
}

export interface TrainingPackQuiz {
  answers: {
    data: Word[];
  };
  correctAnswer: Word;
  yourAnswer?: number;
}

// --- Auth ---

export interface TokenResponse {
  token_type: string;
  token: string;
  // Backend serialises as ISO date string.
  expires_at: string;
}

// --- User ---

export interface IRole {
  id: number;
  level: number;
  name: string;
  slug: string;
  description: string;
}

export interface IUser {
  id: number;
  email: string;
  name: string;
  roles: IRole[];
}

export interface Pack {
  id: number;
  slug: string;
  user_id: number;
  // Comes from MySQL tinyint (0/1).
  is_private: number;
  name: string;
  description: string;
  is_attached: boolean;
  burWords: Word[];
}

// Same shape as Word.pivot when the backend embeds bur words inside a pack.
export type PackWord = Word;

export interface PackInput {
  name: string;
  description: string;
  is_private: boolean;
}

export interface FoundWord {
  id: number;
  name: string;
}

// --- Translate ---

export interface TranslationApiPayload {
  result: Word[];
  include: Word[];
  fuzzy: Word[];
}

export interface TranslationResult {
  exactTranslations: Word[];
  occurrences: Word[];
  possibleTranslations: Word[];
}

// --- Quiz ---

export interface QuizQuestion {
  question: string;
  answers: string[];
  correctAnswer: number;
  yourAnswer?: number;
}

export interface QuizQuestionsResponse {
  questions: QuizQuestion[];
  count: number;
}

// --- Statistic ---

export interface TranslationsAmountResponse {
  count: number;
}

// --- Admin ---

export type TranslationLogMethod =
  | 'App\\Services\\BurToRuTranslateService'
  | 'App\\Services\\RuToBurTranslateService';

export interface TranslationLog {
  id: number;
  method: TranslationLogMethod;
  translation_source: string;
  results_count: number;
  created_at: string;
  updated_at: string;
  ignore: 0 | 1;
  location_name: string;
  user_agent: string;
}

export interface TranslationLogParams {
  limit?: number;
  offset?: number;
  ignored?: '1' | null;
  status?: '1' | '0' | null;
  type?: TranslationType | null;
}

// --- Image ---

export interface UploadedImage {
  id: number;
  filepath: string;
  url: string;
  burword_id?: number;
  ruword_id?: number;
}

// --- Generic envelope used by most endpoints ---

export interface DataEnvelope<T> {
  data: T;
}
