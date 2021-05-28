/*!
 * @feng3d/filesystem - v0.3.3
 *
 * @feng3d/filesystem is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
/**
 * 加载数据类型
 */
var LoaderDataFormat;
(function (LoaderDataFormat) {
    /**
     * 以原始二进制数据形式接收下载的数据。
     */
    LoaderDataFormat["BINARY"] = "binary";
    /**
     * 以文本形式接收已下载的数据。
     */
    LoaderDataFormat["TEXT"] = "text";
    /**
     * 图片数据
     */
    LoaderDataFormat["IMAGE"] = "image";
})(LoaderDataFormat || (LoaderDataFormat = {}));

/**
 * 加载类
 */
var Loader = function Loader () {};

Loader.prototype.loadText = function loadText (url, onCompleted, onRequestProgress, onError) {
    xmlHttpRequestLoad({ url: url, dataFormat: LoaderDataFormat.TEXT, onCompleted: onCompleted, onProgress: onRequestProgress, onError: onError });
};
/**
 * 加载二进制
 * @param url   路径
 */
Loader.prototype.loadBinary = function loadBinary (url, onCompleted, onRequestProgress, onError) {
    xmlHttpRequestLoad({ url: url, dataFormat: LoaderDataFormat.BINARY, onCompleted: onCompleted, onProgress: onRequestProgress, onError: onError });
};
/**
 * 加载图片
 * @param url   路径
 */
Loader.prototype.loadImage = function loadImage (url, onCompleted, onRequestProgress, onError) {
    var image = new Image();
    image.crossOrigin = "Anonymous";
    image.onload = function (event) {
        onCompleted && onCompleted(image);
    };
    image.onerror = function (event) {
        console.error("Error while trying to load texture: " + url);
        //
        image.src = "data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBmRXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAAExAAIAAAAQAAAATgAAAAAAAABgAAAAAQAAAGAAAAABcGFpbnQubmV0IDQuMC41AP/bAEMABAIDAwMCBAMDAwQEBAQFCQYFBQUFCwgIBgkNCw0NDQsMDA4QFBEODxMPDAwSGBITFRYXFxcOERkbGRYaFBYXFv/bAEMBBAQEBQUFCgYGChYPDA8WFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFv/AABEIAQABAAMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/APH6KKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FCiiigD6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++gooooA+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gUKKKKAPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76CiiigD5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BQooooA+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/voKKKKAPl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FCiiigD6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++gooooA+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gUKKKKAPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76CiiigD5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BQooooA+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/voKKKKAPl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FCiiigD6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++gooooA+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gUKKKKAPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76P//Z";
        //
        var err = new Error(url + " 加载失败！");
        onError && onError(err);
    };
    image.src = url;
};
/**
 * 加载类
 */
var loader = new Loader();
/**
 * 使用XMLHttpRequest加载
 * @param url           加载路径
 * @param dataFormat    数据类型
 */
function xmlHttpRequestLoad(loadItem) {
    var request = new XMLHttpRequest();
    request.open('Get', loadItem.url, true);
    request.setRequestHeader("Access-Control-Allow-Origin", "*");
    request.responseType = loadItem.dataFormat == LoaderDataFormat.BINARY ? "arraybuffer" : "";
    request.onreadystatechange = onRequestReadystatechange(request, loadItem);
    request.onprogress = onRequestProgress(request, loadItem);
    request.send();
}
/**
 * 请求进度回调
 */
function onRequestProgress(request, loadItem) {
    return function (event) {
        loadItem.onProgress && loadItem.onProgress(event.loaded, event.total);
    };
}
/**
 * 请求状态变化回调
 */
function onRequestReadystatechange(request, loadItem) {
    return function (ev) {
        if (request.readyState == 4) { // 4 = "loaded"
            request.onreadystatechange = null;
            if (request.status >= 200 && request.status < 300) {
                var content = loadItem.dataFormat == LoaderDataFormat.TEXT ? request.responseText : request.response;
                loadItem.onCompleted && loadItem.onCompleted(content);
            }
            else {
                var err = new Error(loadItem.url + " 加载失败！");
                loadItem.onError && loadItem.onError(err);
                loadItem.onCompleted && loadItem.onCompleted(null);
            }
        }
    };
}

var databases = {};
/**
 *
 */
var _IndexedDB = function _IndexedDB() {
    /**
     * 数据库状态
     */
    this._dbStatus = {};
};
/**
 * 是否支持 indexedDB
 */
_IndexedDB.prototype.support = function support () {
    if (typeof indexedDB == "undefined") {
        indexedDB = window.indexedDB || window["mozIndexedDB"] || window["webkitIndexedDB"] || window["msIndexedDB"];
        if (indexedDB == undefined) {
            return false;
        }
    }
    return true;
};
/**
 * 获取数据库，如果不存在则新建数据库
 *
 * @param dbname 数据库名称
 * @param callback 完成回调
 */
_IndexedDB.prototype.getDatabase = function getDatabase (dbname, callback) {
    if (databases[dbname]) {
        callback(null, databases[dbname]);
        return;
    }
    this._open(dbname, callback);
};
/**
 * 打开或者升级数据库
 *
 * @param dbname 数据库名称
 * @param callback 完成回调
 * @param upgrade 是否升级数据库
 * @param onupgrade 升级回调
 */
_IndexedDB.prototype._open = function _open (dbname, callback, upgrade, onupgrade) {
        var this$1 = this;
        if ( upgrade === void 0 ) upgrade = false;

    if (!this._dbStatus[dbname])
        { this._dbStatus[dbname] = { status: DBStatus.unOpen, onsuccessCallbacks: [], onupgradeneededCallbacks: [] }; }
    this._dbStatus[dbname].onsuccessCallbacks.push(callback);
    if (upgrade) {
        console.assert(!!onupgrade);
        this._dbStatus[dbname].onupgradeneededCallbacks.push(onupgrade);
    }
    if (this._dbStatus[dbname].status == DBStatus.opening || this._dbStatus[dbname].status == DBStatus.upgrading)
        { return; }
    var request;
    if (!upgrade) {
        request = indexedDB.open(dbname);
        this._dbStatus[dbname].status = DBStatus.opening;
    }
    else {
        var oldDatabase = databases[dbname];
        oldDatabase.close();
        delete databases[dbname];
        request = indexedDB.open(dbname, oldDatabase.version + 1);
        this._dbStatus[dbname].status = DBStatus.upgrading;
    }
    request.onupgradeneeded = function (event) {
        var newdatabase = event.target["result"];
        request.onupgradeneeded = null;
        var callbacks = this$1._dbStatus[dbname].onupgradeneededCallbacks.concat();
        this$1._dbStatus[dbname].onupgradeneededCallbacks.length = 0;
        callbacks.forEach(function (element) {
            element(newdatabase);
        });
    };
    request.onsuccess = function (event) {
        databases[dbname] = event.target["result"];
        request.onsuccess = null;
        this$1._dbStatus[dbname].status = DBStatus.opened;
        var callbacks = this$1._dbStatus[dbname].onsuccessCallbacks.concat();
        this$1._dbStatus[dbname].onsuccessCallbacks.length = 0;
        callbacks.forEach(function (element) {
            element(null, databases[dbname]);
        });
    };
    request.onerror = function (event) {
        request.onerror = null;
        this$1._dbStatus[dbname].status = DBStatus.error;
        var callbacks = this$1._dbStatus[dbname].onsuccessCallbacks.concat();
        this$1._dbStatus[dbname].onsuccessCallbacks.length = 0;
        callbacks.forEach(function (element) {
            element(event, null);
        });
    };
};
/**
 * 删除数据库
 *
 * @param dbname 数据库名称
 * @param callback 完成回调
 */
_IndexedDB.prototype.deleteDatabase = function deleteDatabase (dbname, callback) {
    var request = indexedDB.deleteDatabase(dbname);
    request.onsuccess = function (event) {
        delete databases[dbname];
        callback && callback(null);
        request.onsuccess = null;
    };
    request.onerror = function (event) {
        callback && callback(event);
        request.onerror = null;
    };
};
/**
 * 是否存在指定的对象存储
 *
 * @param dbname 数据库名称
 * @param objectStroreName 对象存储名称
 * @param callback 完成回调
 */
_IndexedDB.prototype.hasObjectStore = function hasObjectStore (dbname, objectStroreName, callback) {
    this.getDatabase(dbname, function (err, database) {
        callback(database.objectStoreNames.contains(objectStroreName));
    });
};
/**
 * 获取对象存储名称列表
 *
 * @param dbname 数据库
 * @param callback 完成回调
 */
_IndexedDB.prototype.getObjectStoreNames = function getObjectStoreNames (dbname, callback) {
    this.getDatabase(dbname, function (err, database) {
        var objectStoreNames = [];
        for (var i = 0; i < database.objectStoreNames.length; i++) {
            objectStoreNames.push(database.objectStoreNames.item(i));
        }
        callback(null, objectStoreNames);
    });
};
/**
 * 创建对象存储
 *
 * @param dbname 数据库名称
 * @param objectStroreName 对象存储名称
 * @param callback 完成回调
 */
_IndexedDB.prototype.createObjectStore = function createObjectStore (dbname, objectStroreName, callback) {
        var this$1 = this;

    this.getDatabase(dbname, function (err, database) {
        if (database.objectStoreNames.contains(objectStroreName)) {
            callback && callback(null);
            return;
        }
        this$1._open(dbname, callback, true, function (newdatabase) {
            newdatabase.createObjectStore(objectStroreName);
        });
    });
};
/**
 * 删除对象存储
 *
 * @param dbname 数据库名称
 * @param objectStroreName 对象存储名称
 * @param callback 完成回调
 */
_IndexedDB.prototype.deleteObjectStore = function deleteObjectStore (dbname, objectStroreName, callback) {
        var this$1 = this;

    this.getDatabase(dbname, function (err, database) {
        if (!database.objectStoreNames.contains(objectStroreName)) {
            callback && callback(null);
            return;
        }
        this$1._open(dbname, callback, true, function (newdatabase) {
            newdatabase.deleteObjectStore(objectStroreName);
        });
    });
};
/**
 * 获取对象存储中所有键列表
 *
 * @param dbname 数据库名称
 * @param objectStroreName 对象存储名称
 * @param callback 完成回调
 */
_IndexedDB.prototype.getAllKeys = function getAllKeys (dbname, objectStroreName, callback) {
    this.getDatabase(dbname, function (err, database) {
        try {
            var transaction = database.transaction([objectStroreName], 'readwrite');
            var objectStore = transaction.objectStore(objectStroreName);
            var request = objectStore.getAllKeys();
            request.onsuccess = function (event) {
                callback && callback(null, event.target["result"]);
                request.onsuccess = null;
            };
        }
        catch (error) {
            callback && callback(error, null);
        }
    });
};
/**
 * 获取对象存储中指定键对应的数据
 *
 * @param dbname 数据库名称
 * @param objectStroreName 对象存储名称
 * @param key 键
 * @param callback 完成回调
 */
_IndexedDB.prototype.objectStoreGet = function objectStoreGet (dbname, objectStroreName, key, callback) {
    this.getDatabase(dbname, function (err, database) {
        var transaction = database.transaction([objectStroreName], 'readwrite');
        var objectStore = transaction.objectStore(objectStroreName);
        var request = objectStore.get(key);
        request.onsuccess = function (event) {
            var result = event.target["result"];
            callback && callback(result != null ? null : new Error(("没有找到资源 " + key)), result);
            request.onsuccess = null;
        };
    });
};
/**
 * 设置对象存储的键与值，如果不存在指定键则新增否则修改。
 *
 * @param dbname 数据库名称
 * @param objectStroreName 对象存储名称
 * @param key 键
 * @param data 数据
 * @param callback 完成回调
 */
