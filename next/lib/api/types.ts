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

export interface TranslateBucketSubword {
  id: number;
  name: string;
  slug: string | null;
}

export interface TranslateBucketItem {
  id: number;
  slug: string | null;
  name: string;
  images: WordImage[];
  speechs: WordVoiceActing[];
  translations: Translation[];
  // Present only when the bucket entry is a Russian word (ru2bur direction):
  // backend serialises the linked Buryat words with their slugs so the UI can
  // open the dictionary page for the chosen translation directly.
  bur_words?: TranslateBucketSubword[];
}

export interface TranslateResponse {
  result: TranslateBucketItem[];
  include: TranslateBucketItem[];
  match: TranslateBucketItem[];
  fuzzy: TranslateBucketItem[];
}

// Legacy aliases retained for any historical consumers; new code should use
// `TranslateResponse` / `TranslateBucketItem` directly.
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

// --- SRS (Spaced Repetition System) ---
// Контракт: GET /api/srs/due, POST /api/srs/grade [auth:sanctum]

/** Элемент из GET /api/srs/due */
export interface SrsDueItem {
  word_id: number;
  word: string;
  slug: string;
  due_at: string | null;
  reps: number;
  interval: number;
  ease: number;
  lapses: number;
  is_new: boolean;
}

export interface SrsDueResponse {
  items: SrsDueItem[];
  count: number;
}

// --- Reader (Learn-2, Phase 4) ---
// Контракт: GET /api/texts, GET /api/texts/{slug},
//           POST /api/known-words, DELETE /api/known-words/{burword_id},
//           POST /api/srs/words [auth:sanctum]

/** Элемент списка текстов из GET /api/texts */
export interface TextListItem {
  id: number;
  slug: string;
  title: string;
  level: string | null;
  word_count: number;
}

/** Токен тела текста из GET /api/texts/{slug} */
export interface TextToken {
  token: string;
  burword_id: number | null;
  slug: string | null;
  known: boolean;
}

/** Полный текст из GET /api/texts/{slug} */
export interface TextDetail {
  id: number;
  slug: string;
  title: string;
  body: string;
  tokens: TextToken[];
}

/** Статус слова в читалке (вычисляется на клиенте по токену) */
export type WordStatus = 'known' | 'new' | 'ignored';

/** Токен с вычисленным статусом для рендера */
export interface ReaderToken extends TextToken {
  status: WordStatus;
}

/** Ответ POST /api/srs/words */
export interface SrsAddWordResponse {
  word_id: number;
  added: boolean;
}

/** Ответ POST /api/known-words */
export interface KnownWordResponse {
  burword_id: number;
  known: true;
}

// --- Gamification (Learn-2, Phase 2) ---
// TODO(8795-Ф2): сверить с финальным контрактом backend-tl

/** GET /api/stats/me [auth:sanctum] */
export interface GamificationMe {
  xp: number;
  level: number;
  streak: number;
  longest_streak: number;
  last_active_date: string | null;
  daily_goal_xp: number;
  xp_today: number;
  goal_met: boolean;
}

/** Строка лидерборда из GET /api/leaderboard */
export interface LeaderboardRow {
  rank: number;
  user_id: number;
  name: string;
  xp: number;
  level: number;
}

/** Мета «своей» позиции из GET /api/leaderboard */
export interface LeaderboardMe {
  rank: number;
  xp: number;
}

/** GET /api/leaderboard?period=all|week&limit=20 [auth:sanctum] */
export interface LeaderboardResponse {
  rows: LeaderboardRow[];
  me: LeaderboardMe | null;
}

// --- Lessons / Skill-tree (Learn-2, Phase 3) ---
// TODO(8795-Ф3): сверить с финальным контрактом backend-tl

export interface LessonListItem {
  id: number;
  slug: string;
  title: string;
  description: string;
  position: number;
  xp_reward: number;
  exercise_count: number;
  status: 'locked' | 'available' | 'completed';
  score: number | null;
  prerequisite_id: number | null;
}

export type ExerciseType = 'match' | 'type' | 'listen-pick' | 'image-pick';

export interface Exercise {
  id: number;
  type: ExerciseType;
  prompt: string;
  payload: Record<string, unknown>;
}

export interface LessonDetail {
  id: number;
  slug: string;
  title: string;
  exercises: Exercise[];
}

export interface CheckAnswer {
  exercise_id: number;
  // string for type/listen-pick/image-pick; [left,right][] for match
  answer: unknown;
}

export interface CheckResult {
  exercise_id: number;
  correct: boolean;
}

export interface CheckResponse {
  results: CheckResult[];
  score: number;
  passed: boolean;
  xp_awarded: number;
  stats: GamificationMe;
}
// --- Contributions (Learn-2, Phase 5) ---
// POST /api/contributions [auth]
// GET  /api/contributions/mine [auth]
// GET  /api/moderation/contributions?status=pending&limit [auth:admin|moderator]
// POST /api/moderation/contributions/{id}/approve [auth:admin|moderator]
// POST /api/moderation/contributions/{id}/reject  [auth:admin|moderator]

export type ContributionType = 'new_word' | 'translation' | 'correction';
export type ContributionStatus = 'pending' | 'approved' | 'rejected';
export type ContributionLang = 'ru' | 'en';

/** Payload for type=translation — suggest a missing translation */
export interface ContribPayloadTranslation {
  burword_id?: number | null;
  word: string; // буряатское слово
  translation: string;
  lang: ContributionLang;
}

/** Payload for type=new_word — add a word not yet in the dictionary */
export interface ContribPayloadNewWord {
  word: string; // буряатское слово
  translation: string;
  lang: ContributionLang;
  example?: string;
}

/** Payload for type=correction — suggest a fix to existing entry */
export interface ContribPayloadCorrection {
  burword_id: number | null;
  word: string;
  field: 'translation' | 'example' | 'other';
  suggestion: string;
  comment?: string;
}

export type ContribPayload =
  | ContribPayloadTranslation
  | ContribPayloadNewWord
  | ContribPayloadCorrection;

/** Single contribution item (mine + moderation queue) */
export interface Contribution {
  id: number;
  type: ContributionType;
  status: ContributionStatus;
  payload: ContribPayload;
  moderation_note?: string | null;
  created_at: string;
}

/** Moderation-queue item — includes submitter info */
export interface ModerationContribution extends Contribution {
  user_id: number;
  user_name: string;
}

export interface ModerationListResponse {
  data: ModerationContribution[];
  meta: { count: number };
}
