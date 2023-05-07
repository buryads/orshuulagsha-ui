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
                      <a
                        href="#"
                        v-if="pack.user_id === $auth.user.data.id || $authUtils().isUserA('admin')"
                        @click="removeBurword(burword)"
                      >
                        <outline-trash-icon class="cursor-pointer w-5 h-5 hover:bg-gray-500 rounded inline-block" />
                      </a>
                    </p>
                    <p class="text-gray-700" v-if="burword.ru_words && burword.ru_words.length">
                      {{ burword.ru_words.map(v => v.name)[0] }}
                    </p>
                    <p class="text-gray-700" v-else-if="burword.translations && burword.translations.length">
                      {{ burword.translations.map(v => v.name)[0] }}
                    </p>
                  </div>
                  <div class="col-span-2 relative" >
                    <div v-if="burword.images && burword.images.length">
                      <img width="100" height="50" :src="extractDefaultBurImageFromBurWord(burword)">
                      <button
                        v-if="isEdit"
                        label=""
                        class="absolute w-5 m-1 top-0 hover:bg-gray-300 rounded cursor-pointer bg-gray-500 p-1"
                        @click.prevent="showEditBurwordModal(burword)"
                      >
                        <outline-plus-icon/>
                      </button>
                    </div>
                    <button
                      v-else-if="isEdit"
                      label=""
                      class="absolute w-5 m-1 top-0 hover:bg-gray-300 rounded cursor-pointer bg-gray-500 p-1"
                      @click.prevent="showEditBurwordModal(burword)"
                    >
                      <outline-plus-icon/>
                    </button>
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
        <Input id="burWord" :placeholder="$t('enterBurWord')" type="text" accept="image/jpeg" v-model="burWordSearch" class="lg:w-full inline-block text-base font-extrabold text-slate-900 tracking-tight dark:text-slate-200"/>
        <div :key="update" style="max-height: 12rem; overflow-y: scroll;">
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
    <Modal className="w-8/12" v-show="showEditBurword">
      <template v-slot:header>Select default image or upload new image for the word: <span class="text-green-500">{{ editBurword.name }}</span></template>
      <template v-slot:body>
        <div v-for="image in editBurword.images" class="inline-block">
          <label :for="'img-' + image.id">
            <img width="150" height="150" class="m-2" :src="image.url">
            <input
              :id="'img-' + image.id"
              :placeholder="$t('selectDefaultPackImage')"
              type="radio"
              name="defaultImage"
              :value="image.id"
              v-model="defaultImage"
              class="lg:w-full inline-block text-base font-extrabold text-slate-900 tracking-tight dark:text-slate-200"
            />
          </label>
        </div>
        <Input id="burWord" :placeholder="$t('enterBurWord')" type="file" v-model="file" class="lg:w-full inline-block text-base font-extrabold text-slate-900 tracking-tight dark:text-slate-200"/>
      </template>
      <template v-slot:footer>
        <Button :label="$t('close')" class="lg:w-full" @click="showEditBurword = false"/>
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
import extractDefaultBurImageFromBurWord from "~/utils/extractDefaultBurImageFromBurWord";

export default Vue.extend({
  data () {
    return {
      showAddBurword: false,
      showEditBurword: false,
      editBurword: false,
      file: null,
      pack: {
        name: null,
        is_private: true
      },
      error: {},
      burWords: [],
      update: 0,
      defaultImage: null,
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
    },
    file (newVal) {
      if (!newVal) {
        return;
      }
      this.submitImage(this.editBurword)
    },
    defaultImage (newVal) {
      this.setDefaultBurWordImage(this.editBurword, newVal);
    }
  },
  async created() {
    if (!this.$auth.loggedIn) {
      this.$router.push(this.localePath('/'));
    }
    if (this.isEdit) {
      await this.loadPackData(this.packId);
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
    extractDefaultBurImageFromBurWord,
    async loadPackData (packId) {
      const {data: {data: pack}} = await this.$axios.get(`/api/user/packs/${packId}`);
      this.setPack(pack);
    },
    setPack (pack) {
      this.pack = pack;
      this.burWords = pack.burWords;
    },
    showEditBurwordModal(burword) {
      this.editBurword = burword;
      this.defaultImage = burword.pivot.bur_word_image_id;
      this.showEditBurword = true;
    },
    submitImage(burword) {
      const formData = new FormData();
      formData.append('image', this.file);
      const headers = { 'Content-Type': 'multipart/form-data' };
      this.$axios.post(`/api/images/burwords/${burword.id}`, formData, { headers }).then((res) => {
        this.editBurword = res.data.data;
      });
    },
    setDefaultBurWordImage(burword, imageId) {
      this.$axios.post(`/api/user/packs/${this.packId}/burwords/${burword.id}`, {
        bur_word_image_id: imageId
      }).then((res) => {
        const pack = res.data.data;
        this.setPack(pack);
      });
    },
    async save () {
      try {
        if (!this.isEdit) {
          const {data: {data: {id}}} = await this.$axios.post('/api/user/packs', this.pack);
          this.$router.push(this.localePath(`/packs/`));
          setTimeout(() => this.$router.push(this.localePath(`/packs/${id}/edit`)), 500);
          return;
        } else {
          const {data: {data}} = await this.$axios.put(`/api/user/packs/${this.pack.id}`, this.pack);
          this.pack = data;
          this.burWords = data.burWords;
        }
      } catch (e) {
        this.error = e.response.data;
        return;
      }
    },
    async loadSimilarWords() {
       const data = await this.$axios.$get(`/api/user/words-matcher/ru/bur?word=${this.burWordSearch}&limit=1000`);
      this.$nextTick(() => this.burWordSearchResults = data);
      this.update++;
    },
    async saveBurwords () {
      let response = null;
      try {
        if (!this.isEdit) {
          const {data: {data: {id}}} = await this.$axios.post('/api/user/packs', this.pack);
          this.$router.push(this.localePath(`/packs/${id}/edit`));
        } else {
          response = await this.$axios.post(`/api/user/packs/${this.pack.id}`, this.pack);
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
      const {data: {data}} = await this.$axios.post(`/api/user/packs/${this.pack.id}/${word.id}`, this.pack);
      this.pack = data;
      this.burWords = data.burWords;
    },
    async removeBurword (word) {
      const {data: {data}} = await this.$axios.delete(`/api/user/packs/${this.pack.id}/${word.id}`, this.pack);
      this.pack = data;
      this.burWords = data.burWords;
    }
  }
})
</script>

<style>
</style>
