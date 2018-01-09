angular.module('asch').controller('votetoCtrl', function ($scope, $rootScope, apiService, ipCookie, $location, $http, userService, postSerivice, $translate) {

    $rootScope.votetoinfo = false;

    $scope.Close = function () {
        $rootScope.isBodyMask = false;
        $rootScope.votetoinfo = false;
    };
    $scope.userService = userService;
    // 重制create
    $scope.createTransaction = function() {
        return AschJS.vote.createVote($rootScope.voteContent, userService.secret, $scope.secondpassword);
    }
    $scope.checkvoteto = function () {
        var reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/;
        if (userService.secondPublicKey && !reg.test($scope.secondpassword)) {
            toastError($translate.instant('ERR_SECOND_PASSWORD_FORMAT'));
            return;
        }
        postSerivice.retryPost($scope.createTransaction, function(err, res) {
            if (err === null) {
                if (res.success == true) {
                    $rootScope.checkobj = {}
                    $rootScope.coedobj = {}
                    $scope.Close();
                    $rootScope.$emit('upvoteSuccess');
                    toast($translate.instant('INF_VOTE_SUCCESS'));
                }
            }
        })
    };
});
