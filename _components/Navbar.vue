<template>
  <div>
    <nav
      class="container relative mx-auto mx-auto flex h-20 w-full items-center justify-between px-3 md:px-8"
    >
      <div class="w-full p-4">
        <!--light mode - text and Icons-->
        <div
          class="rounded-lg bg-white p-2 font-medium capitalize text-gray-900 shadow-lg"
        >
          <nuxt-link
            :to="localePath('/')"
            class="mr-2 cursor-pointer border-r border-gray-200 px-2"
          >
            <img src="/images/logo.png" class="mx-auto inline h-10 w-10" />
            <span
              class="hidden hover:bg-gray-200 hover:text-gray-700 lg:inline"
            >
              {{ $t('appName') }}
            </span>
          </nuxt-link>
          <nuxt-link
            :to="localePath('/games')"
            class="mb-5 cursor-pointer rounded px-2 py-1 text-sm hover:bg-gray-200 hover:text-gray-700"
          >
            <outline-puzzle-icon
              class="fas fa-stream inline-block w-8 rounded-full bg-gray-200 p-2"
            />
            <span class="mx-1 hidden lg:inline">{{ $t('games') }}</span>
          </nuxt-link>
          <nuxt-link
            :to="localePath('/names')"
            class="mb-5 cursor-pointer rounded px-2 py-1 text-sm hover:bg-gray-200 hover:text-gray-700"
          >
            <outline-at-symbol-icon
              class="fas fa-stream inline-block w-8 rounded-full bg-gray-200 p-2"
            />
            <span class="mx-1 hidden lg:inline">{{ $t('names') }}</span>
          </nuxt-link>
          <nuxt-link
            :to="localePath('/quiz')"
            class="mb-5 cursor-pointer rounded px-2 py-1 text-sm hover:bg-gray-200 hover:text-gray-700"
          >
            <outline-information-circle-icon
              class="fas fa-stream inline-block w-8 rounded-full bg-gray-200 p-2"
            />
            <span class="mx-1 hidden lg:inline">{{ $t('quiz') }}</span>
          </nuxt-link>
          <div
            class="inline-block cursor-pointer"
            @click.prevent="showDatabaseDropdown = !showDatabaseDropdown"
          >
            <nuxt-link
              to="#"
              class="mb-5 rounded px-2 py-1 text-sm hover:bg-gray-200 hover:text-gray-700"
            >
              <outline-view-list-icon
                class="fas fa-stream inline-block w-8 rounded-full bg-gray-200 p-2"
              />
              <span class="mx-1 hidden lg:inline">{{ $t('words') }}</span>
            </nuxt-link>
            <div
              v-if="showDatabaseDropdown"
              class="fixed left-0 top-0 z-20 h-screen w-screen bg-blend-lighten md:bg-blend-darken"
            ></div>
            <div
              v-bind:class="{
                hidden: !showDatabaseDropdown,
                block: showDatabaseDropdown,
              }"
              class="absolute z-50 float-left mt-1 mt-5 list-none rounded bg-white py-2 text-left text-base text-gray-700 shadow-lg"
              style="min-width: 12rem"
              ref="popoverDropdownRef"
            >
              <nuxt-link
                :to="localePath('/words/')"
                class="block w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal hover:bg-gray-200"
              >
                {{ $t('buryadDictionary') }}
              </nuxt-link>
              <nuxt-link
                :to="localePath('/words/ru')"
                class="block w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal hover:bg-gray-200"
              >
                {{ $t('russianDictionary') }}
              </nuxt-link>
            </div>
          </div>
          <div
            class="inline-block cursor-pointer"
            @click.prevent="dropdownPopoverShow = !dropdownPopoverShow"
          >
            <nuxt-link
              to="#"
              class="mb-5 rounded px-2 py-1 text-sm hover:bg-gray-200 hover:text-gray-700"
            >
              <img
                :src="`/flags/${$i18n.locale}.svg`"
                class="-mt-1 inline-block w-6"
              />
            </nuxt-link>
            <div
              v-if="dropdownPopoverShow"
              class="fixed left-0 top-0 z-20 h-screen w-screen bg-blend-lighten md:bg-blend-darken"
            ></div>
            <div
              v-bind:class="{
                hidden: !dropdownPopoverShow,
                block: dropdownPopoverShow,
              }"
              class="absolute z-50 float-left mt-1 mt-5 list-none rounded bg-white py-2 text-left text-base text-gray-700 shadow-lg"
              style="min-width: 12rem"
              ref="popoverDropdownRef"
            >
              <nuxt-link
                v-for="locale in locales"
                v-if="$i18n.locale !== locale"
                :key="locale"
                :to="switchLocalePath(locale)"
                class="block w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal hover:bg-gray-200"
              >
                <img
                  :src="`/flags/${locale}.svg`"
                  class="-mt-1 inline-block w-6"
                />
                {{ $t(locale) }}
              </nuxt-link>
            </div>
          </div>
          <nuxt-link
            v-if="!user.id"
            :to="localePath('/login')"
            class="cursor-pointer rounded px-2 py-1 text-sm hover:bg-gray-200 hover:text-gray-700"
          >
            <outline-login-icon
              class="fas fa-stream inline-block w-8 rounded-full bg-gray-200 p-2"
            />
            <span class="mx-1 hidden lg:inline">{{ $t('login') }}</span>
          </nuxt-link>
          <div
            v-if="user.id"
            class="inline-block cursor-pointer"
            @click.prevent="showUserDropdown = !showUserDropdown"
          >
            <nuxt-link
              to="#"
              class="mb-5 rounded px-2 py-1 text-sm hover:bg-gray-200 hover:text-gray-700"
            >
              <outline-adjustments-icon
                class="fas fa-stream inline-block w-8 rounded-full bg-gray-200 p-2"
              />
              <span class="mx-1 hidden lg:inline">{{ user.name }}</span>
            </nuxt-link>
            <div
              v-if="showUserDropdown"
              class="fixed left-0 top-0 z-20 h-screen w-screen bg-blend-lighten md:bg-blend-darken"
            ></div>
            <div
              v-bind:class="{
                hidden: !showUserDropdown,
                block: showUserDropdown,
              }"
              class="absolute z-50 float-left mt-1 mt-5 list-none rounded bg-white py-2 text-left text-base text-gray-700 shadow-lg"
              style="min-width: 12rem"
              ref="popoverDropdownRef"
            >
              <nuxt-link
                class="block px-4 py-2 text-sm hover:bg-gray-200 hover:text-gray-700"
                :to="localePath('/dashboard')"
              >
                <outline-user-icon class="inline h-5 w-5" />
                Dashboard
              </nuxt-link>
              <nuxt-link
                class="block px-4 py-2 text-sm hover:bg-gray-200 hover:text-gray-700"
                :to="localePath('/packs')"
              >
                <outline-information-circle-icon class="inline h-5 w-5" />
                Cards
              </nuxt-link>
              <span v-if="$authUtils().isUserA('admin')">
                <span
                  class="relative block flex cursor-pointer items-center whitespace-nowrap px-4 py-2"
                >
                  <outline-beaker-icon class="inline h-5 w-5 lg:hidden" />
                  <span class="hidden lg:inline">Words Matchers:</span>
                </span>
                <nuxt-link
                  class="block px-4 py-2 text-sm hover:bg-gray-200 hover:text-gray-700"
                  :to="localePath('/admin/words-matcher/bur/ru')"
                >
                  <span
                    class="relative flex cursor-pointer items-center whitespace-nowrap"
                  >
                    Bur>Ru
                  </span>
                </nuxt-link>
                <nuxt-link
                  class="block px-4 py-2 text-sm hover:bg-gray-200 hover:text-gray-700"
                  :to="localePath('/admin/words-matcher/ru/bur')"
                >
                  <span
                    class="relative flex cursor-pointer items-center whitespace-nowrap"
                  >
                    Ru>Bur
                  </span>
                </nuxt-link>
                <hr />
                <nuxt-link
                  class="block px-4 py-2 text-sm hover:bg-gray-200 hover:text-gray-700"
                  :to="localePath('/admin/words/bur/ru')"
                >
                  <outline-document-add-icon class="inline h-5 w-5" />
                  Add new words
                </nuxt-link>
                <nuxt-link
                  class="block px-4 py-2 text-sm hover:bg-gray-200 hover:text-gray-700"
                  :to="localePath('/admin/logs')"
                >
                  <outline-document-report-icon class="inline h-5 w-5" />
                  Logs
                </nuxt-link>
                <nuxt-link
                  class="block px-4 py-2 text-sm hover:bg-gray-200 hover:text-gray-700"
                  :to="localePath('/admin/logs/unique-not-found-words')"
                >
                  <outline-emoji-sad-icon class="inline h-5 w-5" />
                  Unique failed logs
                </nuxt-link>
              </span>
              <button
                @click.prevent="logout"
                class="nuxt-link-active block w-full px-4 py-2 text-left text-sm hover:bg-gray-200 hover:text-gray-700"
              >
                <outline-logout-icon class="inline h-5 w-5" />
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
    name: 'Navbar',
    data() {
      return {
        user: {},
        showDatabaseDropdown: false,
        dropdownPopoverShow: false,
        showUserDropdown: false,
        locales: this.$i18n.locales,
      };
    },
    mounted() {
      this.user = this.$auth.user?.data || {};
    },
    methods: {
      async logout() {
        await this.$auth.logout();
        this.$router.push(this.localePath('/'));
        window.location.reload();
      },
    },
  };
</script>

<style scoped></style>
