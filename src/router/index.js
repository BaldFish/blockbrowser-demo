import Vue from 'vue'
import Router from 'vue-router'
import Myhome from '@/components/home/home'
import MyBlockList from '@/components/home/blockList'
import MyBlockDetails from '@/components/home/blockDetails'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      //name: 'home',
      component: Myhome,
      children:[
        {
          path: '',
          redirect:"blockList",
        },
        {
          path: 'blockList',
          name: 'blockList',
          component: MyBlockList
        },
        {
          path: 'blockDetails',
          name: 'blockDetails',
          component: MyBlockDetails
        },
      ]
    }
  ]
})
