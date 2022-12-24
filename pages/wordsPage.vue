<template>
  <div>
    <div class="flex bg-gray-900 w-full justify-center">
      <div class="w-full max-w-xl p-3">
        <div class="w-full h-full flex align-center justify-center">
          <div id="cloud" class="" style="height: 4em; width: 100em;">
            <h1 class="font-bold text-4xl text-center text-white">
              {{ title }}
            </h1>
          </div>
        </div>
      </div>
    </div>
    <div class="flex bg-white w-full h-screen justify-center">
      <div class="w-full max-w-xl p-3">
        <h1 class="font-bold text-3xl text-center text-indigo-700">
          {{ description }}
        </h1>
        <div class="block md:flex">
          <div class="flex-auto">
            <div class="container mx-auto md:px-5 md:py-5">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ts-nocheck
import IEcharts from 'vue-echarts-v3';

export default {
  name: 'view',
  head() {
    return {
      title: 'Слова',
      description: 'Описание',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.title
        }
      ]
    }
  },
  components: {
    IEcharts
  },
  props: {
  },
  mounted() {},
  data: () => {
    return {
      title: 'Слова',
      description: 'Описание',
      updateNames: 0,
      searchName: '',
      loading: true,
      filteredNames: [],
      names: []
    };
  },
  methods: {
    filter (e) {
      const value = e.value.toLowerCase().trim();
      this.filteredNames = [];
      if (value.length > 0) {
        this.names.forEach(nameInfo => {
          if (!nameInfo.name.toLowerCase().includes(value)) {
            return;
          }
          this.filteredNames.push(nameInfo);
        });
      }
      this.updateNames++;
    },
    shuffle(array) {
      let currentIndex = array.length;
      while(currentIndex !== 0){
        let randomIndex = Math.floor(Math.random()*array.length);
        currentIndex -=1;
        let temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex]=temp;
      }
      return array;
    },
    random(min,max) {
      return Math.floor((Math.random())*(max-min+1))+min;
    }
  }
};
</script>

<style scoped>
.echarts {
  width: 400px;
  height: 400px;
}
</style>
