<template>
  <div class="flex">
    <div
      class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24"
    >
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <div class="flex items-end gap-4">
          <img
            class="h-10 w-auto"
            src="/images/logo-yellow.png"
            alt="buryads.com"
          />
          <h2
            class="text-2xl font-bold leading-none tracking-tight text-gray-900"
          >
            {{ $t('signIn') }}
          </h2>
        </div>

        <div class="mt-10">
          <div>
            <form @submit.prevent="login" method="POST" class="space-y-6">
              <UILabel>
                <span>Email</span>

                <UIInput type="email" v-model="email" required />
              </UILabel>

              <UILabel>
                <span>{{ $t('password') }}</span>
                <!--                <span class="flex justify-between">
                  <span>Password</span>
                  <a
                    href="#"
                    class="font-semibold text-bur-blue hover:text-indigo-600"
                  >
                    Forgot password?
                  </a>
                </span>-->

                <UIInput type="password" v-model="password" required />
              </UILabel>

              <Transition mode="out-in">
                <div v-if="errors" class="mt-2 font-medium text-red-500">
                  {{ errors }}
                </div>
              </Transition>

              <UIButton
                type="submit"
                :disabled="isLoading"
                class="w-full bg-bur-blue text-white hover:opacity-80"
              >
                <span class="relative">
                  {{ $t('login') }}
                  <span class="absolute left-full top-1/2 -translate-y-1/2">
                    <IconsSpinner
                      v-if="isLoading"
                      class="ml-1.5 h-3.5 w-3.5 animate-spin"
                    />
                  </span>
                </span>
              </UIButton>
            </form>
          </div>

          <!--          <WidgetSocialMediaAuth />-->

          <div class="mt-6 border-t pt-4 text-center">
            <span>{{ $t('noAccount') }}</span>

            <NuxtLink
              :to="localePath('/signup')"
              class="ml-1.5 font-semibold text-bur-blue hover:text-indigo-600"
            >
              {{ $t('createAccount') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="relative hidden min-h-[600px] w-0 flex-1 lg:block">
      <div
        class="absolute inset-0 h-full w-full rounded-md bg-[url(/images/baikal.jpg)] bg-cover bg-center bg-no-repeat shadow-[0_0_2px_2px_#f5f5f5_inset] lg:bg-[-150px]"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  const localePath = useLocalePath();

  const { $api } = useNuxtApp();
  const isLoading = ref(false);
  const email = ref('');
  const password = ref('');
  const errors = ref();

  async function login() {
    try {
      errors.value = '';
      isLoading.value = true;
      await $api.auth.login(email.value, password.value);
      await $api.user.getUser();

      navigateTo(localePath('/packs'));
    } catch (e) {
      console.error(e);
      errors.value = e.response.data.message;
    } finally {
      isLoading.value = false;
    }
  }
</script>
