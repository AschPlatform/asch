angular.module('asch').controller('addaclCtrl', function ($scope, $rootScope, apiService, ipCookie, $location, $window, NgTableParams, userService,postSerivice, $translate) {
    $rootScope.userlogin = true;
    $rootScope.active = 'acl';
    $scope.comfirmDialog = false;
    $rootScope.secpwd = userService.secondPublicKey;
    $scope.sub = function () {
        $scope.comfirmDialog = true;
        $rootScope.isBodyMask = true;

    };
    //关闭确认
    $scope.comfirmDialogClose = function () {
        $rootScope.isBodyMask = false;
        $scope.comfirmDialog = false;
    };

    // 重制create
    $scope.createTransaction = function() {
        var currency = $rootScope.addACL.name;;
        var flagType = 1;
        var flag = $rootScope.addACL.acl;
        var operator = '+'; // '+'表示增加， ‘-’表示删除
        var list = $scope.addList.split('\n') || [];
        if (!userService.secondPublicKey) {
            $scope.secondPassword = '';
        }
        return AschJS.uia.createAcl(currency, operator, flag, list, userService.secret, $scope.secondPassword);        
    }
    $scope.comfirmSub = function () {
        postSerivice.retryPost($scope.createTransaction, function(err, res){
            if (err === null) {
                if (res.success == true) {
                    $scope.secondPassword = '';
                    $scope.addList = '';
                    toast($translate.instant('INF_OPERATION_SUCCEEDED'));
                    $scope.comfirmDialogClose();
                }
            }
        })
    }
});
