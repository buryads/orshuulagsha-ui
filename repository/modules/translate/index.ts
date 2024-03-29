import HttpFactory from '~/repository/factory';
import type {
  ITranslateModule,
  translationType,
  translationApiResponse,
} from '~/repository/modules/translate/types';
import type { TranslationType } from '~/types/types';

class TranslateModule extends HttpFactory implements ITranslateModule {
  public readonly RESOURCE = '/api/translate';

  async translateWord(
    translationType: TranslationType = 'bur2ru',
    value: string,
  ): Promise<translationType> {
    try {
      const {
        data: { data },
      }: { data: translationApiResponse } = await this.call(
        'GET',
        `${this.RESOURCE}/${translationType}?word=${value.toLowerCase()}`,
      );

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