_IndexedDB.prototype.objectStorePut = function objectStorePut (dbname, objectStroreName, key, data, callback) {
    this.getDatabase(dbname, function (err, database) {
        try {
            var transaction = database.transaction([objectStroreName], 'readwrite');
            var objectStore = transaction.objectStore(objectStroreName);
            var request = objectStore.put(data, key);
            request.onsuccess = function (event) {
                callback && callback(null);
                request.onsuccess = null;
            };
        }
        catch (error) {
            callback && callback(error);
        }
    });
};
/**
 * 删除对象存储中指定键以及对于数据
 *
 * @param dbname 数据库名称
 * @param objectStroreName 对象存储名称
 * @param key 键
 * @param callback 完成回调
 */
_IndexedDB.prototype.objectStoreDelete = function objectStoreDelete (dbname, objectStroreName, key, callback) {
    this.getDatabase(dbname, function (err, database) {
        try {
            var transaction = database.transaction([objectStroreName], 'readwrite');
            var objectStore = transaction.objectStore(objectStroreName);
            var request = objectStore.delete(key);
            request.onsuccess = function (event) {
                callback && callback();
                request.onsuccess = null;
            };
        }
        catch (error) {
            callback && callback(error);
        }
    });
};
/**
 * 清空对象存储中数据
 *
 * @param dbname 数据库名称
 * @param objectStroreName 对象存储名称
 * @param callback 完成回调
 */
_IndexedDB.prototype.objectStoreClear = function objectStoreClear (dbname, objectStroreName, callback) {
    this.getDatabase(dbname, function (err, database) {
        try {
            var transaction = database.transaction([objectStroreName], 'readwrite');
            var objectStore = transaction.objectStore(objectStroreName);
            var request = objectStore.clear();
            request.onsuccess = function (event) {
                callback && callback();
                request.onsuccess = null;
            };
        }
        catch (error) {
            callback && callback(error);
        }
    });
};
/**
 *
 */
var _indexedDB = new _IndexedDB();
/**
 * 数据库状态
 */
var DBStatus;
(function (DBStatus) {
    /**
     * 未开启
     */
    DBStatus[DBStatus["unOpen"] = 0] = "unOpen";
    /**
     * 正在开启中
     */
    DBStatus[DBStatus["opening"] = 1] = "opening";
    /**
     * 已开启
     */
    DBStatus[DBStatus["opened"] = 2] = "opened";
    /**
     * 正在升级中
     */
    DBStatus[DBStatus["upgrading"] = 3] = "upgrading";
    /**
     * 开启或者升级失败
     */
    DBStatus[DBStatus["error"] = 4] = "error";
})(DBStatus || (DBStatus = {}));

/**
 * 文件系统类型
 */
var FSType;
(function (FSType) {
    FSType["http"] = "http";
    FSType["native"] = "native";
    FSType["indexedDB"] = "indexedDB";
})(FSType || (FSType = {}));

/**
 * Http可读文件系统
 */
var HttpFS = function HttpFS(rootPath) {
    if ( rootPath === void 0 ) rootPath = "";

    /**
     * 根路径
     */
    this.rootPath = "";
    this.type = FSType.http;
    this.rootPath = rootPath;
    if (this.rootPath == "") {
        if (typeof document != "undefined") {
            var url = document.URL.split("?").shift();
            this.rootPath = url.substring(0, url.lastIndexOf("/") + 1);
        }
    }
};
/**
 * 读取文件
 * @param path 路径
 * @param callback 读取完成回调 当err不为null时表示读取失败
 */
HttpFS.prototype.readArrayBuffer = function readArrayBuffer (path, callback) {
    // rootPath
    loader.loadBinary(this.getAbsolutePath(path), function (content) {
        callback(null, content);
    }, null, function (e) {
        callback(e, null);
    });
};
/**
 * 读取文件为字符串
 * @param path 路径
 * @param callback 读取完成回调 当err不为null时表示读取失败
 */
HttpFS.prototype.readString = function readString (path, callback) {
    loader.loadText(this.getAbsolutePath(path), function (content) {
        callback(null, content);
    }, null, function (e) {
        callback(e, null);
    });
};
/**
 * 读取文件为Object
 * @param path 路径
 * @param callback 读取完成回调 当err不为null时表示读取失败
 */
HttpFS.prototype.readObject = function readObject (path, callback) {
    loader.loadText(this.getAbsolutePath(path), function (content) {
        var obj = JSON.parse(content);
        callback(null, obj);
    }, null, function (e) {
        callback(e, null);
    });
};
/**
 * 加载图片
 * @param path 图片路径
 * @param callback 加载完成回调
 */
HttpFS.prototype.readImage = function readImage (path, callback) {
    var img = new Image();
    img.onload = function () {
        callback(null, img);
    };
    img.onerror = function (evt) {
        callback(new Error(("加载图片" + path + "失败")), null);
    };
    img.src = this.getAbsolutePath(path);
};
/**
 * 获取文件绝对路径
 * @param path （相对）路径
 * @param callback 回调函数
 */
HttpFS.prototype.getAbsolutePath = function getAbsolutePath (path) {
    return this.rootPath + path;
};
/**
 * 默认基础文件系统
 */
var basefs = new HttpFS();

/*!
 * @feng3d/event - v0.3.3
 *
 * @feng3d/event is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
/**
 * 事件属性名称常量
 */
var EVENT_KEY = '__event__';
/**
 * 事件派发器代理的对象
 */
var EVENT_EMITTER_TARGET = '__event_emitter_target__';
/**
 * 事件冒泡函数名称常量，冒泡的对象需要定义该名称的函数。
 *
 * function __event_bubble_function__(): any[];
 *
 * var bubbleObject: { __event_bubble_function__: () => any[] }
 */
var EVENT_BUBBLE_FUNCTION = '__event_bubble_function__';
/**
 * 事件派发器
 */
var EventEmitter = function EventEmitter(target) {
    if (target === undefined) {
        target = this;
    }
    console.assert(!EventEmitter.targetMap.has(target), ("同一个 " + target + " 对象无法对应两个 EventEmitter！"));
    EventEmitter.targetMap.set(target, this);
    this[EVENT_EMITTER_TARGET] = target;
};
/**
 * 获取事件派发器
 * @param target
 */
EventEmitter.getEventEmitter = function getEventEmitter (target) {
    console.assert(target !== undefined && target !== null, "被监听对象无法为undefined或者null！");
    if (target instanceof EventEmitter) {
        return target;
    }
    return this.targetMap.get(target);
};
/**
 * 获取事件派发器，当没有找到对应派发器时，返回新建的事件派发器。
 * @param target
 */
EventEmitter.getOrCreateEventEmitter = function getOrCreateEventEmitter (target) {
    var eventEmitter = this.getEventEmitter(target);
    if (!eventEmitter) {
        eventEmitter = new EventEmitter(target);
    }
    return eventEmitter;
};
/**
 * 返回监听的事件类型列表。
 */
EventEmitter.prototype.eventNames = function eventNames () {
    var names = Object.keys(this[EVENT_KEY]);
    return names;
};
/**
 * 返回指定事件类型的监听数量。
 *
 * @param type 事件的类型。
 */
EventEmitter.prototype.listenerCount = function listenerCount (type) {
    var _a, _b;
    return ((_b = (_a = this[EVENT_KEY]) === null || _a === void 0 ? void 0 : _a[type]) === null || _b === void 0 ? void 0 : _b.length) || 0;
};
/**
 * 监听一次事件后将会被移除
 * @param type						事件的类型。
 * @param listener					处理事件的侦听器函数。
 * @param thisObject            listener函数作用域
 * @param priority					事件侦听器的优先级。数字越大，优先级越高。默认优先级为 0。
 */
EventEmitter.prototype.once = function once (type, listener, thisObject, priority) {
        if ( priority === void 0 ) { priority = 0; }

    this.on(type, listener, thisObject, priority, true);
    return this;
};
/**
 * 派发事件
 *
 * 当事件重复流向一个对象时将不会被处理。
 *
 * @param e   事件对象
 * @returns 返回事件是否被该对象处理
 */
EventEmitter.prototype.emitEvent = function emitEvent (e) {
    // 是否为初次派发
    var isEventStart = !e.target;
    if (isEventStart) {
        // 初始化事件
        e.target = e.target || null;
        e.currentTarget = e.currentTarget || null;
        e.isStop = e.isStop || false;
        e.isStopBubbles = e.isStopBubbles || false;
        e.targets = e.targets || [];
        e.handles = e.handles || [];
        e.targetsIndex = e.targetsIndex || 0;
        e.targetsBubblesIndex = e.targetsBubblesIndex || 0;
    }
    var targets = e.targets;
    if (targets.indexOf(this[EVENT_EMITTER_TARGET]) !== -1) {
        return false;
    }
    targets.push(this[EVENT_EMITTER_TARGET]);
    //
    var index = e.targetsIndex;
    while (targets.length > index) {
        var n = targets.length;
        // 派发事件
        while (e.targetsIndex < n) {
            var eventEmitter = EventEmitter.getOrCreateEventEmitter(targets[e.targetsIndex++]);
            eventEmitter.handleEvent(e); // 传递到其它对象中去，将会增加 targets 的长度。
        }
        index = e.targetsIndex;
        if (isEventStart) // 统一在派发事件入口处理冒泡
         {
            // 处理冒泡
            if (e.bubbles && !e.isStopBubbles) {
                while (e.targetsBubblesIndex < n) {
                    var eventEmitter$1 = EventEmitter.getOrCreateEventEmitter(targets[e.targetsBubblesIndex++]);
                    eventEmitter$1.handelEventBubbles(e); // 冒泡到其它对象中去，将会增加 targets 的长度。
                }
                index = e.targetsBubblesIndex;
            }
        }
    }
    return true;
};
/**
 * 将事件调度到事件流中. 事件目标是对其调用 emitEvent() 方法的 Event 对象。
 * @param type                  事件的类型。类型区分大小写。
 * @param data                  事件携带的自定义数据。
 * @param bubbles               表示事件是否为冒泡事件。如果事件可以冒泡，则此值为 true；否则为 false。
 */
EventEmitter.prototype.emit = function emit (type, data, bubbles) {
        if ( bubbles === void 0 ) { bubbles = false; }

    var e = { type: type, data: data, bubbles: bubbles, target: null, currentTarget: null, isStop: false, isStopBubbles: false, targets: [], handles: [] };
    return this.emitEvent(e);
};
/**
 * 检查 Event 对象是否为特定事件类型注册了任何侦听器.
 *
 * @param type		事件的类型。
 * @return 			如果指定类型的侦听器已注册，则值为 true；否则，值为 false。
 */
EventEmitter.prototype.has = function has (type) {
    return this.listenerCount(type) > 0;
};
/**
 * 为监听对象新增指定类型的事件监听。
 *
 * @param type						事件的类型。
 * @param listener					处理事件的监听器函数。
 * @param thisObject            监听器的上下文。可选。
 * @param priority					事件监听器的优先级。数字越大，优先级越高。默认为0。
 * @param once                  值为true时在监听一次事件后该监听器将被移除。默认为false。
 */
