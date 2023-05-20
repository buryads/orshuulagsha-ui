import HttpFactory from '~/repository/factory';
import {
  ITranslateModule,
  translation,
  translationApiResponse,
} from '~/repository/modules/translate/types';

class TranslateModule extends HttpFactory implements ITranslateModule {
  private readonly RESOURCE = '/api/translate';

  async translateWord(
    translationType: 'bur2ru' | 'ru2bur' = 'bur2ru',
    value: string,
  ): Promise<translation> {
    try {
      const {
        data: { data },
      } = (await this.call(
        'GET',
        `${this.RESOURCE}/${translationType}?word=${value.toLowerCase()}`,
      )) as translationApiResponse;

      return {
        exactTranslations: data.result,
        occurrences: data.includes,
        possibleTranslations: data.fuzzy,
      };
    } catch (error: unknown) {
      console.error(error);
      throw error;
    }
  }
}

export default TranslateModule;
