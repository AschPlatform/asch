var app = angular.module('asch', ['ngRoute', 'ui.bootstrap', 'ngTable', 'ipCookie', 'pascalprecht.translate', 'ja.qr']);

app.config(function ($httpProvider) {
    // Use x-www-form-urlencoded Content-Type
    // $httpProvider.defaults.headers.post['Origin'] = '*';
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
    $httpProvider.defaults.headers.put['Content-Type'] = 'application/json'; 
      
    $httpProvider.defaults.headers.common = { "request-node-status":"yes"};
});




app.config(function ($translateProvider) {
    var browserLang = navigator.browserLanguage ? navigator.browserLanguage : navigator.language;
    var defaultLang = 'en-us';
    if (browserLang && browserLang.indexOf('zh') > -1) {
        defaultLang = 'zh-cn';
    }
    console.log(browserLang, defaultLang);
    for (var lang in window.Translations) {
        $translateProvider.translations(lang, window.Translations[lang]);
    }
    $translateProvider.preferredLanguage(defaultLang);
    $translateProvider.useSanitizeValueStrategy(null);
});