angular.module('asch').controller('deletevoteCtrl', function ($scope, $rootScope, apiService, ipCookie, $location, $http, userService, postSerivice, $translate) {

    $rootScope.deletevotetoinfo = false;
    $scope.userService = userService;
    $scope.Close = function () {
        $rootScope.isBodyMask = false;
        $rootScope.deletevotetoinfo = false;
    };
    // 重制create
    $scope.createTransaction = function () {
        return AschJS.vote.createVote($rootScope.deletevoteContent, userService.secret, $scope.secondpassword)
    }

    $scope.checkvoteto = function (params) {
        var reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/;
        if (userService.secondPublicKey && !reg.test($scope.secondpassword)) {
            toastError($translate.instant('ERR_SECOND_PASSWORD_FORMAT'));
            return;
        }
        postSerivice.retryPost($scope.createTransaction, function(err, res){
            if (err === null) {
                if (res.success == true) {
                    $rootScope.coedobj = {}
                    $rootScope.checkobj = {}
                    $scope.Close();
                    $rootScope.$emit('downvoteSuccess');
                    toast($translate.instant('INF_DELETE_SUCCESS'));
                }
            }
        })
    };
});
