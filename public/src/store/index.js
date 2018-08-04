import Vue from 'vue'
import Vuex from 'vuex'

import state from './state'
import getters from './getters'
import mutations from './mutations'
import actions from './actions'

Vue.use(Vuex)

const model = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

const store = new Vuex.Store({
  ...model
})

export default store
