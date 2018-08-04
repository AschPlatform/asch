import filters from '../utils/filters'

export default ({ Vue }) => {
  Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key])
  })
}
