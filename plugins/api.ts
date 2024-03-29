import { defineNuxtPlugin } from '#app';
import TranslateModule from '~/repository/modules/translate';
import StatisticModule from '~/repository/modules/statistic';
import QuizModule from '~/repository/modules/quiz';
import WordsModule from '~/repository/modules/words';
import AuthModule from '~/repository/modules/auth';
import axios, { AxiosRequestConfig } from 'axios';
import UserModule from '~/repository/modules/user';
import ImageModule from '~/repository/modules/image';
import AdminModule from '~/repository/modules/admin';

export interface IApiInstance {
  translate: TranslateModule;
  statistic: StatisticModule;
  quiz: QuizModule;
  words: WordsModule;
  auth: AuthModule;
  user: UserModule;
  image: ImageModule;
  admin: AdminModule;
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
    user: new UserModule(apiFetcher),
    image: new ImageModule(apiFetcher),
    admin: new AdminModule(apiFetcher),
  };

  return {
    provide: {
      api: modules,
    },
  };
});
