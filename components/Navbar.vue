<template>
  <div>
    <nav v-if="!user.id" class="container mx-auto w-full flex relative justify-between items-center mx-auto md:px-8 px-3 h-20">
      <div class="p-4 w-full">
        <!--light mode - text and icons-->
        <div class="p-2 text-gray-900 bg-white rounded-lg shadow-lg font-medium capitalize">
          <nuxt-link :to="localePath('/')" class="px-2 mr-2 border-r border-gray-200 cursor-pointer">
            <img src="/favicon.png"
                 alt="alt placeholder" class="w-10 h-10 -mt-1 inline mx-auto">
            <span class="hidden lg:inline hover:bg-gray-200 hover:text-gray-700">{{ $t('appName') }}</span>
          </nuxt-link>
          <nuxt-link :to="localePath('/games')" class="px-2 py-1 cursor-pointer hover:bg-gray-200 hover:text-gray-700 text-sm rounded mb-5">
            <outline-puzzle-icon class="w-8 fas fa-stream p-2 bg-gray-200 rounded-full inline-block" />
            <span class="mx-1 hidden lg:inline">{{ $t('games') }}</span>
          </nuxt-link>
          <nuxt-link :to="localePath('/names')" class="px-2 py-1 cursor-pointer hover:bg-gray-200 hover:text-gray-700 text-sm rounded mb-5">
            <outline-at-symbol-icon class="w-8 fas fa-stream p-2 bg-gray-200 rounded-full inline-block" />
            <span class="mx-1 hidden lg:inline">{{ $t('names') }}</span>
          </nuxt-link>
          <nuxt-link :to="localePath('/quiz')" class="px-2 py-1 cursor-pointer hover:bg-gray-200 hover:text-gray-700 text-sm rounded mb-5">
            <outline-information-circle-icon class="w-8 fas fa-stream p-2 bg-gray-200 rounded-full inline-block" />
            <span class="mx-1 hidden lg:inline">{{ $t('quiz') }}</span>
          </nuxt-link>
          <div class="inline-block cursor-pointer" @click.prevent="showDatabaseDropdown = !showDatabaseDropdown">
            <nuxt-link to="#" class="px-2 py-1 hover:bg-gray-200 hover:text-gray-700 text-sm rounded mb-5">
              <outline-view-list-icon class="w-8 fas fa-stream p-2 bg-gray-200 rounded-full inline-block" />
              <span class="mx-1 hidden lg:inline">{{ $t('words') }}</span>
            </nuxt-link>
            <div v-if="showDatabaseDropdown" class="bg-blend-lighten md:bg-blend-darken w-screen h-screen fixed top-0 left-0 z-20"></div>
            <div v-bind:class="{'hidden': !showDatabaseDropdown, 'block': showDatabaseDropdown}" class="mt-5 absolute bg-white text-gray-700 text-base z-50 float-left py-2 list-none text-left rounded shadow-lg mt-1" style="min-width:12rem" ref="popoverDropdownRef">
              <nuxt-link :to="localePath('/words/')" class="text-sm py-2 px-4 font-normal hover:bg-gray-200 block w-full whitespace-nowrap bg-transparent ">
                {{ $t('buryadDictionary') }}
              </nuxt-link>
              <nuxt-link :to="localePath('/words/ru')" class="text-sm py-2 px-4 font-normal hover:bg-gray-200 block w-full whitespace-nowrap bg-transparent ">
                {{ $t('russianDictionary') }}
              </nuxt-link>
            </div>
          </div>
          <div class="inline-block cursor-pointer" @click.prevent="dropdownPopoverShow = !dropdownPopoverShow">
            <nuxt-link to="#" class="px-2 py-1 hover:bg-gray-200 hover:text-gray-700 text-sm rounded mb-5">
              <img :src="`/flags/${$i18n.locale}.svg`" class="w-6 inline-block -mt-1"/>
            </nuxt-link>
            <div v-if="dropdownPopoverShow" class="bg-blend-lighten md:bg-blend-darken w-screen h-screen fixed top-0 left-0 z-20"></div>
            <div v-bind:class="{'hidden': !dropdownPopoverShow, 'block': dropdownPopoverShow}" class="mt-5 absolute bg-white text-gray-700 text-base z-50 float-left py-2 list-none text-left rounded shadow-lg mt-1" style="min-width:12rem" ref="popoverDropdownRef">
              <nuxt-link v-for="locale in locales" v-if="$i18n.locale !== locale" :key="locale" :to="switchLocalePath(locale)" class="text-sm py-2 px-4 font-normal hover:bg-gray-200 block w-full whitespace-nowrap bg-transparent ">
                <img :src="`/flags/${locale}.svg`" class="w-6 inline-block -mt-1"/> {{ $t(locale) }}
              </nuxt-link>
            </div>
          </div>
          <nuxt-link :to="localePath('/login')" class="px-2 py-1 cursor-pointer hover:bg-gray-200 hover:text-gray-700 text-sm rounded mb-5">
            <outline-login-icon class="w-8 fas fa-stream p-2 bg-gray-200 rounded-full inline-block" />
            <span class="mx-1 hidden lg:inline">{{ $t('login') }}</span>
          </nuxt-link>
          <div v-if="user.id" class="flex-initial">
            <div class="flex justify-end items-center relative">
              <div class="flex mr-4 items-center">
                <div class="flex items-center relative cursor-pointer whitespace-nowrap">
                  <outline-beaker-icon class="w-5 h-5 inline lg:hidden" /> <span class="hidden lg:inline">Words Matchers:</span>
                </div>
                <nuxt-link class="inline-block py-2 px-3 hover:bg-gray-200 rounded-full" :to="localePath('/words-matcher/bur/ru')">
                  <div class="flex items-center relative cursor-pointer whitespace-nowrap">Bur>Ru</div>
                </nuxt-link>
                <nuxt-link class="inline-block py-2 px-3 hover:bg-gray-200 rounded-full" :to="localePath('/words-matcher/ru/bur')">
                  <div class="flex items-center relative cursor-pointer whitespace-nowrap">Ru>Bur</div>
                </nuxt-link>
                <span class="inline-block py-2 px-3 rounded-full">
              <div class="flex items-center relative cursor-pointer whitespace-nowrap">|</div>
            </span>
                <nuxt-link class="inline-block py-2 px-3 hover:bg-gray-200 rounded-full whitespace-nowrap" :to="localePath('/words/bur/ru')">
                  <div class="flex items-center relative cursor-pointer whitespace-nowrap">
                    <outline-document-add-icon class="w-5 h-5" /> <span class="hidden lg:inline">Add new words</span>
                  </div>
                </nuxt-link>
                <nuxt-link class="inline-block py-2 px-3 hover:bg-gray-200 rounded-full" :to="localePath('/logs')">
                  <div class="flex items-center relative cursor-pointer whitespace-nowrap">
                    <outline-document-report-icon class="w-5 h-5" /> <span class="hidden lg:inline">Logs</span>
                  </div>
                </nuxt-link>
                <nuxt-link class="inline-block py-2 px-3 hover:bg-gray-200 rounded-full" :to="localePath('/logs/unique-not-found-words')">
                  <div class="flex items-center relative cursor-pointer whitespace-nowrap">
                    <outline-emoji-sad-icon class="w-5 h-5" />
                  </div>
                </nuxt-link>
              </div>

              <div class="block">
                <div class="inline relative">
                  <div type="button" class="inline-flex items-center relative px-2 rounded-full">
                    <div class="pl-1 hidden lg:inline">
                      {{ user.name }}({{ user.email }})
                    </div>

                    <div class="block flex-grow-0 flex-shrink-0 h-10 w-12 pl-5">
                      <outline-user-icon class="w-full h-full"/>
                    </div>

                    <button @click.prevent="logout" class="ml-5 p-2 border rounded-full hover:shadow-lg">
                      <outline-logout-icon class="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  name: "Navbar",
  data () {
    return {
      user: {},
      showDatabaseDropdown: false,
      dropdownPopoverShow: false,
      locales: this.$i18n.locales
    }
  },
  computed: {
    locale () {
      return locales.ru;
    }
  },
  mounted() {
    this.user = this.$auth.user?.data || {};
  },
  methods: {
    async logout() {
      await this.$auth.logout();
      this.$router.push('/');
      window.location.reload();
    }
  }
}
</script>

<style scoped>

</style>
