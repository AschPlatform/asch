/**
 * Created by zenking on 16/8/27.
 */
angular.module('asch').filter('catalogsFilter', function ($filter) {
    return function (value) {
        var type = '';
        if (value == '1') {
            type = $filter('translate')('DAPP_CATEGORY_COMMON');
        } else if (value == '2') {
            type = $filter('translate')('DAPP_CATEGORY_BUSINESS');
        } else if (value == '3') {
            type = $filter('translate')('DAPP_CATEGORY_SOCIAL');
        } else if (value == '4') {
            type = $filter('translate')('DAPP_CATEGORY_EDUCATION');
        } else if (value == '5') {
            type = $filter('translate')('DAPP_CATEGORY_ENTERTAINMENT');
        } else if (value == '6') {
            type = $filter('translate')('DAPP_CATEGORY_NEWS');
        } else if (value == '7') {
            type = $filter('translate')('DAPP_CATEGORY_LIFE');
        } else if (value == '8') {
            type = $filter('translate')('DAPP_CATEGORY_UTILITIES');
        } else if (value == '9') {
            type = $filter('translate')('DAPP_CATEGORY_GAMES');
        }
        return type;
    }
});
