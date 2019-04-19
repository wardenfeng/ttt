namespace feng3d
{
    /**
     * 索引数据文件系统
     */
    export var indexedDBFS: IndexedDBFS;

    /**
     * 用于是否为文件夹
     */
    const directorytoken = "!!!___directory___!!!";

    /**
     * 索引数据文件系统
     */
    export class IndexedDBFS extends ReadWriteFS
    {
        get type()
        {
            return FSType.indexedDB;
        }

        /**
         * 数据库名称
         */
        DBname: string;

        /**
         * 项目名称（表单名称）
         */
        projectname: string;

        constructor(DBname = "feng3d-editor", projectname = "testproject")
        {
            super();
            this.DBname = DBname;
            this.projectname = projectname;
        }

        /**
         * 读取文件
         * @param path 路径
         * @param callback 读取完成回调 当err不为null时表示读取失败
         */
        readArrayBuffer(path: string, callback: (err: Error, data: ArrayBuffer) => void)
        {
            _indexedDB.objectStoreGet(this.DBname, this.projectname, path, (err, data) =>
            {
                if (err)
                {
                    callback(err, data);
                    return;
                }
                if (data instanceof ArrayBuffer)
                {
                    callback(null, data);
                } else if (data instanceof Object)
                {
                    var str = JSON.stringify(data, null, '\t').replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1')
                    var arraybuffer = dataTransform.stringToArrayBuffer(str);
                    callback(null, arraybuffer);
                } else
                {
                    var arraybuffer = dataTransform.stringToArrayBuffer(data);
                    callback(null, arraybuffer);
                }
            });
        }

        /**
         * 读取文件
         * @param path 路径
         * @param callback 读取完成回调 当err不为null时表示读取失败
         */
        readString(path: string, callback: (err: Error, data: string) => void)
        {
            _indexedDB.objectStoreGet(this.DBname, this.projectname, path, (err, data) =>
            {
                if (err)
                {
                    callback(err, data);
                    return;
                }
                if (data instanceof ArrayBuffer)
                {
                    dataTransform.arrayBufferToString(data, (str) =>
                    {
                        callback(null, str);
                    });
                } else if (data instanceof Object)
                {
                    var str = JSON.stringify(data, null, '\t').replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1')
                    callback(null, str);
                } else
                {
                    callback(null, data);
                }
            });
        }

        /**
         * 读取文件
         * @param path 路径
         * @param callback 读取完成回调 当err不为null时表示读取失败
         */
        readObject(path: string, callback: (err: Error, data: object) => void)
        {
            _indexedDB.objectStoreGet(this.DBname, this.projectname, path, (err, data) =>
            {
                if (err)
                {
                    callback(err, data);
                    return;
                }
                if (data instanceof ArrayBuffer)
                {
                    dataTransform.arrayBufferToString(data, (str) =>
                    {
                        var obj = JSON.parse(str);
                        callback(null, obj);
                    });
                } else if (data instanceof Object)
                {
                    callback(null, data);
                } else
                {
                    debuger && console.assert(typeof data == "string");
                    var obj = JSON.parse(data);
                    callback(null, obj);
                }
            });
        }

        /**
         * 加载图片
         * @param path 图片路径
         * @param callback 加载完成回调
         */
        readImage(path: string, callback: (err: Error, img: HTMLImageElement) => void)
        {
            if (this._images[path]) return this._images[path];

            this.readArrayBuffer(path, (err, data) =>
            {
                if (err)
                {
                    callback(err, null);
                    return;
                }
                dataTransform.arrayBufferToImage(data, (img) =>
                {
                    this._images[path] = img;
                    callback(null, img);
                });
            });
        }

        /**
         * 获取文件绝对路径
         * @param path （相对）路径
         * @param callback 回调函数
         */
        getAbsolutePath(path: string)
        {
            return path;
        }

        /**
         * 是否为文件夹
         *
         * @param path 文件路径
         * @param callback 完成回调
         */
        isDirectory(path: string, callback: (result: boolean) => void)
        {
            this.readString(path, (err, data) =>
            {
                callback(data == directorytoken);
            });
        }

        /**
         * 文件是否存在
         * @param path 文件路径
         * @param callback 回调函数
         */
        exists(path: string, callback: (exists: boolean) => void): void
        {
            _indexedDB.objectStoreGet(this.DBname, this.projectname, path, (err, data) =>
            {
                callback(!!data);
            });
        }

        /**
         * 读取文件夹中文件列表
         * @param path 路径
         * @param callback 回调函数
         */
        readdir(path: string, callback: (err: Error, files: string[]) => void): void
        {
            this.getAllPaths((err, allfilepaths) =>
            {
                if (!allfilepaths)
                {
                    callback(err, null);
                    return;
                }
                var subfilemap = {};
                allfilepaths.forEach(element =>
                {
                    var dirp = path == "" ? path : (path + "/");
                    if (element.substr(0, dirp.length) == dirp && element != path)
                    {
                        var result = element.substr(dirp.length);
                        var subfile = result.split("/").shift();
                        subfilemap[subfile] = 1;
                    }
                });
                var files = Object.keys(subfilemap);
                callback(null, files);
            });
        }

        /**
         * 新建文件夹
         * @param path 文件夹路径
         * @param callback 回调函数
         */
        mkdir(path: string, callback?: (err: Error) => void): void
        {
            this.exists(path, (exists) =>
            {
                if (exists)
                {
                    callback(new Error(`文件夹${path}已存在无法新建`));
                    return;
                }
                _indexedDB.objectStorePut(this.DBname, this.projectname, path, directorytoken, callback);
            });
        }

        /**
         * 删除文件
         * @param path 文件路径
         * @param callback 回调函数
         */
        deleteFile(path: string, callback: (err: Error) => void)
        {
            // 删除文件
            _indexedDB.objectStoreDelete(this.DBname, this.projectname, path, callback);
            dispatcher.dispatch("fs.delete", path);
        }

        /**
         * 写文件
         * @param path 文件路径
         * @param data 文件数据
         * @param callback 回调函数
         */
        writeArrayBuffer(path: string, data: ArrayBuffer, callback?: (err: Error) => void)
        {
            _indexedDB.objectStorePut(this.DBname, this.projectname, path, data, callback);
            dispatcher.dispatch("fs.write", path);
        }

        /**
         * 写文件
         * @param path 文件路径
         * @param data 文件数据
         * @param callback 回调函数
         */
        writeString(path: string, data: string, callback?: (err: Error) => void)
        {
            _indexedDB.objectStorePut(this.DBname, this.projectname, path, data, callback);
            dispatcher.dispatch("fs.write", path);
        }

        /**
         * 写文件
         * @param path 文件路径
         * @param object 文件数据
         * @param callback 回调函数
         */
        writeObject(path: string, object: Object, callback?: (err: Error) => void)
        {
            _indexedDB.objectStorePut(this.DBname, this.projectname, path, object, callback);
            dispatcher.dispatch("fs.write", path);
        }

        /**
         * 写图片
         * @param path 图片路径
         * @param image 图片
         * @param callback 回调函数
         */
        writeImage(path: string, image: HTMLImageElement, callback?: (err: Error) => void)
        {
            dataTransform.imageToArrayBuffer(image, (arraybuffer) =>
            {
                this.writeArrayBuffer(path, arraybuffer, callback);
                dispatcher.dispatch("fs.write", path);
            });
        }

        /**
         * 复制文件
         * @param src    源路径
         * @param dest    目标路径
         * @param callback 回调函数
         */
        copyFile(src: string, dest: string, callback?: (err: Error) => void)
        {
            _indexedDB.objectStoreGet(this.DBname, this.projectname, src, (err, data) =>
            {
                if (err)
                {
                    callback(err);
                    return;
                }
                _indexedDB.objectStorePut(this.DBname, this.projectname, dest, data, callback);
            });
        }

        /**
         * 获取所有文件路径
         * @param callback 回调函数
         */
        getAllPaths(callback: (err: Error, allPaths: string[]) => void)
        {
            _indexedDB.getAllKeys(this.DBname, this.projectname, (err, allPaths) =>
            {
                if (err)
                {
                    callback(err, allPaths);
                    return;
                }
                callback(err, allPaths);
            });
        }

        /**
         * 是否存在指定项目
         * @param projectname 项目名称
         * @param callback 回调函数
         */
        hasProject(projectname: string, callback: (has: boolean) => void)
        {
            feng3d._indexedDB.getObjectStoreNames(this.DBname, (err, objectStoreNames) =>
            {
                if (err) { callback(false); return; }
                callback(objectStoreNames.indexOf(projectname) != -1);
            });
        }
        /**
         * 初始化项目
         * @param projectname 项目名称
         * @param callback 回调函数
         */
        initproject(projectname: string, callback: (err: Error) => void)
        {
            this.projectname = projectname;
            feng3d._indexedDB.createObjectStore(this.DBname, projectname, callback);
        }
    }

    indexedDBFS = new IndexedDBFS();
}