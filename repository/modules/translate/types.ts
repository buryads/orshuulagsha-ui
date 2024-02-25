import type { Word } from '~/repository/modules/types';

export type translationType = {
  exactTranslations: Word[];
  occurrences: Word[];
  possibleTranslations: Word[];
};

export type translationApiResponse = {
  data: {
    result: Word[];
    include: Word[];
    fuzzy: Word[];
  };
};

export interface ITranslateModule {
  translateWord(
    translationType: 'bur2ru' | 'ru2bur',
    value: string,
  ): Promise<translationType>;
}
