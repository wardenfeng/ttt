var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var feng3d;
(function (feng3d) {
    /**
     * 路径工具
     */
    var PathUtils = /** @class */ (function () {
        function PathUtils() {
        }
        /**
         * 标准化文件夹路径
         * @param path
         */
        PathUtils.prototype.normalizeDir = function (path) {
            if (path[path.length - 1] == "/")
                path = path.substr(0, path.length - 1);
            return path;
        };
        /**
         * 是否为HTTP地址
         *
         * @param path 地址
         */
        PathUtils.prototype.isHttpURL = function (path) {
            if (path.indexOf("http://") != -1 || path.indexOf("https://") != -1 || path.indexOf("file:///") != -1)
                return true;
            return false;
        };
        /**
         * 获取不带后缀名称
         * @param path 路径
         */
        PathUtils.prototype.getName = function (path) {
            console.assert(path != undefined);
            var name = this.basename(path);
            if (this.isDirectory(path))
                return name;
            name = name.split(".").shift();
            return name;
        };
        /**
         * 获取带后缀名称
         * @param path 路径
         */
        PathUtils.prototype.basename = function (path) {
            console.assert(path != undefined);
            var paths = path.split("/");
            var name = paths.pop();
            if (name == "")
                name = paths.pop();
            return name;
        };
        /**
         * 获取后缀
         * @param path 路径
         */
        PathUtils.prototype.extname = function (path) {
            console.assert(path != undefined);
            var name = this.basename(path);
            var index = name.indexOf(".");
            if (index == -1)
                return "";
            return name.substr(index);
        };
        /**
         * 父路径
         * @param path 路径
         */
        PathUtils.prototype.dirname = function (path) {
            console.assert(path != undefined);
            var paths = path.split("/");
            if (this.isDirectory(path))
                paths.pop();
            paths.pop();
            return paths.join("/");
        };
        /**
         * 获取子文件（非文件夹）路径
         *
         * @param parentPath 父文件夹路径
         * @param childName 子文件名称
         */
        PathUtils.prototype.getChildFilePath = function (parentPath, childName) {
            console.assert(parentPath != undefined);
            console.assert(childName != undefined);
            if (parentPath.charAt(parentPath.length - 1) != "/")
                parentPath += "/";
            return parentPath + childName;
        };
        /**
         * 获取子文件夹路径
         *
         * @param parentPath 父文件夹路径
         * @param childFolderName 子文件夹名称
         */
        PathUtils.prototype.getChildFolderPath = function (parentPath, childFolderName) {
            if (parentPath.charAt(parentPath.length - 1) != "/")
                parentPath += "/";
            if (childFolderName.charAt(childFolderName.length - 1) != "/")
                childFolderName += "/";
            return parentPath + childFolderName;
        };
        /**
         * 是否文件夹
         * @param path 路径
         */
        PathUtils.prototype.isDirectory = function (path) {
            return path.split("/").pop() == "";
        };
        /**
         * 获取目录深度
         * @param path 路径
         */
        PathUtils.prototype.getDirDepth = function (path) {
            var length = path.split("/").length;
            if (this.isDirectory(path))
                length--;
            return length - 1;
        };
        return PathUtils;
    }());
    feng3d.PathUtils = PathUtils;
    feng3d.pathUtils = new PathUtils();
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 加载类
     */
    var Loader = /** @class */ (function () {
        function Loader() {
        }
        /**
         * 加载文本
         * @param url   路径
         */
        Loader.prototype.loadText = function (url, onCompleted, onRequestProgress, onError) {
            xmlHttpRequestLoad({ url: url, dataFormat: feng3d.LoaderDataFormat.TEXT, onCompleted: onCompleted, onProgress: onRequestProgress, onError: onError });
        };
        /**
         * 加载二进制
         * @param url   路径
         */
        Loader.prototype.loadBinary = function (url, onCompleted, onRequestProgress, onError) {
            xmlHttpRequestLoad({ url: url, dataFormat: feng3d.LoaderDataFormat.BINARY, onCompleted: onCompleted, onProgress: onRequestProgress, onError: onError });
        };
        /**
         * 加载图片
         * @param url   路径
         */
        Loader.prototype.loadImage = function (url, onCompleted, onRequestProgress, onError) {
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
        return Loader;
    }());
    feng3d.Loader = Loader;
    feng3d.loader = new Loader();
    /**
     * 使用XMLHttpRequest加载
     * @param url           加载路径
     * @param dataFormat    数据类型
     */
    function xmlHttpRequestLoad(loadItem) {
        var request = new XMLHttpRequest();
        request.open('Get', loadItem.url, true);
        request.setRequestHeader("Access-Control-Allow-Origin", "*");
        request.responseType = loadItem.dataFormat == feng3d.LoaderDataFormat.BINARY ? "arraybuffer" : "";
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
                    var content = loadItem.dataFormat == feng3d.LoaderDataFormat.TEXT ? request.responseText : request.response;
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
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
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
    })(LoaderDataFormat = feng3d.LoaderDataFormat || (feng3d.LoaderDataFormat = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var databases = {};
    /**
     *
     */
    var _IndexedDB = /** @class */ (function () {
        function _IndexedDB() {
            /**
             * 数据库状态
             */
            this._dbStatus = {};
        }
        /**
         * 是否支持 indexedDB
         */
        _IndexedDB.prototype.support = function () {
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
        _IndexedDB.prototype.getDatabase = function (dbname, callback) {
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
        _IndexedDB.prototype._open = function (dbname, callback, upgrade, onupgrade) {
            var _this = this;
            if (upgrade === void 0) { upgrade = false; }
            if (!this._dbStatus[dbname])
                this._dbStatus[dbname] = { status: DBStatus.unOpen, onsuccessCallbacks: [], onupgradeneededCallbacks: [] };
            this._dbStatus[dbname].onsuccessCallbacks.push(callback);
            if (upgrade) {
                console.assert(!!onupgrade);
                this._dbStatus[dbname].onupgradeneededCallbacks.push(onupgrade);
            }
            if (this._dbStatus[dbname].status == DBStatus.opening || this._dbStatus[dbname].status == DBStatus.upgrading)
                return;
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
                var callbacks = _this._dbStatus[dbname].onupgradeneededCallbacks.concat();
                _this._dbStatus[dbname].onupgradeneededCallbacks.length = 0;
                callbacks.forEach(function (element) {
                    element(newdatabase);
                });
            };
            request.onsuccess = function (event) {
                databases[dbname] = event.target["result"];
                request.onsuccess = null;
                _this._dbStatus[dbname].status = DBStatus.opened;
                var callbacks = _this._dbStatus[dbname].onsuccessCallbacks.concat();
                _this._dbStatus[dbname].onsuccessCallbacks.length = 0;
                callbacks.forEach(function (element) {
                    element(null, databases[dbname]);
                });
            };
            request.onerror = function (event) {
                request.onerror = null;
                _this._dbStatus[dbname].status = DBStatus.error;
                var callbacks = _this._dbStatus[dbname].onsuccessCallbacks.concat();
                _this._dbStatus[dbname].onsuccessCallbacks.length = 0;
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
        _IndexedDB.prototype.deleteDatabase = function (dbname, callback) {
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
        _IndexedDB.prototype.hasObjectStore = function (dbname, objectStroreName, callback) {
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
        _IndexedDB.prototype.getObjectStoreNames = function (dbname, callback) {
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
        _IndexedDB.prototype.createObjectStore = function (dbname, objectStroreName, callback) {
            var _this = this;
            this.getDatabase(dbname, function (err, database) {
                if (database.objectStoreNames.contains(objectStroreName)) {
                    callback && callback(null);
                    return;
                }
                _this._open(dbname, callback, true, function (newdatabase) {
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
        _IndexedDB.prototype.deleteObjectStore = function (dbname, objectStroreName, callback) {
            var _this = this;
            this.getDatabase(dbname, function (err, database) {
                if (!database.objectStoreNames.contains(objectStroreName)) {
                    callback && callback(null);
                    return;
                }
                _this._open(dbname, callback, true, function (newdatabase) {
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
        _IndexedDB.prototype.getAllKeys = function (dbname, objectStroreName, callback) {
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
        _IndexedDB.prototype.objectStoreGet = function (dbname, objectStroreName, key, callback) {
            this.getDatabase(dbname, function (err, database) {
                var transaction = database.transaction([objectStroreName], 'readwrite');
                var objectStore = transaction.objectStore(objectStroreName);
                var request = objectStore.get(key);
                request.onsuccess = function (event) {
                    var result = event.target["result"];
                    callback && callback(result != null ? null : new Error("\u6CA1\u6709\u627E\u5230\u8D44\u6E90 " + key), result);
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
        _IndexedDB.prototype.objectStorePut = function (dbname, objectStroreName, key, data, callback) {
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
        _IndexedDB.prototype.objectStoreDelete = function (dbname, objectStroreName, key, callback) {
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
        _IndexedDB.prototype.objectStoreClear = function (dbname, objectStroreName, callback) {
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
        return _IndexedDB;
    }());
    feng3d._IndexedDB = _IndexedDB;
    feng3d._indexedDB = new _IndexedDB();
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
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 文件系统类型
     */
    var FSType;
    (function (FSType) {
        FSType["http"] = "http";
        FSType["native"] = "native";
        FSType["indexedDB"] = "indexedDB";
    })(FSType = feng3d.FSType || (feng3d.FSType = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 可读文件系统
     */
    var ReadFS = /** @class */ (function () {
        function ReadFS(fs) {
            this._images = {};
            this._state = {};
            this.fs = fs;
        }
        Object.defineProperty(ReadFS.prototype, "fs", {
            /**
             * 基础文件系统
             */
            get: function () { return this._fs || feng3d.basefs; },
            set: function (v) { this._fs = v; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ReadFS.prototype, "type", {
            /**
             * 文件系统类型
             */
            get: function () { return this.fs.type; },
            enumerable: false,
            configurable: true
        });
        /**
         * 读取文件为ArrayBuffer
         * @param path 路径
         * @param callback 读取完成回调 当err不为null时表示读取失败
         */
        ReadFS.prototype.readArrayBuffer = function (path, callback) {
            this.fs.readArrayBuffer(path, callback);
        };
        /**
         * 读取文件为字符串
         * @param path 路径
         * @param callback 读取完成回调 当err不为null时表示读取失败
         */
        ReadFS.prototype.readString = function (path, callback) {
            this.fs.readString(path, callback);
        };
        /**
         * 读取文件为Object
         * @param path 路径
         * @param callback 读取完成回调 当err不为null时表示读取失败
         */
        ReadFS.prototype.readObject = function (path, callback) {
            this.fs.readObject(path, callback);
        };
        /**
         * 加载图片
         * @param path 图片路径
         * @param callback 加载完成回调
         */
        ReadFS.prototype.readImage = function (path, callback) {
            this.fs.readImage(path, callback);
            // functionwrap.wrapF(this.fs, this.fs.readImage, [path], callback);
        };
        /**
         * 获取文件绝对路径
         * @param path （相对）路径
         */
        ReadFS.prototype.getAbsolutePath = function (path) {
            return this.fs.getAbsolutePath(path);
        };
        /**
         * 读取文件列表为字符串列表
         *
         * @param path 路径
         * @param callback 读取完成回调 当err不为null时表示读取失败
         */
        ReadFS.prototype.readStrings = function (paths, callback) {
            var _this = this;
            feng3d.task.parallelResults(paths, function (path, callback) {
                _this.readString(path, function (err, str) {
                    callback(err || str);
                });
            }, callback);
        };
        return ReadFS;
    }());
    feng3d.ReadFS = ReadFS;
    feng3d.fs = new ReadFS();
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 可读写文件系统
     *
     * 扩展基础可读写文件系统
     */
    var ReadWriteFS = /** @class */ (function (_super) {
        __extends(ReadWriteFS, _super);
        function ReadWriteFS(fs) {
            return _super.call(this, fs) || this;
        }
        /**
         * 文件是否存在
         * @param path 文件路径
         * @param callback 回调函数
         */
        ReadWriteFS.prototype.exists = function (path, callback) {
            this.fs.exists(path, callback);
        };
        /**
         * 读取文件夹中文件列表
         * @param path 路径
         * @param callback 回调函数
         */
        ReadWriteFS.prototype.readdir = function (path, callback) {
            this.fs.readdir(path, callback);
        };
        /**
         * 新建文件夹
         * @param path 文件夹路径
         * @param callback 回调函数
         */
        ReadWriteFS.prototype.mkdir = function (path, callback) {
            var _this = this;
            path = feng3d.pathUtils.normalizeDir(path);
            this.fs.exists(path, function (exists) {
                if (exists) {
                    callback && callback(null);
                    return;
                }
                _this.fs.mkdir(path, callback);
            });
        };
        /**
         * 删除文件
         * @param path 文件路径
         * @param callback 回调函数
         */
        ReadWriteFS.prototype.deleteFile = function (path, callback) {
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
        ReadWriteFS.prototype.writeFile = function (path, arraybuffer, callback) {
            var _this = this;
            var ext = feng3d.pathUtils.extname(path);
            ext = ext.split(".").pop();
            var fileTypedic = { "meta": "txt", "json": "object", "jpg": "arraybuffer", "png": "arraybuffer", "mp3": "arraybuffer", "js": "txt", "ts": "txt", "map": "txt", "html": "txt" };
            var type = fileTypedic[ext];
            if (path == "tsconfig.json" || path == ".vscode/settings.json")
                type = "txt";
            if (type == "txt") {
                feng3d.dataTransform.arrayBufferToString(arraybuffer, function (str) {
                    _this.fs.writeString(path, str, function (err) {
                        callback(err);
                    });
                });
            }
            else if (type == "object") {
                feng3d.dataTransform.arrayBufferToObject(arraybuffer, function (obj) {
                    _this.fs.writeObject(path, obj, function (err) {
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
                console.error("\u65E0\u6CD5\u5BFC\u5165\u6587\u4EF6 " + path);
            }
        };
        /**
         * 写ArrayBuffer(新建)文件
         * @param path 文件路径
         * @param arraybuffer 文件数据
         * @param callback 回调函数
         */
        ReadWriteFS.prototype.writeArrayBuffer = function (path, arraybuffer, callback) {
            var _this = this;
            // 如果所属文件夹不存在则新建
            var dirpath = feng3d.pathUtils.dirname(path);
            this.mkdir(dirpath, function (err) {
                if (err) {
                    callback && callback(err);
                    return;
                }
                _this.fs.writeArrayBuffer(path, arraybuffer, callback);
            });
        };
        /**
         * 写字符串到(新建)文件
         * @param path 文件路径
         * @param str 文件数据
         * @param callback 回调函数
         */
        ReadWriteFS.prototype.writeString = function (path, str, callback) {
            var _this = this;
            // 如果所属文件夹不存在则新建
            var dirpath = feng3d.pathUtils.dirname(path);
            this.mkdir(dirpath, function (err) {
                if (err) {
                    callback && callback(err);
                    return;
                }
                _this.fs.writeString(path, str, callback);
            });
        };
        /**
         * 写Object到(新建)文件
         * @param path 文件路径
         * @param object 文件数据
         * @param callback 回调函数
         */
        ReadWriteFS.prototype.writeObject = function (path, object, callback) {
            var _this = this;
            // 如果所属文件夹不存在则新建
            var dirpath = feng3d.pathUtils.dirname(path);
            this.mkdir(dirpath, function (err) {
                if (err) {
                    callback && callback(err);
                    return;
                }
                _this.fs.writeObject(path, object, callback);
            });
        };
        /**
         * 写图片
         * @param path 图片路径
         * @param image 图片
         * @param callback 回调函数
         */
        ReadWriteFS.prototype.writeImage = function (path, image, callback) {
            var _this = this;
            // 如果所属文件夹不存在则新建
            var dirpath = feng3d.pathUtils.dirname(path);
            this.mkdir(dirpath, function (err) {
                if (err) {
                    callback && callback(err);
                    return;
                }
                _this.fs.writeImage(path, image, callback);
            });
        };
        /**
         * 复制文件
         * @param src    源路径
         * @param dest    目标路径
         * @param callback 回调函数
         */
        ReadWriteFS.prototype.copyFile = function (src, dest, callback) {
            this.fs.copyFile(src, dest, callback);
        };
        /**
         * 是否为文件夹
         *
         * @param path 文件路径
         * @param callback 完成回调
         */
        ReadWriteFS.prototype.isDirectory = function (path, callback) {
            this.fs.isDirectory(path, callback);
        };
        /**
         * 初始化项目
         * @param projectname 项目名称
         * @param callback 回调函数
         */
        ReadWriteFS.prototype.initproject = function (projectname, callback) {
            this.fs.initproject(projectname, callback);
        };
        /**
         * 是否存在指定项目
         * @param projectname 项目名称
         * @param callback 回调函数
         */
        ReadWriteFS.prototype.hasProject = function (projectname, callback) {
            this.fs.hasProject(projectname, callback);
        };
        /**
         * 获取指定文件下所有文件路径列表
         */
        ReadWriteFS.prototype.getAllPathsInFolder = function (dirpath, callback) {
            var _this = this;
            if (dirpath === void 0) { dirpath = ""; }
            var dirs = [dirpath];
            var result = [];
            var currentdir = "";
            // 递归获取文件
            var handle = function () {
                if (dirs.length > 0) {
                    currentdir = dirs.shift();
                    _this.readdir(currentdir, function (err, files) {
                        // 获取子文件路径
                        var getChildPath = function () {
                            if (files.length == 0) {
                                handle();
                                return;
                            }
                            var childpath = currentdir + (currentdir == "" ? "" : "/") + files.shift();
                            result.push(childpath);
                            _this.isDirectory(childpath, function (result) {
                                if (result)
                                    dirs.push(childpath);
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
        ReadWriteFS.prototype.moveFile = function (src, dest, callback) {
            var _this = this;
            this.copyFile(src, dest, function (err) {
                if (err) {
                    callback && callback(err);
                    return;
                }
                _this.deleteFile(src, callback);
            });
        };
        /**
         * 重命名文件
         * @param oldPath 老路径
         * @param newPath 新路径
         * @param callback 回调函数
         */
        ReadWriteFS.prototype.renameFile = function (oldPath, newPath, callback) {
            this.moveFile(oldPath, newPath, callback);
        };
        /**
         * 移动一组文件
         * @param movelists 移动列表
         * @param callback 回调函数
         */
        ReadWriteFS.prototype.moveFiles = function (movelists, callback) {
            var _this = this;
            this.copyFiles(movelists.concat(), function (err) {
                if (err) {
                    callback && callback(err);
                    return;
                }
                var deletelists = movelists.reduce(function (value, current) { value.push(current[0]); return value; }, []);
                _this.deleteFiles(deletelists, callback);
            });
        };
        /**
         * 复制一组文件
         * @param copylists 复制列表
         * @param callback 回调函数
         */
        ReadWriteFS.prototype.copyFiles = function (copylists, callback) {
            var _this = this;
            if (copylists.length > 0) {
                var copyitem = copylists.shift();
                this.copyFile(copyitem[0], copyitem[1], function (err) {
                    if (err) {
                        callback && callback(err);
                        return;
                    }
                    _this.copyFiles(copylists, callback);
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
        ReadWriteFS.prototype.deleteFiles = function (deletelists, callback) {
            var _this = this;
            if (deletelists.length > 0) {
                this.deleteFile(deletelists.shift(), function (err) {
                    if (err) {
                        callback && callback(err);
                        return;
                    }
                    _this.deleteFiles(deletelists, callback);
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
        ReadWriteFS.prototype.rename = function (oldPath, newPath, callback) {
            var _this = this;
            this.isDirectory(oldPath, function (result) {
                if (result) {
                    _this.getAllPathsInFolder(oldPath, function (err, filepaths) {
                        if (err) {
                            callback && callback(err);
                            return;
                        }
                        var renamelists = [[oldPath, newPath]];
                        filepaths.forEach(function (element) {
                            renamelists.push([element, element.replace(oldPath, newPath)]);
                        });
                        _this.moveFiles(renamelists, callback);
                    });
                }
                else {
                    _this.renameFile(oldPath, newPath, callback);
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
        ReadWriteFS.prototype.move = function (src, dest, callback) {
            this.rename(src, dest, callback);
        };
        /**
         * 删除文件(夹)
         * @param path 路径
         * @param callback 回调函数
         */
        ReadWriteFS.prototype.delete = function (path, callback) {
            var _this = this;
            this.isDirectory(path, function (result) {
                if (result) {
                    _this.getAllPathsInFolder(path, function (err, filepaths) {
                        if (err) {
                            callback && callback(err);
                            return;
                        }
                        var removelists = filepaths.concat(path);
                        _this.deleteFiles(removelists, callback);
                    });
                }
                else {
                    _this.deleteFile(path, callback);
                }
            });
        };
        return ReadWriteFS;
    }(feng3d.ReadFS));
    feng3d.ReadWriteFS = ReadWriteFS;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 用于是否为文件夹
     */
    var directorytoken = "!!!___directory___!!!";
    /**
     * 索引数据文件系统
     */
    var IndexedDBFS = /** @class */ (function () {
        function IndexedDBFS(DBname, projectname) {
            if (DBname === void 0) { DBname = "feng3d-editor"; }
            if (projectname === void 0) { projectname = "testproject"; }
            this.DBname = DBname;
            this.projectname = projectname;
        }
        Object.defineProperty(IndexedDBFS.prototype, "type", {
            get: function () {
                return feng3d.FSType.indexedDB;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * 读取文件
         * @param path 路径
         * @param callback 读取完成回调 当err不为null时表示读取失败
         */
        IndexedDBFS.prototype.readArrayBuffer = function (path, callback) {
            feng3d._indexedDB.objectStoreGet(this.DBname, this.projectname, path, function (err, data) {
                if (err) {
                    callback(err, data);
                    return;
                }
                if (data instanceof ArrayBuffer) {
                    callback(null, data);
                }
                else if (data instanceof Object) {
                    var str = JSON.stringify(data, null, '\t').replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');
                    var arraybuffer = feng3d.dataTransform.stringToArrayBuffer(str);
                    callback(null, arraybuffer);
                }
                else {
                    var arraybuffer = feng3d.dataTransform.stringToArrayBuffer(data);
                    callback(null, arraybuffer);
                }
            });
        };
        /**
         * 读取文件
         * @param path 路径
         * @param callback 读取完成回调 当err不为null时表示读取失败
         */
        IndexedDBFS.prototype.readString = function (path, callback) {
            feng3d._indexedDB.objectStoreGet(this.DBname, this.projectname, path, function (err, data) {
                if (err) {
                    callback(err, data);
                    return;
                }
                if (data instanceof ArrayBuffer) {
                    feng3d.dataTransform.arrayBufferToString(data, function (str) {
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
        IndexedDBFS.prototype.readObject = function (path, callback) {
            feng3d._indexedDB.objectStoreGet(this.DBname, this.projectname, path, function (err, data) {
                if (err) {
                    callback(err, data);
                    return;
                }
                if (data instanceof ArrayBuffer) {
                    feng3d.dataTransform.arrayBufferToString(data, function (str) {
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
        IndexedDBFS.prototype.readImage = function (path, callback) {
            this.readArrayBuffer(path, function (err, data) {
                if (err) {
                    callback(err, null);
                    return;
                }
                feng3d.dataTransform.arrayBufferToImage(data, function (img) {
                    callback(null, img);
                });
            });
        };
        /**
         * 获取文件绝对路径
         * @param path （相对）路径
         * @param callback 回调函数
         */
        IndexedDBFS.prototype.getAbsolutePath = function (path) {
            return path;
        };
        /**
         * 是否为文件夹
         *
         * @param path 文件路径
         * @param callback 完成回调
         */
        IndexedDBFS.prototype.isDirectory = function (path, callback) {
            this.readString(path, function (err, data) {
                callback(data == directorytoken);
            });
        };
        /**
         * 文件是否存在
         * @param path 文件路径
         * @param callback 回调函数
         */
        IndexedDBFS.prototype.exists = function (path, callback) {
            feng3d._indexedDB.objectStoreGet(this.DBname, this.projectname, path, function (err, data) {
                callback(!!data);
            });
        };
        /**
         * 读取文件夹中文件列表
         * @param path 路径
         * @param callback 回调函数
         */
        IndexedDBFS.prototype.readdir = function (path, callback) {
            feng3d._indexedDB.getAllKeys(this.DBname, this.projectname, function (err, allfilepaths) {
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
        IndexedDBFS.prototype.mkdir = function (path, callback) {
            var _this = this;
            this.exists(path, function (exists) {
                if (exists) {
                    callback(new Error("\u6587\u4EF6\u5939" + path + "\u5DF2\u5B58\u5728\u65E0\u6CD5\u65B0\u5EFA"));
                    return;
                }
                feng3d._indexedDB.objectStorePut(_this.DBname, _this.projectname, path, directorytoken, callback);
            });
        };
        /**
         * 删除文件
         * @param path 文件路径
         * @param callback 回调函数
         */
        IndexedDBFS.prototype.deleteFile = function (path, callback) {
            // 删除文件
            feng3d._indexedDB.objectStoreDelete(this.DBname, this.projectname, path, callback);
            feng3d.globalEmitter.emit("fs.delete", path);
        };
        /**
         * 写文件
         * @param path 文件路径
         * @param data 文件数据
         * @param callback 回调函数
         */
        IndexedDBFS.prototype.writeArrayBuffer = function (path, data, callback) {
            feng3d._indexedDB.objectStorePut(this.DBname, this.projectname, path, data, callback);
            feng3d.globalEmitter.emit("fs.write", path);
        };
        /**
         * 写文件
         * @param path 文件路径
         * @param data 文件数据
         * @param callback 回调函数
         */
        IndexedDBFS.prototype.writeString = function (path, data, callback) {
            feng3d._indexedDB.objectStorePut(this.DBname, this.projectname, path, data, callback);
            feng3d.globalEmitter.emit("fs.write", path);
        };
        /**
         * 写文件
         * @param path 文件路径
         * @param object 文件数据
         * @param callback 回调函数
         */
        IndexedDBFS.prototype.writeObject = function (path, object, callback) {
            feng3d._indexedDB.objectStorePut(this.DBname, this.projectname, path, object, callback);
            feng3d.globalEmitter.emit("fs.write", path);
        };
        /**
         * 写图片
         * @param path 图片路径
         * @param image 图片
         * @param callback 回调函数
         */
        IndexedDBFS.prototype.writeImage = function (path, image, callback) {
            var _this = this;
            feng3d.dataTransform.imageToArrayBuffer(image, function (arraybuffer) {
                _this.writeArrayBuffer(path, arraybuffer, callback);
                feng3d.globalEmitter.emit("fs.write", path);
            });
        };
        /**
         * 复制文件
         * @param src    源路径
         * @param dest    目标路径
         * @param callback 回调函数
         */
        IndexedDBFS.prototype.copyFile = function (src, dest, callback) {
            var _this = this;
            feng3d._indexedDB.objectStoreGet(this.DBname, this.projectname, src, function (err, data) {
                if (err) {
                    callback(err);
                    return;
                }
                feng3d._indexedDB.objectStorePut(_this.DBname, _this.projectname, dest, data, callback);
            });
        };
        /**
         * 是否存在指定项目
         * @param projectname 项目名称
         * @param callback 回调函数
         */
        IndexedDBFS.prototype.hasProject = function (projectname, callback) {
            feng3d._indexedDB.getObjectStoreNames(this.DBname, function (err, objectStoreNames) {
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
        IndexedDBFS.prototype.initproject = function (projectname, callback) {
            this.projectname = projectname;
            feng3d._indexedDB.createObjectStore(this.DBname, projectname, callback);
        };
        return IndexedDBFS;
    }());
    feng3d.IndexedDBFS = IndexedDBFS;
    feng3d.indexedDBFS = new IndexedDBFS();
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * Http可读文件系统
     */
    var HttpFS = /** @class */ (function () {
        function HttpFS(rootPath) {
            if (rootPath === void 0) { rootPath = ""; }
            /**
             * 根路径
             */
            this.rootPath = "";
            this.type = feng3d.FSType.http;
            this.rootPath = rootPath;
            if (this.rootPath == "") {
                if (typeof document != "undefined") {
                    var url = document.URL.split("?").shift();
                    this.rootPath = url.substring(0, url.lastIndexOf("/") + 1);
                }
            }
        }
        /**
         * 读取文件
         * @param path 路径
         * @param callback 读取完成回调 当err不为null时表示读取失败
         */
        HttpFS.prototype.readArrayBuffer = function (path, callback) {
            // rootPath
            feng3d.loader.loadBinary(this.getAbsolutePath(path), function (content) {
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
        HttpFS.prototype.readString = function (path, callback) {
            feng3d.loader.loadText(this.getAbsolutePath(path), function (content) {
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
        HttpFS.prototype.readObject = function (path, callback) {
            feng3d.loader.loadText(this.getAbsolutePath(path), function (content) {
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
        HttpFS.prototype.readImage = function (path, callback) {
            var img = new Image();
            img.onload = function () {
                callback(null, img);
            };
            img.onerror = function (evt) {
                callback(new Error("\u52A0\u8F7D\u56FE\u7247" + path + "\u5931\u8D25"), null);
            };
            img.src = this.getAbsolutePath(path);
        };
        /**
         * 获取文件绝对路径
         * @param path （相对）路径
         * @param callback 回调函数
         */
        HttpFS.prototype.getAbsolutePath = function (path) {
            return this.rootPath + path;
        };
        return HttpFS;
    }());
    feng3d.HttpFS = HttpFS;
    feng3d.basefs = new HttpFS();
})(feng3d || (feng3d = {}));
//# sourceMappingURL=index.js.map