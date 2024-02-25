<template>
  <div class="container mt-6">
    <div class="flex flex-col gap-3 sm:flex-row">
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

      <div class="text-sm text-gray-700">
        <button
          @click="showFiltersModal = true"
          type="button"
          class="flex items-center gap-1 rounded border border-neutral-200 bg-neutral-100 px-3 py-1.5"
        >
          <AdjustmentsHorizontalIcon class="h-5 w-5" />
          Filter
        </button>
      </div>
    </div>

    <div class="mt-8 flow-root overflow-x-auto">
      <table class="min-w-full border-separate border-spacing-0">
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

        <tbody v-if="logs">
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

      <div
        v-if="!logs"
        class="mt-5 text-center text-sm font-medium text-gray-900"
      >
        No data
      </div>

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

  <UIModal
    :visible="showFiltersModal"
    @close="showFiltersModal = false"
    modal-class="!overflow-auto"
  >
    <template #content>
      <UIRadioGroup
        label="Translation type"
        :options="[
          {
            id: 1,
            title: 'all',
            value: null,
          },
          {
            id: 2,
            title: 'bur -> ru',
            value: 'bur2ru',
          },
          {
            id: 3,
            title: 'ru -> bur',
            value: 'ru2bur',
          },
        ]"
        v-model="filters.translationType"
      />

      <UIRadioGroup
        class="mt-3"
        label="Status"
        :options="[
          {
            id: 1,
            title: 'all',
            value: null,
          },
          {
            id: 2,
            title: 'successful',
            value: 1,
          },
          {
            id: 3,
            title: 'failed',
            value: 0,
          },
        ]"
        v-model="filters.status"
      />

      <UILabel class="inline-block">
        <UICheckbox
          v-model="filters.ignored"
          label-class="mt-4 flex items-center text-sm font-medium leading-6 text-gray-900"
        >
          show ignored
        </UICheckbox>
      </UILabel>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <UIButton class="bg-bur-yellow px-6 text-white">Apply</UIButton>
      </div>
    </template>
  </UIModal>
</template>

<script lang="ts" setup>
  import { useAsyncData } from '#app';
  import type { Ref } from 'vue';
  import type { TranslationLog } from '~/repository/modules/admin/types';
  import { TrashIcon } from '@heroicons/vue/24/outline';
  import detectDevice from '../../utils/detectDevice';
  import dateFormat from 'dateformat/lib/dateformat';
  import { AdjustmentsHorizontalIcon } from '@heroicons/vue/24/outline';

  type Filter = {
    translationType?: 'all' | 'bur2ru' | 'ru2bur';
    status?: 'all' | 1 | 0;
    ignored?: 1 | null;
  };

  useHead({
    title: 'Logs',
  });

  const { $api } = useNuxtApp();
  const route = useRoute();
  const logs: Ref<TranslationLog[] | null> = ref([]);
  const isLoading = ref(false);
  const currentPage = ref(Number(route.query.page) || 1);
  const PER_PAGE = 100;
  const showFiltersModal = ref(false);
  const filters = reactive({
    translationType: 'all',
    status: 'all',
    ignored: null,
  } as Filter);

  const { data } = await useAsyncData('admin-logs', () =>
    Promise.all([
      $api.admin.getTranslationLogs(PER_PAGE),
      $api.admin.getTranslationsCount(),
      $api.admin.getTranslationsCount('bur2ru'),
      $api.admin.getTranslationsCount('ru2bur'),
    ]),
  );
  logs.value = data.value?.[0] || null;
  const allTranslationsNumber = data.value?.[1] || 0;
  const ru2burTranslationsNumber = data.value?.[2] || 0;
  const bur2ruTranslationsNumber = data.value?.[3] || 0;

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
