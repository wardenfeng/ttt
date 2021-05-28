/*!
 * @feng3d/filesystem - v0.3.3
 *
 * @feng3d/filesystem is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
this.feng3d = this.feng3d || {};
var feng3d = (function (exports, event, polyfill, task) {
    'use strict';

    /**
     * 加载数据类型
     */
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
    })(exports.LoaderDataFormat || (exports.LoaderDataFormat = {}));

    /**
     * 加载类
     */
    var Loader = function Loader () {};

    Loader.prototype.loadText = function loadText (url, onCompleted, onRequestProgress, onError) {
        xmlHttpRequestLoad({ url: url, dataFormat: exports.LoaderDataFormat.TEXT, onCompleted: onCompleted, onProgress: onRequestProgress, onError: onError });
    };
    /**
     * 加载二进制
     * @param url   路径
     */
    Loader.prototype.loadBinary = function loadBinary (url, onCompleted, onRequestProgress, onError) {
        xmlHttpRequestLoad({ url: url, dataFormat: exports.LoaderDataFormat.BINARY, onCompleted: onCompleted, onProgress: onRequestProgress, onError: onError });
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
        request.responseType = loadItem.dataFormat == exports.LoaderDataFormat.BINARY ? "arraybuffer" : "";
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
                    var content = loadItem.dataFormat == exports.LoaderDataFormat.TEXT ? request.responseText : request.response;
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
    (function (FSType) {
        FSType["http"] = "http";
        FSType["native"] = "native";
        FSType["indexedDB"] = "indexedDB";
    })(exports.FSType || (exports.FSType = {}));

    /**
     * Http可读文件系统
     */
    var HttpFS = function HttpFS(rootPath) {
        if ( rootPath === void 0 ) rootPath = "";

        /**
         * 根路径
         */
        this.rootPath = "";
        this.type = exports.FSType.http;
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
        return exports.FSType.indexedDB;
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
                var arraybuffer = polyfill.dataTransform.stringToArrayBuffer(str);
                callback(null, arraybuffer);
            }
            else {
                var arraybuffer = polyfill.dataTransform.stringToArrayBuffer(data);
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
                polyfill.dataTransform.arrayBufferToString(data, function (str) {
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
                polyfill.dataTransform.arrayBufferToString(data, function (str) {
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
            polyfill.dataTransform.arrayBufferToImage(data, function (img) {
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
        event.globalEmitter.emit("fs.delete", path);
    };
    /**
     * 写文件
     * @param path 文件路径
     * @param data 文件数据
     * @param callback 回调函数
     */
    IndexedDBFS.prototype.writeArrayBuffer = function writeArrayBuffer (path, data, callback) {
        _indexedDB.objectStorePut(this.DBname, this.projectname, path, data, callback);
        event.globalEmitter.emit("fs.write", path);
    };
    /**
     * 写文件
     * @param path 文件路径
     * @param data 文件数据
     * @param callback 回调函数
     */
    IndexedDBFS.prototype.writeString = function writeString (path, data, callback) {
        _indexedDB.objectStorePut(this.DBname, this.projectname, path, data, callback);
        event.globalEmitter.emit("fs.write", path);
    };
    /**
     * 写文件
     * @param path 文件路径
     * @param object 文件数据
     * @param callback 回调函数
     */
    IndexedDBFS.prototype.writeObject = function writeObject (path, object, callback) {
        _indexedDB.objectStorePut(this.DBname, this.projectname, path, object, callback);
        event.globalEmitter.emit("fs.write", path);
    };
    /**
     * 写图片
     * @param path 图片路径
     * @param image 图片
     * @param callback 回调函数
     */
    IndexedDBFS.prototype.writeImage = function writeImage (path, image, callback) {
            var this$1 = this;

        polyfill.dataTransform.imageToArrayBuffer(image, function (arraybuffer) {
            this$1.writeArrayBuffer(path, arraybuffer, callback);
            event.globalEmitter.emit("fs.write", path);
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

        task.task.parallelResults(paths, function (path, callback) {
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
                polyfill.dataTransform.arrayBufferToString(arraybuffer, function (str) {
                    this$1.fs.writeString(path, str, function (err) {
                        callback(err);
                    });
                });
            }
            else if (type == "object") {
                polyfill.dataTransform.arrayBufferToObject(arraybuffer, function (obj) {
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

    exports.HttpFS = HttpFS;
    exports.Loader = Loader;
    exports.PathUtils = PathUtils;
    exports.ReadFS = ReadFS;
    exports.ReadWriteFS = ReadWriteFS;
    exports._IndexedDB = _IndexedDB;
    exports._indexedDB = _indexedDB;
    exports.fs = fs;
    exports.indexedDBFS = indexedDBFS;
    exports.loader = loader;
    exports.pathUtils = pathUtils;

    return exports;

}({}, feng3d, feng3d, feng3d));
Object.assign(this.feng3d, _feng_d_filesystem);
//# sourceMappingURL=index.js.map
