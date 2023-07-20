<template>
  <div class="pagination">
    <button :disabled="page === 1" @click="goToPage(page - 1)">Previous</button>
    <span
      v-for="page in displayedPages"
      :key="page"
      @click="goToPage(page)"
      :class="{ active: page === page }"
    >
      {{ page }}
    </span>
    <span v-if="shouldDisplayEllipsisBefore" class="ellipsis">...</span>
    <span v-if="shouldDisplayEllipsisAfter" class="ellipsis">...</span>
    <button :disabled="page === lastPage" @click="goToPage(page + 1)">
      Next
    </button>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    page: number;
    lastPage: number;
  }

  const emit = defineEmits(['changePage']);
  const { page, lastPage } = defineProps<Props>();

  const displayedPages = computed(() => generateDisplayedPages(page, lastPage));
  console.log(displayedPages.value);
  const shouldDisplayEllipsisBefore = computed(
    () => displayedPages.value[0] > 2,
  );
  const shouldDisplayEllipsisAfter = computed(
    () => displayedPages.value[displayedPages.value.length - 1] < lastPage - 1,
  );

  function goToPage(page: number) {
    // You can emit an event or perform any other action here to handle the page change
    emit('changePage', page);
    console.log(`Navigating to page ${page}`);
  }

  function generateDisplayedPages(currentPage: number, lastPage: number) {
    const MAX_PAGES = 3;
    const pages = [];

    let startPage = Math.max(currentPage - MAX_PAGES, 1);
    let endPage = Math.min(currentPage + MAX_PAGES, lastPage);

    if (endPage - startPage < MAX_PAGES * 2) {
      const diff = MAX_PAGES * 2 - (endPage - startPage);
      if (startPage - diff > 1) {
        startPage -= diff;
      } else {
        endPage += diff;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
</script>

<style scoped>
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
  }

  button {
    margin: 0 5px;
  }

  span {
    margin: 0 2px;
    cursor: pointer;
  }

  .active {
    font-weight: bold;
  }

  .ellipsis {
    margin: 0 2px;
  }
</style>
