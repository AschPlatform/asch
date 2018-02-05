angular.module('asch').controller('loginCtrl', function ($scope, $rootScope, apiService, ipCookie, $window, $location, userService, $translate) {
	$rootScope.userlogin = false;
	$rootScope.showPassword = false;
	$rootScope.register = true;
	$rootScope.creatpwd = false;
	$rootScope.checkpwd = false;
	$rootScope.homedata = {};
	$rootScope.qrcode = undefined;

	$scope.languages = [
		{key: 'en-us', value: 'English'},
		{key: 'zh-cn', value: '中文简体'},
		{key: 'de-de', value: 'Deutsch'}
	];

	$scope.changeLanguage = function () {
		/*console.log($translate.proposedLanguage());*/
		if (!$scope.selectedLanguage) {
			var key = $translate.proposedLanguage();
			for (var i = 0; i < $scope.languages.length; ++i) {
				if ($scope.languages[i].key === key) {
					$scope.selectedLanguage = $scope.languages[i];
					break;
				}
			}
		}
		$translate.use($scope.selectedLanguage.key);
		$rootScope.languageSelected = $scope.selectedLanguage.key;
		// console.log($translate);
		$scope.languageIcon = '/assets/common/' + $scope.selectedLanguage.key + '.png';
	}
	$scope.changeLanguage();
	
	$scope.newuser = function () {
		$rootScope.register = false;
		$rootScope.creatpwd = true;
		$rootScope.checkpwd = false;
		var code = new Mnemonic(Mnemonic.Words.ENGLISH);
		$scope.newsecret = code.toString();
		newpublicKey = AschJS.crypto.getKeys($scope.newsecret).publicKey;
		$rootScope.newpublicKey = newpublicKey
	};

	// if(userService.setsecret){
	// 			$scope.secret =userService.setsecret;
	// } else {
	// 	$scope.secret = '';
	// }
	//默认保持登录
	$scope.saveLogin = true;
	//读取cookie
	// if(ipCookie('userSecret')){
	// 	if($scope.saveLogin){
	// 		$scope.secret =ipCookie('userSecret');
	// 	} else {
	// 		$scope.secret='';
	// 	}
	// };
	// 取消默认保持状态清楚cookie
	// $scope.saveLoginChange = function () {
	// 	$scope.saveLogin =!$scope.saveLogin;
	// 	//}
	// 	//console.log($scope.saveLogin)
	// 	if(!$scope.saveLogin){
	//
	// 		$scope.secret =ipCookie('userSecret');
	// 	}
	// 	else {
	//
	// 		$scope.secret =ipCookie('userSecret');
	// 	}
	// }
	$scope.backto = function () {
		$rootScope.register = true;
		$rootScope.creatpwd = false;
		$rootScope.checkpwd = false;
	};
	$scope.close = function () {
		$rootScope.register = true;
		$rootScope.creatpwd = false;
		$rootScope.checkpwd = false;
	}
	//确认
	$scope.lastcheck = function () {
		if ($scope.newsecret == $scope.lastsecret) {
			// qr赋值
			$rootScope.qrcode = $scope.newsecret;
			apiService.login({
				publicKey: newpublicKey
			}).success(function (res) {
				$rootScope.homedata = res;
				if (res.success == true) {
					userService.setData($scope.newsecret, newpublicKey, res.account, res.latestBlock);
					// 是否登录的全局变量
					$rootScope.isLogin = true;
					$location.path('/home');
				}
			}).error(function (res) {
				toastError(res.error);
			});
		} else {
			toastError($translate.instant('ERR_PASSWORD_NOT_EQUAL'));
		}
	}
	$scope.saveTxt = function (filename) {
		var text = $scope.newsecret.trim();
		var address = AschJS.crypto.getAddress(newpublicKey);
		txt = 'secret:' + '\r\n' + text + '\r\n\r\n' + 'address:' + '\r\n' + address + '\r\n';
		var link = document.createElement("a");
		link.setAttribute("target", "_blank");
		if (Blob !== undefined) {
			var blob = new Blob([txt], { type: "text/plain" });
			link.setAttribute("href", URL.createObjectURL(blob));
		} else {
			link.setAttribute("href", "data:text/plain," + encodeURIComponent(txt));
		}
		link.setAttribute("download", filename);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
	// $scope.saveCookie = function () {
	// 	ipCookie('userSecret',$scope.secret);
	// 	//console.log(ipCookie('userSecret'));
	//}
	//登录
	// $scope.secret = $scope.secret.trim();
	$scope.registerin = function () {
		if (!$scope.secret) {
			toastError($translate.instant('ERR_INPUT_PASSWORD'));
			return;
		}
		// qr赋值
		$rootScope.qrcode = $scope.secret;
		if (!Mnemonic.isValid($scope.secret)) {
			return toastError($translate.instant('ERR_VIOLATE_BIP39'));
		}
		var publicKey = AschJS.crypto.getKeys($scope.secret).publicKey;
		// 增加root qrstr属性git
		$rootScope.qrstr = $scope.secret;
		$rootScope.publickey = publicKey;
		apiService.login({
			publicKey: publicKey
		}).success(function (res) {
			$rootScope.homedata = res;
			if (res.success == true) {
				userService.setData($scope.secret, publicKey, res.account, res.latestBlock)
				// 是否登录的全局变量
				$rootScope.isLogin = true;
				$location.path('/home');
			} else {
				toastError($translate.instant('ERR_SERVER_ERROR'));
			}
		}).error(function (res) {
			toastError($translate.instant('ERR_SERVER_ERROR'));
		})
	}
	//下一步登录
	$scope.nextStep = function () {
		$rootScope.register = false;
		$rootScope.creatpwd = false;
		$rootScope.checkpwd = true;
	}
});
