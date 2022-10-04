import * as am5 from '@amcharts/amcharts5';
import * as am5wc from '@amcharts/amcharts5/wc';
import am5themesAnimated from '@amcharts/amcharts5/themes/Animated';

import Vue from "vue";

Vue.prototype.$am5core = () => {
  return {
    am5,
    am5wc,
    am5themesAnimated
  }
}
