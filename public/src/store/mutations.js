export default {
  // user information / can set null
  setUserInfo: (state, userInfo) => {
    state.userInfo = userInfo
  },
  updateUserInfo: (state, userInfo) => {
    state.userInfo = { ...state.userInfo, ...userInfo }
  }
}