EventEmitter.prototype.on = function on (type, listener, thisObject, priority, once) {
        if ( priority === void 0 ) { priority = 0; }
        if ( once === void 0 ) { once = false; }

    if (listener === null)
        { return this; }
    var objectListener = this[EVENT_KEY];
    if (!objectListener) {
        objectListener = { __anyEventType__: [] };
        this[EVENT_KEY] = objectListener;
    }
    thisObject = thisObject || this;
    var listeners = objectListener[type] = objectListener[type] || [];
    var i = 0;
    for (i = 0; i < listeners.length; i++) {
        var element = listeners[i];
        if (element.listener === listener && element.thisObject === thisObject) {
            listeners.splice(i, 1);
            break;
        }
    }
    for (i = 0; i < listeners.length; i++) {
        var element$1 = listeners[i];
        if (priority > element$1.priority) {
            break;
        }
    }
    listeners.splice(i, 0, { listener: listener, thisObject: thisObject, priority: priority, once: once });
    return this;
};
/**
 * 移除监听
 *
 * @param type						事件的类型。可选。该值为空时所有被监听对象上的监听均将被移除。
 * @param listener					要删除的监听器对象。可选。该值为空时所有指定类型的监听均将被移除。
 * @param thisObject            监听器的上下文。可选。
 */
EventEmitter.prototype.off = function off (type, listener, thisObject) {
    if (!type) {
        this[EVENT_KEY] = undefined;
        return;
    }
    var objectListener = this[EVENT_KEY];
    if (!objectListener)
        { return; }
    if (!listener) {
        delete objectListener[type];
        return;
    }
    thisObject = thisObject || this;
    var listeners = objectListener[type];
    if (listeners) {
        for (var i = listeners.length - 1; i >= 0; i--) {
            var element = listeners[i];
            if (element.listener === listener && element.thisObject === thisObject) {
                listeners.splice(i, 1);
            }
        }
        if (listeners.length === 0) {
            delete objectListener[type];
        }
    }
    return this;
};
/**
 * 移除所有监听
 *
 * @param type						事件的类型。可选。该值为空时所有被监听对象上的监听均将被移除。
 */
EventEmitter.prototype.offAll = function offAll (type) {
    this.off(type);
    return this;
};
/**
 * 监听对象的任意事件，该对象的任意事件都将触发该监听器的调用。
 *
 * @param listener              处理事件的监听器函数。
 * @param thisObject            监听器的上下文。可选。
 * @param priority              事件监听器的优先级。数字越大，优先级越高。默认为0。
 * @param once                  值为true时在监听一次事件后该监听器将被移除。默认为false。
 */
EventEmitter.prototype.onAny = function onAny (listener, thisObject, priority, once) {
        if ( priority === void 0 ) { priority = 0; }
        if ( once === void 0 ) { once = false; }

    var objectListener = this[EVENT_KEY];
    if (!objectListener) {
        objectListener = { __anyEventType__: [] };
        this[EVENT_KEY] = objectListener;
    }
    var listeners = objectListener.__anyEventType__;
    var i = 0;
    for (i = 0; i < listeners.length; i++) {
        var element = listeners[i];
        if (element.listener === listener && element.thisObject === thisObject) {
            listeners.splice(i, 1);
            break;
        }
    }
    for (i = 0; i < listeners.length; i++) {
        var element$1 = listeners[i];
        if (priority > element$1.priority) {
            break;
        }
    }
    listeners.splice(i, 0, { listener: listener, thisObject: thisObject, priority: priority, once: once });
    return this;
};
/**
 * 移除监听对象的任意事件。
 *
 * @param listener              处理事件的监听器函数。
 * @param thisObject            监听器的上下文。可选。
 */
EventEmitter.prototype.offAny = function offAny (listener, thisObject) {
    var objectListener = this[EVENT_KEY];
    if (!listener) {
        if (objectListener) {
            objectListener.__anyEventType__.length = 0;
        }
        return;
    }
    if (objectListener) {
        var listeners = objectListener.__anyEventType__;
        for (var i = listeners.length - 1; i >= 0; i--) {
            var element = listeners[i];
            if (element.listener === listener && element.thisObject === thisObject) {
                listeners.splice(i, 1);
            }
        }
    }
    return this;
};
/**
 * 处理事件
 * @param e 事件
 */
EventEmitter.prototype.handleEvent = function handleEvent (e) {
    // 设置目标
    e.target = e.target || this[EVENT_EMITTER_TARGET];
    e.currentTarget = this[EVENT_EMITTER_TARGET];
    //
    var objectListener = this[EVENT_KEY];
    if (!objectListener)
        { return; }
    var listeners = objectListener[e.type];
    if (listeners) {
        // 遍历调用事件回调函数
        var listeners0 = listeners.concat();
        var i = 0;
        for (i = 0; i < listeners0.length && !e.isStop; i++) {
            listeners0[i].listener.call(listeners0[i].thisObject, e); // 此处可能会删除当前事件，所以上面必须拷贝
            e.handles.push(listeners0[i]);
        }
        for (i = listeners.length - 1; i >= 0; i--) {
            if (listeners[i].once) {
                listeners.splice(i, 1);
            }
        }
        if (listeners.length === 0) {
            delete objectListener[e.type];
        }
    }
    // Any_EVENT_Type
    listeners = objectListener.__anyEventType__;
    if (listeners) {
        // 遍历调用事件回调函数
        var listeners0$1 = listeners.concat();
        for (var i$1 = 0; i$1 < listeners0$1.length && !e.isStop; i$1++) {
            listeners0$1[i$1].listener.call(listeners0$1[i$1].thisObject, e); // 此处可能会删除当前事件，所以上面必须拷贝
        }
        for (var i$2 = listeners.length - 1; i$2 >= 0; i$2--) {
            if (listeners[i$2].once) {
                listeners.splice(i$2, 1);
            }
        }
    }
};
/**
 * 处理事件冒泡
 * @param e 事件
 */
EventEmitter.prototype.handelEventBubbles = function handelEventBubbles (e) {
    var _a;
    if (typeof ((_a = this[EVENT_EMITTER_TARGET]) === null || _a === void 0 ? void 0 : _a[EVENT_BUBBLE_FUNCTION]) === 'function') {
        var bubbleTargets = this[EVENT_EMITTER_TARGET][EVENT_BUBBLE_FUNCTION]();
        bubbleTargets.forEach(function (v) {
            if (v !== undefined && e.targets.indexOf(v) === -1) {
                e.targets.push(v);
            }
        });
    }
};
EventEmitter.targetMap = new Map();

/**
 * 可针对（除undefined、null、Symbol外）的任意对象（0, 1, true, false, "1", {}）派发事件
 */
var FEvent = function FEvent () {};

FEvent.prototype.eventNames = function eventNames (obj) {
    var _a;
    console.assert(obj !== undefined && obj !== null, "被监听对象无法为undefined或者null！");
    var names = ((_a = EventEmitter.getEventEmitter(obj)) === null || _a === void 0 ? void 0 : _a.eventNames()) || [];
    return names;
};
/**
 * Return the number of listeners listening to a given event.
 */
FEvent.prototype.listenerCount = function listenerCount (obj, type) {
    var _a;
    console.assert(obj !== undefined && obj !== null, "被监听对象无法为undefined或者null！");
    var count = ((_a = EventEmitter.getEventEmitter(obj)) === null || _a === void 0 ? void 0 : _a.listenerCount(type)) || 0;
    return count;
};
/**
 * 监听一次事件后将会被移除
 * @param type						事件的类型。
 * @param listener					处理事件的监听器函数。
 * @param thisObject            listener函数作用域
 * @param priority					事件监听器的优先级。数字越大，优先级越高。默认为0。
 */
FEvent.prototype.once = function once (obj, type, listener, thisObject, priority) {
        if ( thisObject === void 0 ) { thisObject = null; }
        if ( priority === void 0 ) { priority = 0; }

    console.assert(obj !== undefined && obj !== null, "被监听对象无法为undefined或者null！");
    EventEmitter.getOrCreateEventEmitter(obj).once(type, listener, thisObject, priority);
    return this;
};
/**
 * 派发事件
 *
 * 当事件重复流向一个对象时将不会被处理。
 *
 * @param e             事件对象。
 * @returns             返回事件是否被该对象处理。
 */
FEvent.prototype.emitEvent = function emitEvent (obj, e) {
    console.assert(obj !== undefined && obj !== null, "被监听对象无法为undefined或者null！");
    var result = EventEmitter.getOrCreateEventEmitter(obj).emitEvent(e) || false;
    return result;
};
/**
 * 将事件调度到事件流中. 事件目标是对其调用 emitEvent() 方法的 IEvent 对象。
 * @param type                  事件的类型。类型区分大小写。
 * @param data                  事件携带的自定义数据。
 * @param bubbles               表示事件是否为冒泡事件。如果事件可以冒泡，则此值为 true；否则为 false。
 */
FEvent.prototype.emit = function emit (obj, type, data, bubbles) {
        if ( bubbles === void 0 ) { bubbles = false; }

    console.assert(obj !== undefined && obj !== null, "被监听对象无法为undefined或者null！");
    var result = EventEmitter.getOrCreateEventEmitter(obj).emit(type, data, bubbles) || false;
    return result;
};
/**
 * 检查 被监听对象 是否为特定事件类型注册了任何监听器.
 *
 * @param obj                   被监听对象。
 * @param type		            事件的类型。
 * @return 			            如果指定类型的监听器已注册，则值为 true；否则，值为 false。
 */
FEvent.prototype.has = function has (obj, type) {
    var _a;
    console.assert(obj !== undefined && obj !== null, "被监听对象无法为undefined或者null！");
    var result = ((_a = EventEmitter.getEventEmitter(obj)) === null || _a === void 0 ? void 0 : _a.has(type)) || false;
    return result;
};
/**
 * 为监听对象新增指定类型的事件监听。
 *
 * @param obj                   被监听对象。
 * @param type						事件的类型。
 * @param listener					处理事件的监听器函数。
 * @param thisObject            监听器的上下文。可选。
 * @param priority					事件监听器的优先级。数字越大，优先级越高。默认为0。
 * @param once                  值为true时在监听一次事件后该监听器将被移除。默认为false。
 */
FEvent.prototype.on = function on (obj, type, listener, thisObject, priority, once) {
        if ( priority === void 0 ) { priority = 0; }
        if ( once === void 0 ) { once = false; }

    console.assert(obj !== undefined && obj !== null, "被监听对象无法为undefined或者null！");
    EventEmitter.getOrCreateEventEmitter(obj).on(type, listener, thisObject, priority, once);
    return this;
};
/**
 * 移除监听
 *
 * @param obj                   被监听对象。
 * @param type						事件的类型。可选。该值为空时所有被监听对象上的监听均将被移除。
 * @param listener					要删除的监听器对象。可选。该值为空时所有指定类型的监听均将被移除。
 * @param thisObject            监听器的上下文。可选。
 */
FEvent.prototype.off = function off (obj, type, listener, thisObject) {
    var _a;
    console.assert(obj !== undefined && obj !== null, "被监听对象无法为undefined或者null！");
    (_a = EventEmitter.getEventEmitter(obj)) === null || _a === void 0 ? void 0 : _a.off(type, listener, thisObject);
    return this;
};
/**
 * Remove all listeners, or those of the specified event.
 */
FEvent.prototype.offAll = function offAll (obj, type) {
    var _a;
    console.assert(obj !== undefined && obj !== null, "被监听对象无法为undefined或者null！");
    (_a = EventEmitter.getEventEmitter(obj)) === null || _a === void 0 ? void 0 : _a.offAll(type);
    return this;
};
/**
 * 监听对象的任意事件，该对象的任意事件都将触发该监听器的调用。
 *
 * @param obj                   被监听对象。
 * @param listener              处理事件的监听器函数。
 * @param thisObject            监听器的上下文。可选。
 * @param priority              事件监听器的优先级。数字越大，优先级越高。默认为0。
 * @param once                  值为true时在监听一次事件后该监听器将被移除。默认为false。
 */
