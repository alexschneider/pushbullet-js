var PushBullet = (function() {
    var pb = {};
    var pbURL = "https://api.pushbullet.com/v2/";
    var pbPush = pbURL + "pushes";
    var pbContact = pbURL + "contacts";
    var pbDevice = pbURL + "devices";
    var pbUser = pbURL + "users/me";
    var pbUpReq = pbURL + "upload-request";
    var httpReqDone = 4;
    var httpResGood = 200;
    var httpResNoCont = 204;

    pb.APIKey = null;

    pb.push = function(pushType, devId, email, data, callback) {
        var parameters = {
            type: pushType.toLowerCase()
        };
        if(email && devId) {
            var err = new Error("Cannot push to both device and contact");
            if(callback) {
                return callback(err);
            } else {
                throw err;
            }
        } else if(email) {
            parameters.email = email;
        } else if(devId) {
            parameters.device_iden = devId;
        } else {
            var err = new Error("Must push to either device or contact");
            if(callback) {
                return callback(err);
            } else {
                throw err;
            }
        }
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
            var err = new Error("Invalid type");
            if(callback) {
                return callback(err);
            } else {
                throw err;
            }
            break;
        }
        var res = ajaxReq(pbPush, "POST", parameters, callback);
        if(!callback) {
            return res;
        }
    };

    pb.pushFile = function(devId, email, fileHandle, body, callback) {
        var type = "file_type=" + encodeURIComponent(fileHandle.type);
        var name = "file_name=" + encodeURIComponent(fileHandle.name);
        var upReqURL = pbUpReq + "?" + type + name;
        var upReqFunc = !callback ? null : function(err, res) {
            if(err) {
                return callback(err);
            } else {
                try {
                    doPushFile(res, devId, email, fileHandle, body, callback);
                } catch(err) {
                    return callback(err);
                }
            }
        };
        var res = ajaxReq(upReqURL, "GET", null, upReqFunc);
        if(!callback) {
            return doPushFile(res, fileHandle);
        }
    };

    var doPushFile = function(ajax, devId, email, fileHandle, body, callback) {
        var fileInfo = new FormData();
        fileInfo.append("awsaccesskeyid", ajax.data.awsaccesskeyid);
        fileInfo.append("acl", ajax.data.acl);
        fileInfo.append("key", ajax.data.key);
        fileInfo.append("signature", ajax.data.signature);
        fileInfo.append("policy", ajax.data.policy);
        fileInfo.append("content_type", ajax.data.content_type);
        fileInfo.append("file", fileHandle);
        ajaxReq(ajax.upload_url, "POST", fileInfo, null);
        var parameters = {
            file_name: fileHandle.name,
            file_type: fileHandle.type,
            file_url: ajax.file_url,
            type: "file"
        };
        if(email && devId) {
            var err = new Error("Cannot push to both device and contact");
            if(callback) {
                return callback(err);
            } else {
                throw err;
            }
        } else if(email) {
            parameters.email = email;
        } else if(devId) {
            parameters.device_iden = devId;
        } else {
            var err = new Error("Must push to either device or contact");
            if(callback) {
                return callback(err);
            } else {
                throw err;
            }
        }
        var res = ajaxReq(pbPush, "POST", parameters, callback);
        if(!callback) {
            return res;
        }
    };

    pb.pushHistory = function(callback) {
        var res = ajaxReq(pbPush, "GET", null, callback);
        if(!callback) {
            return res;
        }
    };

    pb.devices = function(callback) {
        var res = ajaxReq(pbDevice, "GET", null, callback);
        if(!callback) {
            return res;
        }
    };

    pb.contacts = function(callback) {
        var res = ajaxReq(pbContact, "GET", null, callback);
        if(!callback) {
            return res;
        }
    };

    pb.user = function(callback) {
        var res = ajaxReq(pbUser, "GET", null, callback);
        if(!callback) {
            return res;
        }
    };

    var ajaxReq = function(url, verb, parameters, callback) {
        if(!pb.APIKey) {
            var err = new Error("API Key for Pushbullet not set");
            if(callback) {
                return callback(err);
            } else {
                throw err;
            }
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
    };

    var handleResponse = function(ajax) {
        if(ajax.status !== httpResGood && ajax.status !== httpResNoCont) {
            throw new Error(ajax.status);
        }
        return ajax.response;
    };

    return pb;
}());
