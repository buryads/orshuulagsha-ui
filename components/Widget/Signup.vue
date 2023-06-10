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
            <form action="#" method="POST" class="space-y-6">
              <UILabel>
                <span>Name</span>

                <UIInput type="text" required />
              </UILabel>

              <UILabel>
                <span>Email</span>

                <UIInput type="email" required />
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

                <UIInput type="password" required />
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

          <div class="mt-6 flex justify-center gap-2 border-t pt-4">
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
        class="absolute inset-0 h-full w-full bg-[url(/images/baikal.jpg)] bg-cover bg-center bg-no-repeat lg:bg-[-150px_10px]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  const localePath = useLocalePath();
</script>
