import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/home'
import Subscribers from '@/pages/subscribers'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/subscribers',
      name: '',
      component: Subscribers
    }
  ]
})
