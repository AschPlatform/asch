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

    var serverUrl = $location.protocol() +"://"+$location.host()+":"+$location.port()||80;
    if ($location.protocol().toLower == "https" || true){
        nodeService.staticServer(serverUrl);
    }
    else{
        nodeService.dynamicServers($location.protocol() +"://"+$location.host()+":"+$location.port()||80);
    }
});
