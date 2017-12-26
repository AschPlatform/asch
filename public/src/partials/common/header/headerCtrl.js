angular.module('asch').controller('headerCtrl', function($scope, $rootScope, apiService, ipCookie, $window, $location) {
   
    $scope.init = function () {

   }
   $rootScope.goPay = function () {
       $rootScope.currencyName = '';
       $location.path('/pay');
   }
});