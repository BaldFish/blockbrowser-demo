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
Vue.config.productionTip = false;

/* eslint-disable no-new */
const store = new Vuex.Store({
  state: {
    blockData: {},
    searchInput:"",
    blocks:[],
    // data:{},
    // blockNumbers:"",
    // partners:"",
    // transactionCounts:"",
    // saveCounts:"",
  },
  mutations: {
    changeBlockData(state, params) {
      state.blockData = params;
      window.sessionStorage.setItem("blockData", JSON.stringify(state.blockData))
    },
    changeBlocks(state, params) {
      state.blocks = params;
      window.sessionStorage.setItem("blocks", JSON.stringify(state.blocks))
    },
    changeSearchInput(state, params) {
      state.searchInput = params;
    },
    // changeData(state, params){
    //   state.data = params;
    // }
  }
});
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
