angular.module('asch').filter('histroyFilter', function($filter) {
	return function (i) {
		var content = ''
		if (i.type == 9) {
			content='注册了发行商 ' + i.asset.uiaIssuer.name
		} else if(i.type == 10){
			content = '注册了资产 ' + i.asset.uiaAsset.name
		} else if(i.type == 11&& i.asset.uiaFlags.flagType == 1){
			var arr = ['黑名单模式','白名单模式']
			content = '资产 ' + i.asset.uiaFlags.currency + ' 访问控制设置为 '+ arr[i.asset.uiaFlags.flag]
		} else if(i.type == 11&& i.asset.uiaFlags.flagType == 2){
			content = '资产 ' + i.asset.uiaFlags.currency + ' 被注销'
		} else if(i.type == 12){
			content = '资产 ' + i.asset.uiaAcl.currency + ' 更新了访问控制列表'
		} else if(i.type == 13){
			content = '资产 ' + i.asset.uiaIssue.currency + ' 新发行 ' + (i.asset.uiaIssue.amountShow || '?')
		} else if(i.type == 14){
			content = '资产 ' + i.asset.uiaTransfer.currency + ' 从 ' + i.senderId+' 转账 ' + (i.asset.uiaTransfer.amountShow || '?') + ' 到 ' +i.recipientId
		}
		return $filter('timestampFilter')(i.timestamp) + ' ' + content;
	}
});