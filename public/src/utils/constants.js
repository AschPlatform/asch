const langsOpts = [
  {
    label: '中文简体',
    value: 'zh'
  },
  {
    label: 'English',
    value: 'en'
  },
  {
    label: 'Deutsch',
    value: 'de'
  }
]

const officialPeers = [
  {
    ip: '107.191.41.208',
    port: 80,
    local: 'US'
  },
  {
    ip: '45.76.98.139',
    port: 80,
    local: 'JP'
  },
  {
    ip: '45.63.27.97',
    port: 80,
    local: 'US'
  },
  {
    ip: '45.76.99.134',
    port: 80,
    local: 'JP'
  },
  {
    ip: '104.238.180.37',
    port: 80,
    local: 'US'
  },
  {
    ip: '45.32.254.236',
    port: 80,
    local: 'JP'
  },
  {
    ip: '108.61.181.76',
    port: 80,
    local: 'JP'
  },
  {
    ip: '222.161.26.230',
    port: 9999,
    local: 'CN'
  },
  {
    ip: '222.161.26.231',
    port: 9999,
    local: 'CN'
  }
]

const urls = {
  server: {
    development: 'http://localhost:4096',
    // development: 'http://39.106.182.193:8192',
    // dev: 'http://localhost:4096',
    // dev2: 'http://testnet.asch.cn:4096',
    // dev3: 'http://101.200.123.124:4097',
    // dev4: 'http://192.168.2.179:4096',
    production: 'http://39.106.182.193:8192'
  },
  // 登录接口
  loginApi: {
    mock: '/data/home/accounts.json',
    url: '/api/accounts/open2'
  },
  // 余额账单Apiget /api/accounts?address=4205898691220223329L
  accountApi: {
    mock: '/data/home/accounts.json',
    url: '/api/accounts'
  },
  // 余额账单Apiget /api/transactions
  transactionsApi: {
    mock: '/data/home/transactions.json',
    url: '/api/transactions'
  },
  //  获取受托人接口
  delegatesApi: {
    mock: '/data/vote/delegates.json',
    url: '/api/delegates'
  },
  //  获取我的投票列表借口
  myvotesApi: {
    mock: '/data/vote/delegates.json',
    url: '/api/accounts/delegates'
  },
  //  获取我的投票列表借口
  blocksApi: {
    mock: '/data/blockchain/blocks.json',
    url: '/api/blocks'
  },
  // 受托人的基本信息
  blockforgingApi: {
    mock: '/data/blockforging/delegates.json',
    url: '/api/delegates/get'
  },
  // 详情基本信息
  blocksDetailApi: {
    mock: '/data/blockDetail/getblocks.json',
    url: '/api/blocks/get'
  },
  // 账户基本信息
  accountdetailApi: {
    mock: '/data/accountdetail/accounts.json',
    url: '/api/accounts'
  },
  // 谁投我的票接口
  votetomeApi: {
    mock: '/data/vote/voter.json',
    url: '/api/delegates/voters'
  },
  // 节点列表
  peerApi: {
    mock: '/data/peer/peers.json',
    url: '/api/peers'
  },
  postApi: {
    mock: '/data/vote/delegates.json',
    url: '/peer/transactions'
  },
  appListApi: {
    mock: '/data/application/applist.json',
    url: '/api/dapps'
  },
  appInstalledApi: {
    mock: '/data/application/applist.json',
    url: '/api/dapps/installed'
  },
  forgingStatusApi: {
    mock: '/data/blockforging/status.json',
    url: '/api/delegates/forging/status'
  },
  //  获取我的余额
  myBalancesApi: {
    mock: '/data/assets/my-balances.json',
    url: '/api/uia/balances/:address'
  },
  //  查询发行商
  issuerApi: {
    mock: '/data/assets/issuer.json',
    url: '/api/uia/issuers/:address'
  },
  //  获取某个发行商的资产
  myAssetsApi: {
    mock: '/data/assets/my-assets.json',
    url: '/api/uia/issuers/:name/assets'
  },
  //  获取资产活动记录
  myTransactionsApi: {
    mock: '/data/assets/my-transactions.json',
    url: '/api/uia/transactions/my/:address'
  },
  //  获取资产访问控制列表
  assetAclApi: {
    mock: '/data/assets/acl.json',
    url: '/api/uia/assets/:name/acl/:flag'
  },
  //  获取应用余额
  appBalanceApi: {
    mock: '',
    url: '/api/dapps/balances/:appId'
  },
  //  获取特定资产
  uiaAssetApi: {
    mock: '',
    url: '/api/uia/assets/:name'
  },
  //  获取所有资产
  uiaAssetListApi: {
    mock: '',
    url: '/api/uia/assets'
  },
  // 区分 local 与 mainnet 的请求头参数
  magics: {
    development: '594fe0f3',
    production: '5f5b3cf5'
  }
}

const transTypes = [
  'TRS_TYPE_TRANSFER',
  'TRS_TYPE_SECOND_PASSWORD',
  'TRS_TYPE_DELEGATE',
  'TRS_TYPE_VOTE',
  'TRS_TYPE_MULTISIGNATURE',
  'TRS_TYPE_DAPP',
  'TRS_TYPE_DEPOSIT',
  'TRS_TYPE_WITHDRAWAL',
  'TRS_TYPE_STORAGE',
  'TRS_TYPE_UIA_ISSUER',
  'TRS_TYPE_UIA_ASSET',
  'TRS_TYPE_UIA_FLAGS',
  'TRS_TYPE_UIA_ACL',
  'TRS_TYPE_UIA_ISSUE',
  'TRS_TYPE_UIA_TRANSFER'
]
transTypes[100] = 'TRS_TYPE_LOCK'

export { urls, langsOpts, transTypes, officialPeers }
