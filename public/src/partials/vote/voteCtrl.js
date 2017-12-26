angular.module('asch').controller('voteCtrl', function ($scope, $rootScope, apiService, ipCookie, $location, $window, NgTableParams, userService, $translate) {
    $rootScope.active = 'vote';
    $rootScope.userlogin = true;
    $scope.letin = true;
    $scope.hosting = false;
    $scope.mgvotecord = false;
    $rootScope.showaccountdetailInfo = function (i) {
        $rootScope.blockdetailinfo = false;
        $rootScope.dealdetailinfo = false;
        $scope.i = i;
        $rootScope.$broadcast('accountdetail', $scope.i)
    }
    $scope.letinchange = function () {
        $scope.letin = true;
        $scope.hosting = false;
        $scope.mgvotecord = false;
        $scope.tableparams = new NgTableParams({
            page: 1,
            count: 20,
            sorting: {
                height: 'desc'
            }
        }, {
                total: 0,
                counts: [],
                getData: function ($defer, params) {
                    //console.log($defer)
                    // console.log(params)
                    apiService.delegates({
                        address: userService.address,
                        orderBy: 'rate:asc',
                        limit: params.count(),
                        offset: (params.page() - 1) * params.count()
                    }).success(function (res) {
                        //  $scope.res =res;
                        // params.data=res.delegates;
                        params.total(res.totalCount);
                        $scope.delegateCount = res.totalCount;
                        // return res.delegates;
                        $defer.resolve(res.delegates);
                    }).error(function (res) {
                        toastError($translate.instant('ERR_SERVER_ERROR'));
                    });
                }
            });
    }
    $scope.hostingchange = function () {
        $scope.letin = false;
        $scope.hosting = true;
        $scope.mgvotecord = false;
        $scope.tableparams3 = new NgTableParams({
            page: 1,
            count: 20,
            sorting: {
                height: 'desc'
            }
        }, {
                total: 0,
                counts: [],
                getData: function ($defer, params) {
                    apiService.votetome({
                        publicKey: userService.publicKey,
                        orderBy: 'rate:asc',
                        limit: params.count(),
                        offset: (params.page() - 1) * params.count()
                    }).success(function (res) {
                        //  $scope.res =res;
                        // params.data=res.delegates;
                        // params.total(res.totalCount);
                        // return res.delegates;
                        $scope.totalVoter = res.accounts.length,
                            $defer.resolve(res.accounts);
                    }).error(function (res) {
                        toastError($translate.instant('ERR_SERVER_ERROR'));
                    });
                }
            });
    }
    $scope.mgvotecordchange = function () {
        $scope.letin = false;
        $scope.hosting = false;
        $scope.mgvotecord = true;
        $scope.tableparams2 = new NgTableParams({
            page: 1,
            count: 20,
            sorting: {
                height: 'desc'
            }
        }, {
                total: 0,
                counts: [],
                getData: function ($defer, params) {
                    apiService.myvotes({
                        address: userService.address,
                        orderBy: 'rate:asc',
                        limit: params.count(),
                        offset: (params.page() - 1) * params.count()
                    }).success(function (res) {
                        //  $scope.res =res;
                        // params.data=res.delegates;
                        params.total(res.totalCount);
                        $scope.myvoteCount = res.delegates.length;
                        // return res.delegates;
                        $defer.resolve(res.delegates);
                    }).error(function (res) {
                        toastError($translate.instant('ERR_SERVER_ERROR'));
                    });
                }
            });
    };
    if ($scope.letin) {
        $scope.tableparams = new NgTableParams({
            page: 1,
            count: 20,
            sorting: {
                height: 'desc'
            }
        }, {
                total: 0,
                counts: [],
                getData: function ($defer, params) {
                    apiService.delegates({
                        address: userService.address,
                        orderBy: 'rate:asc',
                        limit: params.count(),
                        offset: (params.page() - 1) * params.count()
                    }).success(function (res) {
                        //  $scope.res =res;
                        // params.data=res.delegates;
                        params.total(res.totalCount);
                        $scope.delegateCount = res.totalCount;
                        // return res.delegates;
                        $defer.resolve(res.delegates);
                    }).error(function (res) {
                        toastError($translate.instant('ERR_SERVER_ERROR'));
                    });
                }
            });
    }
    //$scope.tableparams.reload();
    //$scope.tableparams.settings().$scope = $scope;
    //$rootScope.checkobj = {};
    $scope.checkitem = function (i) {
        if ($scope.letin) {
            var key = i.username;
            if (!$rootScope.checkobj[key]) {
                $rootScope.checkobj[key] = i;
                // console.log($rootScope.checkobj)
            } else {
                delete $rootScope.checkobj[key];
                //  console.log($rootScope.checkobj)
            }
        };


    }
    $scope.checkitem2 = function (i) {
        if ($scope.mgvotecord) {
            var key = i.username;
            if (!$rootScope.coedobj[key]) {
                $rootScope.coedobj[key] = i;
                // console.log($rootScope.checkobj)
            } else {
                delete $rootScope.coedobj[key];
                //  console.log($rootScope.checkobj)
            }
        }
    }

    //投票的函数
    $scope.votetoShowInfo = function () {
        if ($scope.mgvotecord) {
            var deletevoteContent = [];
            var showdelusername = {};

            angular.forEach($rootScope.coedobj, function (data, index, array) {
                deletevoteContent.push('-' + data.publicKey);
                showdelusername[data.username] = {
                    "username": data.username,
                    "address": data.address
                }
            });
            if (deletevoteContent.length == 0) {
                toastError($translate.instant('ERR_AT_LEAST_SELECT_ONE_DELEGATE'));
                return;
            } else if (deletevoteContent.length > 33) {
                toastError($translate.instant('ERR_NO_MORE_THAN_33'));
            } else {
                $rootScope.deletevotetoinfo = true;
                $rootScope.isBodyMask = true;
                $rootScope.showdelusername = showdelusername;
                $rootScope.deletevoteContent = deletevoteContent;
                // console.log($rootScope.showdelusername)
            }
        }
        if ($scope.letin) {
            var voteContent = [];
            var showusername = {};

            angular.forEach($rootScope.checkobj, function (data, index, array) {
                voteContent.push('+' + data.publicKey);
                showusername[data.username] = {
                    "username": data.username,
                    "address": data.address
                }
            });
            if (voteContent.length == 0) {
                toastError($translate.instant('ERR_AT_LEAST_SELECT_ONE_DELEGATE'));
                return;
            } else if (voteContent.length > 33) {
                toastError($translate.instant('ERR_VOTE_NO_MORE_THAN_33'));
            } else {
                $rootScope.votetoinfo = true;
                $rootScope.isBodyMask = true;
                $rootScope.showusername = showusername;
                $rootScope.voteContent = voteContent;
                // console.log($rootScope.showusername)
            }
        }
    }

    $rootScope.$on('upvoteSuccess', function () {
        // console.log('voteDone');
        if ($scope.tableparams) {
            $scope.tableparams.reload();
        }
    });

    $rootScope.$on('downvoteSuccess', function () {
        // console.log('voteDone');
        if ($scope.tableparams2) {
            $scope.tableparams2.reload();
        }
    });
});
