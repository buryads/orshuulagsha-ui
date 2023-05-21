export type translationsAmountApiResponse = {
  count: number;
};

export interface IStatistic {
  getTranslationsAmount: () => Promise<number>;
}
