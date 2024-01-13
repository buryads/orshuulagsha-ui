<template>
  <div class="container mt-6">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="title">Translation logs</h1>
        <p class="mt-2 text-sm text-gray-700">List of attempts to translate.</p>
      </div>
    </div>

    <div class="mt-8 flow-root">
      <table class="min-w-full border-separate border-spacing-0" v-if="logs">
        <thead>
          <tr>
            <th
              scope="col"
              class="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:table-cell"
            >
              Word / Phrase
            </th>
            <th
              scope="col"
              class="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
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
                'hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell',
              ]"
            >
              {{ item.results_count }}
            </td>
            <td
              :class="[
                index !== logs.length - 1 ? 'border-b border-gray-200' : '',
                'hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 lg:table-cell',
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
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useAsyncData } from '#app';
  import { Ref } from 'vue';
  import { TranslationLog } from '~/repository/modules/admin/types';
  import { TrashIcon } from '@heroicons/vue/24/outline';
  import detectDevice from '../../utils/detectDevice';
  import dateFormat from 'dateformat/lib/dateformat';

  useHead({
    title: 'Logs',
  });

  const { $api } = useNuxtApp();
  const logs: Ref<TranslationLog[] | null> = ref([]);
  const { data } = await useAsyncData('admin-logs', () =>
    $api.admin.getTranslationLogs(),
  );

  logs.value = data.value;

  async function ignoreLogItem(id: number) {
    await $api.admin.ignoreTranslationLog(id);
    logs.value = await $api.admin.getTranslationLogs();
  }
</script>
