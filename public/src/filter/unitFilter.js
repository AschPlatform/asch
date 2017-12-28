angular.module('asch').filter('unitFilter', function ($filter, $translate) {
  return function (value) {
    if (value < 10000) {
      return value;
    } if (value >= 10000 && value < 100000000) {
      return value / 10000 + $translate.instant('DAPP_MILLION'); 
    } else {
      return value / 100000000 + $translate.instant('DAPP_BILLION');
    }
  }
});