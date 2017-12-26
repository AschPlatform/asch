
angular.module('asch').controller('dealinfoCtrl', function ($scope, $rootScope, apiService, ipCookie, $location, $translate) {

    $rootScope.dealdetailinfo = false;
    $scope.CloseDealinfo = function () {
        $rootScope.isBodyMask = false;
        $rootScope.dealdetailinfo = false;
    };
    $rootScope.showdetailInfo = function (i) {
        $scope.accountdetailinfo = false;
        $scope.dealdetailinfo = false;
        $scope.i = i;
        $rootScope.$broadcast('detail', $scope.i)
    }
    $rootScope.showaccountdetailInfo = function (i) {
        $scope.blockdetailinfo = false;
        $scope.dealdetailinfo = false;
        $scope.i = i;
        $rootScope.$broadcast('accountdetail', $scope.i)
    }
    $rootScope.$on('jiaoyi', function (d, data) {
        if (typeof data == 'object') {
            $scope.blockId = data.id;
        } else {
            $scope.blockId = data;
        }
        if (!$scope.blockId) {
            return;
        }
        apiService.transactions({
            blockId: $scope.blockId
        }).success(function (res) {
            if (res.success == true) {
                $rootScope.dealdetailinfo = true;
                $rootScope.isBodyMask = true;
                $rootScope.blockdetailinfo = false;
                $rootScope.accountdetailinfo = false;
                // if(res.transactions.length>20){
                //     $scope.transactions=res.transactions.slice(0,20)
                // } else {
                $scope.transactions = res.transactions
                // }

            };
        }).error(function () {
            toastError($translate.instant('ERR_SERVER_ERROR'));
        })

    });
});