FEvent.prototype.onAny = function onAny (obj, listener, thisObject, priority, once) {
        if ( priority === void 0 ) { priority = 0; }
        if ( once === void 0 ) { once = false; }

    console.assert(obj !== undefined && obj !== null, "被监听对象无法为undefined或者null！");
    EventEmitter.getOrCreateEventEmitter(obj).onAny(listener, thisObject, priority, once);
    return this;
};
/**
 * 移除监听对象的任意事件。
 *
 * @param obj                   被监听对象。
 * @param listener              处理事件的监听器函数。
 * @param thisObject            监听器的上下文。可选。
 */
FEvent.prototype.offAny = function offAny (obj, listener, thisObject) {
    var _a;
    console.assert(obj !== undefined && obj !== null, "被监听对象无法为undefined或者null！");
    (_a = EventEmitter.getEventEmitter(obj)) === null || _a === void 0 ? void 0 : _a.offAny(listener, thisObject);
    return this;
};
/**
 * 初始化事件对象
 *
 * @param type                  事件的类型。类型区分大小写。
 * @param data                  事件携带的自定义数据。
 * @param bubbles               表示事件是否为冒泡事件。如果事件可以冒泡，则此值为 true；否则为 false。
 */
FEvent.prototype.makeEvent = function makeEvent (type, data, bubbles) {
        if ( bubbles === void 0 ) { bubbles = false; }

    return { type: type, data: data, bubbles: bubbles };
};
/**
 * 事件
 */
var event = new FEvent();

/**
 * 全局事件
 */
var globalEmitter = new EventEmitter();

/**
 * 只针对Object的事件
 */
var objectevent = event;

/*!
 * @feng3d/polyfill - v0.3.3
 *
 * @feng3d/polyfill is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, "includes", {
        configurable: true,
        enumerable: false,
        value: function (searchElement, fromIndex) {
            for (var i = fromIndex, n = this.length; i < n; i++) {
                if (searchElement == this[i])
                    { return true; }
            }
            return false;
        },
        writable: true,
    });
}
Array.equal = function (self, arr) {
    if (self.length != arr.length)
        { return false; }
    var keys = Object.keys(arr);
    for (var i = 0, n = keys.length; i < n; i++) {
        var key = keys[i];
        if (self[key] != arr[key])
            { return false; }
    }
    return true;
};
Array.concatToSelf = function (self) {
    var arguments$1 = arguments;

    var items = [], len = arguments.length - 1;
    while ( len-- > 0 ) { items[ len ] = arguments$1[ len + 1 ]; }

    var arr = [];
    items.forEach(function (v) { return arr = arr.concat(v); });
    arr.forEach(function (v) { return self.push(v); });
    return self;
};
Array.unique = function (arr, compare) {
    if ( compare === void 0 ) { compare = function (a, b) { return a == b; }; }

    var keys = Object.keys(arr);
    var ids = keys.map(function (v) { return Number(v); }).filter(function (v) { return !isNaN(v); });
    var deleteMap = {};
    //
    for (var i = 0, n = ids.length; i < n; i++) {
        var ki = ids[i];
        if (deleteMap[ki])
            { continue; }
        for (var j = i + 1; j < n; j++) {
            var kj = ids[j];
            if (compare(arr[ki], arr[kj]))
                { deleteMap[kj] = true; }
        }
    }
    //
    for (var i$1 = ids.length - 1; i$1 >= 0; i$1--) {
        var id = ids[i$1];
        if (deleteMap[id])
            { arr.splice(id, 1); }
    }
    return arr;
};
/**
 * 数组元素是否唯一
 * @param equalFn 比较函数
 */
Array.isUnique = function (array, compare) {
    if ( compare === void 0 ) { compare = function (a, b) { return a == b; }; }

    for (var i = array.length - 1; i >= 0; i--) {
        for (var j = 0; j < i; j++) {
            if (compare(array[i], array[j])) {
                return false;
            }
        }
    }
    return true;
};
Array.delete = function (arr, item) {
    var index = arr.indexOf(item);
    if (index != -1)
        { arr.splice(index, 1); }
    return index;
};
Array.replace = function (arr, a, b, isAdd) {
    if ( isAdd === void 0 ) { isAdd = true; }

    var isreplace = false;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == a) {
            arr[i] = b;
            isreplace = true;
            break;
        }
    }
    if (!isreplace && isAdd)
        { arr.push(b); }
    return arr;
};
Array.create = function (length, itemFunc) {
    var arr = [];
    for (var i = 0; i < length; i++) {
        arr[i] = itemFunc(i);
    }
    return arr;
};
Array.binarySearch = function (array, target, compare, start, end) {
    var insert = Array.binarySearchInsert(array, target, compare, start, end);
    if (array[insert] == target)
        { return insert; }
    return -1;
};
Array.binarySearchInsert = function (array, target, compare, start, end) {
    if (start === undefined)
        { start = 0; }
    if (end === undefined)
        { end = array.length; }
    if (start == end)
        { return start; }
    if (compare(array[start], target) == 0) {
        return start;
    }
    var middle = ~~((start + end) / 2);
    if (compare(array[middle], target) < 0) {
        start = middle + 1;
    }
    else {
        end = middle;
    }
    return Array.binarySearchInsert(array, target, compare, start, end);
};

Map.getKeys = function (map) {
    var keys = [];
    map.forEach(function (v, k) {
        keys.push(k);
    });
    return keys;
};
Map.getValues = function (map) {
    var values = [];
    map.forEach(function (v, k) {
        values.push(v);
    });
    return values;
};

Object.isBaseType = function (object) {
    //基础类型
    if (object == undefined
        || object == null
        || typeof object == "boolean"
        || typeof object == "string"
        || typeof object == "number")
        { return true; }
    return false;
};
Object.getPropertyDescriptor = function (host, property) {
    var data = Object.getOwnPropertyDescriptor(host, property);
    if (data) {
        return data;
    }
    var prototype = Object.getPrototypeOf(host);
    if (prototype) {
        return Object.getPropertyDescriptor(prototype, property);
    }
    return undefined;
};
Object.propertyIsWritable = function (host, property) {
    var data = Object.getPropertyDescriptor(host, property);
    if (!data)
        { return false; }
    if (data.get && !data.set)
        { return false; }
    return true;
};
Object.runFunc = function (obj, func) {
    func(obj);
    return obj;
};
Object.isObject = function (obj) {
    return obj != null && (obj.constructor == Object || (obj.constructor.name == "Object")); // 兼容其他 HTMLIFrameElement 传入的Object
};
Object.getPropertyValue = function (object, property) {
    if (typeof property == "string")
        { property = property.split("."); }
    var value = object;
    var len = property.length;
    for (var i = 0; i < property.length; i++) {
        if (value == null)
            { return undefined; }
        value = value[property[i]];
    }
    return value;
};
Object.getPropertyChains = function (object) {
    var result = [];
    // 属性名称列表
    var propertys = Object.keys(object);
    // 属性所属对象列表
    var hosts = new Array(propertys.length).fill(object);
    // 父属性所在编号列表
    var parentPropertyIndices = new Array(propertys.length).fill(-1);
    // 处理到的位置
    var index = 0;
    while (index < propertys.length) {
        var host = hosts[index];
        var cp = propertys[index];
        var cv = host[cp];
        var vks;
        if (cv == null || Object.isBaseType(cv) || (vks = Object.keys(cv)).length == 0) {
            // 处理叶子属性
            var ps = [cp];
            var ci = index;
            // 查找并组合属性链
            while ((ci = parentPropertyIndices[ci]) != -1) {
                ps.push(propertys[ci]);
            }
            ps.reverse();
            result.push(ps.join("."));
        }
        else {
            // 处理中间属性
            vks.forEach(function (k) {
                propertys.push(k);
                hosts.push(cv);
                parentPropertyIndices.push(index);
            });
        }
        index++;
    }
    return result;
};
Object.equalDeep = function (a, b) {
    if (a == b)
        { return true; }
    if (Object.isBaseType(a) || Object.isBaseType(b))
        { return a == b; }
    if (typeof a == "function" || typeof b == "function")
        { return a == b; }
    //
    var akeys = Object.keys(a);
    var bkeys = Object.keys(b);
    if (!Array.equal(akeys, bkeys))
        { return false; }
    if (Array.isArray(a) && Array.isArray(b))
        { return a.length == b.length; }
    // 检测所有属性
    for (var i = 0; i < akeys.length; i++) {
        var element = akeys[i];
        if (!Object.equalDeep(a[element], b[element])) {
            return false;
        }
    }
    return true;
};
Object.assignShallow = function (target, source) {
    if (source == null)
        { return target; }
    var keys = Object.keys(source);
    keys.forEach(function (k) {
        target[k] = source[k];
    });
    return target;
};
Object.assignDeep = function (target, source, replacers, deep) {
    if ( replacers === void 0 ) { replacers = []; }
    if ( deep === void 0 ) { deep = Number.MAX_SAFE_INTEGER; }

    if (source == null)
        { return target; }
    if (deep < 1)
        { return target; }
    var keys = Object.keys(source);
    var handles = replacers.concat(Object.assignDeepDefaultHandlers);
    keys.forEach(function (k) {
        //
        for (var i = 0; i < handles.length; i++) {
            if (handles[i](target, source, k, replacers, deep)) {
                return;
            }
        }
        //
        target[k] = source[k];
    });
    return target;
};
Object.assignDeepDefaultHandlers = [
    function (target, source, key) {
        if (target[key] == source[key])
            { return true; }
        return false;
    },
    function (target, source, key) {
        if (Object.isBaseType(target[key]) || Object.isBaseType(source[key])) {
            target[key] = source[key];
            return true;
        }
        return false;
    },
    function (target, source, key, handlers, deep) {
        if (Array.isArray(source[key]) || Object.isObject(source[key])) {
            Object.assignDeep(target[key], source[key], handlers, deep - 1);
            return true;
        }
        return false;
    } ];

var __class__ = "__class__";
/**
 * 类工具
 */
var ClassUtils = function ClassUtils() {
    this.classUtilsHandlers = [];
    this.defaultInstMap = {};
};
/**
 * 返回对象的完全限定类名。
 * @param value 需要完全限定类名称的对象，可以将任何 JavaScript 值传递给此方法，包括所有可用的 JavaScript 类型、对象实例、原始类型
 * （如number)和类对象
 * @returns 包含完全限定类名称的字符串。
 */
ClassUtils.prototype.getQualifiedClassName = function getQualifiedClassName (value) {
    if (value == null)
        { return "null"; }
    var classUtilsHandlers = classUtils.classUtilsHandlers;
    if (classUtilsHandlers) {
        classUtilsHandlers.forEach(function (element) {
            element(value);
        });
    }
    var prototype = value.prototype ? value.prototype : Object.getPrototypeOf(value);
    if (prototype.hasOwnProperty(__class__))
        { return prototype[__class__]; }
    var className = prototype.constructor.name;
    if (_global[className] == prototype.constructor)
        { return className; }
    //在可能的命名空间内查找
    for (var i = 0; i < _classNameSpaces.length; i++) {
        var tryClassName = _classNameSpaces[i] + "." + className;
        if (this.getDefinitionByName(tryClassName) == prototype.constructor) {
            className = tryClassName;
            registerClass(prototype.constructor, className);
            return className;
        }
    }
    console.warn(("未在给出的命名空间 " + _classNameSpaces + " 内找到 " + value + "-" + className + " 的定义"));
    return className;
};
/**
 * 返回 name 参数指定的类的类对象引用。
 * @param name 类的名称。
 */
