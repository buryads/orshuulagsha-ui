<template>
  <div>
    <nav class="container mx-auto w-full flex relative justify-between items-center mx-auto md:px-8 px-3 h-20">
      <div class="p-4 w-full">
        <!--light mode - text and icons-->
        <div class="p-2 text-gray-900 bg-white rounded-lg shadow-lg font-medium capitalize">
          <nuxt-link :to="localePath('/')" class="px-2 mr-2 border-r border-gray-200 cursor-pointer">
            <img src="/favicon.png"
                 alt="alt placeholder" class="w-10 h-10 inline mx-auto">
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
          <nuxt-link v-if="!user.id" :to="localePath('/login')" class="px-2 py-1 cursor-pointer hover:bg-gray-200 hover:text-gray-700 text-sm rounded">
            <outline-login-icon class="w-8 fas fa-stream p-2 bg-gray-200 rounded-full inline-block" />
            <span class="mx-1 hidden lg:inline">{{ $t('login') }}</span>
          </nuxt-link>
          <div v-if="user.id" class="inline-block cursor-pointer" @click.prevent="showUserDropdown = !showUserDropdown">
            <nuxt-link to="#" class="px-2 py-1 hover:bg-gray-200 hover:text-gray-700 text-sm rounded mb-5">
              <outline-adjustments-icon class="w-8 fas fa-stream p-2 bg-gray-200 rounded-full inline-block" />
              <span class="mx-1 hidden lg:inline">{{ user.name }}</span>
            </nuxt-link>
            <div v-if="showUserDropdown" class="bg-blend-lighten md:bg-blend-darken w-screen h-screen fixed top-0 left-0 z-20"></div>
            <div v-bind:class="{'hidden': !showUserDropdown, 'block': showUserDropdown}" class="mt-5 absolute bg-white text-gray-700 text-base z-50 float-left py-2 list-none text-left rounded shadow-lg mt-1" style="min-width:12rem" ref="popoverDropdownRef">
              <nuxt-link class="block py-2 px-4 hover:bg-gray-200 hover:text-gray-700 text-sm" :to="localePath('/dashboard')">
                <outline-user-icon class="w-5 h-5 inline" /> Dashboard
              </nuxt-link>
              <nuxt-link class="block py-2 px-4 hover:bg-gray-200 hover:text-gray-700 text-sm" :to="localePath('/packs')">
                <outline-information-circle-icon class="w-5 h-5 inline" /> Cards
              </nuxt-link>
              <span v-if="$authUtils().isUserA('admin')">
                <span class="py-2 px-4 block flex items-center relative cursor-pointer whitespace-nowrap">
                  <outline-beaker-icon class="w-5 h-5 inline lg:hidden" /> <span class="hidden lg:inline">Words Matchers:</span>
                </span>
                <nuxt-link class="block py-2 px-4 hover:bg-gray-200 hover:text-gray-700 text-sm" :to="localePath('/admin/words-matcher/bur/ru')">
                  <span class="flex items-center relative cursor-pointer whitespace-nowrap">Bur>Ru</span>
                </nuxt-link>
                <nuxt-link class="block py-2 px-4 hover:bg-gray-200 hover:text-gray-700 text-sm" :to="localePath('/admin/words-matcher/ru/bur')">
                  <span class="flex items-center relative cursor-pointer whitespace-nowrap">Ru>Bur</span>
                </nuxt-link>
                <hr>
                <nuxt-link class="block py-2 px-4 hover:bg-gray-200 hover:text-gray-700 text-sm" :to="localePath('/admin/words/bur/ru')">
                  <outline-document-add-icon class="w-5 h-5 inline" /> Add new words
                </nuxt-link>
                <nuxt-link class="block py-2 px-4 hover:bg-gray-200 hover:text-gray-700 text-sm" :to="localePath('/admin/logs')">
                  <outline-document-report-icon class="w-5 h-5 inline" /> Logs
                </nuxt-link>
                <nuxt-link class="block py-2 px-4 hover:bg-gray-200 hover:text-gray-700 text-sm" :to="localePath('/admin/logs/unique-not-found-words')">
                  <outline-emoji-sad-icon class="w-5 h-5 inline" /> Unique failed logs
                </nuxt-link>
              </span>
              <button @click.prevent="logout" class="block text-left py-2 px-4 hover:bg-gray-200 w-full hover:text-gray-700 text-sm nuxt-link-active">
                <outline-logout-icon class="w-5 h-5 inline" />
                <span class="hidden lg:inline">{{ $t('logout') }}</span>
              </button>
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
      showUserDropdown: false,
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
