import axios from './axiosWrap'
import { urls } from './constants'
import { toastError, getCurrentSeverUrl } from './util'

// import nodeService from './servers'

const json2url = json => {
  var arr = []
  var str = ''
  for (var i in json) {
    str = i + '=' + json[i]
    arr.push(str)
  }
  return arr.join('&')
}

const fetch = (url, data, method, postHeaders) => {
  // TODO test api
  // url = url.mock
  url = url.url
  for (let k in data) {
    if (url.indexOf(':' + k) !== -1) {
      url = url.replace(':' + k, data[k])
      delete data[k]
    }
  }

  // TODO find server
  // let server = nodeService.getCurrentServer()

  // if (!nodeService.isStaticServer()) {
  //   let retryTimes = 0
  //   while (!server.isServerAvalible(true) && retryTimes++ < 10) {
  //     console.log('current server unavalible')
  //     nodeService.changeServer(true)
  //     server = nodeService.getCurrentServer()
  //   }
  // }
  let selectedServerUrl = getCurrentSeverUrl()
  // let realUrl = urls.server.caos + url
  let realUrl = !selectedServerUrl
    ? urls.server[process.env.NODE_ENV] + url
    : selectedServerUrl + url
  let type = method.toLowerCase()
  let res = {}
  if (type === 'get') {
    res = axios.get(realUrl + '?' + json2url(data))
  } else if (type === 'post') {
    res = axios.post(realUrl, data, postHeaders)
  } else if (type === 'put') {
    res = axios.put(realUrl, data, postHeaders)
  }
  return res
}

const api = {}

api.login = params => {
  return fetch(urls.loginApi, params, 'post')
}
// 账户请求
api.account = params => {
  return fetch(urls.accountApi, params, 'get')
}
// 交易请求
api.transactions = params => {
  return fetch(urls.transactionsApi, params, 'get')
}
// 获取投票列表
api.myvotes = params => {
  return fetch(urls.myvotesApi, params, 'get')
}
// 获取最新区块
api.blocks = params => {
  return fetch(urls.blocksApi, params, 'get')
}
// 受托人模块
api.blockforging = params => {
  return fetch(urls.blockforgingApi, params, 'get')
}
//  入围候选人
api.delegates = params => {
  return fetch(urls.delegatesApi, params, 'get')
}
//  投我的票
api.votetome = params => {
  return fetch(urls.votetomeApi, params, 'get')
}
//  节点列表
api.peer = params => {
  return fetch(urls.peerApi, params, 'get')
}
//  区块详情
api.blockDetail = params => {
  return fetch(urls.blocksDetailApi, params, 'get')
}
//  账户详情
api.accountdetail = params => {
  return fetch(urls.accountdetailApi, params, 'get')
}
//  应用列表
api.appList = params => {
  return fetch(urls.appListApi, params, 'get')
}
//  已安装应用列表
api.appInstalled = params => {
  return fetch(urls.appInstalledApi, params, 'get')
}
api.forgingStatus = params => {
  return fetch(urls.forgingStatusApi, params, 'get')
}
//  获取我的余额
api.myBalances = params => {
  return fetch(urls.myBalancesApi, params, 'get')
}
//  获取我的资产
api.myAssets = params => {
  return fetch(urls.myAssetsApi, params, 'get')
}
//  查询发行商
api.issuer = params => {
  return fetch(urls.issuerApi, params, 'get')
}
//  获取资产访问控制列表
api.assetAcl = params => {
  return fetch(urls.assetAclApi, params, 'get')
}
//  获取我的资产操作记录
api.myAssetTransactions = params => {
  return fetch(urls.myTransactionsApi, params, 'get')
}
//  获取应用余额
api.appBalance = params => {
  return fetch(urls.appBalanceApi, params, 'get')
}
//  获取资产
api.uiaAssetApi = params => {
  return fetch(urls.uiaAssetApi, params, 'get')
}

