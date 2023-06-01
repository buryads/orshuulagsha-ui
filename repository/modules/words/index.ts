import HttpFactory from '~/repository/factory';
import {
  IWordsModule,
  wordsApiResponse,
} from '~/repository/modules/words/types';
import { word } from '~/repository/modules/types';

class WordsModule extends HttpFactory implements IWordsModule {
  public readonly RESOURCE = '/api/words';
  public readonly RESOURCE_BUR = '/api/words/bur';

  async getBurWords({ page, perPage }: { page: number; perPage: number }) {
    try {
      const response: wordsApiResponse = await this.call(
        'GET',
        `${this.RESOURCE_BUR}`,
        { query: { page, per_page: perPage } },
      );

      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getOneBurWord(slug: string) {
    try {
      const response: word = await this.call(
        'GET',
        `${this.RESOURCE_BUR}/${slug}`,
      );

      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default WordsModule;
