<template>
  <div class="container mx-auto px-10">
    <div class="block md:flex">
      <div class="flex-auto">
        <div class="max-w-3xl mx-auto pt-10 xl:max-w-none xl:ml-0 xl:mr-[15.5rem] xl:pr-16">
          <Header>
            {{ pack.name }}
          </Header>
          <div class="mt-10 relative">
            <p>
              {{ pack.description }}
            </p>
            <div class="w-full">
              <img v-if="pack.burWords && pack.burWords.length && pack.burWords[0].images && pack.burWords[0].images.length" class="inline-block w-6/12" width="50" height="25" :src="pack.burWords[0].images[0].url" alt="">
            </div>
            <div class="grid grid-flow-row-dense grid-cols-1">
              <div v-for="burword in pack.burWords" class="rounded overflow-hidden bg-gray-200 mx-2 col-span-1">
                <div class="px-6 py-4">
                  <div class="grid grid-flow-row-dense grid-cols-12">
                    <Speech v-if="burword.speechs && burword.speechs.length" :speech="burword.speechs[0]"/>
                    <div class="col-span-9 inline-block text-left">
                      <p>{{ burword.name }}</p>
                      <p class="text-gray-700" v-if="burword.translations">{{ burword.translations.map(v => v.name)[0] }}</p>
                    </div>
                    <div class="inline-block col-span-2">
                      <img v-if="burword.images && burword.images.length" width="50" height="25" :src="burword.images[0].url">
                    </div>
                  </div>
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
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import Input from '../components/Input.vue';
import Button from "~/components/Button.vue";
import Speech from "~/components/Speech.vue";
import Header from "~/components/Header.vue";

export default Vue.extend({
  data () {
    return {
      title: `${this.$t('cards')} - ${this.packName}`,
      pack: {}
    }
  },
  components: {
    Header,
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
