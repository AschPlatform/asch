angular.module('asch').filter('savecheckpbulish', function ($rootScope) {
    return function (key) {

        if( $rootScope.checkdelitem[key]){
            // console.log(key)
            return true;
        } else {
            return false;

        }
    }
});
