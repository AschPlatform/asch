angular.module('asch').filter('typeFilter', function ($filter) {
    const TYPE_LABEL = [
        'TRS_TYPE_TRANSFER',
        'TRS_TYPE_SECOND_PASSWORD',
        'TRS_TYPE_DELEGATE',
        'TRS_TYPE_VOTE',
        'TRS_TYPE_MULTISIGNATURE',
        'TRS_TYPE_DAPP',
        'TRS_TYPE_DEPOSIT',
        'TRS_TYPE_WITHDRAWAL',
        'TRS_TYPE_STORAGE',
        'TRS_TYPE_UIA_ISSUER',
        'TRS_TYPE_UIA_ASSET',
        'TRS_TYPE_UIA_FLAGS',
        'TRS_TYPE_UIA_ACL',
        'TRS_TYPE_UIA_ISSUE',
        'TRS_TYPE_UIA_TRANSFER'
    ]
    return function (value) {
        if (value === 100) {
            return $filter('translate')('TRS_TYPE_LOCK');
        }
        return $filter('translate')(TYPE_LABEL[value]);
    }
});
