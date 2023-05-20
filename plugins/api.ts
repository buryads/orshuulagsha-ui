import { $fetch, FetchOptions } from 'ohmyfetch';
import { defineNuxtPlugin } from '#app';
import TranslateModule from '~/repository/modules/translate';

interface IApiInstance {
  translate: TranslateModule;
}

export default defineNuxtPlugin((nuxtApp) => {
  const fetchOptions: FetchOptions = {
    baseURL: nuxtApp.$config.API_BASE_URL,
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