ClassUtils.prototype.getDefinitionByName = function getDefinitionByName (name, readCache) {
        if ( readCache === void 0 ) { readCache = true; }

    if (name == "null")
        { return null; }
    if (!name)
        { return null; }
    if (_global[name])
        { return _global[name]; }
    if (readCache && _definitionCache[name])
        { return _definitionCache[name]; }
    var paths = name.split(".");
    var length = paths.length;
    var definition = _global;
    for (var i = 0; i < length; i++) {
        var path = paths[i];
        definition = definition[path];
        if (!definition) {
            return null;
        }
    }
    _definitionCache[name] = definition;
    return definition;
};
/**
 * 获取默认实例
 *
 * @param name 类名称
 */
ClassUtils.prototype.getDefaultInstanceByName = function getDefaultInstanceByName (name) {
    if (name === undefined) {
        return null;
    }
    var defaultInst = this.defaultInstMap[name];
    if (defaultInst)
        { return defaultInst; }
    //
    defaultInst = this.defaultInstMap[name] = this.getInstanceByName(name);
    // 冻结对象，防止被修改
    Object.freeze(defaultInst);
    return defaultInst;
};
/**
 * 获取实例
 *
 * @param name 类名称
 */
ClassUtils.prototype.getInstanceByName = function getInstanceByName (name) {
    var cls = this.getDefinitionByName(name);
    console.assert(cls, ("无法获取名称为 " + name + " 的实例!"));
    var instance = this.getInstanceByDefinition(cls);
    return instance;
};
ClassUtils.prototype.getInstanceByDefinition = function getInstanceByDefinition (cls) {
    console.assert(cls);
    if (!cls)
        { return undefined; }
    if (cls["__create__"]) {
        return cls["__create__"]();
    }
    return new cls();
};
/**
 * 新增反射对象所在的命名空间，使得getQualifiedClassName能够得到正确的结果
 */
ClassUtils.prototype.addClassNameSpace = function addClassNameSpace (namespace) {
    if (_classNameSpaces.indexOf(namespace) == -1) {
        _classNameSpaces.push(namespace);
    }
};
/**
 * 类工具
 */
var classUtils = new ClassUtils();
var _definitionCache = {};
var _global;
if (typeof window != "undefined") {
    _global = window;
}
var _classNameSpaces = ["feng3d"];
/**
 * 为一个类定义注册完全限定类名
 * @param classDefinition 类定义
 * @param className 完全限定类名
 */
function registerClass(classDefinition, className) {
    var prototype = classDefinition.prototype;
    Object.defineProperty(prototype, __class__, { value: className, writable: true, enumerable: false });
}

/**
 * 数据类型转换
 * TypeArray、ArrayBuffer、Blob、File、DataURL、canvas的相互转换
 * @see http://blog.csdn.net/yinwhm12/article/details/73482904
 */
var DataTransform = function DataTransform () {};

DataTransform.prototype.blobToArrayBuffer = function blobToArrayBuffer (blob, callback) {
    var reader = new FileReader();
    reader.onload = function (e) {
        callback(e.target["result"]);
    };
    reader.readAsArrayBuffer(blob);
};
/**
 * ArrayBuffer to Blob
 */
DataTransform.prototype.arrayBufferToBlob = function arrayBufferToBlob (arrayBuffer) {
    var blob = new Blob([arrayBuffer]); // 注意必须包裹[]
    return blob;
};
/**
 * ArrayBuffer to Uint8
 * Uint8数组可以直观的看到ArrayBuffer中每个字节（1字节 == 8位）的值。一般我们要将ArrayBuffer转成Uint类型数组后才能对其中的字节进行存取操作。
 */
DataTransform.prototype.arrayBufferToUint8 = function arrayBufferToUint8 (arrayBuffer) {
    var u8 = new Uint8Array(arrayBuffer);
    return u8;
};
/**
 * Uint8 to ArrayBuffer
 * 我们Uint8数组可以直观的看到ArrayBuffer中每个字节（1字节 == 8位）的值。一般我们要将ArrayBuffer转成Uint类型数组后才能对其中的字节进行存取操作。
 */
DataTransform.prototype.uint8ToArrayBuffer = function uint8ToArrayBuffer (uint8Array) {
    var buffer = uint8Array.buffer;
    return buffer;
};
/**
 * Array to ArrayBuffer
 * @param array 例如：[0x15, 0xFF, 0x01, 0x00, 0x34, 0xAB, 0x11];
 */
DataTransform.prototype.arrayToArrayBuffer = function arrayToArrayBuffer (array) {
    var uint8 = new Uint8Array(array);
    var buffer = uint8.buffer;
    return buffer;
};
/**
 * TypeArray to Array
 */
DataTransform.prototype.uint8ArrayToArray = function uint8ArrayToArray (u8a) {
    var arr = [];
    for (var i = 0; i < u8a.length; i++) {
        arr.push(u8a[i]);
    }
    return arr;
};
/**
 * canvas转换为dataURL
 */
DataTransform.prototype.canvasToDataURL = function canvasToDataURL (canvas, type, quality) {
        if ( type === void 0 ) { type = "png"; }
        if ( quality === void 0 ) { quality = 1; }

    if (type == "png")
        { return canvas.toDataURL("image/png"); }
    return canvas.toDataURL("image/jpeg", quality);
};
/**
 * canvas转换为图片
 */
DataTransform.prototype.canvasToImage = function canvasToImage (canvas, type, quality, callback) {
        if ( type === void 0 ) { type = "png"; }
        if ( quality === void 0 ) { quality = 1; }

    var dataURL = this.canvasToDataURL(canvas, type, quality);
    this.dataURLToImage(dataURL, callback);
};
/**
 * File、Blob对象转换为dataURL
 * File对象也是一个Blob对象，二者的处理相同。
 */
DataTransform.prototype.blobToDataURL = function blobToDataURL (blob, callback) {
    var a = new FileReader();
    a.onload = function (e) {
        callback(e.target["result"]);
    };
    a.readAsDataURL(blob);
};
/**
 * dataURL转换为Blob对象
 */
DataTransform.prototype.dataURLtoBlob = function dataURLtoBlob (dataurl) {
    var arr = dataurl.split(","), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    var blob = new Blob([u8arr], { type: mime });
    return blob;
};
/**
 * dataURL图片数据转换为HTMLImageElement
 * dataURL图片数据绘制到canvas
 * 先构造Image对象，src为dataURL，图片onload之后绘制到canvas
 */
DataTransform.prototype.dataURLDrawCanvas = function dataURLDrawCanvas (dataurl, canvas, callback) {
    this.dataURLToImage(dataurl, function (img) {
        // canvas.drawImage(img);
        callback(img);
    });
};
DataTransform.prototype.dataURLToArrayBuffer = function dataURLToArrayBuffer (dataurl, callback) {
    var blob = this.dataURLtoBlob(dataurl);
    this.blobToArrayBuffer(blob, callback);
};
DataTransform.prototype.arrayBufferToDataURL = function arrayBufferToDataURL (arrayBuffer, callback) {
    var blob = this.arrayBufferToBlob(arrayBuffer);
    this.blobToDataURL(blob, callback);
};
DataTransform.prototype.dataURLToImage = function dataURLToImage (dataurl, callback) {
    var img = new Image();
    img.onload = function () {
        callback(img);
    };
    img.src = dataurl;
};
DataTransform.prototype.imageToDataURL = function imageToDataURL (img, quality) {
        if ( quality === void 0 ) { quality = 1; }

    var canvas = this.imageToCanvas(img);
    var dataurl = this.canvasToDataURL(canvas, "png", quality);
    return dataurl;
};
DataTransform.prototype.imageToCanvas = function imageToCanvas (img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctxt = canvas.getContext('2d');
    ctxt.drawImage(img, 0, 0);
    return canvas;
};
DataTransform.prototype.imageToArrayBuffer = function imageToArrayBuffer (img, callback) {
    if (img["arraybuffer"]) {
        callback(img["arraybuffer"]);
        return;
    }
    var dataUrl = this.imageToDataURL(img);
    this.dataURLToArrayBuffer(dataUrl, function (arraybuffer) {
        img["arraybuffer"] = arraybuffer;
        arraybuffer["img"] = img;
        callback(arraybuffer);
    });
};
DataTransform.prototype.imageDataToDataURL = function imageDataToDataURL (imageData, quality) {
        if ( quality === void 0 ) { quality = 1; }

    var canvas = this.imageDataToCanvas(imageData);
    var dataurl = this.canvasToDataURL(canvas, "png", quality);
    return dataurl;
};
DataTransform.prototype.imageDataToCanvas = function imageDataToCanvas (imageData) {
    var canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    var ctxt = canvas.getContext('2d');
    ctxt.putImageData(imageData, 0, 0);
    return canvas;
};
DataTransform.prototype.imagedataToImage = function imagedataToImage (imageData, quality, callback) {
        if ( quality === void 0 ) { quality = 1; }

    var dataUrl = this.imageDataToDataURL(imageData, quality);
    this.dataURLToImage(dataUrl, callback);
};
DataTransform.prototype.arrayBufferToImage = function arrayBufferToImage (arrayBuffer, callback) {
        var this$1 = this;

    if (arrayBuffer["image"]) {
        callback(arrayBuffer["image"]);
        return;
    }
    this.arrayBufferToDataURL(arrayBuffer, function (dataurl) {
        this$1.dataURLToImage(dataurl, function (img) {
            img["arraybuffer"] = arrayBuffer;
            arrayBuffer["image"] = img;
            callback(img);
        });
    });
};
DataTransform.prototype.blobToText = function blobToText (blob, callback) {
    var a = new FileReader();
    a.onload = function (e) { callback(e.target["result"]); };
    a.readAsText(blob);
};
DataTransform.prototype.stringToArrayBuffer = function stringToArrayBuffer (str) {
    var uint8Array = this.stringToUint8Array(str);
    var buffer = this.uint8ToArrayBuffer(uint8Array);
    return buffer;
};
DataTransform.prototype.arrayBufferToString = function arrayBufferToString (arrayBuffer, callback) {
    var blob = this.arrayBufferToBlob(arrayBuffer);
    this.blobToText(blob, callback);
};
/**
 * ArrayBuffer 转换为 对象
 *
 * @param arrayBuffer
 * @param callback
 */
DataTransform.prototype.arrayBufferToObject = function arrayBufferToObject (arrayBuffer, callback) {
    this.arrayBufferToString(arrayBuffer, function (str) {
        var obj = JSON.parse(str);
        callback(obj);
    });
};
DataTransform.prototype.stringToUint8Array = function stringToUint8Array (str) {
    var utf8 = unescape(encodeURIComponent(str));
    var uint8Array = new Uint8Array(utf8.split('').map(function (item) {
        return item.charCodeAt(0);
    }));
    return uint8Array;
};
DataTransform.prototype.uint8ArrayToString = function uint8ArrayToString (arr, callback) {
    // or [].slice.apply(arr)
    // var utf8 = Array.from(arr).map(function (item)
    var utf8 = [].slice.apply(arr).map(function (item) {
        return String.fromCharCode(item);
    }).join('');
    var str = decodeURIComponent(escape(utf8));
    callback(str);
};
/**
 * 数据类型转换
 * TypeArray、ArrayBuffer、Blob、File、DataURL、canvas的相互转换
 * @see http://blog.csdn.net/yinwhm12/article/details/73482904
 */
var dataTransform = new DataTransform();

