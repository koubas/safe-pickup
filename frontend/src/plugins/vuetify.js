import Vue from "vue";
import Vuetify from "vuetify/lib";
import cs from "vuetify/es5/locale/cs";

Vue.use(Vuetify);

export default new Vuetify({
  lang: {
    locales: { cs },
    current: "cs"
  }
});
