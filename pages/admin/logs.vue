<template>
  <div class="container mt-6">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="title">Translation logs</h1>
        <p class="mt-2 text-sm text-gray-700">List of attempts to translate.</p>
      </div>
    </div>

    <div class="mt-8 flow-root">
      <div class="inline-block min-w-full py-2 align-middle">
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
            <tr v-for="(item, index) in logs" :key="item.id">
              <td
                :class="[
                  index !== logs.length - 1 ? 'border-b border-gray-200' : '',
                  index % 2 !== 0 && 'bg-neutral-50',
                  'whitespace-nowrap py-4 pl-3 pr-3 text-sm font-medium text-gray-900 ',
                ]"
              >
                {{ item.translation_source }}
              </td>
              <td
                :class="[
                  index !== logs.length - 1 ? 'border-b border-gray-200' : '',
                  index % 2 !== 0 && 'bg-neutral-50',
                  'hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell',
                ]"
              >
                {{ item.results_count }}
              </td>
              <td
                :class="[
                  index !== logs.length - 1 ? 'border-b border-gray-200' : '',
                  index % 2 !== 0 && 'bg-neutral-50',
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
                  index % 2 !== 0 && 'bg-neutral-50',
                  'whitespace-nowrap px-3 py-4 text-sm text-gray-500',
                ]"
              >
                {{ item.created_at }}

                <small v-if="item.location_name || item.user_agent">
                  {{ item.location_name }}
                  ({{ detectDevice(item.user_agent) }})
                </small>
              </td>
              <td
                :class="[
                  index !== logs.length - 1 ? 'border-b border-gray-200' : '',
                  index % 2 !== 0 && 'bg-neutral-50',
                  'relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-8 lg:pr-8',
                ]"
              ></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useAsyncData } from '#app';
  import { Ref } from 'vue';
  import { TranslationLog } from '~/repository/modules/admin/types';
  import detectDevice from '../../utils/detectDevice';

  useHead({
    title: 'Logs',
  });

  const { $api } = useNuxtApp();
  const logs: Ref<TranslationLog[] | null> = ref([]);
  const { data } = await useAsyncData('admin-logs', () =>
    $api.admin.getTranslationLogs(),
  );

  logs.value = data.value;
</script>
