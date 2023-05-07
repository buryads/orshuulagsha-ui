<template>
  <div class="container mx-auto px-10">
    <div class="block md:flex">
      <div class="flex-auto">
        <div class="max-w-3xl mx-auto pt-10 xl:max-w-none xl:ml-0 xl:mr-[15.5rem] xl:pr-16">
          <Header>
            {{ title }}
            <template v-slot:controls v-if="this.$auth.loggedIn">
              <Button :label="$t('create')" class="ml-5 inline-block lg:w-2/12 md:w-2/12 sm:w-2/12" @click="$router.push(localePath(`/pack/create`))"/>
            </template>
          </Header>
          <div class="mt-10 relative">
            <Packs :pagination="pagination" :packs="packs" @loadPage="loadPage"></Packs>
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
import Packs from "~/components/Packs.vue";
import Header from "~/components/Header.vue";

export default Vue.extend({
  data () {
    return {
      title: this.$t('packsTitle'),
      packs: [],
      pagination: {},
    }
  },
  components: {
    Header,
    Packs,
    PublicPagination,
    Button,
    Input
  },
  computed: {
    user: {
      get () {
        return this.$auth.user?.data ?? {}
      }
    }
  },
  async created() {
    await this.loadPage();
  },
  head(): any {
    return {
      title: `${this.$t('packsTitle')} - ${this.$t('appName')}`,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: `${this.$t('packsTitle')} - ${this.$t('appName')}`
        },
        {
          property: 'og:title',
          name: 'title',
          content: `${this.$t('packsTitle')} - ${this.$t('appName')}`
        },
        {
          property: 'og:type',
          name: 'type',
          content: `article`
        },
        {
          property: 'og:description',
          name: 'description',
          content: `${this.$t('packsDescription')} - ${this.$t('appName')}`
        }
      ]
    }
  },
  methods: {
    async loadPage (page = 1) {
      const response = await this.$axios.get(`/api/user/packs?page=${page}`);
      this.packs = response.data.data;
      this.pagination = response.data.pagination;
    }
  }
})
</script>

<style>
</style>
