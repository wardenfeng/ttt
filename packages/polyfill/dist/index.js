var feng3d;
(function (feng3d) {
    feng3d.lazy = {
        getvalue: function (lazyItem) {
            if (typeof lazyItem == "function")
                return lazyItem();
            return lazyItem;
        }
    };
})(feng3d || (feng3d = {}));
Object.isBaseType = function (object) {
    //基础类型
    if (object == undefined
        || object == null
        || typeof object == "boolean"
        || typeof object == "string"
        || typeof object == "number")
        return true;
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
        return false;
    if (data.get && !data.set)
        return false;
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
        property = property.split(".");
    var value = object;
    var len = property.length;
    for (var i = 0; i < property.length; i++) {
        if (value == null)
            return undefined;
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
        return true;
    if (Object.isBaseType(a) || Object.isBaseType(b))
        return a == b;
    if (typeof a == "function" || typeof b == "function")
        return a == b;
    //
    var akeys = Object.keys(a);
    var bkeys = Object.keys(b);
    if (!Array.equal(akeys, bkeys))
        return false;
    if (Array.isArray(a) && Array.isArray(b))
        return a.length == b.length;
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
        return target;
    var keys = Object.keys(source);
    keys.forEach(function (k) {
        target[k] = source[k];
    });
    return target;
};
Object.assignDeep = function (target, source, replacers, deep) {
    if (replacers === void 0) { replacers = []; }
    if (deep === void 0) { deep = Number.MAX_SAFE_INTEGER; }
    if (source == null)
        return target;
    if (deep < 1)
        return target;
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
            return true;
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
    },
];
var feng3d;
(function (feng3d) {
    feng3d.__class__ = "__class__";
    /**
     * 类工具
     */
    var ClassUtils = /** @class */ (function () {
        function ClassUtils() {
            this.classUtilsHandlers = [];
            this.defaultInstMap = {};
        }
        /**
         * 返回对象的完全限定类名。
         * @param value 需要完全限定类名称的对象，可以将任何 JavaScript 值传递给此方法，包括所有可用的 JavaScript 类型、对象实例、原始类型
         * （如number)和类对象
         * @returns 包含完全限定类名称的字符串。
         */
        ClassUtils.prototype.getQualifiedClassName = function (value) {
            if (value == null)
                return "null";
            var classUtilsHandlers = feng3d.classUtils.classUtilsHandlers;
            if (classUtilsHandlers) {
                classUtilsHandlers.forEach(function (element) {
                    element(value);
                });
            }
            var prototype = value.prototype ? value.prototype : Object.getPrototypeOf(value);
            if (prototype.hasOwnProperty(feng3d.__class__))
                return prototype[feng3d.__class__];
            var className = prototype.constructor.name;
            if (_global[className] == prototype.constructor)
                return className;
            //在可能的命名空间内查找
            for (var i = 0; i < _classNameSpaces.length; i++) {
                var tryClassName = _classNameSpaces[i] + "." + className;
                if (this.getDefinitionByName(tryClassName) == prototype.constructor) {
                    className = tryClassName;
                    registerClass(prototype.constructor, className);
                    return className;
                }
            }
            console.warn("\u672A\u5728\u7ED9\u51FA\u7684\u547D\u540D\u7A7A\u95F4 " + _classNameSpaces + " \u5185\u627E\u5230 " + value + "-" + className + " \u7684\u5B9A\u4E49");
            return className;
        };
        /**
         * 返回 name 参数指定的类的类对象引用。
         * @param name 类的名称。
         */
        ClassUtils.prototype.getDefinitionByName = function (name, readCache) {
            if (readCache === void 0) { readCache = true; }
            if (name == "null")
                return null;
            if (!name)
                return null;
            if (_global[name])
                return _global[name];
            if (readCache && _definitionCache[name])
                return _definitionCache[name];
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
        ClassUtils.prototype.getDefaultInstanceByName = function (name) {
            if (name === undefined) {
                return null;
            }
            var defaultInst = this.defaultInstMap[name];
            if (defaultInst)
                return defaultInst;
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
        ClassUtils.prototype.getInstanceByName = function (name) {
            var cls = this.getDefinitionByName(name);
            console.assert(cls, "\u65E0\u6CD5\u83B7\u53D6\u540D\u79F0\u4E3A " + name + " \u7684\u5B9E\u4F8B!");
            var instance = this.getInstanceByDefinition(cls);
            return instance;
        };
        ClassUtils.prototype.getInstanceByDefinition = function (cls) {
            console.assert(cls);
            if (!cls)
                return undefined;
            if (cls["__create__"]) {
                return cls["__create__"]();
            }
            return new cls();
        };
        /**
         * 新增反射对象所在的命名空间，使得getQualifiedClassName能够得到正确的结果
         */
        ClassUtils.prototype.addClassNameSpace = function (namespace) {
            if (_classNameSpaces.indexOf(namespace) == -1) {
                _classNameSpaces.push(namespace);
            }
        };
        return ClassUtils;
    }());
    feng3d.ClassUtils = ClassUtils;
    ;
    feng3d.classUtils = new ClassUtils();
    var _definitionCache = {};
    var _global;
    var global;
    if (typeof window != "undefined") {
        _global = window;
    }
    else if (typeof global != "undefined") {
        _global = global;
    }
    var _classNameSpaces = ["feng3d"];
    /**
     * 为一个类定义注册完全限定类名
     * @param classDefinition 类定义
     * @param className 完全限定类名
     */
    function registerClass(classDefinition, className) {
        var prototype = classDefinition.prototype;
        Object.defineProperty(prototype, feng3d.__class__, { value: className, writable: true, enumerable: false });
    }
    feng3d.registerClass = registerClass;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 数据类型转换
     * TypeArray、ArrayBuffer、Blob、File、DataURL、canvas的相互转换
     * @see http://blog.csdn.net/yinwhm12/article/details/73482904
     */
    var DataTransform = /** @class */ (function () {
        function DataTransform() {
        }
        /**
         * Blob to ArrayBuffer
         */
        DataTransform.prototype.blobToArrayBuffer = function (blob, callback) {
            var reader = new FileReader();
            reader.onload = function (e) {
                callback(e.target["result"]);
            };
            reader.readAsArrayBuffer(blob);
        };
        /**
         * ArrayBuffer to Blob
         */
        DataTransform.prototype.arrayBufferToBlob = function (arrayBuffer) {
            var blob = new Blob([arrayBuffer]); // 注意必须包裹[]
            return blob;
        };
        /**
         * ArrayBuffer to Uint8
         * Uint8数组可以直观的看到ArrayBuffer中每个字节（1字节 == 8位）的值。一般我们要将ArrayBuffer转成Uint类型数组后才能对其中的字节进行存取操作。
         */
        DataTransform.prototype.arrayBufferToUint8 = function (arrayBuffer) {
            var u8 = new Uint8Array(arrayBuffer);
            return u8;
        };
        /**
         * Uint8 to ArrayBuffer
         * 我们Uint8数组可以直观的看到ArrayBuffer中每个字节（1字节 == 8位）的值。一般我们要将ArrayBuffer转成Uint类型数组后才能对其中的字节进行存取操作。
         */
        DataTransform.prototype.uint8ToArrayBuffer = function (uint8Array) {
            var buffer = uint8Array.buffer;
            return buffer;
        };
        /**
         * Array to ArrayBuffer
         * @param array 例如：[0x15, 0xFF, 0x01, 0x00, 0x34, 0xAB, 0x11];
         */
        DataTransform.prototype.arrayToArrayBuffer = function (array) {
            var uint8 = new Uint8Array(array);
            var buffer = uint8.buffer;
            return buffer;
        };
        /**
         * TypeArray to Array
         */
        DataTransform.prototype.uint8ArrayToArray = function (u8a) {
            var arr = [];
            for (var i = 0; i < u8a.length; i++) {
                arr.push(u8a[i]);
            }
            return arr;
        };
        /**
         * canvas转换为dataURL
         */
        DataTransform.prototype.canvasToDataURL = function (canvas, type, quality) {
            if (type === void 0) { type = "png"; }
            if (quality === void 0) { quality = 1; }
            if (type == "png")
                return canvas.toDataURL("image/png");
            return canvas.toDataURL("image/jpeg", quality);
        };
        /**
         * canvas转换为图片
         */
        DataTransform.prototype.canvasToImage = function (canvas, type, quality, callback) {
            if (type === void 0) { type = "png"; }
            if (quality === void 0) { quality = 1; }
            var dataURL = this.canvasToDataURL(canvas, type, quality);
            this.dataURLToImage(dataURL, callback);
        };
        /**
         * File、Blob对象转换为dataURL
         * File对象也是一个Blob对象，二者的处理相同。
         */
        DataTransform.prototype.blobToDataURL = function (blob, callback) {
            var a = new FileReader();
            a.onload = function (e) {
                callback(e.target["result"]);
            };
            a.readAsDataURL(blob);
        };
        /**
         * dataURL转换为Blob对象
         */
        DataTransform.prototype.dataURLtoBlob = function (dataurl) {
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
        DataTransform.prototype.dataURLDrawCanvas = function (dataurl, canvas, callback) {
            this.dataURLToImage(dataurl, function (img) {
                // canvas.drawImage(img);
                callback(img);
            });
        };
        DataTransform.prototype.dataURLToArrayBuffer = function (dataurl, callback) {
            var blob = this.dataURLtoBlob(dataurl);
            this.blobToArrayBuffer(blob, callback);
        };
        DataTransform.prototype.arrayBufferToDataURL = function (arrayBuffer, callback) {
            var blob = this.arrayBufferToBlob(arrayBuffer);
            this.blobToDataURL(blob, callback);
        };
        DataTransform.prototype.dataURLToImage = function (dataurl, callback) {
            var img = new Image();
            img.onload = function () {
                callback(img);
            };
            img.src = dataurl;
        };
        DataTransform.prototype.imageToDataURL = function (img, quality) {
            if (quality === void 0) { quality = 1; }
            var canvas = this.imageToCanvas(img);
            var dataurl = this.canvasToDataURL(canvas, "png", quality);
            return dataurl;
        };
        DataTransform.prototype.imageToCanvas = function (img) {
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctxt = canvas.getContext('2d');
            ctxt.drawImage(img, 0, 0);
            return canvas;
        };
        DataTransform.prototype.imageToArrayBuffer = function (img, callback) {
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
        DataTransform.prototype.imageDataToDataURL = function (imageData, quality) {
            if (quality === void 0) { quality = 1; }
            var canvas = this.imageDataToCanvas(imageData);
            var dataurl = this.canvasToDataURL(canvas, "png", quality);
            return dataurl;
        };
        DataTransform.prototype.imageDataToCanvas = function (imageData) {
            var canvas = document.createElement("canvas");
            canvas.width = imageData.width;
            canvas.height = imageData.height;
            var ctxt = canvas.getContext('2d');
            ctxt.putImageData(imageData, 0, 0);
            return canvas;
        };
        DataTransform.prototype.imagedataToImage = function (imageData, quality, callback) {
            if (quality === void 0) { quality = 1; }
            var dataUrl = this.imageDataToDataURL(imageData, quality);
            this.dataURLToImage(dataUrl, callback);
        };
        DataTransform.prototype.arrayBufferToImage = function (arrayBuffer, callback) {
            var _this = this;
            if (arrayBuffer["image"]) {
                callback(arrayBuffer["image"]);
                return;
            }
            this.arrayBufferToDataURL(arrayBuffer, function (dataurl) {
                _this.dataURLToImage(dataurl, function (img) {
                    img["arraybuffer"] = arrayBuffer;
                    arrayBuffer["image"] = img;
                    callback(img);
                });
            });
        };
        DataTransform.prototype.blobToText = function (blob, callback) {
            var a = new FileReader();
            a.onload = function (e) { callback(e.target["result"]); };
            a.readAsText(blob);
        };
        DataTransform.prototype.stringToArrayBuffer = function (str) {
            var uint8Array = this.stringToUint8Array(str);
            var buffer = this.uint8ToArrayBuffer(uint8Array);
            return buffer;
        };
        DataTransform.prototype.arrayBufferToString = function (arrayBuffer, callback) {
            var blob = this.arrayBufferToBlob(arrayBuffer);
            this.blobToText(blob, callback);
        };
        /**
         * ArrayBuffer 转换为 对象
         *
         * @param arrayBuffer
         * @param callback
         */
        DataTransform.prototype.arrayBufferToObject = function (arrayBuffer, callback) {
            this.arrayBufferToString(arrayBuffer, function (str) {
                var obj = JSON.parse(str);
                callback(obj);
            });
        };
        DataTransform.prototype.stringToUint8Array = function (str) {
            var utf8 = unescape(encodeURIComponent(str));
            var uint8Array = new Uint8Array(utf8.split('').map(function (item) {
                return item.charCodeAt(0);
            }));
            return uint8Array;
        };
        DataTransform.prototype.uint8ArrayToString = function (arr, callback) {
            // or [].slice.apply(arr)
            // var utf8 = Array.from(arr).map(function (item)
            var utf8 = [].slice.apply(arr).map(function (item) {
                return String.fromCharCode(item);
            }).join('');
            var str = decodeURIComponent(escape(utf8));
            callback(str);
        };
        return DataTransform;
    }());
    feng3d.DataTransform = DataTransform;
    feng3d.dataTransform = new DataTransform();
})(feng3d || (feng3d = {}));
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
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, "includes", {
        configurable: true,
        enumerable: false,
        value: function (searchElement, fromIndex) {
            for (var i = fromIndex, n = this.length; i < n; i++) {
                if (searchElement == this[i])
                    return true;
            }
            return false;
        },
        writable: true,
    });
}
Array.equal = function (self, arr) {
    if (self.length != arr.length)
        return false;
    var keys = Object.keys(arr);
    for (var i = 0, n = keys.length; i < n; i++) {
        var key = keys[i];
        if (self[key] != arr[key])
            return false;
    }
    return true;
};
Array.concatToSelf = function (self) {
    var items = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        items[_i - 1] = arguments[_i];
    }
    var arr = [];
    items.forEach(function (v) { return arr = arr.concat(v); });
    arr.forEach(function (v) { return self.push(v); });
    return self;
};
Array.unique = function (arr, compare) {
    if (compare === void 0) { compare = function (a, b) { return a == b; }; }
    var keys = Object.keys(arr);
    var ids = keys.map(function (v) { return Number(v); }).filter(function (v) { return !isNaN(v); });
    var deleteMap = {};
    //
    for (var i = 0, n = ids.length; i < n; i++) {
        var ki = ids[i];
        if (deleteMap[ki])
            continue;
        for (var j = i + 1; j < n; j++) {
            var kj = ids[j];
            if (compare(arr[ki], arr[kj]))
                deleteMap[kj] = true;
        }
    }
    //
    for (var i = ids.length - 1; i >= 0; i--) {
        var id = ids[i];
        if (deleteMap[id])
            arr.splice(id, 1);
    }
    return arr;
};
/**
 * 数组元素是否唯一
 * @param equalFn 比较函数
 */
Array.isUnique = function (array, compare) {
    if (compare === void 0) { compare = function (a, b) { return a == b; }; }
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
        arr.splice(index, 1);
    return index;
};
Array.replace = function (arr, a, b, isAdd) {
    if (isAdd === void 0) { isAdd = true; }
    var isreplace = false;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == a) {
            arr[i] = b;
            isreplace = true;
            break;
        }
    }
    if (!isreplace && isAdd)
        arr.push(b);
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
        return insert;
    return -1;
};
Array.binarySearchInsert = function (array, target, compare, start, end) {
    if (start === undefined)
        start = 0;
    if (end === undefined)
        end = array.length;
    if (start == end)
        return start;
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
Math.DEG2RAD = Math.PI / 180;
Math.RAD2DEG = 180 / Math.PI;
Math.PRECISION = 1e-6;
/**
 * 获取唯一标识符
 * @see http://www.broofa.com/Tools/Math.uuid.htm
 */
Math.uuid = Math.uuid || function (length) {
    if (length === void 0) { length = 36; }
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
                    rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
                r = rnd & 0xf;
                rnd = rnd >> 4;
                id[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
            }
        }
        return id.join('');
    };
}();
/**
 * （夹紧）计算指定值到区间[edge0 ,edge1]最近的值
 *
 * @param value 指定值
 * @param lowerlimit 区间下界
 * @param upperlimit 区间上界
 */
