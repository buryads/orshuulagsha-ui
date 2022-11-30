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
            <p class="mt-2 text-lg text-slate-700 dark:text-slate-400">List of attempts to translate.</p>
            <p class="mt-2 text-lg text-slate-700 dark:text-slate-400">All translations: {{ translations.count }}</p>
            <p class="mt-2 text-lg text-slate-700 dark:text-slate-400">Ru to Bur translations: {{ translations.ruToBurCount }}</p>
            <p class="mt-2 text-lg text-slate-700 dark:text-slate-400">Bur to Ru translations: {{ translations.burToRuCount }}</p>
            <hr class="mt-3">
            <p class="mt-2 text-lg text-slate-700 dark:text-slate-400">Today's translations: {{ translations.countToday }}</p>
            <hr class="mt-3" v-if="isUniqueNotFoundWords">
            <p class="mt-2 text-lg text-red-700 dark:text-red-400" v-if="isUniqueNotFoundWords"><a href="/api/api/translations-logs/unique-not-found-words/csv" target="_blank">Download CSV (all unique words by method)</a></p>
          </header>
          <div class="mt-10 relative">
            <div class="overflow-hidden lg:overflow-auto scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-slate-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-slate-300 scrollbar-track:!rounded dark:scrollbar-track:!bg-slate-500/[0.16] dark:scrollbar-thumb:!bg-slate-500/50">
              <table class="w-full text-left border-collapse">
                <thead>
                <tr>
                  <th class="sticky z-10 top-0 text-sm leading-6 font-semibold text-slate-700 bg-white p-0 dark:bg-slate-900 dark:text-slate-300">
                    <div class="py-2 pr-2 border-b border-slate-200 dark:border-slate-400/20">#</div>
                  </th>
                  <th class="sticky z-10 top-0 text-sm leading-6 font-semibold text-slate-700 bg-white p-0 dark:bg-slate-900 dark:text-slate-300">
                    <div class="py-2 pr-2 border-b border-slate-200 dark:border-slate-400/20">Word/Phrase</div>
                  </th>
                  <th class="sticky z-10 top-0 text-sm leading-6 font-semibold text-slate-700 bg-white p-0 dark:bg-slate-900 dark:text-slate-300 pr-3">
                    <div class="py-2 pl-2 border-b border-slate-200 dark:border-slate-400/20">Results</div>
                  </th>
                  <th class="sticky z-10 top-0 text-sm leading-6 font-semibold text-slate-700 bg-white p-0 dark:bg-slate-900 dark:text-slate-300">
                    <div class="py-2 pr-2 border-b border-slate-200 dark:border-slate-400/20">Class</div>
                  </th>
                  <th class="sticky z-10 top-0 text-sm leading-6 font-semibold text-slate-700 bg-white p-0 dark:bg-slate-900 dark:text-slate-300">
                    <div class="py-2 pl-2 border-b border-slate-200 dark:border-slate-400/20">Date</div>
                  </th>
                </tr>
                </thead>
                <tbody class="align-baseline">
                <template v-for="log in translations.logs">
                  <tr :class="`${!log.results_count ? 'bg-red-300' : ''} ${log.ignore ? 'opacity-50 bg-gray-200' : ''}`">
                    <td translate="no" class="py-2 font-mono text-xs text-sky-500 dark:text-sky-400">
                      <b>
                        <nuxt-link
                          v-if="log.results_count === 0 && !log.ignore"
                          :to="`/words/${log.method.replace('App\\Services\\', '').replace('TranslateService', '').replace('RuToBur', 'ru/bur').replace('BurToRu', 'bur/ru')}?word=${log.translation_source}`"
                        >
                          <outline-document-add-icon class="w-5 h-5 inline-block" />
                        </nuxt-link>
                        <a
                          v-if="log.results_count === 0 && !log.ignore"
                          @click.prevent="ignore(log.id)"
                          href="##"
                        >
                          <outline-archive-icon class="w-5 h-5 inline-block"/>
                        </a>
                        <span  v-if="log.results_count === 0 && log.ignore">
                        <outline-eye-off-icon class="w-5 h-5 inline-block"/>
                      </span>
                      </b>
                    </td>
                    <td translate="no" class="py-2 font-mono text-xs text-sky-500 dark:text-sky-400">
                      <p v-if="log.results_count !== 0 || log.ignore">{{ log.translation_source }}</p>
                      <b v-else>{{ log.translation_source }}</b>
                    </td>
                    <td translate="no" class="py-2 font-mono text-xs text-sky-500 dark:text-sky-400">
                      {{ log.results_count }}
                    </td>
                    <td translate="no" class="py-2 font-mono text-xs text-sky-500 dark:text-sky-400">
                      {{ log.method.replace('App\\Services\\', '').replace('TranslateService', '').replace('RuToBur', 'ru -> bur').replace('BurToRu', 'bur -> ru') }}
                    </td>
                    <td translate="no" class="py-2 font-mono text-xs text-sky-500 dark:text-sky-400">
                      {{ formatDate(log.created_at) }} <small v-if="log.location_name || log.user_agent">{{ log.location_name }}({{ detectDevice(log.user_agent) }})</small>
                    </td>
                  </tr>
                </template>
                </tbody>
              </table>
              <Pagination
                v-if="translations.count"
                :offset="pagination.offset"
                :limit="pagination.limit"
                :total="translations.count"
                :key="paginationUpdate"
                @loadPage="loadListByOffset"
              />
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
import moment from "moment";
import Pagination from "../components/Pagination.vue";
import DeviceDetector from "device-detector-js";

