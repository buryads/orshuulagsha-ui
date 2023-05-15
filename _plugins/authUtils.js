import Vue from "vue";

Vue.prototype.$authUtils = function () {
  return {
    isUserA: (role) => {
      return !!this.$auth?.user?.data.roles.find(({slug}) => slug === role);
    },
  }
}