var MathUtil = function MathUtil() {
    /**
     * 角度转弧度因子
     */
    this.DEG2RAD = Math.PI / 180;
    /**
     * 弧度转角度因子
     */
    this.RAD2DEG = 180 / Math.PI;
    /**
     * 默认精度
     */
    this.PRECISION = 1e-6;
    /**
     * 获取唯一标识符
     * @see http://www.broofa.com/Tools/Math.uuid.htm
     */
    this.uuid = function uuid(length) {
        if ( length === void 0 ) { length = 36; }

        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var id = new Array(length);
        var rnd = 0, r = 0;
        return function generateUUID() {
            for (var i = 0; i < length; i++) {
                if (i === 8 || i === 13 || i === 18 || i === 23) {
                    id[i] = '-';
                }
                else if (i === 14) {
                    id[i] = '4';
                }
                else {
                    if (rnd <= 0x02)
                        { rnd = 0x2000000 + (Math.random() * 0x1000000) | 0; }
                    r = rnd & 0xf;
                    rnd = rnd >> 4;
                    id[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
                }
            }
            return id.join('');
        };
    }();
};
/**
 * （夹紧）计算指定值到区间[edge0 ,edge1]最近的值
 *
 * @param value 指定值
 * @param lowerlimit 区间下界
 * @param upperlimit 区间上界
 */
MathUtil.prototype.clamp = function clamp (value, lowerlimit, upperlimit) {
    if ((value - lowerlimit) * (value - upperlimit) <= 0)
        { return value; }
    if (value < lowerlimit)
        { return lowerlimit < upperlimit ? lowerlimit : upperlimit; }
    return lowerlimit > upperlimit ? lowerlimit : upperlimit;
};
/**
 * 计算欧几里得模（整数模） ((n % m) + m) % m
 *
 * @param n 被除数
 * @param m 除数
 * @see https://en.wikipedia.org/wiki/Modulo_operation
 */
MathUtil.prototype.uclideanModulo = function uclideanModulo (n, m) {
    return ((n % m) + m) % m;
};
/**
 * 使 x 值从区间 <a1, a2> 线性映射到区间 <b1, b2>
 *
 * @param x 第一个区间中值
 * @param a1 第一个区间起始值
 * @param a2 第一个区间终止值
 * @param b1 第二个区间起始值
 * @param b2 第二个区间起始值
 */
MathUtil.prototype.mapLinear = function mapLinear (x, a1, a2, b1, b2) {
    return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
};
/**
 * 线性插值
 *
 * @param start 起始值
 * @param end 终止值
 * @param t 插值系数 [0 ,1]
 *
 * @see https://en.wikipedia.org/wiki/Linear_interpolation
 */
MathUtil.prototype.lerp = function lerp (start, end, t) {
    return (1 - t) * start + t * end;
};
/**
 * 计算平滑值 3x^2 - 2x^3
 *
 * @param x
 * @param min 最小值
 * @param max 最大值
 *
 * @see http://en.wikipedia.org/wiki/Smoothstep
 */
MathUtil.prototype.smoothstep = function smoothstep (x, min, max) {
    if (x <= min)
        { return 0; }
    if (x >= max)
        { return 1; }
    x = (x - min) / (max - min);
    return x * x * (3 - 2 * x);
};
/**
 * 计算平滑值 6x^5 - 15x^4 + 10x^3
 *
 * @param x
 * @param min 最小值
 * @param max 最大值
 */
MathUtil.prototype.smootherstep = function smootherstep (x, min, max) {
    if (x <= min)
        { return 0; }
    if (x >= max)
        { return 1; }
    x = (x - min) / (max - min);
    return x * x * x * (x * (x * 6 - 15) + 10);
};
/**
 * 从<low, high>获取随机整数
 *
 * @param low 区间起始值
 * @param high 区间终止值
 */
MathUtil.prototype.randInt = function randInt (low, high) {
    return low + Math.floor(Math.random() * (high - low + 1));
};
/**
 * 从<low, high>获取随机浮点数
 *
 * @param low 区间起始值
 * @param high 区间终止值
 */
MathUtil.prototype.randFloat = function randFloat (low, high) {
    return low + Math.random() * (high - low);
};
/**
 * 从<-range/2, range/2>获取随机浮点数
 *
 * @param range 范围
 */
MathUtil.prototype.randFloatSpread = function randFloatSpread (range) {
    return range * (0.5 - Math.random());
};
/**
 * 角度转换为弧度
 *
 * @param degrees 角度
 */
MathUtil.prototype.degToRad = function degToRad (degrees) {
    return degrees * this.DEG2RAD;
};
/**
 * 弧度转换为角度
 *
 * @param radians 弧度
 */
MathUtil.prototype.radToDeg = function radToDeg (radians) {
    return radians * this.RAD2DEG;
};
/**
 * 判断指定整数是否为2的幂
 *
 * @param value 整数
 */
MathUtil.prototype.isPowerOfTwo = function isPowerOfTwo (value) {
    return (value & (value - 1)) === 0 && value !== 0;
};
/**
 * 获取离指定整数最近的2的幂
 *
 * @param value 整数
 */
MathUtil.prototype.nearestPowerOfTwo = function nearestPowerOfTwo (value) {
    return Math.pow(2, Math.round(Math.log(value) / Math.LN2));
};
/**
 * 获取指定大于等于整数最小2的幂，3->4,5->8,17->32,33->64
 *
 * @param value 整数
 */
MathUtil.prototype.nextPowerOfTwo = function nextPowerOfTwo (value) {
    value--;
    value |= value >> 1;
    value |= value >> 2;
    value |= value >> 4;
    value |= value >> 8;
    value |= value >> 16;
    value++;
    return value;
};
/**
 * 获取目标最近的值
 *
 * source增加或者减少整数倍precision后得到离target最近的值
 *
 * ```
 * Math.toRound(71,0,5);//运算结果为1
 * ```
 *
 * @param source 初始值
 * @param target 目标值
 * @param precision 精度
 */
MathUtil.prototype.toRound = function toRound (source, target, precision) {
        if ( precision === void 0 ) { precision = 360; }

    return source + Math.round((target - source) / precision) * precision;
};
/**
 * 比较两个Number是否相等
 *
 * @param a 数字a
 * @param b 数字b
 * @param precision 进度
 */
MathUtil.prototype.equals = function equals (a, b, precision) {
    if (precision == undefined)
        { precision = this.PRECISION; }
    return Math.abs(a - b) < precision;
};
/**
 * 计算最大公约数
 *
 * @param a 整数a
 * @param b 整数b
 *
 * @see https://en.wikipedia.org/wiki/Greatest_common_divisor
 */
MathUtil.prototype.gcd = function gcd (a, b) {
    if (b)
        { while ((a %= b) && (b %= a))
            { } }
    return a + b;
};
/**
 * 计算最小公倍数
 * Least common multiple
 *
 * @param a 整数a
 * @param b 整数b
 *
 * @see https://en.wikipedia.org/wiki/Least_common_multiple
 */
MathUtil.prototype.lcm = function lcm (a, b) {
    return a * b / this.gcd(a, b);
};
var mathUtil = new MathUtil();

var lazy = {
    getvalue: function (lazyItem) {
        if (typeof lazyItem == "function")
            { return lazyItem(); }
        return lazyItem;
    }
};

/**
 * 用于是否为文件夹
 */
var directorytoken = "!!!___directory___!!!";
/**
 * 索引数据文件系统
 */
var IndexedDBFS = function IndexedDBFS(DBname, projectname) {
    if ( DBname === void 0 ) DBname = "feng3d-editor";
    if ( projectname === void 0 ) projectname = "testproject";

    this.DBname = DBname;
    this.projectname = projectname;
};

var prototypeAccessors = { type: { configurable: true } };
prototypeAccessors.type.get = function () {
    return FSType.indexedDB;
};
/**
 * 读取文件
 * @param path 路径
 * @param callback 读取完成回调 当err不为null时表示读取失败
 */
IndexedDBFS.prototype.readArrayBuffer = function readArrayBuffer (path, callback) {
    _indexedDB.objectStoreGet(this.DBname, this.projectname, path, function (err, data) {
        if (err) {
            callback(err, data);
            return;
        }
        if (data instanceof ArrayBuffer) {
            callback(null, data);
        }
        else if (data instanceof Object) {
            var str = JSON.stringify(data, null, '\t').replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');
            var arraybuffer = dataTransform.stringToArrayBuffer(str);
            callback(null, arraybuffer);
        }
        else {
            var arraybuffer = dataTransform.stringToArrayBuffer(data);
            callback(null, arraybuffer);
        }
    });
};
/**
 * 读取文件
 * @param path 路径
 * @param callback 读取完成回调 当err不为null时表示读取失败
 */
IndexedDBFS.prototype.readString = function readString (path, callback) {
    _indexedDB.objectStoreGet(this.DBname, this.projectname, path, function (err, data) {
        if (err) {
            callback(err, data);
            return;
        }
        if (data instanceof ArrayBuffer) {
            dataTransform.arrayBufferToString(data, function (str) {
                callback(null, str);
            });
        }
        else if (data instanceof Object) {
            var str = JSON.stringify(data, null, '\t').replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');
            callback(null, str);
        }
        else {
            callback(null, data);
        }
    });
};
/**
 * 读取文件
 * @param path 路径
 * @param callback 读取完成回调 当err不为null时表示读取失败
 */
IndexedDBFS.prototype.readObject = function readObject (path, callback) {
    _indexedDB.objectStoreGet(this.DBname, this.projectname, path, function (err, data) {
        if (err) {
            callback(err, data);
            return;
        }
        if (data instanceof ArrayBuffer) {
            dataTransform.arrayBufferToString(data, function (str) {
                var obj = JSON.parse(str);
                callback(null, obj);
            });
        }
        else if (data instanceof Object) {
            callback(null, data);
        }
        else {
            console.assert(typeof data == "string");
            var obj = JSON.parse(data);
            callback(null, obj);
        }
    });
};
/**
 * 加载图片
 * @param path 图片路径
 * @param callback 加载完成回调
 */
IndexedDBFS.prototype.readImage = function readImage (path, callback) {
    this.readArrayBuffer(path, function (err, data) {
        if (err) {
            callback(err, null);
            return;
        }
        dataTransform.arrayBufferToImage(data, function (img) {
            callback(null, img);
        });
    });
};
/**
 * 获取文件绝对路径
 * @param path （相对）路径
 * @param callback 回调函数
 */
IndexedDBFS.prototype.getAbsolutePath = function getAbsolutePath (path) {
    return path;
};
/**
 * 是否为文件夹
 *
 * @param path 文件路径
 * @param callback 完成回调
 */
IndexedDBFS.prototype.isDirectory = function isDirectory (path, callback) {
    this.readString(path, function (err, data) {
        callback(data == directorytoken);
    });
};
/**
 * 文件是否存在
 * @param path 文件路径
 * @param callback 回调函数
 */
IndexedDBFS.prototype.exists = function exists (path, callback) {
    _indexedDB.objectStoreGet(this.DBname, this.projectname, path, function (err, data) {
        callback(!!data);
    });
};
/**
 * 读取文件夹中文件列表
 * @param path 路径
 * @param callback 回调函数
 */
IndexedDBFS.prototype.readdir = function readdir (path, callback) {
    _indexedDB.getAllKeys(this.DBname, this.projectname, function (err, allfilepaths) {
        if (!allfilepaths) {
            callback(err, null);
            return;
        }
        var subfilemap = {};
        allfilepaths.forEach(function (element) {
            var dirp = path == "" ? path : (path + "/");
            if (element.substr(0, dirp.length) == dirp && element != path) {
                var result = element.substr(dirp.length);
                var subfile = result.split("/").shift();
                subfilemap[subfile] = 1;
            }
        });
        var files = Object.keys(subfilemap);
        callback(null, files);
    });
};
/**
 * 新建文件夹
 * @param path 文件夹路径
 * @param callback 回调函数
 */
IndexedDBFS.prototype.mkdir = function mkdir (path, callback) {
        var this$1 = this;

    this.exists(path, function (exists) {
        if (exists) {
            callback(new Error(("文件夹" + path + "已存在无法新建")));
            return;
        }
        _indexedDB.objectStorePut(this$1.DBname, this$1.projectname, path, directorytoken, callback);
    });
};
/**
 * 删除文件
 * @param path 文件路径
 * @param callback 回调函数
 */
IndexedDBFS.prototype.deleteFile = function deleteFile (path, callback) {
    // 删除文件
    _indexedDB.objectStoreDelete(this.DBname, this.projectname, path, callback);
    globalEmitter.emit("fs.delete", path);
};
/**
 * 写文件
 * @param path 文件路径
 * @param data 文件数据
 * @param callback 回调函数
 */
IndexedDBFS.prototype.writeArrayBuffer = function writeArrayBuffer (path, data, callback) {
    _indexedDB.objectStorePut(this.DBname, this.projectname, path, data, callback);
    globalEmitter.emit("fs.write", path);
};
/**
 * 写文件
 * @param path 文件路径
 * @param data 文件数据
 * @param callback 回调函数
 */
IndexedDBFS.prototype.writeString = function writeString (path, data, callback) {
    _indexedDB.objectStorePut(this.DBname, this.projectname, path, data, callback);
    globalEmitter.emit("fs.write", path);
};
/**
 * 写文件
 * @param path 文件路径
 * @param object 文件数据
 * @param callback 回调函数
 */
IndexedDBFS.prototype.writeObject = function writeObject (path, object, callback) {
    _indexedDB.objectStorePut(this.DBname, this.projectname, path, object, callback);
    globalEmitter.emit("fs.write", path);
};
/**
 * 写图片
 * @param path 图片路径
 * @param image 图片
 * @param callback 回调函数
 */
IndexedDBFS.prototype.writeImage = function writeImage (path, image, callback) {
        var this$1 = this;

    dataTransform.imageToArrayBuffer(image, function (arraybuffer) {
        this$1.writeArrayBuffer(path, arraybuffer, callback);
        globalEmitter.emit("fs.write", path);
    });
};
/**
 * 复制文件
 * @param src源路径
 * @param dest目标路径
 * @param callback 回调函数
 */
IndexedDBFS.prototype.copyFile = function copyFile (src, dest, callback) {
        var this$1 = this;

    _indexedDB.objectStoreGet(this.DBname, this.projectname, src, function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        _indexedDB.objectStorePut(this$1.DBname, this$1.projectname, dest, data, callback);
    });
};
/**
 * 是否存在指定项目
 * @param projectname 项目名称
 * @param callback 回调函数
 */
