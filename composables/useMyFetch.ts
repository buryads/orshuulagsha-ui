import { useFetch } from '#app';

const useMyFetch = (url: string, options?: {}) => {
  return useFetch(url, {
    baseURL: 'https://tt.buryads.com', // build time, useRuntimeConfig doesn't help here so @todo find better way
    ...options,
  });
};

export default useMyFetch;
