const shell = require("shelljs")
const os = require('os')

function exec(cmd){
  return shell.exec(cmd).stdout
}

function getProcessInfo(name){
  return exec("ps aux | grep " + name + " | egrep -v 'grep'")
}  

function getOsInfo(){
  let info = {}
  info.release = os.release()
  info.cpucore = os.cpus().length
  info.memfreemb = os.freemem()/1024/1024
  info.memtotalmb = os.totalmem()/1024/1024
  info.loadavg = os.loadavg()
  return info
}

function getInfo(){
  let info = getOsInfo()
  info.sqlite = getProcessInfo('blockchain.db')
  info.node = getProcessInfo('app.js')
  return info
}

// console.log(getInfo())
module.exports = {
  exec,
  getProcessInfo,
  getOsInfo,
  getInfo
}