IndexedDBFS.prototype.hasProject = function hasProject (projectname, callback) {
    _indexedDB.getObjectStoreNames(this.DBname, function (err, objectStoreNames) {
        if (err) {
            callback(false);
            return;
        }
        callback(objectStoreNames.indexOf(projectname) != -1);
    });
};
/**
 * 初始化项目
 * @param projectname 项目名称
 * @param callback 回调函数
 */
IndexedDBFS.prototype.initproject = function initproject (projectname, callback) {
    this.projectname = projectname;
    _indexedDB.createObjectStore(this.DBname, projectname, callback);
};

Object.defineProperties( IndexedDBFS.prototype, prototypeAccessors );
/**
 * 索引数据文件系统
 */
var indexedDBFS = new IndexedDBFS();

/**
 * 路径工具
 */
var PathUtils = function PathUtils () {};

PathUtils.prototype.normalizeDir = function normalizeDir (path) {
    if (path[path.length - 1] == "/")
        { path = path.substr(0, path.length - 1); }
    return path;
};
/**
 * 是否为HTTP地址
 *
 * @param path 地址
 */
PathUtils.prototype.isHttpURL = function isHttpURL (path) {
    if (path.indexOf("http://") != -1 || path.indexOf("https://") != -1 || path.indexOf("file:///") != -1)
        { return true; }
    return false;
};
/**
 * 获取不带后缀名称
 * @param path 路径
 */
PathUtils.prototype.getName = function getName (path) {
    console.assert(path != undefined);
    var name = this.basename(path);
    if (this.isDirectory(path))
        { return name; }
    name = name.split(".").shift();
    return name;
};
/**
 * 获取带后缀名称
 * @param path 路径
 */
PathUtils.prototype.basename = function basename (path) {
    console.assert(path != undefined);
    var paths = path.split("/");
    var name = paths.pop();
    if (name == "")
        { name = paths.pop(); }
    return name;
};
/**
 * 获取后缀
 * @param path 路径
 */
PathUtils.prototype.extname = function extname (path) {
    console.assert(path != undefined);
    var name = this.basename(path);
    var index = name.indexOf(".");
    if (index == -1)
        { return ""; }
    return name.substr(index);
};
/**
 * 父路径
 * @param path 路径
 */
PathUtils.prototype.dirname = function dirname (path) {
    console.assert(path != undefined);
    var paths = path.split("/");
    if (this.isDirectory(path))
        { paths.pop(); }
    paths.pop();
    return paths.join("/");
};
/**
 * 获取子文件（非文件夹）路径
 *
 * @param parentPath 父文件夹路径
 * @param childName 子文件名称
 */
PathUtils.prototype.getChildFilePath = function getChildFilePath (parentPath, childName) {
    console.assert(parentPath != undefined);
    console.assert(childName != undefined);
    if (parentPath.charAt(parentPath.length - 1) != "/")
        { parentPath += "/"; }
    return parentPath + childName;
};
/**
 * 获取子文件夹路径
 *
 * @param parentPath 父文件夹路径
 * @param childFolderName 子文件夹名称
 */
PathUtils.prototype.getChildFolderPath = function getChildFolderPath (parentPath, childFolderName) {
    if (parentPath.charAt(parentPath.length - 1) != "/")
        { parentPath += "/"; }
    if (childFolderName.charAt(childFolderName.length - 1) != "/")
        { childFolderName += "/"; }
    return parentPath + childFolderName;
};
/**
 * 是否文件夹
 * @param path 路径
 */
PathUtils.prototype.isDirectory = function isDirectory (path) {
    return path.split("/").pop() == "";
};
/**
 * 获取目录深度
 * @param path 路径
 */
PathUtils.prototype.getDirDepth = function getDirDepth (path) {
    var length = path.split("/").length;
    if (this.isDirectory(path))
        { length--; }
    return length - 1;
};
/**
 * 路径工具
 */
var pathUtils = new PathUtils();

/*!
 * @feng3d/task - v0.3.3
 *
 * @feng3d/task is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
/**
 * 任务
 *
 * 处理 异步任务(函数)串联并联执行功能
 */
var Task = function Task () {};

Task.prototype.parallel = function parallel (fns) {
    var result = function (callback) {
        if (fns.length == 0) {
            callback();
            return;
        }
        var index = 0;
        fns.forEach(function (fn) {
            var callbackNum = 0;
            fn(function () {
                callbackNum++;
                if (callbackNum == 1) {
                    index++;
                    if (index == fns.length) {
                        callback();
                    }
                }
                else {
                    console.warn(((fn.name ? "函数" + fn.name : "匿名函数") + " 多次调用回调函数，当前次数 " + callbackNum));
                }
            });
        });
    };
    return result;
};
/**
 * 串联多个异步函数为一个函数
 *
 * 这些异步函数按顺序依次执行，等待前一个异步函数执行完调用回调后才执行下一个异步函数。
 *
 * @param fns 一组异步函数
 */
Task.prototype.series = function series (fns) {
    var result = function (callback) {
        if (fns.length == 0) {
            callback();
            return;
        }
        var index = 0;
        var next = function () {
            var fn = fns[index];
            var callbackNum = 0;
            fn(function () {
                callbackNum++;
                if (callbackNum == 1) {
                    index++;
                    if (index < fns.length) {
                        next();
                    }
                    else {
                        callback && callback();
                    }
                }
                else {
                    console.warn(((fn.name ? "函数" + fn.name : "匿名函数") + " 多次调用回调函数，当前次数 " + callbackNum));
                }
            });
        };
        next();
    };
    return result;
};
/**
 * 创建一组并行同类任务，例如同时加载一组资源，并在回调中返回结果数组
 *
 * @param ps 一组参数
 * @param fn 单一任务函数
 * @param done 完成回调
 */
Task.prototype.parallelResults = function parallelResults (ps, fn, done) {
    var map = new Map();
    // 包装函数
    var fns = ps.map(function (p) { return function (callback) {
        fn(p, function (r) {
            map.set(p, r);
            callback();
        });
    }; });
    this.parallel(fns)(function () {
        var results = ps.map(function (p) {
            return map.get(p);
        });
        map.clear();
        done(results);
    });
};
/**
 * 创建一组串联同类任务，例如排序加载一组资源
 *
 * @param ps 一组参数
 * @param fn 单一任务函数
 * @param done 完成回调
 */
Task.prototype.seriesResults = function seriesResults (ps, fn, done) {
    var map = new Map();
    // 包装函数
    var fns = ps.map(function (p) { return function (callback) {
        fn(p, function (r) {
            map.set(p, r);
            callback();
        });
    }; });
    this.series(fns)(function () {
        var results = ps.map(function (p) {
            return map.get(p);
        });
        map.clear();
        done(results);
    });
};
/**
 * 任务，用于处理任务之间依赖
 */
var task = new Task();

/**
 * 可读文件系统
 */
var ReadFS = function ReadFS(fs) {
    this._images = {};
    this._state = {};
    this.fs = fs;
};

var prototypeAccessors$1 = { fs: { configurable: true },type: { configurable: true } };
/**
 * 基础文件系统
 */
prototypeAccessors$1.fs.get = function () { return this._fs || basefs; };
prototypeAccessors$1.fs.set = function (v) { this._fs = v; };
/**
 * 文件系统类型
 */
prototypeAccessors$1.type.get = function () {
    return this.fs.type;
};
/**
 * 读取文件为ArrayBuffer
 * @param path 路径
 * @param callback 读取完成回调 当err不为null时表示读取失败
 */
ReadFS.prototype.readArrayBuffer = function readArrayBuffer (path, callback) {
    this.fs.readArrayBuffer(path, callback);
};
/**
 * 读取文件为字符串
 * @param path 路径
 * @param callback 读取完成回调 当err不为null时表示读取失败
 */
ReadFS.prototype.readString = function readString (path, callback) {
    this.fs.readString(path, callback);
};
/**
 * 读取文件为Object
 * @param path 路径
 * @param callback 读取完成回调 当err不为null时表示读取失败
 */
ReadFS.prototype.readObject = function readObject (path, callback) {
    this.fs.readObject(path, callback);
};
/**
 * 加载图片
 * @param path 图片路径
 * @param callback 加载完成回调
 */
ReadFS.prototype.readImage = function readImage (path, callback) {
    this.fs.readImage(path, callback);
    // functionwrap.wrapF(this.fs, this.fs.readImage, [path], callback);
};
/**
 * 获取文件绝对路径
 * @param path （相对）路径
 */
ReadFS.prototype.getAbsolutePath = function getAbsolutePath (path) {
    return this.fs.getAbsolutePath(path);
};
/**
 * 读取文件列表为字符串列表
 *
 * @param path 路径
 * @param callback 读取完成回调 当err不为null时表示读取失败
 */
ReadFS.prototype.readStrings = function readStrings (paths, callback) {
        var this$1 = this;

    task.parallelResults(paths, function (path, callback) {
        this$1.readString(path, function (err, str) {
            callback(err || str);
        });
    }, callback);
};

