<template>
  <div class="container mx-auto px-10">
    <div class="block md:flex">
      <div class="flex-auto">
        <div class="max-w-3xl mx-auto pt-10 xl:max-w-none xl:ml-0 xl:mr-[15.5rem] xl:pr-16">
          <header id="header" class="relative z-20">
            <div>
              <div class="flex items-center">
                <h1 class="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">
                  {{ title }}
                </h1>
                <Button :label="$t('create')" class="ml-5 inline-block lg:w-2/12 md:w-2/12 sm:w-2/12" @click="$router.push(localePath(`/pack/create`))"/>
              </div>
            </div>
          </header>
          <div class="mt-10 relative">
            <h2 class="group flex whitespace-pre-wrap relative scroll-mt-[var(--scroll-mt)] -ml-4 pl-4" id="class-reference">
              <a href="#class-reference" class="absolute -ml-10 flex items-center opacity-0 border-0 group-hover:opacity-100" aria-label="Anchor">
                &ZeroWidthSpace;
                <div class="w-6 h-6 text-slate-400 ring-1 ring-slate-900/5 rounded-md shadow-sm flex items-center justify-center hover:ring-slate-900/10 hover:shadow hover:text-slate-700 dark:bg-slate-700 dark:text-slate-300 dark:shadow-none dark:ring-0">
                  {{ $t('cards') }}
                </div>
              </a>
              <span><span class="sr-only">Quick reference</span></span>
            </h2>
            <div class="overflow-hidden w-full lg:overflow-auto scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-slate-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-slate-300 scrollbar-track:!rounded dark:scrollbar-track:!bg-slate-500/[0.16] dark:scrollbar-thumb:!bg-slate-500/50">
              <div class="grid grid-flow-row-dense grid-cols-4">
                <div v-for="pack in packs" class="rounded overflow-hidden shadow-lg mx-2 mb-5 lg:col-span-1 md:col-span-2 col-span-4">
                  <nuxt-link v-if="pack.user_id === user.id || $authUtils().isUserA('admin')" :to="`/packs/${pack.id}/edit`" class="absolute w-5 m-5 hover:bg-gray-300 rounded cursor-pointer"><outline-pencil-icon/></nuxt-link>
                  <img class="w-full" src="/card-top.jpeg" alt="Sunset in the mountains">
                  <div class="px-6 py-4">
                    <div class="font-bold text-xl mb-2">{{ pack.name }}</div>
                    <p class="text-gray-700 text-base">
                      {{ pack.description }}
                    </p>
                  </div>
                  <div class="px-6 py-4 w-full">
                    <Button :label="$t('learn')" class="lg:w-full" @click="$router.push(localePath(`/packs/${pack.slug}/cards`))"/>
                  </div>
                </div>
              </div>
              <PublicPagination :pagination="pagination" @paginate="loadPage" class="pb-10"/>
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
import PublicPagination from "~/components/PublicPagination.vue";
import Input from '../components/Input.vue';
import Button from "~/components/Button.vue";

export default Vue.extend({
  data () {
    return {
      title: 'Packs',
      packs: [],
      pagination: {},
    }
  },
  components: {
    PublicPagination,
    Button,
    Input
  },
  computed: {
    user: {
      get () {
        return this.$auth.user?.data
      }
    }
  },
  async created() {
    if (!this.$auth.loggedIn) {
      this.$router.push('/');
      return;
    }
    await this.loadPage();
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
    async loadPage (page = 1) {
      const {data: {data, pagination}} = await this.$axios.get(`/api/api/user/packs?page=${page}`);
      this.packs = data;
      this.pagination = pagination;
    }
  }
})
</script>

<style>
</style>
