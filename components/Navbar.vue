<template>
  <nav v-if="user.id" class="container mx-auto bg-white w-full flex relative justify-between items-center mx-auto px-8 h-20">
    <!-- logo -->
    <div class="inline-flex">
      <nuxt-link to="/">
        <nuxt-link class="inline-block py-2 px-3 hover:bg-gray-200 rounded-full" to="/">
          <div class="flex items-center relative cursor-pointer whitespace-nowrap">
            <outline-book-open-icon class="w-12 h-12"/>
          </div>
        </nuxt-link>
      </nuxt-link>
    </div>

    <!-- end logo -->

    <!-- login -->
    <div class="flex-initial">
      <div class="flex justify-end items-center relative">
        <div class="flex mr-4 items-center">
          <div class="flex items-center relative cursor-pointer whitespace-nowrap">
            <outline-beaker-icon class="w-5 h-5 inline lg:hidden" /> <span class="hidden lg:inline">Words Matchers:</span>
          </div>
          <nuxt-link class="inline-block py-2 px-3 hover:bg-gray-200 rounded-full" to="/words-matcher/bur/ru">
            <div class="flex items-center relative cursor-pointer whitespace-nowrap">Bur>Ru</div>
          </nuxt-link>
          <nuxt-link class="inline-block py-2 px-3 hover:bg-gray-200 rounded-full" to="/words-matcher/ru/bur">
            <div class="flex items-center relative cursor-pointer whitespace-nowrap">Ru>Bur</div>
          </nuxt-link>
          <span class="inline-block py-2 px-3 rounded-full">
            <div class="flex items-center relative cursor-pointer whitespace-nowrap">|</div>
          </span>
          <nuxt-link class="inline-block py-2 px-3 hover:bg-gray-200 rounded-full whitespace-nowrap" to="/words/bur/ru">
            <div class="flex items-center relative cursor-pointer whitespace-nowrap">
              <outline-document-add-icon class="w-5 h-5" /> <span class="hidden lg:inline">Add new words</span>
            </div>
          </nuxt-link>
          <nuxt-link class="inline-block py-2 px-3 hover:bg-gray-200 rounded-full" to="/logs">
            <div class="flex items-center relative cursor-pointer whitespace-nowrap">
              <outline-document-report-icon class="w-5 h-5" /> <span class="hidden lg:inline">Logs</span>
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
    <!-- end login -->
  </nav>
</template>

<script>

export default {
  name: "Navbar",
  data () {
    return {
      user: {}
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
