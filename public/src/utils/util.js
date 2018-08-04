import { SessionStorage, Notify, Dialog } from 'quasar'

export const alertMsg = (content, duration = 500) => {
  this.$q.notify({
    enter: 'bounceInRight',
    leave: 'bounceOutRight',
    color: 'red',
    icon: 'warning',
    html: content,
    duration: duration,
    position: 'top'
  })
}
export const confirm = (conf, cancel = () => {}, confirm = () => {}) => {
  Dialog.create({
    title: conf.title || 'Confirm',
    message: conf.message,
    ok: conf.confirm || 'Agree',
    cancel: conf.cancel || 'Disagree'
  })
    .then(() => {
      confirm()
    })
    .catch(() => {
      cancel()
    })
}
export const toast = message => {
  const type = 'positive'
  const color = 'positive'
  Notify.create({ message, type, color })
}
export const toastError = message => {
  const type = 'negative'
  const color = 'negative'
  Notify.create({ message, type, color })
}
export const toastWarn = message => {
  const type = 'warning'
  const color = 'warning'
  Notify.create({ message, type, color })
}
export const toastInfo = message => {
  const type = 'info'
  const color = 'info'
  Notify.create({ message, type, color })
}
export const prompt = (config, cb = () => {}, cbCancel = () => {}) => {
  Dialog.create({
    title: config.title || 'Prompt',
    message: config.message || '',
    prompt: config.prompt,
    cancel: config.cancel || true,
    color: config.color || 'primary'
  })
    .then(data => {
      cb(data)
    })
    .catch(e => {
      cbCancel(e)
    })
}

export const setCache = (key, value) => {
  return SessionStorage.set(key, value)
}
export const getCache = key => {
  return SessionStorage.get.item(key)
}
export const removeCache = key => {
  return SessionStorage.remove(key)
}
export const getCurrentSeverUrl = () => {
  let currentServer = getCache('currentServer')
  if (currentServer) {
    let { ip, port } = currentServer
    return 'http://' + ip + ':' + port
  } else {
    return false
  }
}
