import { useUserStore } from '~/store/user';

export default defineNuxtRouteMiddleware(async () => {
  const store = useUserStore();
  const localePath = useLocalePath();

  if (!store.user && !useCookie('token').value) {
    return navigateTo(localePath('/signin'));
  }
});
