<template>
  <div class="container mx-auto px-10 pb-10">
    <client-only>
    <div class="block md:flex">
      <div class="flex-auto">
        <div class="max-w-3xl mx-auto pt-10 xl:max-w-none xl:ml-0 xl:mr-[15.5rem] xl:pr-16">
          <header id="header" class="relative z-20">
            <p class="text-red-500" v-if="error.message">{{ $t(error.message) }}</p>
            <Input id="packName" :placeholder="$t('enterPackName')" type="text" v-model="pack.name" class="w-full bg-gray-200 border-none focus:border-none inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200"/>
            <textarea id="packDescription" :placeholder="$t('enterPackDescription')" rows="3" v-model="pack.description" class="w-full bg-gray-200 border-none focus:border-none p-5 inline-block text-base font-extrabold text-slate-900 tracking-tight dark:text-slate-200"></textarea>
            <div class="form-check">
              <input type="checkbox" id="flexCheckChecked" v-model="pack.is_private">
              <label class="form-check-label inline-block text-gray-800" for="flexCheckChecked">
                Is private
              </label>
            </div>
          </header>
          <div class="grid grid-flow-row-dense grid-cols-1">
            <div v-for="burword in burWords" class="rounded overflow-hidden bg-gray-200 mx-2 col-span-1">
              <div class="px-6 py-4">
                <div class="grid grid-flow-row-dense grid-cols-12">
                  <Speech v-if="burword.speechs && burword.speechs.length" :speech="burword.speechs[0]"/>
                  <div class="col-span-9 text-left">
                    <p>
                      {{ burword.name }}
                      <a href="#" v-if="pack.user_id === $auth.user.data.id || $authUtils().isUserA('admin')" @click="removeBurword(burword)"><outline-trash-icon class="cursor-pointer w-5 h-5 hover:bg-gray-500 rounded inline-block" /></a>
                    </p>
                    <p class="text-gray-700" v-if="burword.translations">
                      {{ burword.translations.map(v => v.name)[0] }}
                    </p>
                  </div>
                  <div class="col-span-2">
                    <img v-if="burword.images && burword.images.length" width="50" height="25" :src="burword.images[0].url">
                  </div>
                </div>
              </div>
              <hr>
            </div>
            <div class="grid grid-flow-row-dense grid-cols-12">
              <div class="col-span-8">
                <Button :label="isEdit ? $t('save') : $t('create')" class="lg:w-full" @click="save()"/>
              </div>
              <div class="col-span-4 text-left pl-5">
                <Button v-if="isEdit" :label="$t('addBurword')" class="lg:w-full" @click="showAddBurword = true"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Modal className="w-8/12" v-show="showAddBurword">
      <template v-slot:header>Add new word</template>
      <template v-slot:body>
        <Input id="burWord" :placeholder="$t('enterBurWord')" type="text" v-model="burWordSearch" class="lg:w-full inline-block text-base font-extrabold text-slate-900 tracking-tight dark:text-slate-200"/>
        <div :key="update">
          <div v-for="burWord in burWordSearchResults">
            <p>
              {{ burWord.name }}
              <span @click="addBurword(burWord)" class="cursor-pointer">
                <outline-plus-icon class="w-5 hover:bg-gray-500 rounded inline-block"/>
              </span>
            </p>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Button :label="$t('close')" class="lg:w-full" @click="showAddBurword = false"/>
      </template>
    </Modal>
    </client-only>
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
