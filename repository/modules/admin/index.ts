import HttpFactory from '~/repository/factory';
import { TranslationLog } from '~/repository/modules/admin/types';

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

  async getTranslationsCount(type?: 'ru2bur' | 'bur2ru') {
    const method =
      type === 'ru2bur'
        ? 'App\\Services\\BurToRuTranslateService'
        : type === 'bur2ru'
        ? 'App\\Services\\BurToRuTranslateService'
        : null;
  }
}

export default AdminModule;
