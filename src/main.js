// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuex from 'vuex';
Vue.use(Vuex);
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);
Vue.config.productionTip = false

/* eslint-disable no-new */
const store = new Vuex.Store({
  state: {
    clickArticleData: "",
  },
  mutations: {
    changeArticleData(state, params) {
      state.clickArticleData = params;
      window.sessionStorage.setItem("clickData", JSON.stringify(state.clickArticleData))
    }
  }
});
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
