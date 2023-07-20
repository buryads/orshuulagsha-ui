import { IApiInstance } from '~/plugins/api';

declare module '#app' {
  interface NuxtApp {
    $api: IApiInstance;
  }
}

declare module 'nuxt/dist/app/nuxt' {
  interface NuxtApp {
    $api: IApiInstance;
  }
}
