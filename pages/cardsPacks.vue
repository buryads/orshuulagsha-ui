<template>
  <div class="container mx-auto px-10">
    <div class="block md:flex">
      <div class="flex-auto">
        <div class="max-w-3xl mx-auto pt-10 xl:max-w-none xl:ml-0 xl:mr-[15.5rem] xl:pr-16">
          <Header>
            {{ title }}
            <template v-slot:controls>
              <Button :label="$t('create')" class="ml-5 inline-block lg:w-2/12 md:w-2/12 sm:w-2/12" @click="$router.push(localePath(`/pack/create`))"/>
            </template>
          </Header>
          <div class="mt-10 relative">
            <Packs :pagination="pagination" :packs="packs" @load-page="loadPage"></Packs>
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
      title: 'Packs',
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
        return this.$auth.user?.data
      }
    }
  },
  async created() {
    if (!this.$auth.loggedIn) {
      this.$router.push('/');
      return;
    }
    await this.loadPage();
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
    async loadPage (page = 1) {
      const {data: {data, pagination}} = await this.$axios.get(`/api/api/user/packs?page=${page}`);
      this.packs = data;
      this.pagination = pagination;
    }
  }
})
</script>

<style>
</style>
