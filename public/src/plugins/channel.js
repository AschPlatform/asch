export default ({ Vue }) => {
  let loadPlugin = () => {
    if (window.CHPlugin) {
      return (
        window.console && console.error && console.error('Channel Plugin script included twice.')
      )
    }
    let ch = { q: [] }
    let arr = ['initialize', 'checkIn', 'checkOut', 'show', 'hide', 'track', 'timeTrack']
    arr.forEach(function (e) {
      ch[e] = function () {
        var n = Array.prototype.slice.call(arguments)
        n.unshift(e)
        ch.q.push(n)
      }
    })
    window.CHPlugin = ch
    var node = document.createElement('div')
    node.id = 'ch-plugin'
    document.body.appendChild(node)
    var asyncLoad = function () {
      var s = document.createElement('script')
      s.type = 'text/javascript'
      s.async = true
      s.src = '//cdn.channel.io/plugin/ch-plugin-web.js'
      s.charset = 'UTF-8'
      var x = document.getElementsByTagName('script')[0]
      x.parentNode.insertBefore(s, x)
    }
    if (window.attachEvent) {
      window.attachEvent('onload', asyncLoad)
    } else {
      window.addEventListener('DOMContentLoaded', asyncLoad, false)
    }
  }
  loadPlugin()
  window.CHPlugin.initialize({
    pluginKey: '833cda63-5ffb-404d-a1db-4e8cabd93403',
    hideDefaultLauncher: false
  })
}
