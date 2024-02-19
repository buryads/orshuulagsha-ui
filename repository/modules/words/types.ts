import type { metaResponse, Word } from '~/repository/modules/types';

export type wordsApiResponse = {
  data: Word[];
  meta: metaResponse;
};

export type oneWordApiResponse = {
  data: Word;
};

export interface IWordsModule {
  getBurWords: (params: {
    page: number;
    perPage: number;
  }) => Promise<wordsApiResponse>;

  getOneBurWord: (slug: string) => Promise<Word>;
}