Object.defineProperties( ReadFS.prototype, prototypeAccessors$1 );
/**
 * 默认文件系统
 */
var fs = new ReadFS();

/**
 * 可读写文件系统
 *
 * 扩展基础可读写文件系统
 */
var ReadWriteFS = /*@__PURE__*/(function (ReadFS) {
    function ReadWriteFS(fs) {
        ReadFS.call(this, fs);
    }

    if ( ReadFS ) ReadWriteFS.__proto__ = ReadFS;
    ReadWriteFS.prototype = Object.create( ReadFS && ReadFS.prototype );
    ReadWriteFS.prototype.constructor = ReadWriteFS;

    var prototypeAccessors = { fs: { configurable: true } };
    prototypeAccessors.fs.get = function () {
        return this._fs;
    };
    prototypeAccessors.fs.set = function (value) {
        this._fs = value;
    };
    /**
     * 文件是否存在
     * @param path 文件路径
     * @param callback 回调函数
     */
    ReadWriteFS.prototype.exists = function exists (path, callback) {
        this.fs.exists(path, callback);
    };
    /**
     * 读取文件夹中文件列表
     * @param path 路径
     * @param callback 回调函数
     */
    ReadWriteFS.prototype.readdir = function readdir (path, callback) {
        this.fs.readdir(path, callback);
    };
    /**
     * 新建文件夹
     * @param path 文件夹路径
     * @param callback 回调函数
     */
    ReadWriteFS.prototype.mkdir = function mkdir (path, callback) {
        var this$1 = this;

        path = pathUtils.normalizeDir(path);
        this.fs.exists(path, function (exists) {
            if (exists) {
                callback && callback(null);
                return;
            }
            this$1.fs.mkdir(path, callback);
        });
    };
    /**
     * 删除文件
     * @param path 文件路径
     * @param callback 回调函数
     */
    ReadWriteFS.prototype.deleteFile = function deleteFile (path, callback) {
        this.fs.deleteFile(path, callback);
    };
    /**
     * 写(新建)文件
     * 自动根据文件类型保存为对应结构
     *
     * @param path 文件路径
     * @param arraybuffer 文件数据
     * @param callback 回调函数
     */
    ReadWriteFS.prototype.writeFile = function writeFile (path, arraybuffer, callback) {
        var this$1 = this;

        var ext = pathUtils.extname(path);
        ext = ext.split(".").pop();
        var fileTypedic = { "meta": "txt", "json": "object", "jpg": "arraybuffer", "png": "arraybuffer", "mp3": "arraybuffer", "js": "txt", "ts": "txt", "map": "txt", "html": "txt" };
        var type = fileTypedic[ext];
        if (path == "tsconfig.json" || path == ".vscode/settings.json")
            { type = "txt"; }
        if (type == "txt") {
            dataTransform.arrayBufferToString(arraybuffer, function (str) {
                this$1.fs.writeString(path, str, function (err) {
                    callback(err);
                });
            });
        }
        else if (type == "object") {
            dataTransform.arrayBufferToObject(arraybuffer, function (obj) {
                this$1.fs.writeObject(path, obj, function (err) {
                    callback(err);
                });
            });
        }
        else if (type == "arraybuffer") {
            this.writeArrayBuffer(path, arraybuffer, function (err) {
                callback(err);
            });
        }
        else {
            console.error(("无法导入文件 " + path));
        }
    };
    /**
     * 写ArrayBuffer(新建)文件
     * @param path 文件路径
     * @param arraybuffer 文件数据
     * @param callback 回调函数
     */
    ReadWriteFS.prototype.writeArrayBuffer = function writeArrayBuffer (path, arraybuffer, callback) {
        var this$1 = this;

        // 如果所属文件夹不存在则新建
        var dirpath = pathUtils.dirname(path);
        this.mkdir(dirpath, function (err) {
            if (err) {
                callback && callback(err);
                return;
            }
            this$1.fs.writeArrayBuffer(path, arraybuffer, callback);
        });
    };
    /**
     * 写字符串到(新建)文件
     * @param path 文件路径
     * @param str 文件数据
     * @param callback 回调函数
     */
    ReadWriteFS.prototype.writeString = function writeString (path, str, callback) {
        var this$1 = this;

        // 如果所属文件夹不存在则新建
        var dirpath = pathUtils.dirname(path);
        this.mkdir(dirpath, function (err) {
            if (err) {
                callback && callback(err);
                return;
            }
            this$1.fs.writeString(path, str, callback);
        });
    };
    /**
     * 写Object到(新建)文件
     * @param path 文件路径
     * @param object 文件数据
     * @param callback 回调函数
     */
    ReadWriteFS.prototype.writeObject = function writeObject (path, object, callback) {
        var this$1 = this;

        // 如果所属文件夹不存在则新建
        var dirpath = pathUtils.dirname(path);
        this.mkdir(dirpath, function (err) {
            if (err) {
                callback && callback(err);
                return;
            }
            this$1.fs.writeObject(path, object, callback);
        });
    };
    /**
     * 写图片
     * @param path 图片路径
     * @param image 图片
     * @param callback 回调函数
     */
    ReadWriteFS.prototype.writeImage = function writeImage (path, image, callback) {
        var this$1 = this;

        // 如果所属文件夹不存在则新建
        var dirpath = pathUtils.dirname(path);
        this.mkdir(dirpath, function (err) {
            if (err) {
                callback && callback(err);
                return;
            }
            this$1.fs.writeImage(path, image, callback);
        });
    };
    /**
     * 复制文件
     * @param src    源路径
     * @param dest    目标路径
     * @param callback 回调函数
     */
    ReadWriteFS.prototype.copyFile = function copyFile (src, dest, callback) {
        this.fs.copyFile(src, dest, callback);
    };
    /**
     * 是否为文件夹
     *
     * @param path 文件路径
     * @param callback 完成回调
     */
    ReadWriteFS.prototype.isDirectory = function isDirectory (path, callback) {
        this.fs.isDirectory(path, callback);
    };
    /**
     * 初始化项目
     * @param projectname 项目名称
     * @param callback 回调函数
     */
    ReadWriteFS.prototype.initproject = function initproject (projectname, callback) {
        this.fs.initproject(projectname, callback);
    };
    /**
     * 是否存在指定项目
     * @param projectname 项目名称
     * @param callback 回调函数
     */
    ReadWriteFS.prototype.hasProject = function hasProject (projectname, callback) {
        this.fs.hasProject(projectname, callback);
    };
    /**
     * 获取指定文件下所有文件路径列表
     */
    ReadWriteFS.prototype.getAllPathsInFolder = function getAllPathsInFolder (dirpath, callback) {
        var this$1 = this;
        if ( dirpath === void 0 ) dirpath = "";

        var dirs = [dirpath];
        var result = [];
        var currentdir = "";
        // 递归获取文件
        var handle = function () {
            if (dirs.length > 0) {
                currentdir = dirs.shift();
                this$1.readdir(currentdir, function (err, files) {
                    // 获取子文件路径
                    var getChildPath = function () {
                        if (files.length == 0) {
                            handle();
                            return;
                        }
                        var childpath = currentdir + (currentdir == "" ? "" : "/") + files.shift();
                        result.push(childpath);
                        this$1.isDirectory(childpath, function (result) {
                            if (result)
                                { dirs.push(childpath); }
                            getChildPath();
                        });
                    };
                    getChildPath();
                });
            }
            else {
                callback(null, result);
            }
        };
        handle();
    };
    /**
     * 移动文件
     * @param src 源路径
     * @param dest 目标路径
     * @param callback 回调函数
     */
    ReadWriteFS.prototype.moveFile = function moveFile (src, dest, callback) {
        var this$1 = this;

        this.copyFile(src, dest, function (err) {
            if (err) {
                callback && callback(err);
                return;
            }
            this$1.deleteFile(src, callback);
        });
    };
    /**
     * 重命名文件
     * @param oldPath 老路径
     * @param newPath 新路径
     * @param callback 回调函数
     */
    ReadWriteFS.prototype.renameFile = function renameFile (oldPath, newPath, callback) {
        this.moveFile(oldPath, newPath, callback);
    };
    /**
     * 移动一组文件
     * @param movelists 移动列表
     * @param callback 回调函数
     */
    ReadWriteFS.prototype.moveFiles = function moveFiles (movelists, callback) {
        var this$1 = this;

        this.copyFiles(movelists.concat(), function (err) {
            if (err) {
                callback && callback(err);
                return;
            }
            var deletelists = movelists.reduce(function (value, current) { value.push(current[0]); return value; }, []);
            this$1.deleteFiles(deletelists, callback);
        });
    };
    /**
     * 复制一组文件
     * @param copylists 复制列表
     * @param callback 回调函数
     */
    ReadWriteFS.prototype.copyFiles = function copyFiles (copylists, callback) {
        var this$1 = this;

        if (copylists.length > 0) {
            var copyitem = copylists.shift();
            this.copyFile(copyitem[0], copyitem[1], function (err) {
                if (err) {
                    callback && callback(err);
                    return;
                }
                this$1.copyFiles(copylists, callback);
            });
            return;
        }
        callback && callback(null);
    };
    /**
     * 删除一组文件
     * @param deletelists 删除列表
     * @param callback 回调函数
     */
    ReadWriteFS.prototype.deleteFiles = function deleteFiles (deletelists, callback) {
        var this$1 = this;

        if (deletelists.length > 0) {
            this.deleteFile(deletelists.shift(), function (err) {
                if (err) {
                    callback && callback(err);
                    return;
                }
                this$1.deleteFiles(deletelists, callback);
            });
            return;
        }
        callback && callback(null);
    };
    /**
     * 重命名文件(夹)
     * @param oldPath 老路径
     * @param newPath 新路径
     * @param callback 回调函数
     */
    ReadWriteFS.prototype.rename = function rename (oldPath, newPath, callback) {
        var this$1 = this;

        this.isDirectory(oldPath, function (result) {
            if (result) {
                this$1.getAllPathsInFolder(oldPath, function (err, filepaths) {
                    if (err) {
                        callback && callback(err);
                        return;
                    }
                    var renamelists = [[oldPath, newPath]];
                    filepaths.forEach(function (element) {
                        renamelists.push([element, element.replace(oldPath, newPath)]);
                    });
                    this$1.moveFiles(renamelists, callback);
                });
            }
            else {
                this$1.renameFile(oldPath, newPath, callback);
            }
        });
    };
    /**
     * 移动文件(夹)
     *
     * @param src 源路径
     * @param dest 目标路径
     * @param callback 回调函数
     */
    ReadWriteFS.prototype.move = function move (src, dest, callback) {
        this.rename(src, dest, callback);
    };
    /**
     * 删除文件(夹)
     * @param path 路径
     * @param callback 回调函数
     */
    ReadWriteFS.prototype.delete = function delete$1 (path, callback) {
        var this$1 = this;

        this.isDirectory(path, function (result) {
            if (result) {
                this$1.getAllPathsInFolder(path, function (err, filepaths) {
                    if (err) {
                        callback && callback(err);
                        return;
                    }
                    var removelists = filepaths.concat(path);
                    this$1.deleteFiles(removelists, callback);
                });
            }
            else {
                this$1.deleteFile(path, callback);
            }
        });
    };

    Object.defineProperties( ReadWriteFS.prototype, prototypeAccessors );

    return ReadWriteFS;
}(ReadFS));

export { FSType, HttpFS, Loader, LoaderDataFormat, PathUtils, ReadFS, ReadWriteFS, _IndexedDB, _indexedDB, fs, indexedDBFS, loader, pathUtils };
//# sourceMappingURL=index.mjs.map
