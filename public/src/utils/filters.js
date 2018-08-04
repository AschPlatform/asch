import AschJs from 'asch-js'
import { convertFee } from './asch'

const filters = {
  t: (value, t) => {
    return t(value)
  },
  fee: (fee, precision = 8) => {
    return convertFee(fee, precision)
  },
  time: value => {
    return AschJs.utils.format.fullTimestamp(value)
  },
  unit: (value, t) => {
    if (value < 10000) {
      return value
    }
    if (value >= 10000 && value < 100000000) {
      return value / 10000 + t('DAPP_MILLION')
    } else {
      return value / 100000000 + t('DAPP_BILLION')
    }
  },
  category: (value, t) => {
    let type = ''
    if (value === 1) {
      type = t('DAPP_CATEGORY_COMMON')
    } else if (value === 2) {
      type = t('DAPP_CATEGORY_BUSINESS')
    } else if (value === 3) {
      type = t('DAPP_CATEGORY_SOCIAL')
    } else if (value === 4) {
      type = t('DAPP_CATEGORY_EDUCATION')
    } else if (value === 5) {
      type = t('DAPP_CATEGORY_ENTERTAINMENT')
    } else if (value === 6) {
      type = t('DAPP_CATEGORY_NEWS')
    } else if (value === 7) {
      type = t('DAPP_CATEGORY_LIFE')
    } else if (value === 8) {
      type = t('DAPP_CATEGORY_UTILITIES')
    } else if (value === 9) {
      type = t('DAPP_CATEGORY_GAMES')
    }
    return type
  },
  assetsRecord: i => {
    let content = ''
    if (i.type === 9) {
      content = '注册了发行商 ' + i.asset.uiaIssuer.name
    } else if (i.type === 10) {
      content = '注册了资产 ' + i.asset.uiaAsset.name
    } else if (i.type === 11 && i.asset.uiaFlags.flagType === 1) {
      let arr = ['黑名单模式', '白名单模式']
      content =
        '资产 ' + i.asset.uiaFlags.currency + ' 访问控制设置为 ' + arr[i.asset.uiaFlags.flag]
    } else if (i.type === 11 && i.asset.uiaFlags.flagType === 2) {
      content = '资产 ' + i.asset.uiaFlags.currency + ' 被注销'
    } else if (i.type === 12) {
      content = '资产 ' + i.asset.uiaAcl.currency + ' 更新了访问控制列表'
    } else if (i.type === 13) {
      content =
        '资产 ' + i.asset.uiaIssue.currency + ' 新发行 ' + (i.asset.uiaIssue.amountShow || '?')
    } else if (i.type === 14) {
      content =
        '资产 ' +
        i.asset.uiaTransfer.currency +
        ' 从 ' +
        i.senderId +
        ' 转账 ' +
        (i.asset.uiaTransfer.amountShow || '?') +
        ' 到 ' +
        i.recipientId
    }
    return filters.time(i.timestamp) + ' ' + content
  }
}
export default filters