let input;

export default Vue.extend({
  components: {
    Pagination
  },
  data () {
    return {
      title: 'Translations logs',
      translations: {
        logs: [],
        count: 0,
        ruToBurCount: 0,
        burToRuCount: 0,
        countToday: 0,
      },
      meta: {
        count: 0,
        to: 0,
        from: 0
      },
      paginationUpdate: 0,
      pagination: {
        offset: 0,
        limit: 100
      },
      pages: []
    }
  },
  computed: {
    translationLogsUrl () {
      return `/api/api/translations-logs${this.isUniqueNotFoundWords ? '/unique-not-found-words' : ''}`
    },
    isUniqueNotFoundWords () {
      return this.$route.name === 'TranslationsLogsUniqueNotFoundWords';
    }
  },
  async created() {
    if (!this.$auth.loggedIn) {
      return this.$router.push('/login');
    }

    const currentPage = parseInt(this.$route.query?.page || 1);
    this.pagination.offset = currentPage <= 1 ? 0 : (currentPage - 1) * 100;

    const startAt = moment().format('YYYY-MM-DD');
    const endAt = moment().add(1, 'day').format('YYYY-MM-DD');
    await this.loadList();
    const {count: ruToBurCount} = await this.$axios.$get(`${this.translationLogsUrl}/count?method=App\\Services\\RuToBurTranslateService`);
    const {count: burToRuCount} = await this.$axios.$get(`${this.translationLogsUrl}/count?method=App\\Services\\BurToRuTranslateService`);
    const {count: countToday} = await this.$axios.$get(`${this.translationLogsUrl}/count?startAt=${startAt}&endAt=${endAt}`);
    this.translations.ruToBurCount = ruToBurCount;
    this.translations.burToRuCount = burToRuCount;
    this.translations.count = this.meta.count;
    this.translations.countToday = countToday;
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
    detectDevice (userAgent) {
      const deviceDetector = new DeviceDetector();
      const info = deviceDetector.parse(userAgent);
      return info?.client?.name ? `${info?.client?.name}` : userAgent;
    },
    formatDate (date: any) {
      return moment(date).format('MMMM Do YYYY, h:mm:ss a')
    },
    async loadListByOffset (offset: any, limit: any) {
      this.pagination.limit = limit || this.pagination.limit;
      this.pagination.offset = offset === 0 ? 0 : offset || this.pagination.offset;
      await this.loadList();
      this.paginationUpdate++;
    },
    async loadList () {
      const {count} = await this.$axios.$get(`${this.translationLogsUrl}/count`);
      this.meta.count = count;
      this.translations.logs = await this.$axios.$get(`${this.translationLogsUrl}?limit=${this.pagination.limit}&offset=${this.pagination.offset}`);
    },
    async ignore (id) {
      await this.$axios.$put(`${this.translationLogsUrl}/${id}/ignore`);
      this.loadList();
    },
    preparePagination () {
      this.meta.from = this.translations.logs[this.translations.logs.length - 1].id;
      this.meta.to = this.translations.logs[0].id;
      this.pages = [];
      const pageCount = Math.ceil(this.meta.count / this.pagination.limit);
      const currentPage = this.pagination.offset / this.pagination.limit;
      if (currentPage > 2) {
        for (let i = 0; i < 3; i++) {
          this.pages.push({
            index: i,
            label: i + 1,
            current: currentPage === i
          });
        }
        this.pages.push({
          index: null,
          label: "...",
          current: false
        });
      }
      for (let i = currentPage; i < currentPage + 3; i++) {
        this.pages.push({
          index: i,
          label: i + 1,
          current: currentPage === i
        });
      }
      if (this.pages[0].index !== pageCount - 3) {
        this.pages.push({
          index: null,
          label: "...",
          current: false
        });
        for (let i = pageCount - 3; i < pageCount; i++) {
          this.pages.push({
            index: i,
            label: i + 1,
            current: currentPage === i
          });
        }

      }
    }
  }
})
</script>

<style>
</style>
