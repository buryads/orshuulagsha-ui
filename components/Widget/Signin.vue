<template>
  <div class="flex min-h-full flex-1">
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
            Sign in to your account
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
                <span class="flex justify-between">
                  <span>Password</span>
                  <a
                    href="#"
                    class="font-semibold text-bur-blue hover:text-indigo-600"
                  >
                    Forgot password?
                  </a>
                </span>

                <UIInput type="password" v-model="password" required />
              </UILabel>

              <UIButton
                type="submit"
                :disabled="isLoading"
                class="w-full bg-bur-blue text-white hover:opacity-80"
              >
                Sign in
              </UIButton>
            </form>
          </div>

          <WidgetSocialMediaAuth class="mt-10" />

          <div class="mt-6 flex justify-center gap-2 border-t pt-4">
            <span>Don't you have an account?</span>

            <NuxtLink
              :to="localePath('/signup')"
              class="font-semibold text-bur-blue hover:text-indigo-600"
            >
              Sign up
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="relative hidden min-h-[600px] w-0 flex-1 lg:block">
      <div
        class="absolute inset-0 h-full w-full bg-[url(/images/baikal.jpg)] bg-cover bg-center bg-no-repeat shadow-[0_0_8px_8px_#f5f5f5_inset] lg:bg-[-150px]"
      />
      box-shadow: 0 0 8px 8px white inset;
    </div>
  </div>
</template>

<script lang="ts" setup>
  const localePath = useLocalePath();

  const { $api } = useNuxtApp();
  const isLoading = ref(false);
  const email = ref('');
  const password = ref('');

  async function login() {
    try {
      isLoading.value = true;
      const data = await $api.auth.login(email.value, password.value);

      console.log(data);
    } catch (e) {
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }
</script>
