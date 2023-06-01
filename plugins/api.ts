import { $fetch, FetchOptions } from 'ohmyfetch';
import { defineNuxtPlugin } from '#app';
import TranslateModule from '~/repository/modules/translate';
import StatisticModule from '~/repository/modules/statistic';
import QuizModule from '~/repository/modules/quiz';
import WordsModule from '~/repository/modules/words';

export interface IApiInstance {
  translate: TranslateModule;
  statistic: StatisticModule;
  quiz: QuizModule;
  words: WordsModule;
}

export default defineNuxtPlugin((nuxtApp) => {
  const fetchOptions: FetchOptions = {
    baseURL: nuxtApp.$config.public.baseURL,
  };

  const apiFetcher = $fetch.create(fetchOptions);

  const modules: IApiInstance = {
    translate: new TranslateModule(apiFetcher),
    statistic: new StatisticModule(apiFetcher),
    quiz: new QuizModule(apiFetcher),
    words: new WordsModule(apiFetcher),
  };

  return {
    provide: {
      api: modules,
    },
  };
});
