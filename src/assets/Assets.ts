namespace feng3d
{
    /**
     * 文件系统类型
     */
    export enum FSType
    {
        http = "http",
        native = "native",
        indexedDB = "indexedDB"
    }

    /**
     * 资源系统
     */
    export var assets: ReadAssets;

    /**
     * 资源
     * 在可读文件系统上进行加工，比如把读取数据转换为图片或者文本
     */
    export class ReadAssets implements ReadFS
    {
        /**
         * 可读文件系统
         */
        fs: ReadFS = httpReadFS;

        get type()
        {
            return this.fs.type;
        }

        /**
         * 读取文件
         * @param path 路径
         * @param callback 读取完成回调 当err不为null时表示读取失败
         */
        readFile(path: string, callback: (err, data: ArrayBuffer) => void)
        {
            var readFS = this.fs;
            if (path.indexOf("http://") != -1
                || path.indexOf("https://") != -1
            )
                readFS = httpReadFS;

            readFS.readFile(path, callback);
        }

        /**
         * 加载图片
         * @param path 图片路径
         * @param callback 加载完成回调
         */
        loadImage(path: string, callback: (err: Error, img: HTMLImageElement) => void)
        {
            if (path == "" || path == null) 
            {
                callback(new Error("无效路径!"), null);
                return;
            }
            this.readFile(path, (err, data) =>
            {
                if (err)
                {
                    callback(err, null);
                    return;
                }
                dataTransform.arrayBufferToImage(data, (img) =>
                {
                    callback(null, img);
                });
            });
        }
    }

    assets = new ReadAssets();

    export class ReadWriteAssets extends ReadAssets implements ReadWriteFS
    {
        /**
         * 可读写文件系统
         */
        // fs: ReadWriteFS = indexedDBfs;
        fs = indexedDBfs;

        constructor(readWriteFS?: ReadWriteFS)
        {
            super();
            if (readWriteFS)
                this.fs = <any>readWriteFS;
        }

        /**
         * 获取文件信息
         * @param path 文件路径
         * @param callback 回调函数
         */
        stat(path: string, callback: (err: Error, stats: FileInfo) => void): void
        {
            this.fs.stat(path, callback);
        }

        /**
         * 读取文件夹中文件列表
         * @param path 路径
         * @param callback 回调函数
         */
        readdir(path: string, callback: (err: Error, files: string[]) => void): void
        {
            assert(path.charAt(path.length - 1) == "/", `文件夹路径必须以 / 结尾！`)
            this.fs.readdir(path, callback);
        }

        /**
         * 删除文件
         * @param path 文件路径
         * @param callback 回调函数
         */
        deleteFile(path: string, callback: (err: Error) => void)
        {
            this.fs.deleteFile(path, callback);
        }

        /**
         * 写文件
         * @param path 文件路径
         * @param data 文件数据
         * @param callback 回调函数
         */
        writeFile(path: string, data: ArrayBuffer, callback?: (err: Error) => void)
        {
            this.fs.writeFile(path, data, callback);
        }


        ///--------------------------

        /**
         * 读取文件为字符串
         */
        readFileAsString(path: string, callback: (err: Error | null, data: string | null) => void): void
        {
            this.fs.readFileAsString(path, callback);
        }
        mkdir(path: string, callback: (err: Error | null) => void): void
        {
            this.fs.mkdir(path, callback);
        }
        rename(oldPath: string, newPath: string, callback: (err: Error | null) => void): void
        {
            this.fs.rename(oldPath, newPath, callback);
        }
        move(src: string, dest: string, callback?: ((err: Error | null) => void) | undefined): void
        {
            this.fs.move(src, dest, callback);
        }
        remove(path: string, callback?: ((err: Error | null) => void) | undefined): void
        {
            this.fs.remove(path, callback);
        }
        /**
         * 获取文件绝对路径
         */
        getAbsolutePath(path: string, callback: (err: Error | null, absolutePath: string | null) => void): void
        {
            this.fs.getAbsolutePath(path, callback);
        }
        /**
         * 获取指定文件下所有文件路径列表
         */
        getAllfilepathInFolder(dirpath: string, callback: (err: Error | null, filepaths: string[] | null) => void): void
        {
            this.fs.getAllfilepathInFolder(dirpath, callback);
        }
    }

    /**
     * 可读文件系统
     */
    export interface ReadFS
    {
        /**
         * 文件系统类型
         */
        readonly type: FSType;
        /**
         * 读取文件
         * @param path 路径
         * @param callback 读取完成回调 当err不为null时表示读取失败
         */
        readFile(path: string, callback: (err, data: ArrayBuffer) => void);
    }

    /**
     * 可读写文件系统
     */
    export interface ReadWriteFS extends ReadFS
    {
        /**
         * 获取文件信息
         * @param path 文件路径
         * @param callback 回调函数
         */
        stat(path: string, callback: (err: Error, stats: FileInfo) => void): void;

        /**
         * 读取文件夹中文件列表
         * @param path 路径
         * @param callback 回调函数
         */
        readdir(path: string, callback: (err: Error, files: string[]) => void): void;

        /**
         * 删除文件
         * @param path 文件路径
         * @param callback 回调函数
         */
        deleteFile(path: string, callback: (err) => void): void;

        /**
         * 写文件
         * @param path 文件路径
         * @param data 文件数据
         * @param callback 回调函数
         */
        writeFile(path: string, data: ArrayBuffer, callback?: (err: Error) => void): void;

        ///-----------------------------

        /**
         * 读取文件为字符串
         */
        readFileAsString(path: string, callback: (err: Error | null, data: string | null) => void): void;
        mkdir(path: string, callback: (err: Error | null) => void): void;
        rename(oldPath: string, newPath: string, callback: (err: Error | null) => void): void;
        move(src: string, dest: string, callback?: ((err: Error | null) => void) | undefined): void;
        remove(path: string, callback?: ((err: Error | null) => void) | undefined): void;
        /**
         * 获取文件绝对路径
         */
        getAbsolutePath(path: string, callback: (err: Error | null, absolutePath: string | null) => void): void;
        /**
         * 获取指定文件下所有文件路径列表
         */
        getAllfilepathInFolder(dirpath: string, callback: (err: Error | null, filepaths: string[] | null) => void): void;
    }
}