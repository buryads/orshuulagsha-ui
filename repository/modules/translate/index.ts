import HttpFactory from '~/repository/factory';
import {
  ITranslateModule,
  translationType,
  translationApiResponse,
} from '~/repository/modules/translate/types';

class TranslateModule extends HttpFactory implements ITranslateModule {
  private readonly RESOURCE = '/api/translate';

  async translateWord(
    translationType: 'bur2ru' | 'ru2bur' = 'bur2ru',
    value: string,
  ): Promise<translationType> {
    try {
      const { data } = (await this.call(
        'GET',
        `${this.RESOURCE}/${translationType}?word=${value.toLowerCase()}`,
      )) as translationApiResponse;

      return {
        exactTranslations: data.result,
        occurrences: data.include,
        possibleTranslations: data.fuzzy,
      };
    } catch (error: unknown) {
      console.error(error);
      throw error;
    }
  }
}

export default TranslateModule;