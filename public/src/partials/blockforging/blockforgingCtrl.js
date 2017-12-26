angular.module('asch').controller('blockforgingCtrl', function($scope, $rootScope, apiService, ipCookie, $location,$window,NgTableParams,userService, $translate) {
	$rootScope.active = 'blockforging';
	$rootScope.userlogin = true;
	//设置基本像素
	document.documentElement.style.fontSize = document.documentElement.clientWidth/20 + "px";
	// 设置  进度条
	$scope.setInfo = function () {
	}

	$scope.forgingStatus = function () {
		var label = $scope.forgingEnabled ? 'FORGING_ENABLE' : 'FORGING_DISABLE';
		return $translate.instant(label);
	}

	$scope.assigneeShowInfo = function () {
		$rootScope.assigneeinfo = true;
		$rootScope.isBodyMask = true;

	}
	$scope.init = function() {

		apiService.blockforging({
			publicKey:userService.publicKey
		}).success(function (res) {
			if(res.success == true){
				$scope.delegate = res.delegate
			};
		}).error(function (res) {

		});

		apiService.forgingStatus({
			publicKey:userService.publicKey
		}).success(function (res) {
			if(res.success == true){
				$scope.forgingEnabled = res.enabled
			};
		}).error(function (res) {
		});

		$scope.blockforgingtableparams = new NgTableParams({
			page: 1,
			count: 20,
			sorting: {
				height: 'desc'
			}
		}, {
			total: 0,
			counts: [],
			getData: function($defer,params) {
				apiService.blocks({
					generatorPublicKey:userService.publicKey,
					limit: params.count(),
					orderBy: 'height:desc',
					offset: (params.page() - 1) * params.count()
				}).success(function(res) {
					params.total(res.count);
					$defer.resolve(res.blocks);
				}).error(function(res) {
					toastError($translate.instant('ERR_SERVER_ERROR'));
				});
			}
		});
	};
});
