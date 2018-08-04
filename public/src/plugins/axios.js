import axios from '../utils/axiosWrap'

export default ({ Vue }) => {
  Vue.prototype.$axios = axios
}
