import type { IconName } from '@/components/ui/icon';

export interface DictEntry {
  pos: string;
  bxr: string;
  ipa: string;
  ru: string;
  note: string;
  uses: number;
  audio: boolean;
}

export interface PhraseEntry {
  ru: string;
  bxr: string;
  source: string;
  year: string | number;
  literary?: boolean;
}

export interface AiVariant {
  kind: 'ai' | 'google';
  label: string;
  title: string;
  back: string;
  note: string;
  tone: string;
  confidence: number;
  warning: string | null;
}

export interface DialectEntry {
  name: string;
  form: string;
  region: string;
  primary?: boolean;
}

export interface CategoryEntry {
  href: string;
  label: string;
  count: string;
  icon: IconName;
  color: string;
  soft: string;
}

export interface FeedItem {
  user: string;
  color: string;
  text: string;
  time: string;
  icon: IconName;
}

export interface ChapterEntry {
  num: string;
  title: string;
  desc: string;
}

export interface DayEntry {
  d: string;
  on: boolean;
  today?: boolean;
}

// TODO: wire to real translate response when shape is known.
export const DICT_ENTRIES: DictEntry[] = [
  {
    pos: 'приветствие',
    bxr: 'Сайн байна',
    ipa: '/sajn bajna/',
    ru: 'здравствуйте, добрый день',
    note: 'нейтральное, формальное',
    uses: 2841,
    audio: true,
  },
  {
    pos: 'вопрос',
    bxr: 'юу һонин бэ?',
    ipa: '/juː hɔ.nin be/',
    ru: 'что нового? как дела?',
    note: 'разговорное, к собеседнику',
    uses: 1207,
    audio: true,
  },
  {
    pos: 'приветствие',
    bxr: 'Сайн!',
    ipa: '/sajn/',
    ru: 'привет',
    note: 'неформальное',
    uses: 924,
    audio: true,
  },
];

export const PHRASE_ENTRIES: PhraseEntry[] = [
  {
    ru: 'Здравствуйте, как дела?',
    bxr: 'Сайн байна, юу һонин бэ?',
    source: 'Корпус разговорной речи',
    year: 2023,
  },
  {
    ru: 'Здравствуйте, дорогие друзья!',
    bxr: 'Сайн байна, хүндэтэ нүхэдүүд!',
    source: 'БГТРК · эфир',
    year: 2024,
  },
  {
    ru: 'Здравствуйте, я приехал из Улан-Удэ.',
    bxr: 'Сайн байна, би Улаан-Үдэһөө ерээб.',
    source: 'Учебник 7 кл.',
    year: 2019,
  },
  {
    ru: '— Здравствуй! — Здравствуй, как поживаешь?',
    bxr: '— Сайн! — Сайн, ямар байнабши?',
    source: 'Диалоги · самоучитель',
    year: 2021,
  },
  {
    ru: 'Здравствуйте все!',
    bxr: 'Бүгэдэндэ сайн!',
    source: 'Эпос «Гэсэр»',
    year: 'XIX в.',
    literary: true,
  },
];

export const AI_VARIANTS: AiVariant[] = [
  {
    kind: 'ai',
    label: 'AI · Claude Haiku',
    title: 'Сайн байна, юу һонин бэ?',
    back: 'сайн байна, юу һонин бэ?',
    note: 'Перевод полностью на бурятском. Соответствует литературной норме хори-бурятского диалекта.',
    tone: 'нейтрально-формально',
    confidence: 96,
    warning: null,
  },
  {
    kind: 'google',
    label: 'Google Translate',
    title: 'Сайн байна, ямар байна?',
    back: 'сайн байна, ямар байна?',
    note: 'AI translation, perhaps the answer is mixed with Mongolian language.',
    tone: 'нейтрально',
    confidence: 71,
    warning: 'Возможно смешение с халха-монгольским',
  },
];

export const DIALECT_ENTRIES: DialectEntry[] = [
  { name: 'Хори-бурятский', form: 'Сайн байна', region: 'Забайкалье', primary: true },
  { name: 'Эхирит-булагатский', form: 'Сайн байнаа', region: 'Иркутская обл.' },
  { name: 'Тункинский', form: 'Мэндэ', region: 'Окинский р-н' },
  { name: 'Сартульский', form: 'Сэн ба', region: 'Селенгинск' },
];

export const CATEGORIES: CategoryEntry[] = [
  {
    href: '/explore',
    label: 'Тематический словарь',
    count: '124k слов',
    icon: 'library',
    color: 'var(--primary)',
    soft: 'var(--primary-50)',
  },
  {
    href: '/learn',
    label: 'Уроки и квизы',
    count: '32 курса',
    icon: 'lightbulb',
    color: 'var(--accent-warm)',
    soft: 'var(--accent-warm-soft)',
  },
  {
    href: '/names',
    label: 'Бурятские имена',
    count: '1 240 имён',
    icon: 'users',
    color: 'var(--tertiary)',
    soft: 'var(--tertiary-soft)',
  },
  {
    href: '/explore',
    label: 'Этимология',
    count: 'новый раздел',
    icon: 'compass',
    color: 'var(--accent-green)',
    soft: 'var(--accent-green-soft)',
  },
  {
    href: '/community',
    label: 'Сообщество',
    count: '2.4k участников',
    icon: 'comment',
    color: 'var(--primary)',
    soft: 'var(--primary-50)',
  },
  {
    href: '/explore',
    label: 'Фразеология',
    count: 'идиомы и пословицы',
    icon: 'leaf',
    color: 'var(--accent-green)',
    soft: 'var(--accent-green-soft)',
  },
];

export const FEED_ITEMS: FeedItem[] = [
  {
    user: 'Аюна Б.',
    color: 'var(--primary)',
    text: 'перевела «нютаг» как «родина»',
    time: 'только что',
    icon: 'translate',
  },
  {
    user: 'Доржо Ц.',
    color: 'var(--accent-warm)',
    text: 'добавил пример к слову «сэнхир»',
    time: '2 мин',
    icon: 'edit',
  },
  {
    user: 'Сурэн Д.',
    color: 'var(--accent-green)',
    text: 'записал произношение для «эжы»',
    time: '8 мин',
    icon: 'mic',
  },
  {
    user: 'Эрдэни Ж.',
    color: 'var(--tertiary)',
    text: 'получил бейдж «Знаток пословиц»',
    time: '12 мин',
    icon: 'trophy',
  },
];

export const CHAPTERS: ChapterEntry[] = [
  { num: '01', title: 'Эпос «Гэсэр»', desc: '8 уроков' },
  { num: '02', title: 'Шаманские традиции', desc: '6 уроков' },
  { num: '03', title: 'Буддизм в Бурятии', desc: '9 уроков' },
];

export const STREAK_DAYS: DayEntry[] = [
  { d: 'Пн', on: true },
  { d: 'Вт', on: true },
  { d: 'Ср', on: true },
  { d: 'Чт', on: true },
  { d: 'Пт', on: true },
  { d: 'Сб', on: true, today: true },
  { d: 'Вс', on: false },
];