Math.clamp = Math.clamp || function (value, lowerlimit, upperlimit) {
    if ((value - lowerlimit) * (value - upperlimit) <= 0)
        return value;
    if (value < lowerlimit)
        return lowerlimit < upperlimit ? lowerlimit : upperlimit;
    return lowerlimit > upperlimit ? lowerlimit : upperlimit;
};
/**
 * 计算欧几里得模（整数模） ((n % m) + m) % m
 *
 * @param n 被除数
 * @param m 除数
 * @see https://en.wikipedia.org/wiki/Modulo_operation
 */
Math.euclideanModulo = Math.euclideanModulo || function (n, m) {
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
Math.mapLinear = Math.mapLinear || function (x, a1, a2, b1, b2) {
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
Math.lerp = Math.lerp || function (start, end, t) {
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
Math.smoothstep = Math.smoothstep || function (x, min, max) {
    if (x <= min)
        return 0;
    if (x >= max)
        return 1;
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
Math.smootherstep = Math.smootherstep || function (x, min, max) {
    if (x <= min)
        return 0;
    if (x >= max)
        return 1;
    x = (x - min) / (max - min);
    return x * x * x * (x * (x * 6 - 15) + 10);
};
/**
 * 从<low, high>获取随机整数
 *
 * @param low 区间起始值
 * @param high 区间终止值
 */
Math.randInt = Math.randInt || function (low, high) {
    return low + Math.floor(Math.random() * (high - low + 1));
};
/**
 * 从<low, high>获取随机浮点数
 *
 * @param low 区间起始值
 * @param high 区间终止值
 */
Math.randFloat = Math.randFloat || function (low, high) {
    return low + Math.random() * (high - low);
};
/**
 * 从<-range/2, range/2>获取随机浮点数
 *
 * @param range 范围
 */
Math.randFloatSpread = Math.randFloatSpread || function (range) {
    return range * (0.5 - Math.random());
};
/**
 * 角度转换为弧度
 *
 * @param degrees 角度
 */
Math.degToRad = Math.degToRad || function (degrees) {
    return degrees * Math.DEG2RAD;
};
/**
 * 弧度转换为角度
 *
 * @param radians 弧度
 */
Math.radToDeg = Math.radToDeg || function (radians) {
    return radians * Math.RAD2DEG;
};
/**
 * 判断指定整数是否为2的幂
 *
 * @param value 整数
 */
Math.isPowerOfTwo = Math.isPowerOfTwo || function (value) {
    return (value & (value - 1)) === 0 && value !== 0;
};
/**
 * 获取离指定整数最近的2的幂
 *
 * @param value 整数
 */
Math.nearestPowerOfTwo = Math.nearestPowerOfTwo || function (value) {
    return Math.pow(2, Math.round(Math.log(value) / Math.LN2));
};
/**
 * 获取指定大于等于整数最小2的幂，3->4,5->8,17->32,33->64
 *
 * @param value 整数
 */
Math.nextPowerOfTwo = Math.nextPowerOfTwo || function (value) {
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
Math.toRound = Math.toRound || function (source, target, precision) {
    if (precision === void 0) { precision = 360; }
    return source + Math.round((target - source) / precision) * precision;
};
/**
 * 比较两个Number是否相等
 *
 * @param a 数字a
 * @param b 数字b
 * @param precision 进度
 */
Math.equals = Math.equals || function (a, b, precision) {
    if (precision == undefined)
        precision = Math.PRECISION;
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
Math.gcd = Math.gcd || function (a, b) {
    if (b)
        while ((a %= b) && (b %= a))
            ;
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
Math.lcm = Math.lcm || function (a, b) {
    return a * b / Math.gcd(a, b);
};
//# sourceMappingURL=index.js.map