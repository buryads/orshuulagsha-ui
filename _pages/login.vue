<template>
  <div class="container mx-auto px-10">
    <div class="block md:flex">
      <div class="flex-auto">
        <div
          class="mx-auto max-w-3xl pt-10 xl:ml-0 xl:mr-[15.5rem] xl:max-w-none xl:pr-16"
        >
          <header id="header" class="relative z-20">
            <div>
              <div class="flex items-center">
                <h1
                  class="inline-block text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-200 sm:text-3xl"
                >
                  {{ title }}
                </h1>
              </div>
            </div>
          </header>
          <div class="relative mt-10">
            <h2
              class="group relative -ml-4 flex scroll-mt-[var(--scroll-mt)] whitespace-pre-wrap pl-4"
              id="class-reference"
            >
              <a
                href="#class-reference"
                class="absolute -ml-10 flex items-center border-0 opacity-0 group-hover:opacity-100"
                aria-label="Anchor"
              >
                &ZeroWidthSpace;
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 shadow-sm ring-1 ring-slate-900/5 hover:text-slate-700 hover:shadow hover:ring-slate-900/10 dark:bg-slate-700 dark:text-slate-300 dark:shadow-none dark:ring-0"
                ></div>
              </a>
              <span><span class="sr-only">Quick reference</span></span>
            </h2>
            <div
              class="scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-slate-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-slate-300 scrollbar-track:!rounded dark:scrollbar-track:!bg-slate-500/[0.16] dark:scrollbar-thumb:!bg-slate-500/50 overflow-hidden lg:overflow-auto"
            >
              <div>
                <p class="py-2 text-red-700">{{ error.message }}</p>
                <Input type="email" v-model="form.email" />
                <Input type="password" v-model="form.password" />
              </div>
              <Button label="Login" @click="login" /> or
              <nuxt-link :to="localePath('/signup')" class="text-blue-500"
                >sign up</nuxt-link
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  // @ts-nocheck
  import Vue from 'vue';
  import Input from '~/_components/Input.vue';
  import Button from '~/_components/Button.vue';

  export default Vue.extend({
    data() {
      return {
        title: 'Log in',
        form: {
          email: null,
          password: null,
        },
        error: this.defaultError(),
      };
    },
    components: {
      Button,
      Input,
    },
    created() {
      if (this.$auth.loggedIn) {
        this.$router.push(this.localePath('/dashboard'));
      }
    },
    head(): any {
      return {
        title: this.title,
        meta: [
          {
            hid: 'description',
            name: 'description',
            content: this.title,
          },
        ],
      };
    },
    methods: {
      async login() {
        try {
          this.error = this.defaultError();
          await this.$auth.loginWith('laravelSanctum', {
            data: this.form,
          });
          await this.$router.push(this.localePath('/dashboard'));
          window.location.reload();
        } catch (e) {
          this.error = e.response?.data || this.defaultError('Undefined error');
          console.error(e);
        }
      },
      defaultError(message = null) {
        return {
          message: message,
        };
      },
    },
  });
</script>

<style></style>
