import HttpFactory from '~/repository/factory';
import type {
  IStatistic,
  translationsAmountApiResponse,
} from '~/repository/modules/statistic/types';

class StatisticModule extends HttpFactory implements IStatistic {
  public readonly RESOURCE = '/api/statistic/daily-translations-count';

  async getTranslationsAmount(): Promise<number> {
    try {
      const {
        data: { count },
      }: { data: translationsAmountApiResponse } = await this.call(
        'GET',
        `${this.RESOURCE}`,
      );

      return count;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
}

export default StatisticModule;
