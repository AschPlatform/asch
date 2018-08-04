/*
export const someAction = (state) => {
}
*/
import { api } from '../utils/api'

export default {
  // get user infomation (balances / nick) / update
  getUserInfo: ({ commit }, address) => {
    return api.account({ address })
  },
  refreshAccounts: ({ commit, state }) => {
    api.account({ address: state.userInfo.address }).then(res => {
      if (res.success) {
        commit('updateUserInfo', res)
      }
    })
  }
}
