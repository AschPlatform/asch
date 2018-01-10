angular.module('asch').service('apiService', function ($http, $rootScope, $location, nodeService) {

	function json2url(json) {
		var arr = [];
		var str = '';
		for (var i in json) {
			str = i + '=' + json[i];
			arr.push(str);
		}
		return arr.join('&');
	};

	function fetch(url, data, method, postHeaders) {
		for (var k in data) {
			if (url.indexOf(':' + k) != -1) {
				url = url.replace(':' + k, data[k]);
				delete data[k];
			}
		}

		var server = nodeService.getCurrentServer();

		if (!nodeService.isStaticServer()){
			var retryTimes = 0;
			while ((!server.isServerAvalible(true)) && (retryTimes ++ < 10)){
				console.log("current server unavalible");
				nodeService.changeServer(true);
				server = nodeService.getCurrentServer();
			}
		}		

		var realUrl = server.serverUrl + url;		

		var promise = (method.toLowerCase() == 'get') ?
			$http.get(realUrl + '?' + json2url(data)) :
			$http.post(realUrl, data, postHeaders);

		var PromiseWrapper = function(promise) {
			this.promise = promise;
			this.success = function(successFunc){
				promise.success(function(data, status, headers, config){
					server.updateStatus(headers);
					successFunc(data, status, headers, config);
				});
				return this;
			};

			this.error = function(errorFunc){
				this.promise.error(function(data, status, headers, config){
					server.updateStatus(headers);
					errorFunc(data, status, headers, config);
				});
				return this;
			}
		};

		return new PromiseWrapper(promise);
	}

	this.login = function (params) {
		return fetch('{{loginApi}}', params, 'post');
	};
	//账户请求
	this.account = function (params) {
		return fetch('{{accountApi}}', params, 'get');
	};
	//交易请求
	this.transactions = function (params) {
		return fetch('{{transactionsApi}}', params, 'get');
	};
	//获取投票列表
	this.myvotes = function (params) {
		return fetch('{{myvotesApi}}', params, 'get');
	};
	//获取最新区块
	this.blocks = function (params) {
		return fetch('{{blocksApi}}', params, 'get');
	};
	//受托人模块
	this.blockforging = function (params) {
		return fetch('{{blockforgingApi}}', params, 'get');
	};
	// 入围候选人
	this.delegates = function (params) {
	   return fetch('{{delegatesApi}}', params, 'get');
	}
	// 投我的票
	this.votetome = function (params) {
		return fetch('{{votetomeApi}}', params, 'get');
	}
	// 节点列表
	this.peer = function (params) {
		return fetch('{{peerApi}}', params, 'get');
	}
	// 区块详情
	this.blockDetail = function (params) {
		return fetch('{{blocksDetailApi}}', params, 'get');
	}
	// 账户详情
	this.accountdetail = function (params) {
		return fetch('{{accountdetailApi}}', params, 'get');
	};
	// 应用列表
	this.appList = function (params) {
		return fetch('{{appListApi}}', params, 'get');
	}
	// 已安装应用列表
	this.appInstalled = function (params) {
		return fetch('{{appInstalledApi}}', params, 'get');
	}
	this.forgingStatus = function (params) {
		return fetch('{{forgingStatusApi}}', params, 'get');
	}
	// 获取我的余额
	this.myBalances = function (params) {
		return fetch('{{myBalancesApi}}', params, 'get');
	};
	// 获取我的资产
	this.myAssets = function (params) {
		return fetch('{{myAssetsApi}}', params, 'get');
	};
	// 查询发行商
	this.issuer = function (params) {
		return fetch('{{issuerApi}}', params, 'get');
	};
	// 获取资产访问控制列表
	this.assetAcl = function (params) {
		return fetch('{{assetAclApi}}', params, 'get');
	};
	// 获取我的资产操作记录
	this.myAssetTransactions = function (params) {
		return fetch('{{myTransactionsApi}}', params, 'get');
	};
	// 获取应用余额
	this.appBalance = function (params) {
		return fetch('{{appBalanceApi}}', params, 'get')
	}
	// 获取资产
	this.uiaAssetApi = function (params) {
		return fetch('{{uiaAssetApi}}', params, 'get')
	},
	this.uiaAssetListApi = function (params) {
		return fetch('{{uiaAssetListApi}}', params, 'get')
	},
	//广播交易 
	this.broadcastTransaction = function(trans){
		return fetch('{{postApi}}', {transaction : trans}, 'post', { headers: { 'magic': '{{magic}}', 'version': ''}});
	}
});