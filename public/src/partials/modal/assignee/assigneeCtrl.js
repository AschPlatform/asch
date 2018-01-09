/**
 * Created by zenking on 16/7/2.
 */
angular.module('asch').controller('assigneeCtrl', function ($scope, $rootScope, apiService, ipCookie, $location, $http, userService, postSerivice, $translate) {

    // $rootScope.assigneeinfo = false;
    $scope.userService = userService;
    $scope.Close = function () {
        $rootScope.isBodyMask = false;
        $rootScope.assigneeinfo = false;
    };
    // 重制create
    $scope.createTransaction = function () {
        return AschJS.delegate.createDelegate($scope.userName, userService.secret, $scope.secondpassword)
    }
    $scope.nextstep = function () {
        var reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/;
        var usernamereg = /^[a-z0-9!@$&_.]{2,}$/;
        var isAddress = /^[0-9]{1,21}$/g;
        if (!$scope.userName) {
            toastError($translate.instant('ERR_DELEGATE_NAME_EMPTY'));
            return;
        }
        if (isAddress.test($scope.userName)) {
            toastError($translate.instant('ERR_DELEGATE_NAME_ADDRESS'));
            return;
        }
        if (!usernamereg.test($scope.userName)) {
            toastError($translate.instant('ERR_DELEGATE_NAME_FORMAT'));
            return;
        }
        if (userService.secondPublicKey && !reg.test($scope.secondpassword)) {
            toast($translate.instant('ERR_SECOND_PASSWORD_FORMAT'));
            return;
        }
        postSerivice.retryPost($scope.createTransaction, function(err, res){
            if (err === null) {
                if (res.success == true) {
                    $scope.Close();
                    toast($translate.instant('INF_REGISTER_SUCCESS'));
                    $scope.userName = '';
                }
            }
        })
    };
});
