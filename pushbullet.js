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
        var parameters = {type: pushType.toLowerCase()};
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
                parameters.body = data.body;
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
        var res = ajaxReq(pbPush, "POST", parameters, false, callback);
        if(!callback) {
            return res;
        }
    };

    pb.pushFile = function(devId, email, fileHandle, body, callback) {
        var type = "file_type=" + encodeURIComponent(fileHandle.type);
        var name = "file_name=" + encodeURIComponent(fileHandle.name);
        var upReqURL = pbUpReq + "?" + type + "&" + name;
        var upReqFunc = !callback ? null : function(err, res) {
            if(err) {
                return callback(err);
            } else {
                try {
                    doPushFile(res, devId, email, fileHandle, body, callback);
                } catch(err2) {
                    return callback(err2);
                }
            }
        };
        var res = ajaxReq(upReqURL, "GET", null, false, upReqFunc);
        if(!callback) {
            return doPushFile(res, devId, email, fileHandle, body);
        }
    };

    var doPushFile = function(ajax, devId, email, fileHandle, body, callback) {
        var fileInfo = new FormData();
        fileInfo.append("awsaccesskeyid", ajax.data.awsaccesskeyid);
        fileInfo.append("acl", ajax.data.acl);
        fileInfo.append("key", ajax.data.key);
        fileInfo.append("signature", ajax.data.signature);
        fileInfo.append("policy", ajax.data.policy);
        fileInfo.append("content-type", fileHandle.type);
        fileInfo.append("file", fileHandle);
        ajaxReq(ajax.upload_url, "POST", fileInfo, true, null);
        var parameters = {
            file_name: fileHandle.name,
            file_type: fileHandle.type,
            file_url: ajax.file_url,
            type: "file"
        };
        if(body) {
            parameters.body = body;
        }

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
            var err2 = new Error("Must push to either device or contact");
            if(callback) {
                return callback(err2);
            } else {
                throw err2;
            }
        }
        var res = ajaxReq(pbPush, "POST", parameters, false, callback);
        if(!callback) {
            return res;
        }
    };

    pb.deletePush = function(pushId, callback) {
        var res = ajaxReq(pbPush + "/" + pushId, "DELETE", null, false, callback);
        if(!callback) {
            return res;
        }
    };

    pb.pushHistory = function(modifiedAfter, cursor, callback) {
        if(typeof modifiedAfter === 'function') {
            callback = modifiedAfter;
            modifiedAfter = null;
        } else if (typeof cursor === 'function') {
            callback = cursor;
            cursor = null;
        }
        var parameters = null;
        if(modifiedAfter) {
            parameters = {
                modified_after: modifiedAfter
            };
        }
        if(cursor) {
            parameters = parameters || {};
            parameters.cursor = cursor;
        }
        var res = ajaxReq(pbPush, "GET", parameters, false, callback);
        if(!callback) {
            return res;
        }
    };

    pb.devices = function(callback) {
        var res = ajaxReq(pbDevice, "GET", null, false, callback);
        if(!callback) {
            return res;
        }
    };

    pb.deleteDevice = function(devId, callback) {
        var res = ajaxReq(pbDevice + "/" + devId, "DELETE", null, false, callback);
        if(!callback) {
            return res;
        }
    };

    pb.contacts = function(callback) {
        var res = ajaxReq(pbContact, "GET", null, false, callback);
        if(!callback) {
            return res;
        }
    };

    pb.deleteContact = function(contId, callback) {
        var res = ajaxReq(pbContact + "/" + contId, null, false, callback);
        if(!callback) {
            return res;
        }
    };

    pb.user = function(callback) {
        var res = ajaxReq(pbUser, "GET", null, false, callback);
        if(!callback) {
            return res;
        }
    };

    var ajaxReq = function(url, verb, parameters, fileUpload, callback) {
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
                };
            }
            if(verb === "GET") {
                var queryParams = [];
                for(var key in parameters) {
                    queryParams.push(key + '=' + parameters[key]);
                }
                var queryString = queryParams.join("&");
                url += "?" + queryString;
                parameters = null;
            }
            ajax.open(verb, url, async);
            if(!fileUpload) {
                ajax.setRequestHeader("Authorization", "Basic " + window.btoa(pb.APIKey + ":"));
                ajax.setRequestHeader("Content-Type", "application/json");
                parameters = JSON.stringify(parameters);
            }
            if(parameters) {
                ajax.send(parameters);
            } else {
                ajax.send();
            }

            if(!async) {
                return handleResponse(ajax);
            }
        }
    };

    var handleResponse = function(ajax) {
        if(ajax.status !== httpResGood && ajax.status !== httpResNoCont) {
            throw new Error(ajax.status + ": " + ajax.response);
        }
        try {
            return JSON.parse(ajax.response);
        } catch(err) {
            return ajax.response;
        }
    };

    return pb;
}());
