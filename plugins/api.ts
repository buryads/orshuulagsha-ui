import { defineNuxtPlugin } from '#app';
import TranslateModule from '~/repository/modules/translate';
import StatisticModule from '~/repository/modules/statistic';
import QuizModule from '~/repository/modules/quiz';
import WordsModule from '~/repository/modules/words';
import AuthModule from '~/repository/modules/auth';
import axios, { AxiosRequestConfig } from 'axios';

export interface IApiInstance {
  translate: TranslateModule;
  statistic: StatisticModule;
  quiz: QuizModule;
  words: WordsModule;
  auth: AuthModule;
}

export default defineNuxtPlugin((nuxtApp) => {
  const options: AxiosRequestConfig = {
    baseURL: nuxtApp.$config.public.baseURL,
    withCredentials: true,
  };

  const apiFetcher = axios.create(options);

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
