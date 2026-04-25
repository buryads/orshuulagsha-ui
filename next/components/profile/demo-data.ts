import type { IconName } from '@/components/ui/icon';

export interface DemoUser {
  name: string;
  email: string;
  dialect: string;
  level: string;
  joined: string;
}

export const DEMO_USER: DemoUser = {
  name: 'Сайн Бэр',
  email: 'sain@example.com',
  dialect: 'Хоринский',
  level: 'B1',
  joined: '2026-01-15',
};

export interface StatItem {
  label: string;
  value: string;
  sub: string;
  color: string;
  icon: IconName;
}

export const STATS: StatItem[] = [
  {
    label: 'Выучено слов',
    value: '452',
    sub: '+18 за неделю',
    color: 'var(--primary)',
    icon: 'library',
  },
  {
    label: 'Серия дней',
    value: '17',
    sub: 'рекорд: 24',
    color: 'var(--accent-warm)',
    icon: 'flame',
  },
  {
    label: 'Точность',
    value: '87%',
    sub: 'в квизах',
    color: 'var(--accent-green)',
    icon: 'target',
  },
  {
    label: 'Бейджей',
    value: '12',
    sub: 'из 48',
    color: 'var(--tertiary)',
    icon: 'trophy',
  },
];

export interface HistoryLesson {
  title: string;
  progress: string;
  date: string;
  color: string;
  icon: IconName;
  done?: boolean;
}

export const LEARNING_HISTORY: HistoryLesson[] = [
  {
    title: 'Семья и родственники',
    progress: '12/12 уроков',
    date: 'сегодня',
    color: 'var(--accent-warm)',
    icon: 'users',
    done: true,
  },
  {
    title: 'Природа и степь',
    progress: '12/16 уроков',
    date: 'вчера',
    color: 'var(--accent-green)',
    icon: 'mountain',
  },
  {
    title: 'Эпос «Гэсэр» — глава 2',
    progress: 'пройдено 30%',
    date: '3 дня назад',
    color: 'var(--primary)',
    icon: 'book',
  },
  {
    title: 'Игра «Угадай слово»',
    progress: '8/10 верно',
    date: '5 дней назад',
    color: 'var(--tertiary)',
    icon: 'sparkles',
  },
];

export const FAVORITE_WORDS: ReadonlyArray<readonly [string, string]> = [
  ['Эжы', 'мама'],
  ['Нютаг', 'родина'],
  ['Бууза', 'буузы'],
  ['Гэр', 'юрта'],
];

export interface CollectionCard {
  title: string;
  count: number;
  color: string;
  icon: IconName;
}

export const COLLECTIONS: CollectionCard[] = [
  { title: 'Семейное застолье', count: 24, color: 'var(--accent-warm)', icon: 'leaf' },
  { title: 'Эпос «Гэсэр»', count: 67, color: 'var(--primary)', icon: 'book' },
  { title: 'Степные пейзажи', count: 18, color: 'var(--accent-green)', icon: 'mountain' },
  { title: 'Любимые пословицы', count: 32, color: 'var(--tertiary)', icon: 'lightbulb' },
  { title: 'Шаманская лексика', count: 14, color: 'var(--neutral-700)', icon: 'sparkles' },
  { title: 'Новые слова·апрель', count: 47, color: 'var(--primary)', icon: 'calendar' },
];

export interface BadgeItem {
  title: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  color: string;
  icon: IconName;
}

export const BADGES: BadgeItem[] = [
  { title: 'Первое слово', description: 'выучи 1 слово', unlocked: true, color: 'var(--primary)', icon: 'star' },
  { title: 'Полиглот', description: '100 слов', unlocked: true, color: 'var(--accent-warm)', icon: 'library' },
  { title: 'Знаток', description: '500 слов', unlocked: false, progress: 90, color: 'var(--accent-green)', icon: 'trophy' },
  { title: 'Стрик 7', description: '7 дней подряд', unlocked: true, color: 'var(--tertiary)', icon: 'flame' },
  { title: 'Стрик 30', description: '30 дней подряд', unlocked: false, progress: 56, color: 'var(--accent-warm)', icon: 'flame' },
  { title: 'Контрибьютор', description: 'предложи слово', unlocked: true, color: 'var(--primary)', icon: 'edit' },
  { title: 'Голос степи', description: '10 произношений', unlocked: true, color: 'var(--accent-green)', icon: 'mic' },
  { title: 'Знаток эпоса', description: 'пройди «Гэсэр»', unlocked: false, progress: 30, color: 'var(--neutral-700)', icon: 'book' },
];

export interface HistoryEntry {
  date: string;
  type: string;
  description: string;
  color: string;
}

export const HISTORY_ENTRIES: HistoryEntry[] = [
  { date: 'Сегодня, 14:32', type: 'Перевод', description: 'тэнгэри → небо', color: 'var(--primary)' },
  { date: 'Сегодня, 14:18', type: 'Поиск', description: 'хүн (человек)', color: 'var(--neutral-700)' },
  { date: 'Сегодня, 12:05', type: 'Урок', description: 'Семья — урок 12', color: 'var(--accent-warm)' },
  { date: 'Вчера, 21:40', type: 'Квиз', description: '10 вопросов · 9/10', color: 'var(--accent-green)' },
  { date: 'Вчера, 18:12', type: 'Избранное', description: '+ морин (лошадь)', color: 'var(--tertiary)' },
  { date: '23 апр', type: 'Произношение', description: 'записал «эжы»', color: 'var(--accent-green)' },
];

export const SETTINGS_LANGUAGE: ReadonlyArray<readonly [string, string]> = [
  ['Язык интерфейса', 'Русский'],
  ['Основной диалект', 'Хоринский'],
  ['Транслитерация', 'Кириллица'],
  ['Голос произношения', 'Женский, средний возраст'],
];

export const SETTINGS_NOTIFICATIONS: ReadonlyArray<readonly [string, boolean]> = [
  ['Слово дня', true],
  ['Напоминание о стрике', true],
  ['Новые уроки', false],
  ['Активность сообщества', true],
  ['Еженедельный отчёт', true],
];

export interface ActivityChartData {
  path: string;
  areaPath: string;
}

// 30 evenly spaced points; matches the source design path data verbatim.
export const ACTIVITY_LINE_PATH =
  'M0 130 L20 110 L40 120 L60 90 L80 95 L100 80 L120 100 L140 70 L160 85 L180 60 L200 75 L220 50 L240 65 L260 45 L280 80 L300 60 L320 90 L340 55 L360 70 L380 40 L400 60 L420 35 L440 50 L460 30 L480 55 L500 40 L520 60 L540 35 L560 50 L580 25 L600 40';

export const ACTIVITY_AREA_PATH = `${ACTIVITY_LINE_PATH} L600 180 L0 180 Z`;
