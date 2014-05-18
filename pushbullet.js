var PushBullet = (function() {
    var pb = {};
    var pbURL = "https://api.pushbullet.com/v2/";
    var pbPush = pbURL + "pushes";
    var pbContact = pbURL + "contacts";
    var pbDevice = pbURL + "devices";
    var pbUser = pbURL + "users/me";
    var httpReqDone = 4;
    var httpResGood = 200;

    pb.APIKey = null;

    pb.push = function(pushType, devId, data, callback) {
        var parameters = {
            device_iden: devId,
            type: pushType.toLowerCase()
        };
        switch(pushType.toLowerCase()) {
        case "note":
            parameters.title = data.title;
            parameters.body = data.body;
            break;
        case "link":
            parameters.title = data.title;
            parameters.url = data.url;
            if(data.body) {
                paramaters.body = data.body;
            }
            break;
        case "address":
            parameters.name = data.name;
            parameters.address = data.address;
            break;
        case "list":
            parameters.title = data.title;
            parameters.items = data.items;
            break;
        default:
            if(callback) {
                return callback(new Error("Invalid type"));
            } else {
                throw new Error("Invalid type");
            }
            break;
        }
        var res = ajaxReq(pbPush, "POST", parameters, callback);
        if(!callback) {
            return res;
        }
    }

    pb.devices = function(callback) {
        var res = ajaxReq(pbDevice, "GET", null, callback);
        if(!callback) {
            return res;
        }
    }

    pb.contacts = function(callback) {
        var res = ajaxReq(pbContact, "GET", null, callback);
        if(!callback) {
            return res;
        }
    }

    pb.user = function(callback) {
        var res = ajaxReq(pbUser, "GET", null, callback);
        if(!callback) {
            return res;
        }
    }

    var ajaxReq = function(url, verb, parameters, callback) {
        if(!pb.APIKey) {
            throw new Error("API Key for Pushbullet not set");
        } else {
            var ajax = new XMLHttpRequest();
            var async = false;
            if(callback) {
                async = true;
                ajax.onreadystatechange = function() {
                    if(ajax.readyState === httpReqDone) {
                        var res = null;
                        try {
                            res = handleResponse(ajax);
                        } catch(err) {
                            return callback(err);
                        }
                        return callback(null, res);
                    }
                }
            }
            ajax.open(verb, url, async);
            ajax.setRequestHeader("Authorization", "Basic " + window.btoa(pb.APIKey + ":"));
            ajax.send(parameters);
            if(!async) {
                return handleResponse(ajax)
            }
        }
    }

    var handleResponse = function(ajax) {
        if(ajax.status !== httpResGood) {
            throw new Error(ajax.status);
        }
        return ajax.response;
    }

    return pb;
}());
