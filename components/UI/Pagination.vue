<template>
  <nav
    class="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0"
  >
    <div class="-mt-px flex w-0 flex-1">
      <a
        v-if="page > 1"
        href="#"
        @click.prevent="changePage(page - 1)"
        class="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
      >
        <ArrowLongLeftIcon
          class="mr-3 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
        {{ $t('previous') }}
      </a>
    </div>

    <div class="hidden md:-mt-px md:flex">
      <a
        v-for="(rangeItem, i) in paginationRange"
        :key="`${rangeItem}-${i}`"
        href="#"
        @click.prevent="rangeItem === DOTS ? null : changePage(rangeItem)"
        :class="[
          rangeItem === DOTS
            ? 'cursor-default'
            : page === rangeItem
            ? 'border-indigo-500 text-indigo-600'
            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
        ]"
        class="inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium"
      >
        {{ rangeItem === DOTS ? '...' : rangeItem }}
      </a>
      <!-- Current: "border-indigo-500 text-indigo-600", Default: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" -->
    </div>

    <div class="-mt-px flex w-0 flex-1 justify-end">
      <a
        v-if="page < lastPage"
        href="#"
        @click.prevent="changePage(page + 1)"
        class="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
      >
        {{ $t('next') }}
        <ArrowLongRightIcon
          class="ml-3 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </a>
    </div>
  </nav>
</template>

<script setup lang="ts">
  import {
    ArrowLongLeftIcon,
    ArrowLongRightIcon,
  } from '@heroicons/vue/20/solid';
  import usePagination, { DOTS } from '~/utils/usePagination';

  interface Props {
    page: number;
    perPage: number;
    lastPage: number;
  }

  const props = defineProps<Props>();
  const emit = defineEmits(['changePage']);

  const changePage = (page: number) => {
    emit('changePage', page);
  };

  const paginationRange = computed(() =>
    usePagination(props.lastPage, 1, props.page, 3),
  );
</script>
