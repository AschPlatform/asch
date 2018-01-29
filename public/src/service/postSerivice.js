angular.module('asch').service('postSerivice', function ($http, $translate, $rootScope, apiService, nodeService) {
    /*
    var that = this;
    this.post = function (data) {
        var req = {
            method: 'post',
            url: '{{postApi}}',
            headers: { 'magic': '{{magic}}', 'version': '' },
            data: {
                transaction: data
            }
        }
        return $http(req);
    }
    this.retryPostImp = function (funcCreate, timeAdjust, countNum, cb) {
        AschJS.options.set('clientDriftSeconds', timeAdjust)
        var trs = funcCreate()
        that.post(trs).success(function (res) {
            if (/timestamp/.test(res.error)) {
                if (countNum > 3) {
                    var err = 'adjust';
                    return cb(err, res);
                } else {
                    toastError($translate.instant('ADJUST_TIME'));
                    setTimeout(function () {
                        that.retryPostImp(funcCreate, timeAdjust + 5, countNum + 1, cb);
                    }, 2000)
                }
            } else {
                cb(null, res);
            }
        }).error(function (res) {
            var err = 1;
            cb(err, res);
        })
    }
    this.retryPost = function (funcCreate, cb) {
        this.retryPostImp(funcCreate, 5, 1, cb)
    }
    this.writeoff = function (data) {
        var req = {
            method: 'post',
            url: '{{postApi}}',
            headers: { 'magic': '{{magic}}', 'version': '' },
            data: {
                transaction: data
            }
        }
        return $http(req);
    }
    */

    function canRetry(ret){
        return ret.error && /blockchain/.test(ret.error.toLowerCase()) && 
               (!nodeService.isStaticServer()) ;        
    }

    var postService = this;

    this.postWithRetry = function(trans, countDown, callback){
        var retryOrCallbak = function(data){
            if (countDown <= 0){
                callback(1, data);
                // console.log('retryOrCallbak',data);
                return;
            }

            console.log("change server and retry broadcast transaction")
            nodeService.changeServer(true);
            postService.postWithRetry(trans, countDown-1, callback);
        }

        apiService.broadcastTransaction(trans).success(function(data, status, headers, config){    
            if (data.success){
                callback(null, data);
                // console.log('broadcastTransaction-success',data);
                return;
            }
            else if (canRetry(data)){
                retryOrCallbak(data);
                return;
            }            
            //失败返回
            // console.log('broadcastTransaction-fail',data);
            // 统一管理错误信息
            translateErrMsg($rootScope.languageSelected,data.error);
            callback(null, data);

        }).error(function(data, status, headers, config){
            retryOrCallbak(data);
        });
    },

    this.retryPost = function(createTransFunc, callback, retryTimes){
        var trans = createTransFunc();
        var maxRetry = retryTimes | 5;
        this.postWithRetry(trans, maxRetry, callback);
    }

    this.post = function (trans) {
        return apiService.broadcastTransaction(trans);
    }

    this.writeoff = function (trans) {
        return apiService.broadcastTransaction(trans);
    }
});