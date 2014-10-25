#pushbullet.js

There have been many server based [PushBullet](https://www.pushbullet.com/) wrappers such as [node-pushbullet-api](https://github.com/alexwhitman/node-pushbullet-api), but none of them worked on the browser side of things. If someone is writing a web app that involves pushing, they either were forced to go through the server, or reinvent the wheel on the browser. Not anymore! Enter pushbullet.js

---------------------

pushbullet.js is a convenient wrapper for the [PushBullet API](https://docs.pushbullet.com/) with no outside dependencies and no requirements for the user other than a modern web browser such as Chrome, Safari, mobile browsers, or Internet Explorer > 10. Support for previous versions of IE is welcome in a pull request, or until then, get your users to upgrade to an actual browser.

All methods exposed by this wrapper are optionally asynchronous. To use the methods asynchronously, simply supply a callback with the two arguments of `err` and `res` as the final argument to the function call. If you'd rather use things synchronously, simply ommit the callback and the function will work as expected.

Results or return values will nearly always be JSONified. The keys can be found at the corresponding PushBullet API links. Return values are copied from the previously mentioned PushBullet API documentation.

**NOTE**: This is licensed under the GPL. If that does not work, feel free to contact me and I'm sure we can work something out. If this code is used, I would appreciate if you let me know, and if possible, contributing any improvements that you made via a pull request.

Include this library by inserting the following before your code in the HTML (or by your other favorite way of loading scripts)

```html
<script src="http://alexschneider.github.io/pushbullet-js/pushbullet.min.js" type="text/javascript"></script>
```

------------------------------------

##Methods Exposed by this Wrapper
**NOTE**: Before using any methods, PushBullet.APIKey *MUST* be set. Otherwise an exception will be thrown. Example:

```javascript
PushBullet.APIKey = "<your api key here>";
```

* [PushBullet.push](#pushbulletpush)
* [PushBullet.pushFile](#pushbulletpushfile)
* [PushBullet.deletePush](#pushbulletdeletepush)
* [PushBullet.pushHistory](#pushbulletpushhistory)
* [PushBullet.devices](#pushbulletdevices)
* [PushBullet.deleteDevice](#pushbulletdeletedevice)
* [PushBullet.contacts](#pushbulletcontacts)
* [PushBullet.deleteContact](#pushbulletdeletecontact)
* [PushBullet.user](#pushbulletuser)

----------------------------

### PushBullet.push
`PushBullet.push(pushType, devId, email, data, callback)` - pushes either a note, link, address, or list to a PushBullet device.
* `pushType` - either `'note'`, `'link'`, `'address'`, or `'list'`. For file, use [PushBullet.pushFile](#pushbulletpushfile).
* `devId` - the ID of the device to push to. Available device IDs can be found by using [PushBullet.devices](#pushbulletdevices). Either `devId` or `email` can be used, not both.
* `email` - the email address of the contact to push to. Available contacts can be found with [PushBullet.contacts](#pushbulletcontacts). Either `devId` or `email` can be used, not both.
* `data` - the information to push.  Expects a JSONified version of the type parameters [here](https://docs.pushbullet.com/v2/pushes).
* `callback` - Optional callback that expects an `err` and a `res` parameter.

If neither `devId` nor `email` are supplied, all devices will be pushed to.

Example for synchronous:

```javascript
var res = PushBullet.push("note", "<your device here", null, {title: "<your title here>", body: "<your body here>"});
console.log(res);
```

[JSFiddle](http://jsfiddle.net/LE6ZM/)

Example for asynchronous:

```javascript
PushBullet.push("link", null, "<your friend's email here>", {title: "<your title here>", url: "<your url here>", body: "<your optional body here>"}, function(err, res) {
    if(err) {
        throw err;
    } else {
        console.log(res);
    }
});
```

[JSFiddle](http://jsfiddle.net/4fFhF/)

Example return value:
```javascript
{
    "iden":"ubdpjxxxOK0sKG",
    "type":"note",
    "title":"Note title",
    "body":"Note body",
    "created":1399253701.9746201,
    "modified":1399253701.9744401,
    "active":true,
    "dismissed":false,
    "owner_iden":"ubd",
    "target_device_iden":"ubddjAy95rgBxc",
    "sender_iden":"ubd",
    "sender_email":"ryan@pushbullet.com"
    "sender_email_normalized":"ryan@pushbullet.com",
    "receiver_iden":"ubd",
    "receiver_email":"ryan@pushbullet.com",
    "receiver_email_normalized":"ryan@pushbullet.com"
}
```
---
### PushBullet.pushFile
`PushBullet.pushFile(devId, email, fileHandle, body, callback)` - Pushes a file from an HTML form element

* `devId` - the ID of the device to push to. Available device IDs can be found by using [PushBullet.devices](#pushbulletdevices). Either `devId` or `email` can be used, not both.
* `email` - the email address of the contact to push to. Available contacts can be found with [PushBullet.contacts](#pushbulletcontacts). Either `devId` or `email` can be used, not both.
* `fileHandle` - the variable that gets returned when selecting an input of type `file`.
* `body` - optional body to be sent with the file.
* `callback` - Optional callback that expects an `err` and a `res` parameter.

**NOTE**: Because of the large amount of data being transmitted and the fact that doing this synchronously will freeze up the entire web page, asynchronous is strongly recommended.

Example for synchronous:

```javascript
var file = document.getElementById('files')[0];
var res = PushBullet.pushFile("<your device id here>", null, "<optional message here>");
console.log(res);
```

[JSFiddle](http://jsfiddle.net/8QNYc/)

Example for asynchronous:

```javascript
var file = document.getElementById('files')[0];
PushBullet.pushFile("<your device id here>", null, "<optional message here>", function(err, res) {
    if(err) {
        throw err;
    } else {
        console.log(res);
    }
});
```

[JSFiddle](http://jsfiddle.net/AjFHG/)

Example return value: Check the PushBullet.push example.

---
### PushBullet.deletePush
`PushBullet.deletePush(pushId, callback)` - Deletes a push given the ID of a push.
* `pushId` - the ID of the push to be deleted. The ID can be found by using [PushBullet.pushHistory](#pushbulletpushhistory) or by storing the result of [PushBullet.push](#pushbulletpush) or [PushBullet.pushFile](#pushbulletpushfile).
* `callback` - Optional callback that expects an `err` and a `res` parameter

Example for synchronous:

```javascript
var pushId = PushBullet.pushHistory().pushes[0].iden;
var res = PushBullet.deletePush(pushId);
console.log(res);
```

Example for asynchronous

```javascript
PushBullet.pushHistory(function(err, res) {
    if(err) {
        throw err;
    } else {
        var pushId = res.pushes[0].iden;
        PushBullet.deletePush(pushId, function(err2, res2) {
            console.log(res2);
        });
    }
});
```

Example return value:

```javascript
{}
```
---
### PushBullet.pushHistory
`PushBullet.pushHistory(callback)` - Retrieves all the pushes that have been made to PushBullet
* modifiedAfter - Optional parameter for the unixtime lower bound to look for (upper bound being Date.now())
* Cursor - optional [cursor](https://docs.pushbullet.com/http). Check to see if your response contains the `cursor` key, and if it does, supply this. 
* callback - Optional callback that expects an `err` and a `res` parameter.

Example for synchronous:

```javascript
var res = PushBullet.pushHistory();
console.log(res);
```
[JSFiddle](http://jsfiddle.net/PJ7L5/)

Example for asynchronous:

```javascript
PushBullet.pushHistory(function(err, res) {
    if(err) {
        throw err;
    } else {
        console.log(res);
    }
});
```
[JSFiddle](http://jsfiddle.net/GYA4X/)

Example return value:

```javascript
{
    "pushes": [
        {
            "iden": "ubdpjAkaGXvUl2",
            "type": "link",
            "active": true,
            "dismissed": false,
            "created": 1.39934925E9,
            "modified": 1.39934925E9,
            "title": "Pushbullet",
            "body": "Documenting our API",
            "url": "http://docs.pushbullet.com",
            "owner_iden": "ubd",
            "target_device_iden": "ubddjAy95rgBxc",
            "sender_iden": "ubd",
            "sender_email": "ryan@pushbullet.com"
            "sender_email_normalized": "ryan@pushbullet.com",
            "receiver_iden": "ubd",
            "receiver_email": "ryan@pushbullet.com",
            "receiver_email_normalized": "ryan@pushbullet.com",
        }
    ],
    "cursor": null
}
```
---
### PushBullet.devices
`PushBullet.devices(callback)` - Retrieves an array of all devices
* `callback` - Optional callback that expects an `err` and a `res` parameter

Example for synchronous:

```javascript
var res = PushBullet.devices();
console.log(res);
```
[JSFiddle](http://jsfiddle.net/4zdST/)

Example for asynchronous:

```javascript
PushBullet.devices(function(err, res) {
    if(err) {
        throw err;
    } else {
        console.log(res);
    }
});
```
[JSFiddle](http://jsfiddle.net/mF78D/)

Example return value:

```javascript
{
   "devices":[
        {
            "iden":"u1qSJddxeKwOGuGW",
            "push_token":"u1qSJddxeKwOGuGWu1qSJddxeKwOGuGWu1qSJddxeKwOGuGWu1qSJddxeK",
            "app_version":74,
            "android_sdk_version":"19",
            "fingerprint":"",
            "active":true,
            "nickname":"Galaxy S4",
            "manufacturer":"samsung",
            "kind":"android",
            "created":1394748080.0139201,
            "modified":1399008037.8487799,
            "android_version":"4.4.2",
            "model":"SCH-I545"
        }
   ]
}
```
---
### PushBullet.deleteDevice
`PushBullet.deleteDevice(devId, callback)` - Deletes a device given its device id.
* `devId`. The device id can be found using [PushBullet.devices](#pushbulletdevices).
* `callback` - Optional callback that expects an `err` and a `res` parameter

Example for synchronous:

```javascript
var devId = PushBullet.devices()[0].iden;
var res = PushBullet.deleteDevice(devId);
console.log(res);
```

Example for asynchronous:

```javascript
PushBullet.devices(function(err, res) {
    if(err) {
        throw err;
    } else {
        var devId = res[0].iden;
        PushBullet.deleteDevice(devId, function(err2, res2) {
            if(err2) {
                throw err2;
            } else {
                console.log(res2);
            }
        });
    }
});
```

Example return value:

```javascript
{}
```
---
### PushBullet.contacts
`PushBullet.contacts(callback)` - Retrieves an array of all contacts
* `callback` - Optional callback that expects an `err` and a `res` parameter

Example for synchronous:

```javascript
var res = PushBullet.contacts();
console.log(res);
```

Example for asynchronous:

```javascript
PushBullet.contacts(function(err, res) {
    if(err) {
        throw err;
    } else {
        console.log(res);
    }
});
```

Example return value:

```javascript
{
   "contacts":[
        {
            "iden": "ubdcjAfszs0Smi",
            "status": "user",
            "name": "Ryan Oldenburg",
            "created": 1399011660.4298899,
            "modified": 1399011660.42976,
            "id": 5695496404336640,
            "source": "user",
            "email": "ryanjoldenburg@gmail.com"
            "email_normalized": "ryanjoldenburg@gmail.com",
            "active": true
        }
   ]
}
```
---
### PushBullet.deleteContact
`PushBullet.deleteDevice(contId, callback)` - Deletes a device given its device id.
* `contId`. The contact id can be found using [PushBullet.contacts](#pushbulletcontacts).
* `callback` - Optional callback that expects an `err` and a `res` parameter

Example for synchronous:

```javascript
var contId = PushBullet.contacts()[0].iden;
var res = PushBullet.deleteContact(contId);
console.log(res);
```

Example for asynchronous:

```javascript
PushBullet.contacts(function(err, res) {
    if(err) {
        throw err;
    } else {
        var contId = res[0].iden;
        PushBullet.deleteContact(contId, function(err2, res2) {
            if(err2) {
                throw err2;
            } else {
                console.log(res2);
            }
        });
    }
});
```

Example return value:

```javascript
{}
```
---
### PushBullet.user
`PushBullet.user(callback)` - Retrieve information about the current user
* `callback` - Optional callback that expects an `err` and a `res` parameter

Example for synchronous:

```javascript
var res = PushBullet.user();
console.log(res);
```

Example for asynchronous:

```javascript
PushBullet.user(function(err, res) {
    if(err) {
        throw err;
    } else {
        console.log(res);
    }
});
```

Example return value:

```javascript
{
    "iden": "ubd",
    "api_key": "",
    "email": "",
    "email_normalized": "",
    "admin": true,
    "created": 1357941753.8287899,
    "modified": 1399325992.1842301,
    "google_id": "110038027176632715601",
    "google_userinfo": {
        "family_name": "Oldenburg",
        "name": "Ryan Oldenburg",
        "picture": "",
        "locale": "en",
        "gender": "male",
        "email": "",
        "link": "",
        "given_name": "Ryan",
        "id": "110038027176632715601",
        "hd": "",
        "verified_email": true
    },
    "preferences": {
        "onboarding": {
            "app": false,
            "friends": false,
            "extension": false
        },
        "social": false
    }
}
```
