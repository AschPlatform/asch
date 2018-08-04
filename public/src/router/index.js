import Vue from 'vue'
import VueRouter from 'vue-router'
import { SessionStorage } from 'quasar'

import routes from './routes'

Vue.use(VueRouter)

const Router = new VueRouter({
  /*
   * NOTE! Change Vue Router mode from quasar.conf.js -> build -> vueRouterMode
   *
   * If you decide to go with "history" mode, please also set "build.publicPath"
   * to something other than an empty string.
   * Example: '/' instead of ''
   */

  // Leave as is and change from quasar.conf.js instead!
  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE,
  scrollBehavior: () => ({ y: 0 }),
  routes
})

/*
// Inform Google Analytics
Router.beforeEach((to, from, next) => {
  if (typeof ga !== 'undefined') {
    ga('set', 'page', to.path)
    ga('send', 'pageview')
  }
  next()
})
*/
// add hook verify cookie

Router.beforeEach((to, from, next) => {
  let user = to.params.user || from.params.user || SessionStorage.get.item('user')
  if (to.path.indexOf('login') > 0 || user) {
    next({ params: { ...to.params, user: user } })
    return null
  } else {
    next({ path: '/login', replace: true })
    return null
  }
})

export default Router
