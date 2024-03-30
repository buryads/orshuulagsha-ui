import HttpFactory from '~/repository/factory';
import type {
  AdminModuleInterface,
  TranslationLog,
  TranslationLogParams,
} from '~/repository/modules/admin/types';
import type { TranslationLanguage, TranslationType } from '~/types/types';
import type { Signal } from 'human-signals';

class AdminModule extends HttpFactory implements AdminModuleInterface {
  public RESOURCE = '/api/jwt/admin';

  async getTranslationLogs(params?: TranslationLogParams) {
    try {
      const { data }: { data: TranslationLog[] } = await this.call(
        'GET',
        `${this.RESOURCE}/translations-logs`,
        {
          params,
          headers: {
            Authorization: 'Bearer ' + useCookie('token').value,
          },
        },
      );

      return data;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async ignoreTranslationLog(id: number) {
    try {
      const { data }: { data: TranslationLog[] } = await this.call(
        'PUT',
        `${this.RESOURCE}/translations-logs/${id}/ignore`,
        {
          headers: {
            Authorization: 'Bearer ' + useCookie('token').value,
          },
        },
      );

      return data;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async getTranslationsCount(type?: TranslationType): Promise<number> {
    const method =
      type === 'ru2bur'
        ? 'App\\Services\\RuToBurTranslateService'
        : type === 'bur2ru'
        ? 'App\\Services\\BurToRuTranslateService'
        : null;

    try {
      const {
        // @ts-ignore
        data: { count },
      } = await this.call('GET', `${this.RESOURCE}/translations-logs/count`, {
        params: {
          method,
        },
        headers: {
          Authorization: 'Bearer ' + useCookie('token').value,
        },
      });

      return count;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async getRandomRelationshipLessWord(
    source: TranslationLanguage,
    destination: TranslationLanguage,
  ) {
    try {
      // @ts-ignore @todo describe types
      const { data } = await this.call(
        'GET',
        `${this.RESOURCE}/words-matcher/${source}/${destination}/random`,
        {
          headers: {
            Authorization: 'Bearer ' + useCookie('token').value,
          },
        },
      );

      return data;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async getWords(
    word: string,
    source: TranslationLanguage,
    destination: TranslationLanguage,
    signal?: AbortSignal,
  ) {
    try {
      // @ts-ignore @todo describe types
      const { data } = await this.call(
        'GET',
        `${this.RESOURCE}/words-matcher/${source}/${destination}`,
        {
          signal,
          params: {
            word,
          },
          headers: {
            Authorization: 'Bearer ' + useCookie('token').value,
          },
        },
      );

      return data;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async addNewWordToDatabase(
    word: string,
    source: TranslationLanguage,
    destination: TranslationLanguage, // add either ru or bur word
  ) {
    try {
      // @ts-ignore @todo describe types
      const { data } = await this.call(
        'POST',
        `${this.RESOURCE}/words-matcher/${source}/${destination}`,
        {
          params: {
            name: word,
          },
          headers: {
            Authorization: 'Bearer ' + useCookie('token').value,
          },
        },
      );

      return data;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async attachWord(
    word: string,
    source: TranslationLanguage,
    destination: TranslationLanguage,
  ) {
    try {
      // @ts-ignore @todo describe types
      const { data } = await this.call(
        'POST',
        `${this.RESOURCE}/words-matcher/${source}/${destination}`,
        {
          params: {
            word,
          },
          headers: {
            Authorization: 'Bearer ' + useCookie('token').value,
          },
        },
      );

      return data;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
}

export default AdminModule;
