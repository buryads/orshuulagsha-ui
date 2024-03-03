import type { Locales } from '~/types/types';

export type MetaData = {
  [key: string]: {
    [locale in Locales]: string;
  };
};

export const meta: MetaData = {
  mainTitle: {
    ru: 'Бурятско-русский, русско-бурятский словарь',
    bur: 'Буряад ород толи, Ород буряад толи',
    en: 'Buryat-Russian, Russian-Buryat dictionary',
  },
  mainDescription: {
    ru: 'Пополняйте свой словарный запас бурятскими словами, создавая персональные наборы для тренировки и веселитесь с языковыми играми. Обменивайтесь наборами слов с друзьями.',
    bur: 'Пополняйте свой словарный запас бурятскими словами, создавая персональные наборы для тренировки и веселитесь с языковыми играми. Обменивайтесь наборами слов с друзьями.',
    en: 'Enrich your vocabulary with Buryat words by creating personalized sets for practice and have fun with language games. Exchange word sets with friends.',
  },
};
