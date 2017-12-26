
angular.module('asch').controller('blockdetailCtrl', function ($scope, $rootScope, apiService, ipCookie, $location, $translate) {

    $rootScope.blockdetailinfo = false;

    $scope.Close = function () {
        $rootScope.isBodyMask = false;
        $rootScope.blockdetailinfo = false;
    };
    $rootScope.showdealInfo = function (i) {
        $rootScope.blockdetailinfo = false;
        $rootScope.accountdetailinfo = false;
        $scope.i = i;
        $rootScope.$broadcast('jiaoyi', $scope.i)
    }
    $rootScope.showdetailInfo = function (i) {
        $rootScope.accountdetailinfo = false;
        $rootScope.dealdetailinfo = false;
        $scope.i = i;
        $rootScope.$broadcast('detail', $scope.i)
    }
    $rootScope.showaccountdetailInfo = function (i) {
        $rootScope.blockdetailinfo = false;
        $rootScope.dealdetailinfo = false;
        $scope.i = i;
        $rootScope.$broadcast('accountdetail', $scope.i)
    }
    $rootScope.$on('detail', function (d, data) {
        if (typeof data == 'object') {
            $scope.blockId = data.id;
        } else {
            $scope.blockId = data;
        }
        if (!$scope.blockId) {
            return;
        }
        apiService.blockDetail({
            id: $scope.blockId
        }).success(function (res) {
            if (res.success == true) {
                $rootScope.blockdetailinfo = true;
                $rootScope.isBodyMask = true;
                $rootScope.accountdetailinfo = false;
                $rootScope.dealdetailinfo = false;
                $scope.block = res.block;
            };
        }).error(function () {
            toastErrtoastError($translate.instant('ERR_SERVER_ERROR'));
        })

    });
});

