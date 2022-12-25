<template>
  <div class="w-full flex justify-center">
    <ul class="flex list-reset text-base border border-grey-light rounded w-auto font-sans">
      <li v-if="pagination.current_page > 1">
        <a class="block hover:text-blue-500 hover:bg-blue text-blue border-r border-grey-light px-3 py-2"
           href="#"
           @click.prevent="change(pagination.current_page -1)"
        >
          <<
        </a>
      </li>
      <li v-for="page in pages" :key="page" >
        <a :class="[page == pagination.current_page ? 'text-blue-500 bg-blue border-r border-blue':'hover:text-gray-500 hover:bg-blue text-blue border-r border-grey-light', 'block px-3 py-2']"
           href="#"
           @click.stop="change(page)"
        >
          {{ page }}
        </a>
      </li>
      <li v-if="pagination.current_page < pagination.last_page">
        <a class="block hover:text-blue-500 hover:bg-blue text-blue px-3 py-2"
           href="#"
           @click.prevent="change(pagination.current_page + 1)"
        >
          >>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import UrlHelper from "~/utils/url";

export default {
  props: {
    pagination: {
      type: Object,
      required: true
    },
    offset: {
      type: Number,
      default: 4
    }
  },
  computed: {
    pages() {
      if (!this.pagination.to) {
        return null;
      }
      let from = this.pagination.current_page - this.offset;
      if (from < 1) {
        from = 1;
      }
      let to = from + (this.offset * 1.2);
      if (to >= this.pagination.last_page) {
        to = this.pagination.last_page;
      }
      let pages = [];
      for (let page = from; page <= to; page++) {
        pages.push(page);
      }
      return pages;
    },
  },
  methods: {
    change: function(page) {
      UrlHelper.setQueryParameter('page', page);
      this.$emit('paginate', page);
    }
  }
}
</script>
