<template>
  <div class="container mx-auto px-10">
    <div class="block md:flex">
      <div class="flex-auto">
        <div class="max-w-3xl mx-auto pt-10 xl:max-w-none xl:ml-0 xl:mr-[15.5rem] xl:pr-16">
          <header id="header" class="relative z-20">
            <div>
              <div class="flex items-center">
                <h1 class="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">{{ pack.name }}</h1>
              </div>
            </div>
          </header>
          <div class="mt-10 relative">
            <p>
              {{ pack.description }}
            </p>
            <div class="w-full">
              <img v-if="pack.burWords && pack.burWords.length && pack.burWords[0].images && pack.burWords[0].images.length" class="inline-block w-6/12" width="50" height="25" :src="pack.burWords[0].images[0].url" alt="">
            </div>
            <div class="overflow-hidden w-full lg:overflow-auto scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-slate-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-slate-300 scrollbar-track:!rounded dark:scrollbar-track:!bg-slate-500/[0.16] dark:scrollbar-thumb:!bg-slate-500/50">
              <div class="grid grid-flow-row-dense grid-cols-1">
                <div v-for="burword in pack.burWords" class="rounded overflow-hidden bg-gray-200 mx-2 col-span-1">
                  <div class="px-6 py-4">
                    <p class="grid grid-flow-row-dense grid-cols-12">
                      <Speech v-if="burword.speechs && burword.speechs.length" :speech="burword.speechs[0]"/>
                      <span class="col-span-9 inline-block text-left">
                        <span>{{ burword.name }} <a href="#" v-if="pack.user_id === $auth.user.id || $authUtils().isUserA('admin')" @click="removeBurword(burword)"><outline-trash-icon class="cursor-pointer w-5 h-5 hover:bg-gray-500 rounded inline-block" /></a></span>
                        <br>
                        <span class="text-gray-700" v-if="burword.translations">{{ burword.translations.map(v => v.name)[0] }}</span>
                      </span>
                      <img v-if="burword.images && burword.images.length" class="inline-block col-span-2" width="50" height="25" :src="burword.images[0].url" alt="Sunset in the mountains">
                    </p>
                  </div>
                  <hr>
                </div>
<!--                <Button :label="$t('learnPack')" class="lg:w-full" @click="$router.push(localePath(`/packs/test/quiz`))"/>-->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import Input from '../components/Input.vue';
import Button from "~/components/Button.vue";
import Speech from "~/components/Speech.vue";

export default Vue.extend({
  data () {
    return {
      title: `${this.$t('cards')} - ${this.packName}`,
      pack: {}
    }
  },
  components: {
    Speech,
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
  created() {
    if (!this.$auth.loggedIn) {
      this.$router.push('/');
      return;
    }
    this.loadPack();
  },
  computed: {
    packName() {
      return this.$route.params.packName;
    }
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
    async loadPack () {
      const { data } = await this.$axios.$get(`/api/api/user/packs/${this.packName}/by-slug`);
      this.pack = data;
      console.log(data)
    }
  }
})
</script>

<style>
</style>
