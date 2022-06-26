<template>
  <div class="container mx-auto px-10">
    <div class="block md:flex">
      <div class="flex-auto">
        <div class="max-w-3xl mx-auto pt-10 xl:max-w-none xl:ml-0 xl:mr-[15.5rem] xl:pr-16">
          <header id="header" class="relative z-20">
            <div>
              <div class="flex items-center">
                <h1 class="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">{{ title }}</h1>
              </div>
            </div>
          </header>
          <div class="mt-10 relative">
            <h2 class="group flex whitespace-pre-wrap relative scroll-mt-[var(--scroll-mt)] -ml-4 pl-4" id="class-reference">
              <a href="#class-reference" class="absolute -ml-10 flex items-center opacity-0 border-0 group-hover:opacity-100" aria-label="Anchor">
                &ZeroWidthSpace;
                <div class="w-6 h-6 text-slate-400 ring-1 ring-slate-900/5 rounded-md shadow-sm flex items-center justify-center hover:ring-slate-900/10 hover:shadow hover:text-slate-700 dark:bg-slate-700 dark:text-slate-300 dark:shadow-none dark:ring-0">

                </div>
              </a>
              <span><span class="sr-only">Quick reference</span></span>
            </h2>
            <div class="overflow-hidden lg:overflow-auto scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-slate-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-slate-300 scrollbar-track:!rounded dark:scrollbar-track:!bg-slate-500/[0.16] dark:scrollbar-thumb:!bg-slate-500/50">
              <div>
                <p class="text-red-700 py-2">{{ error.message }}</p>
                <Input
                  type="email"
                  v-model="form.email"
                />
                <Input
                  type="password"
                  v-model="form.password"
                />
              </div>
              <Button label="Login" @click="login"/>
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
import Vuex from 'vuex';
import Input from '../components/Input.vue';
import Button from "~/components/Button.vue";

export default Vue.extend({
  data () {
    return {
      title: 'Log in',
      form: {
        email: null,
        password: null,
      },
      error: this.defaultError()
    }
  },
  components: {
    Button,
    Input
  },
  created() {
    if (this.$auth.loggedIn) {
      this.$router.push('/logs');
    }
  },
  head(): any {
    return {
      title: this.title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.title
        }
      ]
    }
  },
  methods: {
    async login () {
      try {
        this.error = this.defaultError();
        await this.$auth.loginWith('laravelSanctum', {
          data: this.form
        });
        await this.$router.push('/');
        window.location.reload();
        console.log('Redirected to main page')
      } catch (e) {
        this.error = e.response?.data || this.defaultError('Undefined error');
        console.error(e)
      }
    },
    defaultError (message = null) {
      return {
        message: message
      }
    }
  }
})
</script>

<style>
</style>
