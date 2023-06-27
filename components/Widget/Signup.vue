<template>
  <div class="flex min-h-full flex-1 flex-row-reverse">
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
            Create your account
          </h2>
        </div>

        <div class="mt-10">
          <div>
            <form @submit.prevent="register" class="space-y-6">
              <UILabel>
                <span>Name</span>

                <UIInput type="text" v-model="name" required />
              </UILabel>

              <UILabel>
                <span>Email</span>

                <UIInput type="email" v-model="email" required />
              </UILabel>

              <UILabel>
                <span>Password</span>

                <UIInput type="password" v-model="password" required />
              </UILabel>

              <UIButton
                type="submit"
                class="w-full bg-bur-blue text-white hover:opacity-80"
              >
                Sign up
              </UIButton>
            </form>
          </div>

          <WidgetSocialMediaAuth class="mt-10" />

          <div class="mt-6 border-t pt-4 text-center">
            <span>Do you have an account already?</span>

            <NuxtLink
              :to="localePath('/signin')"
              to="/signup"
              class="font-semibold text-bur-blue hover:text-indigo-600"
            >
              Sign in
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="relative hidden w-0 flex-1 lg:block">
      <div
        class="absolute inset-0 h-full w-full rounded-md bg-[url(/images/baikal.jpg)] bg-cover bg-center bg-no-repeat shadow-[0_0_2px_2px_#f5f5f5_inset] lg:bg-[-150px]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  const localePath = useLocalePath();
  const { $api } = useNuxtApp();
  const isLoading = ref(false);
  const name = ref('');
  const email = ref('');
  const password = ref('');
  const router = useRouter();

  async function register() {
    try {
      isLoading.value = true;
      await $api.auth.register(name.value, email.value, password.value);
      await $api.user.getUser();

      navigateTo('/profile');
    } catch (e) {
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }
</script>
