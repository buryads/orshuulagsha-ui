<template>
  <nav v-if="user.id" class="container mx-auto bg-white w-full flex relative justify-between items-center mx-auto px-8 h-20">
    <!-- logo -->
    <div class="inline-flex">
      <nuxt-link to="/">
        <nuxt-link class="inline-block py-2 px-3 hover:bg-gray-200 rounded-full" to="/">
          <div class="flex items-center relative cursor-pointer whitespace-nowrap">Vocabulary</div>
        </nuxt-link>
      </nuxt-link>
    </div>

    <!-- end logo -->

    <!-- login -->
    <div class="flex-initial">
      <div class="flex justify-end items-center relative">
        <div class="flex mr-4 items-center">
          <span class="inline-block py-2 px-3 rounded-full">
          Words Matchers:
          </span>
          <nuxt-link class="inline-block py-2 px-3 hover:bg-gray-200 rounded-full" to="/words-matcher/bur/ru">
            <div class="flex items-center relative cursor-pointer whitespace-nowrap">Bur to Ru</div>
          </nuxt-link>
          <nuxt-link class="inline-block py-2 px-3 hover:bg-gray-200 rounded-full" to="/words-matcher/ru/bur">
            <div class="flex items-center relative cursor-pointer whitespace-nowrap">Ru to Bur</div>
          </nuxt-link>
          <span class="inline-block py-2 px-3 rounded-full">
            <div class="flex items-center relative cursor-pointer whitespace-nowrap">|</div>
          </span>
          <nuxt-link class="inline-block py-2 px-3 hover:bg-gray-200 rounded-full" to="/logs">
            <div class="flex items-center relative cursor-pointer whitespace-nowrap">Logs</div>
          </nuxt-link>
        </div>

        <div class="block">
          <div class="inline relative">
            <div type="button" class="inline-flex items-center relative px-2 rounded-full">
              <div class="pl-1">
                {{ user.name }}({{ user.email }})
              </div>

              <div class="block flex-grow-0 flex-shrink-0 h-10 w-12 pl-5">
                <svg
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  role="presentation"
                  focusable="false"
                  style="display: block; height: 100%; width: 100%; fill: currentcolor;"
                >
                  <path d="m16 .7c-8.437 0-15.3 6.863-15.3 15.3s6.863 15.3 15.3 15.3 15.3-6.863 15.3-15.3-6.863-15.3-15.3-15.3zm0 28c-4.021 0-7.605-1.884-9.933-4.81a12.425 12.425 0 0 1 6.451-4.4 6.507 6.507 0 0 1 -3.018-5.49c0-3.584 2.916-6.5 6.5-6.5s6.5 2.916 6.5 6.5a6.513 6.513 0 0 1 -3.019 5.491 12.42 12.42 0 0 1 6.452 4.4c-2.328 2.925-5.912 4.809-9.933 4.809z"></path>
                </svg>
              </div>

              <button @click.prevent="logout" class="ml-5 p-2 border rounded-full hover:shadow-lg">
                Log out
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
