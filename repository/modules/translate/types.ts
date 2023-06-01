import { word } from '~/repository/modules/types';

export type translationType = {
  exactTranslations: word[];
  occurrences: word[];
  possibleTranslations: word[];
};

export type translationApiResponse = {
  data: {
    result: word[];
    include: word[];
    fuzzy: word[];
  };
};

export interface ITranslateModule {
  translateWord(
    translationType: 'bur2ru' | 'ru2bur',
    value: string,
  ): Promise<translationType>;
}
