<template>
  <div class="container mx-auto px-10">
    <div class="block md:flex">
      <div class="flex-auto">
        <div
          class="mx-auto max-w-3xl pt-10 xl:ml-0 xl:mr-[15.5rem] xl:max-w-none xl:pr-16"
        >
          <Header>
            {{ pack.name }}
          </Header>
          <div class="relative mt-10">
            <p>
              {{ pack.description }}
            </p>
            <div class="w-full text-center">
              <img
                v-if="
                  pack.burWords &&
                  pack.burWords.length &&
                  pack.burWords[0].images &&
                  pack.burWords[0].images.length
                "
                class="inline-block"
                style="max-height: 300px; max-width: 300px"
                :src="extractDefaultBurImageFromBurWord(pack.burWords[0])"
                alt=""
              />
            </div>
            <div class="grid grid-flow-row-dense grid-cols-1">
              <div
                v-for="burword in pack.burWords"
                class="col-span-1 mx-2 overflow-hidden rounded bg-gray-200"
              >
                <div class="px-6 py-4">
                  <div class="grid grid-flow-row-dense grid-cols-12">
                    <Speech
                      v-if="burword.speechs && burword.speechs.length"
                      :speech="burword.speechs[0]"
                    />
                    <div class="col-span-9 inline-block text-left">
                      <p>{{ burword.name }}</p>
                      <p
                        class="text-gray-700"
                        v-if="burword.ru_words && burword.ru_words.length"
                      >
                        {{ burword.ru_words.map((v) => v.name)[0] }}
                      </p>
                      <p
                        class="text-gray-700"
                        v-else-if="
                          burword.translations && burword.translations.length
                        "
                      >
                        {{ burword.translations.map((v) => v.name)[0] }}
                      </p>
                    </div>
                    <div class="col-span-2 inline-block">
                      <img
                        v-if="burword.images && burword.images.length"
                        width="100"
                        height="50"
                        :src="extractDefaultBurImageFromBurWord(burword)"
                      />
                    </div>
                  </div>
                </div>
                <hr />
              </div>
              <div v-if="$auth.loggedIn">
                <Button
                  v-if="pack.is_attached"
                  :label="$t('learnPack')"
                  class="lg:w-full"
                  @click="learnPack"
                />
                <Button
                  v-else
                  :label="$t('continuePack')"
                  class="lg:w-full"
                  @click="continuePack"
                />
              </div>
              <div v-else>
                <Button
                  :label="$t('login')"
                  class="lg:w-full"
                  @click="$router.push(localePath('login'))"
                />
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
  import Input from '~/_components/Input.vue';
  import Button from '~/_components/Button.vue';
  import Speech from '~/_components/Speech.vue';
  import Header from '~/_components/Header.vue';
  import extractDefaultBurImageFromBurWord from '~/utils/extractDefaultBurImageFromBurWord';

  export default Vue.extend({
    data() {
      return {};
    },
    async asyncData({ $axios, params, error }) {
      let pack = null;
      try {
        document;
        const { data } = await $axios.$get(
          `/api/user/packs/${params.packName}/by-slug`,
        );
        pack = data;
      } catch (e) {
        const { data } = await $axios.$get(
          `/api/user/packs/${params.packName}/by-slug`,
        );
        pack = data;
      }
      return {
        pack,
      };
    },
    components: {
      Header,
      Speech,
      Button,
      Input,
    },
    computed: {
      user: {
        get() {
          return this.$auth.user?.data;
        },
      },
      packName() {
        return this.$route.params.packName;
      },
    },
    created() {
      this.loadPack();
    },
    computed: {
      packName() {
        return this.$route.params.packName;
      },
      title() {
        return this.pack?.name ? `${this.pack?.name}` : `Card pack name`;
      },
      hasImage() {
        return (
          this.pack.burWords &&
          this.pack.burWords.length &&
          this.pack.burWords[0].images &&
          this.pack.burWords[0].images.length
        );
      },
    },
    head(): any {
      return {
        title: `${this.$t('packTitle').replace(
          '{pack}',
          this.pack.name,
        )} - ${this.$t('appName')}`,
        meta: [
          {
            hid: 'description',
            name: 'description',
            content: this.pack.description,
          },
          {
            property: 'og:title',
            name: 'title',
            content: `${this.$t('packTitle').replace(
              '{pack}',
              this.pack.name,
            )} - ${this.$t('appName')}`,
          },
          {
            property: 'og:type',
            name: 'type',
            content: `article`,
          },
          {
            property: 'og:description',
            name: 'description',
            content: this.pack.description,
          },
          this.hasImage
            ? {
                property: 'og:image',
                name: 'image',
                content: this.pack.burWords[0].images[0].url,
              }
            : {},
        ],
      };
    },
    methods: {
      extractDefaultBurImageFromBurWord,
      async loadPack() {
        const { data } = await this.$axios.$get(
          `/api/user/packs/${this.packName}/by-slug`,
        );
        this.pack = data;
      },
      async learnPack() {
        const { data } = await this.$axios.$post(
          `/api/user/packs/${this.pack.id}/attach`,
        );
        this.continuePack();
      },
      continuePack() {
        this.$router.push(this.localePath(`/packs/${this.pack.slug}/train`));
      },
    },
  });
</script>

<style></style>
