<template>
  <!--   <div class="relative min-h-[calc(100vh-64px)]">
    <div
      class="absolute inset-0 h-full w-full bg-[url(/images/baikal.jpg)] bg-cover bg-no-repeat"
    />
    <div class="container relative z-10 flex min-h-[calc(100vh-64px)]">
      <div
        class="absolute inset-0 m-auto h-[550px] w-[500px] max-w-[95%] rounded-2xl bg-neutral-100 opacity-90"
      />
      <WidgetSignin class="relative m-auto" />
    </div>
  </div> -->
  <div class="mt-6 2xl:container">
    <WidgetSignin />
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '~/store/user';

  definePageMeta({
    middleware() {
      const store = useUserStore();

      if (store.user) {
        return navigateTo('/profile');
      }
    },
  });
</script>
