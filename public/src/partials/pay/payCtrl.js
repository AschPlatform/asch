angular.module('asch').controller('payCtrl', function ($scope, $rootScope, $filter, apiService, ipCookie, $http, $window, userService, postSerivice, $translate) {
    $rootScope.active = 'pay';
    $rootScope.userlogin = true;


    $scope.isSendSuccess = true;
    $scope.userService = userService;
    $scope.sent = userService.address;
    $scope.fee = '0.1';
    // console.log(userService.secondPublicKey, 'MIGNET!!!!!!!!')
    // $scope.amount=;
    $scope.calculateFee = function () {
        if ($scope.amount && Number($scope.amount) > 0) {
            var amount = parseFloat(($scope.amount * 100000000).toFixed(0));
            var fee = AschJS.transaction.calculateFee(amount);
            $scope.fee = $filter('xasFilter')(fee);
        }
    }
    // 重制create
    $scope.createTransaction = function() {
        var amount = parseFloat(($scope.amount * 100000000).toFixed(0));
        var message = $scope.message;

        if(!$rootScope.currencyName){
            return AschJS.transaction.createTransaction(String($scope.fromto), amount, message, userService.secret, $scope.secondPassword);
        } else {
            amount = ($scope.amount*Math.pow(10, $rootScope.precision)).toFixed(0);
            return AschJS.uia.createTransfer(String($rootScope.currencyName), amount, String($scope.fromto), message, userService.secret, $scope.secondPassword)
        }
    }
    $scope.sentMsg = function () {
        var isAddress = /^[0-9]{1,21}$/g;
        var transaction;
        if (!$scope.fromto) {
            toastError($translate.instant('ERR_NO_RECIPIENT_ADDRESS'));
            return false;
        }
        // if (!isAddress.test($scope.fromto)) {
            //     toastError($translate.instant('ERR_RECIPIENT_ADDRESS_FORMAT'));
            //     return false;
            // }
        if ($scope.fromto == userService.address) {
            toastError($translate.instant('ERR_RECIPIENT_EQUAL_SENDER'));
            return false;
        }
        if (!$scope.amount || Number($scope.amount) <= 0) {
            toastError($translate.instant('ERR_AMOUNT_INVALID'));
            return false;
        }
        var amount = parseFloat(($scope.amount * 100000000).toFixed(0));
        var fee = 10000000;
        
        if (userService.secondPublicKey && !$scope.secondPassword) {
            toastError($translate.instant('ERR_NO_SECND_PASSWORD'));
            return false;
        }
        if (!userService.secondPublicKey) {
            $scope.secondPassword = '';
        }
        var message = $scope.message
        if (message && message.length > 256) {
            return toastError($translate.instant('ERR_INVALID_REMARK'));
        }
        if(!$rootScope.currencyName){
            if (amount + fee > userService.balance) {
                toastError($translate.instant('ERR_BALANCE_NOT_ENOUGH'));
                return false;
            }
            //transaction = AschJS.transaction.createTransaction(String($scope.fromto), amount, message, userService.secret, $scope.secondPassword);
        } else {
            amount = ($scope.amount*Math.pow(10, $rootScope.precision)).toFixed(0);
            //transaction = AschJS.uia.createTransfer(String($rootScope.currencyName), amount, String($scope.fromto), message, userService.secret, $scope.secondPassword)
        }
        $scope.isSendSuccess = false;
        postSerivice.retryPost($scope.createTransaction, function(err, res) {
            $scope.isSendSuccess = true;
            if (err === null) {
                if (res.success == true) {
                    $scope.fromto = '';
                    $scope.amount = '';
                    $scope.secondPassword = '';
                    toast($translate.instant('INF_TRANSFER_SUCCESS'));
                } else {
                    if (res.error.indexOf('Insufficient') > -1) {
                        toastError($translate.instant('ERR_BALANCE_NOT_ENOUGH'));
                    } else if(res.error.indexOf('locked') > -1) {
                        toastError($translate.instant('ALREADY_LOCKED'));
                    }
                }
            }
        })
    }
    $scope.resetSent = function () {
        $scope.isSendSuccess = true;
    }
});
