<template>
  <div class="container mt-6">
    <div class="sm:flex sm:items-center">
      <div class="text-gray-700 sm:flex-auto">
        <h1 class="title">Translation logs</h1>
        <p class="mt-2 text-sm">List of attempts to translate.</p>
        <ul class="mt-2 text-sm">
          <li>
            All translations: {{ allTranslationsNumber.toLocaleString() }}
          </li>
          <li>
            Ru to Bur translations:
            {{ ru2burTranslationsNumber.toLocaleString() }}
          </li>
          <li>
            Bur to Ru translations:
            {{ bur2ruTranslationsNumber.toLocaleString() }}
          </li>
        </ul>
      </div>
    </div>

    <div class="mt-8 flow-root overflow-x-auto">
      <table class="min-w-full border-separate border-spacing-0" v-if="logs">
        <thead>
          <tr>
            <th
              scope="col"
              class="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:table-cell"
            >
              Word / Phrase
            </th>
            <th
              scope="col"
              class="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
            >
              Results
            </th>
            <th
              scope="col"
              class="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
            >
              Type
            </th>
            <th
              scope="col"
              class="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
            >
              Date & Location
            </th>
            <th
              scope="col"
              class="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
            >
              <div class="sr-only">edit</div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(item, index) in logs"
            :key="item.id"
            :class="[
              !item.results_count
                ? 'bg-red-100'
                : index % 2 !== 0 && 'bg-neutral-50',
              item.ignore && 'opacity-30',
            ]"
          >
            <td
              :class="[
                index !== logs.length - 1 ? 'border-b border-gray-200' : '',
                'py-4 pl-3 pr-3 text-sm font-medium text-gray-900 ',
              ]"
            >
              {{ item.translation_source }}
            </td>
            <td
              :class="[
                index !== logs.length - 1 ? 'border-b border-gray-200' : '',
                'whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell',
              ]"
            >
              {{ item.results_count }}
            </td>
            <td
              :class="[
                index !== logs.length - 1 ? 'border-b border-gray-200' : '',
                'whitespace-nowrap px-3 py-4 text-sm text-gray-500 lg:table-cell',
              ]"
            >
              {{
                item.method
                  .replace('App\\Services\\', '')
                  .replace('TranslateService', '')
                  .replace('RuToBur', 'ru -> bur')
                  .replace('BurToRu', 'bur -> ru')
              }}
            </td>
            <td
              :class="[
                index !== logs.length - 1 ? 'border-b border-gray-200' : '',
                'whitespace-nowrap px-3 py-4 text-sm text-gray-500',
              ]"
            >
              {{ dateFormat(item.created_at, 'dd.mm.yyyy, HH:MM') }}

              <small v-if="item.location_name || item.user_agent">
                {{ item.location_name }}
                ({{ detectDevice(item.user_agent) }})
              </small>
            </td>
            <td
              :class="[
                index !== logs.length - 1 ? 'border-b border-gray-200' : '',
                'relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-8 lg:pr-8',
              ]"
            >
              <button
                v-if="!item.ignore"
                type="button"
                title="ignore"
                @click="ignoreLogItem(item.id)"
              >
                <TrashIcon class="h-4 w-4 stroke-neutral-500" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <UIPagination
        v-if="allTranslationsNumber / PER_PAGE"
        class="mt-6"
        :page="currentPage"
        :per-page="PER_PAGE"
        :last-page="lastPage"
        @changePage="changePage"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useAsyncData } from '#app';
  import type { Ref } from 'vue';
  import type { TranslationLog } from '~/repository/modules/admin/types';
  import { TrashIcon } from '@heroicons/vue/24/outline';
  import detectDevice from '../../utils/detectDevice';
  import dateFormat from 'dateformat/lib/dateformat';
  import type { metaResponse } from '~/repository/modules/types';

  useHead({
    title: 'Logs',
  });

  let allTranslationsNumber = 0;
  let ru2burTranslationsNumber = 0;
  let bur2ruTranslationsNumber = 0;

  const { $api } = useNuxtApp();
  const route = useRoute();
  const logs: Ref<TranslationLog[] | null> = ref([]);
  const isLoading = ref(false);
  const currentPage = ref(Number(route.query.page) || 1);
  const PER_PAGE = 100;

  const { data } = await useAsyncData('admin-logs', () =>
    Promise.all([
      $api.admin.getTranslationLogs(PER_PAGE),
      $api.admin.getTranslationsCount(),
      $api.admin.getTranslationsCount('bur2ru'),
      $api.admin.getTranslationsCount('ru2bur'),
    ]),
  );
  logs.value = data.value?.[0] || null;
  allTranslationsNumber = data.value?.[1] || 0;
  ru2burTranslationsNumber = data.value?.[2] || 0;
  bur2ruTranslationsNumber = data.value?.[3] || 0;

  const lastPage = Math.ceil(allTranslationsNumber / PER_PAGE);

  async function changePage(page: number) {
    try {
      isLoading.value = true;
      history.replaceState(null, '', `?page=${page}`);
      currentPage.value = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });

      logs.value = await $api.admin.getTranslationLogs(
        PER_PAGE,
        page * PER_PAGE - PER_PAGE,
      );
    } catch (e) {
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }

  const activeRequestsForIgnoring = new Set();

  async function ignoreLogItem(id: number) {
    if (activeRequestsForIgnoring.has(id)) return;

    activeRequestsForIgnoring.add(id);
    await $api.admin.ignoreTranslationLog(id);
    logs.value = await $api.admin.getTranslationLogs();
  }
</script>