api.uiaAssetListApi = params => {
  return fetch(urls.uiaAssetListApi, params, 'get')
}
// 广播交易
api.broadcastTransaction = trans => {
  return fetch(urls.postApi, { transaction: trans }, 'post', {
    headers: { magic: urls.magics[process.env.NODE_ENV], version: '' }
  })
}
// 执行 DAPP 内部合约
api.dappContract = (trans, appid) => {
  let url = { url: `/api/dapps/${appid}/transactions/signed` }
  return fetch(url, { transaction: trans }, 'put', {
    headers: { magic: urls.magics[process.env.NODE_ENV], version: '' }
  })
}

// 查询 DAPP 内部余额
api.dappMyBalance = (appid, address) => {
  let url = { url: `/api/dapps/${appid}/balances/${address}` }
  return fetch(url, {}, 'get')
}

const translateErrMsg = (t, input) => {
  // console.log('translateErrInner',language,input);
  // console.log(this)
  if (typeof input === 'string') {
    input = input.split(':')[0]
    var translateMap = [
      {
        error: 'Failed to verify second signature',
        key: 'ERR_TOAST_SECONDKEY_WRONG'
      },
      {
        error: 'Invalid transaction amount',
        key: 'ERR_TOAST_SECONDKEY_WRONG'
      },
      { error: 'Asset not exists', key: 'ERR_TOAST_ASSET_NOTEXIST' },
      {
        error: 'Insufficient balance',
        key: 'ERR_TOAST_ASSET_INSUFFICIENT'
      },
      {
        error: 'Voting limit exceeded. Maximum is 33 votes per transaction',
        key: 'ERR_TOAST_VOTE_LIMIT'
      },
      {
        error: 'Account is locked',
        key: 'ERR_TOAST_ACCOUNT_ALREADY_LOCKED'
      },
      {
        error: 'Invalid recipient',
        key: 'ERR_TOAST_ACCOUNT_INVALID_RECIPIENT'
      },
      {
        error: 'timestamp',
        key: 'ERR_TOAST_ACCOUNT_INVALID_TIMESTAMP'
      },
      {
        error: 'Invalid lock height',
        key: 'Invalid lock height'
      }
    ]

    for (var idx = 0; idx < translateMap.length; idx++) {
      if (input.indexOf(translateMap[idx].error) > -1) {
        toastError(t(translateMap[idx].key))
        // console.log(translateMap[idx].chinese);
        return
      }
    }
    toastError(input)
  }
}

const canRetry = ret => {
  // return ret.error && /blockchain/.test(ret.error.toLowerCase()) && !nodeService.isStaticServer()
  return false
}

const postService = {
  postWithRetry: (trans, countDown, cb) => {
    let retryOrCallbak = data => {
      if (countDown <= 0) {
        let error = 1
        cb(error, data)
        return
      }

      console.log('change server and retry broadcast transaction')
      // nodeService.changeServer(true)
      postService.postWithRetry(trans, countDown - 1, cb)
    }

    api
      .broadcastTransaction(trans)
      .success((data, status, headers, config) => {
        if (data.success) {
          cb(null, data)
          // console.log('broadcastTransaction-success',data);
          return
        } else if (canRetry(data)) {
          retryOrCallbak(data)
          return
        }
        // 失败返回
        // console.log('broadcastTransaction-fail',data);
        // 统一管理错误信息
        translateErrMsg(null, data.error)
        cb(null, data)
      })
      .error((data, status, headers, config) => {
        retryOrCallbak(data)
      })
  },
  retryPost: (createTransFunc, callback, retryTimes) => {
    let trans = createTransFunc()
    let maxRetry = retryTimes | 5
    this.postWithRetry(trans, maxRetry, callback)
  },
  post: trans => {
    return api.broadcastTransaction(trans)
  },
  writeoff: trans => {
    return api.broadcastTransaction(trans)
  }
}

export { api, postService, translateErrMsg }
