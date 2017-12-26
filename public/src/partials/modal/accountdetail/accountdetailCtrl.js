
angular.module('asch').controller('accountdetailCtrl', function ($scope, $rootScope, apiService, ipCookie, $location, $translate) {

    $rootScope.accountdetailinfo = false;

    $scope.Close = function () {
        $rootScope.isBodyMask = false;
        $rootScope.accountdetailinfo = false;
    };
    $rootScope.$on('accountdetail', function (d, data) {
        $scope.address = data;
        apiService.accountdetail({
            address: $scope.address
        }).success(function (res) {
            if (res.success == true) {
                $rootScope.accountdetailinfo = true;
                $rootScope.isBodyMask = true;
                $scope.account = res.account;
            };
        }).error(function () {
            toastError($translate.instant('ERR_SERVER_ERROR'));
        })

    });
});

