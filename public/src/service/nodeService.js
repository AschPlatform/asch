angular.module('asch').service('nodeService', function ($http) {
    
    var CHECK_STATUS_INTERVAL = 1000 * 30;
    var CHECK_SERVER_TIMEOUT = 1000 * 3;
    var MAX_RESPONSE_TIME = 1000 *3;
    var MAX_SERVER_LOAD = 0.8;
    var MAX_BLOCK_BEHINDS = 3;
    var SERVER_STATE_OK = 2;
    var MAX_CANDIDATE_SERVERS = 10;
    var MAX_FIND_DEPTH = 5;

    var HTTP_STATUS_OK = 200;

    function AschServer(url){
        this.timer = null;

        this.clientTimeDrift = 0;
        this.failedCount = 0;
        this.serverUrl = url;
        this.registerTimestamp = Date.now();
        this.state = "unknown";
        this.serverTimestamp = 0; 
        this.responseTime = 9999999;

        this.version = "";
        this.lastBlock = null;
        this.systemLoad = null;

        function checkFailed(server){
            server.failedCount ++;
            if (server.failedCount >=3){
                unregisterServer(server.serverUrl);
            }

            server.state= "failed";
            server.version = "unknown";
            server.responseTime = Date.now() - server.requestTimestamp;
        }

        function checkSuccess(server, systemInfo){
            server.failedCount = 0;
            server.state="success";
            server.responseTime = Date.now() - server.requestTimestamp;

            server.version = systemInfo.version;
            server.serverTimestamp = systemInfo.timestamp;
            server.lastBlock = systemInfo.lastBlock;
            server.systemLoad = systemInfo.systemLoad;
             //忽略处理时间
             server.clientTimeDrift = Date.now() - server.serverTimestamp;            
        }

        this.versionNotLessThan = function(ver){
            //TODO: 
            return true; //this.version >= ver;
        };

        this.checkServerStatus = function(){
            var server = this;

            server.state= "pending";
            server.requestTimestamp = Date.now();
            
            $http.get(server.serverUrl+"/api/system/", {timeout:CHECK_SERVER_TIMEOUT}).success(function(data, status, headers){  
                if (status != HTTP_STATUS_OK){
                    checkFailed(server);
                    return;
                }

                checkSuccess(server, data);

            }).error(function(data, status, headers){
                checkFailed(server);                
            });
        };

        this.updateStatus = function(responseHeaders){
            if (responseHeaders('node-status')){
                var lastBlock = JSON.parse(responseHeaders("node-status"));
                this.lastBlock = {
                    height: lastBlock.blockHeight,
                    timestamp : lastBlock.blockTime,
                    behind: lastBlock.blocksBehind
                };

                return true;
            }
            return false;
        };

        this.isHealthy = function(){
            //响应时间小于XX秒，且区块落后不超过XX块，最近一分钟负载不高于XX
            return ( this.systemLoad && this.lastBlock ) &&
                this.responseTime <= MAX_RESPONSE_TIME && 
                this.lastBlock.behind <= MAX_BLOCK_BEHINDS && 
                this.systemLoad.loadAverage[0] / this.systemLoad.cores <= MAX_SERVER_LOAD ;
        };
    
        this.isServerAvalible = function(ignorePending){
            //版本不低于1.3.4,且是健康的节点
            return ( this.state=="success" || (ignorePending && this.state == "pending") ) && 
                this.versionNotLessThan("1.3.4") && this.isHealthy();
        };

        this.startCheckStatus = function(){
            setTimeout(this.checkServerStatus.bind(this), 10);
            this.timer = setInterval(this.checkServerStatus.bind(this), CHECK_STATUS_INTERVAL);
        };

        this.stopCheckStatus = function(){
            if (this.timer != null){
                clearInterval(this.timer);
                this.timer = null;
            }
        };
    }

    AschServer.compareServer = function(server1, server2){
        var isServer1Avalible = server1.isServerAvalible();
        var isServer2Avalible = server2.isServerAvalible();

        if (!(isServer1Avalible && isServer2Avalible))
        {
            return isServer1Avalible ? 1 : -1;
        }

        if (server1.lastBlock.height != server2.lastBlock.height){
            return server1.lastBlock.height > server2.lastBlock.height  ? 1 : -1;
        }

        if (server1.responseTime != server2.responseTime){
            return server1.responseTime > server2.responseTime  ? 1 : -1;
        }

        if (server1.systemLoad.loadAverage[0] != server2.systemLoad.loadAverage[0]){
            return server1.systemLoad.loadAverage[0] > server2.systemLoad.loadAverage[0]  ? 1 : -1;
        }

        return 0;
    };
    
    var servers = [];
    var originalServer = null;
    var currentServer = null;
    var seedServers = "{{seedServers}}".split(",");

    function getSeeds(){
        return seedServers;
    } 

    function log(info){
        console.debug(info);
    }

    function registerServer(serverUrl){
        if (findServerIndex(serverUrl) < 0){
            var server = new AschServer(serverUrl);
            server.startCheckStatus();
            servers.push(server);

            return server;
        }
        return null;
     }

    function unregisterServer(serverUrl){
        var index = findServerIndex(serverUrl);
        if (index > -1){
            servers[index].stopCheckStatus();
            servers.slice(index, 1);
            log("unregister server " +serverUrl);
        }
    }

    function findServerIndex(serverUrl, serverArray){
        serverArray = serverArray || servers;
        if (serverUrl == null || serverUrl == "") {
            return -1;
        }

        for(var i=0; i<serverArray.length; i++){
            if ( serverArray[i].serverUrl == serverUrl ){
                return i;
            }
        }
        return -1;
    }

    function selectServerNodes(allNodes){
        var okServers = [];
        for(var i = 0; i < allNodes.length; i++){
            var node = allNodes[i];
            if (node.state != SERVER_STATE_OK) continue;
           
            okServers.push(node);
        }

        if (okServers.length <= MAX_CANDIDATE_SERVERS){
            return okServers;
        }

        var selectedServers = [];
        for(var idx = 0; idx < MAX_CANDIDATE_SERVERS; idx++ ){
            var selectedIndex = parseInt( Math.random() * okServers.length, 10 );
            selectedServers.push(okServers[selectedIndex]);
            okServers.slice(selectedIndex, 1);
        }

        return selectedServers;
    }

    function getPeers(seedServerUrl, onSuccess, onFailed){
        log("find servers from seed server " + seedServerUrl);
        $http.get(seedServerUrl+"/api/peers?limit=100").success(function(data, status, headers){
            if (!data.success){
                onFailed();
                return;
            }

            //种子节点也作为服务节点对待
            registerServer(seedServerUrl);
            angular.forEach(selectServerNodes(data.peers), function(node){
                var serverUrl = "http://" + node.ip + ":" + node.port;
                registerServer(serverUrl);
            });
            onSuccess();
        }, function(data, status, headers){
            onFailed();
        });        
    }

    function sortServers(serverArray){
        serverArray = serverArray || servers;
        return serverArray.sort(AschServer.compareServer);
    }

    function clearServers(){
        for(var i= servers.length -1; i>=0; i--){
            servers[i].stopCheckStatus();
            servers.slice(i, 1);
        }
    }

    function findServersFromSeeds(depth){
        depth = depth || 1;
        if (depth > MAX_FIND_DEPTH) return;

        var idx = parseInt( Math.random() * getSeeds().length, 10 );
        getPeers(getSeeds()[idx], function(){
            log("find servers success " + servers.length);
        },function(){ 
            findServersFromSeeds(depth +1); 
        });     
    }

    function adjustClientDriftSeconds(server){
        var timeAdjust =  Math.trunc(server.clientTimeDrift / 1000);
        log("adjust client time drift " + timeAdjust +"s");
        AschJS.options.set('clientDriftSeconds', timeAdjust);
    }
    
    this._isStaticServer = false;
    this.staticServer = function(serverUrl){
        this._isStaticServer = true;

        log("static server " +serverUrl);
        originalServer = registerServer(serverUrl);
    };

    this.dynamicServers = function(originalServerUrl){
        this._isStaticServer = false;

        log("dynamic server, original server " + originalServerUrl);
        originalServer = registerServer(originalServerUrl);
        this.findServers();
    }

    this.isStaticServer = function(){
        return this._isStaticServer;
    };

    this.findServers = function (){      
        this._isStaticServer = false;
        findServersFromSeeds();
    };

    this.getSortedAvalibleServers = function(){
        var result = [];
        for( var i=0; i<servers.length; i++){
            var server = servers[i];
            if (server.state =="success" && server.isServerAvalible()){
                result.push(server);
            }
        }
        return sortServers(result);
    };

    this.getBestServer = function(){
        var avalibleServers = this.getSortedAvalibleServers();
        var best = avalibleServers.length == 0 ? originalServer : avalibleServers[0];

        return best;
    };
    
    this.getCurrentServer = function(){
        if (currentServer == null){
            this.doChangeServer(this.getBestServer());
        }
        return currentServer;
    };

    this.doChangeServer = function(newServer){
        log("server changed:" + 
            (!currentServer ? "null" : currentServer.serverUrl) + "->" + 
            (!newServer ? "null" : newServer.serverUrl));

        currentServer = newServer; 
        adjustClientDriftSeconds(newServer);
    };

    this.changeServer = function(randomSelect){
        if (currentServer != null){
            var avalibleServers = this.getSortedAvalibleServers();
            var index = findServerIndex(currentServer.serverUrl, avalibleServers);

            if (avalibleServers.length == 0 || (avalibleServers.length == 1 && index == 0)){
                 return false;
            }

            if (randomSelect){
                var selectedIndex = index;
                while(selectedIndex == index){
                    selectedIndex = parseInt( Math.random() * avalibleServers.length, 10 );
                }
                this.doChangeServer(avalibleServers[selectedIndex]);
                return true;
            }

            //当前不是第一个
            if (index != 0 && avalibleServers.length >0){
                this.doChangeServer(avalibleServers[0]);
                return true ;
            }

            if (index == 0 && avalibleServers.length > 1){
                this.doChangeServer(avalibleServers[1]);
                return true;
            }
            
            return false;
        }
    };

    this.getNetStatus = function(){
        return  (navigator.onLine) ? (navigator.onLine ? "online" : "offline") : "unknown";
    };
    
});

