import { $fetch, FetchOptions } from 'ohmyfetch';
import { defineNuxtPlugin } from '#app';
import TranslateModule from '~/repository/modules/translate';
import StatisticModule from '~/repository/modules/statistic';
import QuizModule from '~/repository/modules/quiz';
import WordsModule from '~/repository/modules/words';
import AuthModule from '~/repository/modules/auth';

export interface IApiInstance {
  translate: TranslateModule;
  statistic: StatisticModule;
  quiz: QuizModule;
  words: WordsModule;
  auth: AuthModule;
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
    auth: new AuthModule(apiFetcher),
  };

  return {
    provide: {
      api: modules,
    },
  };
});
