<template>
  <div class="container mx-auto px-10 pb-10">
    <div class="block md:flex">
      <div class="flex-auto">
        <div class="max-w-3xl mx-auto pt-10 xl:max-w-none xl:ml-0 xl:mr-[15.5rem] xl:pr-16">
          <header id="header" class="relative z-20">
            <div>
              <p class="text-red-500" v-if="error.message">{{ $t(error.message) }}</p>
              <div class="flex items-center w-full">
                <Input id="packName" :placeholder="$t('enterPackName')" type="text" v-model="pack.name" class="w-full inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200"/>
              </div>
              <textarea id="packDescription" :placeholder="$t('enterPackDescription')" rows="10" v-model="pack.description" class="w-full p-5 inline-block text-base font-extrabold text-slate-900 tracking-tight dark:text-slate-200"/>
              <div class="form-check">
                <input type="checkbox" id="flexCheckChecked" v-model="pack.is_private">
                <label class="form-check-label inline-block text-gray-800" for="flexCheckChecked">
                  Is private
                </label>
              </div>
            </div>
          </header>
          <div class="mt-10 relative">
            <div class="overflow-hidden w-full lg:overflow-auto scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-slate-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-slate-300 scrollbar-track:!rounded dark:scrollbar-track:!bg-slate-500/[0.16] dark:scrollbar-thumb:!bg-slate-500/50">
              <div class="grid grid-flow-row-dense grid-cols-1">
                <div class="rounded overflow-hidden bg-gray-200 mx-2 col-span-1" v-if="burWords.length > 10">
                  <div class="px-6 py-4">
                    <span class="grid grid-flow-row-dense grid-cols-12">
                      <span class="col-span-1 inline-block"></span>
                      <span class="col-span-9 inline-block text-left">
                        <Button :label="$t('addBurword')" class="lg:w-full" @click="addBurword()"/>
                      </span>
                      <span class="inline-block col-span-2" ></span>
                    </span>
                  </div>
                  <hr>
                </div>
                <div v-for="burword in burWords" class="rounded overflow-hidden bg-gray-200 mx-2 col-span-1">
                  <div class="px-6 py-4">
                    <p class="grid grid-flow-row-dense grid-cols-12">
                      <Speech v-if="burword.speechs && burword.speechs.length" :speech="burword.speechs[0]"/>
                      <span class="col-span-9 inline-block text-left">
                        <span>{{ burword.name }} <a href="#" v-if="pack.user_id === $auth.user.id || $authUtils().isUserA('admin')" @click="removeBurword(burword)"><outline-trash-icon class="cursor-pointer w-5 h-5 hover:bg-gray-500 rounded inline-block" /></a></span>
                        <br>
                        <span class="text-gray-700" v-if="burword.translations">{{ burword.translations.map(v => v.name)[0] }}</span>
                      </span>
                      <img v-if="burword.images && burword.images.length" class="inline-block col-span-2" width="50" height="25" :src="burword.images[0].url" alt="Sunset in the mountains"></p>
                  </div>
                  <hr>
                </div>
                <div v-if="isEdit" class="rounded overflow-hidden bg-gray-200 mx-2 col-span-1">
                  <div class="px-6 py-4">

                  </div>
                  <hr>
                </div>
                <div class="grid grid-flow-row-dense grid-cols-12">
                      <div class="col-span-8 inline-block">
                        <Button :label="isEdit ? $t('save') : $t('create')" class="lg:w-full" @click="save()"/>
                      </div>
                      <div class="col-span-4 inline-block text-left pl-5">
                        <Button :label="$t('addBurword')" class="lg:w-full" @click="showAddBurword = true"/>
                      </div>
                    </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Modal className="w-8/12" v-show="showAddBurword">
      <template v-slot:header>Add new word</template>
      <template v-slot:body>
        <div>
          <Input id="burWord" :placeholder="$t('enterBurWord')" type="text" v-model="burWordSearch" class="lg:w-full inline-block text-base font-extrabold text-slate-900 tracking-tight dark:text-slate-200"/>
        </div>
        <div :key="update">
          <div v-for="burWord in burWordSearchResults"><p>{{ burWord.name }} <span @click="addBurword(burWord)" class="cursor-pointer"><outline-plus-icon class="w-5 hover:bg-gray-500 rounded inline-block"/></span></p></div>
        </div>
      </template>
      <template v-slot:footer>
        <Button :label="$t('close')" class="lg:w-full" @click="showAddBurword = false"/>
      </template>
    </Modal>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import Vue from 'vue';
import Input from '../components/Input.vue';
import Button from "~/components/Button.vue";
import Modal from "~/components/Modal.vue";
import Speech from "~/components/Speech.vue";

export default Vue.extend({
  data () {
    return {
      showAddBurword: false,
      pack: {
        name: null,
        is_private: true
      },
      error: {},
      burWords: [],
      update: 0,
      burWordSearch: null,
      burWordSearchResults: [],
    }
  },
  components: {
    Speech,
    Modal,
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
  watch: {
    burWordSearch () {
      this.loadSimilarWords();
    }
  },
  async created() {
    if (!this.$auth.loggedIn) {
      this.$router.push('/');
    }
    if (this.isEdit) {
      const {data: {data: pack}} = await this.$axios.get(`/api/api/user/packs/${this.packId}`);
      this.pack = pack;
      this.burWords = pack.burWords;
    }
  },
  computed: {
    title () {
      return `${this.isEdit ? this.$t('edit') : this.$t('create')} ${this.$t('pack')} - ${this.pack?.name}`
    },
    packId() {
      return this.$route.params.id;
    },
    isEdit() {
      return !!this.$route.params.id;
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
    async save () {
      try {
        if (!this.isEdit) {
          const {data: {data: {id}}} = await this.$axios.post('/api/api/user/packs', this.pack);
          this.$router.push(this.localePath(`/packs/`));
          setTimeout(() => this.$router.push(`/packs/${id}/edit`), 500);
          return;
        } else {
          const {data: {data}} = await this.$axios.put(`/api/api/user/packs/${this.pack.id}`, this.pack);
          this.pack = data;
          this.burWords = data.burWords;
        }
      } catch (e) {
        this.error = e.response.data;
        return;
      }
    },
    async loadSimilarWords() {
       const data = await this.$axios.$get(`/api/api/user/words-matcher/ru/bur?word=${this.burWordSearch}`);
      this.$nextTick(() => this.burWordSearchResults = data);
      this.update++;
    },
    async saveBurwords () {
      let response = null;
      try {
        if (!this.isEdit) {
          const {data: {data: {id}}} = await this.$axios.post('/api/api/user/packs', this.pack);
          this.$router.push(this.localePath(`/packs/${id}/edit`));
        } else {
          response = await this.$axios.post(`/api/api/user/packs/${this.pack.id}`, this.pack);
        }
      } catch (e) {
        this.error = e.response.data;
        return;
      }
      const {data} = response;
      console.log(data)
    },
    addBurword (word) {
      this.saveBurword(word);
    },
    async saveBurword (word) {
      const {data: {data}} = await this.$axios.post(`/api/api/user/packs/${this.pack.id}/${word.id}`, this.pack);
      this.pack = data;
      this.burWords = data.burWords;
    },
    async removeBurword (word) {
      const {data: {data}} = await this.$axios.delete(`/api/api/user/packs/${this.pack.id}/${word.id}`, this.pack);
      this.pack = data;
      this.burWords = data.burWords;
    }
  }
})
</script>

<style>
</style>
