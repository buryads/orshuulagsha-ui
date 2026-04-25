export type Name = {
  id: string;
  name: string; // Buryat name (Cyrillic)
  gender: 'male' | 'female';
  meaning: string; // Russian
  origin: 'Бурятское' | 'Тибетское' | 'Монгольское';
  era?: 'Древнее' | 'Современное' | 'Классическое';
  accent: string; // CSS variable expression for the decorative blob
};

export const NAMES: Name[] = [
  {
    id: 'altanbeshig',
    name: 'Алтанбэшэг',
    gender: 'male',
    meaning: '«золотая надпись»',
    origin: 'Монгольское',
    era: 'Древнее',
    accent: 'var(--accent-warm)',
  },
  {
    id: 'bair',
    name: 'Баир',
    gender: 'male',
    meaning: '«радость, праздник»',
    origin: 'Бурятское',
    era: 'Современное',
    accent: 'var(--primary)',
  },
  {
    id: 'tuyana',
    name: 'Туяна',
    gender: 'female',
    meaning: '«заря, луч света»',
    origin: 'Бурятское',
    era: 'Современное',
    accent: 'var(--tertiary)',
  },
  {
    id: 'saran',
    name: 'Саран',
    gender: 'female',
    meaning: '«луна»',
    origin: 'Монгольское',
    era: 'Классическое',
    accent: 'var(--primary)',
  },
  {
    id: 'ayur',
    name: 'Аюр',
    gender: 'male',
    meaning: '«долголетие»',
    origin: 'Тибетское',
    era: 'Классическое',
    accent: 'var(--accent-green)',
  },
  {
    id: 'seseg',
    name: 'Сэсэг',
    gender: 'female',
    meaning: '«цветок»',
    origin: 'Бурятское',
    era: 'Современное',
    accent: 'var(--tertiary)',
  },
  {
    id: 'jargal',
    name: 'Жаргал',
    gender: 'male',
    meaning: '«счастье»',
    origin: 'Бурятское',
    era: 'Современное',
    accent: 'var(--accent-warm)',
  },
  {
    id: 'erdeni',
    name: 'Эрдэни',
    gender: 'male',
    meaning: '«драгоценность»',
    origin: 'Тибетское',
    era: 'Классическое',
    accent: 'var(--primary)',
  },
  {
    id: 'dari',
    name: 'Дари',
    gender: 'female',
    meaning: '«спасительница»',
    origin: 'Тибетское',
    era: 'Древнее',
    accent: 'var(--tertiary)',
  },
  {
    id: 'dugar',
    name: 'Дугар',
    gender: 'male',
    meaning: '«белый зонт»',
    origin: 'Тибетское',
    era: 'Классическое',
    accent: 'var(--accent-green)',
  },
  {
    id: 'ayuna',
    name: 'Аюна',
    gender: 'female',
    meaning: '«мелодия»',
    origin: 'Бурятское',
    era: 'Современное',
    accent: 'var(--tertiary)',
  },
  {
    id: 'dorjo',
    name: 'Доржо',
    gender: 'male',
    meaning: '«алмаз, ваджра»',
    origin: 'Тибетское',
    era: 'Древнее',
    accent: 'var(--primary)',
  },
];
