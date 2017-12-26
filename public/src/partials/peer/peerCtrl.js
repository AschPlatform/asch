angular.module('asch').controller('peerCtrl', function ($scope, $rootScope, apiService, ipCookie, $location, $window, NgTableParams, $translate) {
    $rootScope.active = 'peer';
    $rootScope.userlogin = true;
    $rootScope.showdealInfo = function (i) {
        $scope.i = i;
        $rootScope.$broadcast('jiaoyi', $scope.i)
    }

    $scope.init = function () {
        $scope.pertableparams = new NgTableParams({
            page: 1,
            count: 20,
            sorting: {
                height: 'desc'
            }
        }, {
                total: 0,
                counts: [],
                getData: function ($defer, params) {
                    apiService.peer({
                        limit: params.count(),
                        offset: (params.page() - 1) * params.count()
                    }).success(function (res) {
                        //  $scope.res =res;
                        // params.data=res.delegates;
                        params.total(res.totalCount);
                        // return res.delegates;
                        for (var i = 0; i < res.peers.length; ++i) {
                            res.peers[i].ip = res.peers[i].ip.replace(/^[0-9]+.[0-9]+/, '*.*');
                        }
                        $defer.resolve(res.peers);
                    }).error(function (res) {
                        toastError($translate.instant('ERR_SERVER_ERROR'));
                    });
                }
            });
    };
});
