// import { getCache } from '../utils/util'

const getters = {
  userInfo: state => {
    return state.userInfo
  },
  loginFlag: state => {
    return state.isLogin
  }
}

export default getters
