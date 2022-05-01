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
          </header>
          <div class="mt-10 relative">
            <h2 class="group flex whitespace-pre-wrap relative scroll-mt-[var(--scroll-mt)] -ml-4 pl-4" id="class-reference">
              <a href="#class-reference" class="absolute -ml-10 flex items-center opacity-0 border-0 group-hover:opacity-100" aria-label="Anchor">
                &ZeroWidthSpace;
                <div class="w-6 h-6 text-slate-400 ring-1 ring-slate-900/5 rounded-md shadow-sm flex items-center justify-center hover:ring-slate-900/10 hover:shadow hover:text-slate-700 dark:bg-slate-700 dark:text-slate-300 dark:shadow-none dark:ring-0">
                  <svg width="12" height="12" fill="none" aria-hidden="true">
                    <path d="M3.75 1v10M8.25 1v10M1 3.75h10M1 8.25h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                  </svg>
                </div>
              </a>
              <span><span class="sr-only">Quick reference</span></span>
            </h2>
            <div class="overflow-hidden lg:overflow-auto scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-slate-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-slate-300 scrollbar-track:!rounded dark:scrollbar-track:!bg-slate-500/[0.16] dark:scrollbar-thumb:!bg-slate-500/50">
              <table class="w-full text-left border-collapse">
                <thead>
                <tr>
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
                <tr v-for="log in translations.logs" :class="`${!log.results_count ? 'bg-red-300' : ''}`">
                  <td translate="no" class="py-2 font-mono text-xs text-sky-500 dark:text-sky-400">
                    <b>{{ log.translation_source }}</b>
                  </td>
                  <td translate="no" class="py-2 font-mono text-xs text-sky-500 dark:text-sky-400">
                    {{ log.results_count }}
                  </td>
                  <td translate="no" class="py-2 font-mono text-xs text-sky-500 dark:text-sky-400">
                    {{ log.method.replace('App\\Services\\', '').replace('TranslateService', '').replace('RuToBur', 'ru').replace('BurToRu', 'bur') }}
                  </td>
                  <td translate="no" class="py-2 font-mono text-xs text-sky-500 dark:text-sky-400">
                    {{ formatDate(log.created_at) }}
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import moment from "moment";

let input;

export default Vue.extend({
  data () {
    return {
      title: 'Translations logs',
      translations: {
        logs: [],
        count: 0,
        ruToBurCount: 0,
        burToRuCount: 0,
        countToday: 0,
      }
    }
  },
  async fetch() {
    const startAt = moment().format('YYYY-MM-DD');
    const endAt = moment().add(1, 'day').format('YYYY-MM-DD');
    this.translations.logs = await this.$axios.$get('/api/translations-logs');
    const {count} = await this.$axios.$get('/api/translations-logs/count');
    const {count: ruToBurCount} = await this.$axios.$get('/api/translations-logs/count?method=App\\Services\\RuToBurTranslateService');
    const {count: burToRuCount} = await this.$axios.$get('/api/translations-logs/count?method=App\\Services\\BurToRuTranslateService');
    const {count: countToday} = await this.$axios.$get(`/api/translations-logs/count?startAt=${startAt}&endAt=${endAt}`);
    this.translations.ruToBurCount = ruToBurCount;
    this.translations.burToRuCount = burToRuCount;
    this.translations.count = count;
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
    formatDate (date: any) {
      return moment(date).format('MMMM Do YYYY, h:mm:ss a')
    }
  }
})
</script>

<style>
</style>
