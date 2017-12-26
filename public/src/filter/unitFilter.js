angular.module('asch').filter('unitFilter', function ($filter) {
    return function (value) {
      if (value < 10000) {
        return value
      } if (value >= 10000 && value < 100000000) {
        return value / 10000 + '万'
      } else {
        return value / 100000000 + '亿'
      }
    }
});
