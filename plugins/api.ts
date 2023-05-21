import { $fetch, FetchOptions } from 'ohmyfetch';
import { defineNuxtPlugin, NuxtApp } from '#app';
import TranslateModule from '~/repository/modules/translate';

export interface IApiInstance {
  translate: TranslateModule;
}

export default defineNuxtPlugin((nuxtApp) => {
  const fetchOptions: FetchOptions = {
    baseURL: nuxtApp.$config.public.baseURL,
  };

  const apiFetcher = $fetch.create(fetchOptions);

  const modules: IApiInstance = {
    translate: new TranslateModule(apiFetcher),
  };

  return {
    provide: {
      api: modules,
    },
  };
});
