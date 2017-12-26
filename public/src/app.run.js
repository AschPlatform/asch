angular.module('asch').run(function ($rootScope, $location, ipCookie, apiService, $window, userService, nodeService) {
    $rootScope.isBodyMask = false;
    $rootScope.isBodyMaskWhite = false;
    $rootScope.userlogin = false;
    $rootScope.checkobj = {};
    $rootScope.coedobj = {};
    $rootScope.$on('$routeChangeStart', function (r, n, x) {
        if (!userService.secret) {
            $location.path('/login');
        }
    });

    nodeService.findServers($location.protocol() +"://"+$location.host()+":"+$location.port()||80);
});
