angular.module('asch').controller('personalCtrl', function ($scope, $rootScope, apiService, ipCookie, $window, $http, userService, postSerivice, $translate) {
	$rootScope.active = 'personal';
	$rootScope.userlogin = true;
	$scope.lockStatus = '';
	$scope.lockHeight = '';
	//下拉菜单隐藏
	// 账单默认显示
	$scope.accountInfo = true;
	$scope.passwordInfo = false;
	$scope.positionInfo = false;
	$scope.timeLeft = '';
	$scope.qrcode = false;
	$scope.qrcode_address = false;
	// $scope.string = "/asch/secret/raw/" + $rootScope.qrcode;
	$scope.string = $rootScope.qrcode;
	$scope.string_address = userService.address;

	// 二级密码 $scope.secondpassword

	$scope.init = function (params) {
		apiService.account({
			address: userService.address
		}).success(function (res) {
			if (res.success == true) {
				$scope.account = res.account;
				$scope.latestBlock = res.latestBlock;
				$scope.version = res.version;
				userService.update(res.account, res.latestBlock);
				$scope.userService = userService;
				$scope.string = $rootScope.qrcode;
				$scope.string_address = userService.address;
				$scope.positionLockStatus();
				if (userService.latestBlockHeight > userService.lockHeight) {
					$scope.isLocksure = false
				} else {
					$scope.isLocksure = true
				}
			};
		}).error(function (res) {
			toastError(res.error);
		});
	};
	// TABS toggle页面
	$scope.accountchange = function () {
		$scope.accountInfo = true;
		$scope.positionInfo = $scope.passwordInfo = !$scope.accountInfo;
	}
	$scope.passwordchange = function () {
		$scope.passwordInfo = true;
		$scope.accountInfo = $scope.positionInfo = !$scope.passwordInfo;
	}
	$scope.positionchange = function () {
		$scope.positionInfo = true;
		$scope.accountInfo = $scope.passwordInfo = !$scope.positionInfo;
	}

	$scope.setStatus = function () {
		var label = userService.secondPublicKey ? 'ALREADY_SET' : 'NOT_SET';
		return $translate.instant(label);
	}
	$scope.positionLockStatus = function () {
		if (userService.lockHeight != 0) {
			var a = $translate.instant('FRAGIL_PRE');
			var b = $translate.instant('FRAGIL_LAT');
			if (Number(userService.lockHeight) > Number(userService.latestBlockHeight)) {
				return $scope.lockStatus = a + userService.lockHeight + b;
			} else {
				return $scope.lockStatus = $translate.instant('NOT_SET_ALREADYUNBLOCK');
			}
		} else {
			return $scope.lockStatus = $translate.instant('NOT_SET_BLOCKHEIGHT');
		}
	}

	// 显示二维码
	$scope.showQrcode = function() {
		$rootScope.isBodyMaskWhite = true;
		$scope.qrcode = true;
	}
	$scope.showQrcode_address = function() {
		$rootScope.isBodyMaskWhite = true;
		$scope.qrcode_address = true;
	}

	$scope.Close = function () {
        $rootScope.isBodyMaskWhite = false;
		$scope.qrcode = false;
		$scope.qrcode_address = false;
    };
	
	// 解锁 / 上锁判断
	$scope.isLock = function () {
		// console.log(userService.lockHeight, userService.latestBlockHeight);
		if (Number(userService.lockHeight) > Number(userService.latestBlockHeight)) {
			return true;
		} else {
			return false;
		}
	}

	$scope.userService = userService;

	// 两方重制create
	$scope.createTrsPsd = function() {
		return AschJS.signature.createSignature(userService.secret, $scope.secondpassword);
	}

	$scope.createTrsLok = function() {
		var lockHeight = Number($scope.block_number);
		return AschJS.transaction.createLock(lockHeight, userService.secret, $scope.secondpassword);
	}

	$scope.setPassWord = function () {
		var reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/;
		if (!$scope.secondpassword || !$scope.confirmPassword) {
			return toastError($translate.instant('ERR_NO_SECND_PASSWORD'));;
		}
		var secondPwd = $scope.secondpassword.trim();
		var confirmPwd = $scope.confirmPassword.trim();
		if (secondPwd != confirmPwd) {
			toastError($translate.instant('ERR_TWO_INPUTS_NOT_EQUAL'));
		} else if (!reg.test(secondPwd)) {
			toastError($translate.instant('ERR_PASSWORD_INVALID_FORMAT'));
		} else if (reg.test(secondPwd) && reg.test(confirmPwd) && secondPwd == confirmPwd) {
			postSerivice.retryPost($scope.createTrsPsd, function(err, res) {
				if (err === null) {
					if (res.success == true) {
						$scope.passwordsure = true;
						toast($translate.instant('INF_SECND_PASSWORD_SET_SUCCESS'));
					} else {
						toastError(res.error);
					}
				}
			})
		}
	}

	// 设置仓锁
	$scope.setPositionLock = function () {
		if (!$scope.block_number) {
			return toastError($translate.instant('ERR_POSITIONLOCK_EMPTY'));;
		}
		var lockHeight = Number($scope.block_number)
		var diffHeight = lockHeight - userService.latestBlockHeight
		// console.log(lockHeight, diffHeight, userService.latestBlockHeight)
		if (diffHeight <= 0 || diffHeight >= 10000000) {
			return toastError('Invalid lock height')
		}

		if (userService.secondPublicKey && !$scope.secondpassword) {
			toastError($translate.instant('ERR_NO_SECND_PASSWORD'));
			return;
		}

		if (!userService.secondPublicKey) {
			$scope.secondPassword = '';
		}

		postSerivice.retryPost($scope.createTrsLok, function(err, res) {
			if (err === null) {
				if (res.success == true) {
					toast($translate.instant('INF_POSITIONLOCK_SET_SUCCESS'));
					$scope.positionLockStatus();
					$scope.isLocksure = true;
				}
			}
		})
	}

	// 计算解锁时间
	$scope.calTimeLeft = function () {
		if (!$scope.block_number) return
		var lockHeight = Number($scope.block_number)
		var diffHeight = lockHeight - userService.latestBlockHeight
		var sec = diffHeight * 10;
		var min = 0;
		var hou = 0;
		var day = 0;
		var ab = $translate.instant('FRAGIL_ABOUT');
		var d = $translate.instant('FRAGIL_DAY');
		var h = $translate.instant('FRAGIL_HOUR');
		var m = $translate.instant('FRAGIL_MIN');
		var s = $translate.instant('FRAGIL_SEC');
		var r = $translate.instant('FRAGIL_RANGE');
		var u = $translate.instant('FRAGIL_UNLOCK');
		if (diffHeight > 0 && diffHeight < 10000000) {
			if (sec > 60) {
				min = sec / 60;
				sec = sec % 60;
				if (min > 60) {
					hou = min / 60;
					min = min % 60;
					if (hou > 24) {
						day = hou / 24;
						hou = hou % 24;
					}
				}
			}
			$scope.timeLeft = ab + parseInt(day) + d + parseInt(hou) + h + parseInt(min) + m + parseInt(sec) + u;
		} else {
			$scope.timeLeft = r;
		}
	}
	// 退出函数
	$scope.quitout = function () {
		$window.location.href = '#/login'
	}
});

