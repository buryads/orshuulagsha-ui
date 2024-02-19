import HttpFactory from '~/repository/factory';
import type { TranslationLog } from '~/repository/modules/admin/types';

class AdminModule extends HttpFactory {
  public RESOURCE = '/api/jwt/admin';

  async getTranslationLogs(limit = 100, offset = 0) {
    try {
      const { data }: { data: TranslationLog[] } = await this.call(
        'GET',
        `${this.RESOURCE}/translations-logs`,
        {
          params: {
            limit,
            offset,
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

  async getTranslationsCount(type?: 'ru2bur' | 'bur2ru'): Promise<number> {
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
}

export default AdminModule;
