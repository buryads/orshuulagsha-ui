import { useUserStore } from '~/store/user';

export default defineNuxtRouteMiddleware(async () => {
  const store = useUserStore();

  if (!store.user && !useCookie('token').value) {
    return navigateTo('/signin');
  }
});
