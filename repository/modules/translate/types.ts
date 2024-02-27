import type { Word } from '~/repository/modules/types';
import type { TranslationType } from '~/types/types';

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
    translationType: TranslationType,
    value: string,
  ): Promise<translationType>;
}
