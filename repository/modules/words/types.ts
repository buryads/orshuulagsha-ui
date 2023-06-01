import { metaResponse, word } from '~/repository/modules/types';

export type wordsApiResponse = {
  data: word[];
  meta: metaResponse;
};

export interface IWordsModule {
  getBurWords: (params: {
    page: number;
    perPage: number;
  }) => Promise<wordsApiResponse>;

  getOneBurWord: (slug: string) => Promise<word>;
}
