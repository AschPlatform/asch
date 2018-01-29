; (function () {
    window.translateErrMsg = function (language, input) {
        // console.log('translateErrInner',language,input);
        // console.log(this)
        if (typeof input == 'string') {
            var translateMap = [
                {error:"Failed to verify second signature", chinese: this.Translations[language].ERR_TOAST_SECONDKEY_WRONG},
                {error:"Invalid transaction amount", chinese: this.Translations[language].ERR_TOAST_SECONDKEY_WRONG},
                {error:"Asset not exists", chinese: this.Translations[language].ERR_TOAST_ASSET_NOTEXIST},
                {error:"Insufficient asset balance", chinese: this.Translations[language].ERR_TOAST_ASSET_INSUFFICIENT},
                {error:"Voting limit exceeded. Maximum is 33 votes per transaction", chinese: this.Translations[language].ERR_TOAST_VOTE_LIMIT},
                {error:"Account is locked", chinese: this.Translations[language].ERR_TOAST_ACCOUNT_ALREADY_LOCKED},
                {error:"Invalid recipient", chinese: this.Translations[language].ERR_TOAST_ACCOUNT_INVALID_RECIPIENT},
                {error:"timestamp", chinese: this.Translations[language].ERR_TOAST_ACCOUNT_INVALID_TIMESTAMP},
            ];

            for(var idx =0 ; idx< translateMap.length; idx++ ){
                if (input.indexOf(translateMap[idx].error)> -1){
                    toastError(translateMap[idx].chinese);
                    // console.log(translateMap[idx].chinese);
                    return;
                }
            }
            toastError(input);
        }
    }
})();