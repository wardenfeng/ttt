
/**
 * 默认文件系统
 */
export declare const fs: ReadFS;

/**
 * 文件系统类型
 */
export declare enum FSType {
    http = "http",
    native = "native",
    indexedDB = "indexedDB"
}

/**
 * Http可读文件系统
 */
export declare class HttpFS implements IReadFS {
    /**
     * 根路径
     */
    rootPath: string;
    type: FSType;
    constructor(rootPath?: string);
    /**
     * 读取文件
     * @param path 路径
     * @param callback 读取完成回调 当err不为null时表示读取失败
     */
    readArrayBuffer(path: string, callback: (err: Error, data: ArrayBuffer) => void): void;
    /**
     * 读取文件为字符串
     * @param path 路径
     * @param callback 读取完成回调 当err不为null时表示读取失败
     */
    readString(path: string, callback: (err: Error, data: string) => void): void;
    /**
     * 读取文件为Object
     * @param path 路径
     * @param callback 读取完成回调 当err不为null时表示读取失败
     */
    readObject(path: string, callback: (err: Error, data: Object) => void): void;
    /**
     * 加载图片
     * @param path 图片路径
     * @param callback 加载完成回调
     */
    readImage(path: string, callback: (err: Error, img: HTMLImageElement) => void): void;
    /**
     * 获取文件绝对路径
     * @param path （相对）路径
     * @param callback 回调函数
     */
    getAbsolutePath(path: string): string;
}

/**
 *
 */
export declare class _IndexedDB {
    /**
     * 数据库状态
     */
    private _dbStatus;
    /**
     * 是否支持 indexedDB
     */
    support(): boolean;
    /**
     * 获取数据库，如果不存在则新建数据库
     *
     * @param dbname 数据库名称
     * @param callback 完成回调
     */
    getDatabase(dbname: string, callback: (err: any, database: IDBDatabase) => void): void;
    /**
     * 打开或者升级数据库
     *
     * @param dbname 数据库名称
     * @param callback 完成回调
     * @param upgrade 是否升级数据库
     * @param onupgrade 升级回调
     */
    private _open;
    /**
     * 删除数据库
     *
     * @param dbname 数据库名称
     * @param callback 完成回调
     */
    deleteDatabase(dbname: string, callback?: (err: any) => void): void;
    /**
     * 是否存在指定的对象存储
     *
     * @param dbname 数据库名称
     * @param objectStroreName 对象存储名称
     * @param callback 完成回调
     */
    hasObjectStore(dbname: string, objectStroreName: string, callback: (has: boolean) => void): void;
    /**
     * 获取对象存储名称列表
     *
     * @param dbname 数据库
     * @param callback 完成回调
     */
    getObjectStoreNames(dbname: string, callback: (err: Error | null, objectStoreNames: string[]) => void): void;
    /**
     * 创建对象存储
     *
     * @param dbname 数据库名称
     * @param objectStroreName 对象存储名称
     * @param callback 完成回调
     */
    createObjectStore(dbname: string, objectStroreName: string, callback?: (err: any) => void): void;
    /**
     * 删除对象存储
     *
     * @param dbname 数据库名称
     * @param objectStroreName 对象存储名称
     * @param callback 完成回调
     */
    deleteObjectStore(dbname: string, objectStroreName: string, callback?: (err: any) => void): void;
    /**
     * 获取对象存储中所有键列表
     *
     * @param dbname 数据库名称
     * @param objectStroreName 对象存储名称
     * @param callback 完成回调
     */
    getAllKeys(dbname: string, objectStroreName: string, callback?: (err: Error, keys: string[]) => void): void;
    /**
     * 获取对象存储中指定键对应的数据
     *
     * @param dbname 数据库名称
     * @param objectStroreName 对象存储名称
     * @param key 键
     * @param callback 完成回调
     */
    objectStoreGet(dbname: string, objectStroreName: string, key: string | number, callback?: (err: Error, data: any) => void): void;
    /**
     * 设置对象存储的键与值，如果不存在指定键则新增否则修改。
     *
     * @param dbname 数据库名称
     * @param objectStroreName 对象存储名称
     * @param key 键
     * @param data 数据
     * @param callback 完成回调
     */
    objectStorePut(dbname: string, objectStroreName: string, key: string | number, data: any, callback?: (err: Error) => void): void;
    /**
     * 删除对象存储中指定键以及对于数据
     *
     * @param dbname 数据库名称
     * @param objectStroreName 对象存储名称
     * @param key 键
     * @param callback 完成回调
     */
    objectStoreDelete(dbname: string, objectStroreName: string, key: string | number, callback?: (err?: Error) => void): void;
    /**
     * 清空对象存储中数据
     *
     * @param dbname 数据库名称
     * @param objectStroreName 对象存储名称
     * @param callback 完成回调
     */
    objectStoreClear(dbname: string, objectStroreName: string, callback?: (err?: Error) => void): void;
}

/**
 *
 */
export declare const _indexedDB: _IndexedDB;

/**
 * 索引数据文件系统
 */
declare class IndexedDBFS implements IReadWriteFS {
    get type(): FSType;
    /**
     * 数据库名称
     */
    DBname: string;
    /**
     * 项目名称（表单名称）
     */
    projectname: string;
    constructor(DBname?: string, projectname?: string);
    /**
     * 读取文件
     * @param path 路径
     * @param callback 读取完成回调 当err不为null时表示读取失败
     */
    readArrayBuffer(path: string, callback: (err: Error, data: ArrayBuffer) => void): void;
    /**
     * 读取文件
     * @param path 路径
     * @param callback 读取完成回调 当err不为null时表示读取失败
     */
    readString(path: string, callback: (err: Error, data: string) => void): void;
    /**
     * 读取文件
     * @param path 路径
     * @param callback 读取完成回调 当err不为null时表示读取失败
     */
    readObject(path: string, callback: (err: Error, data: object) => void): void;
    /**
     * 加载图片
     * @param path 图片路径
     * @param callback 加载完成回调
     */
    readImage(path: string, callback: (err: Error, img: HTMLImageElement) => void): void;
    /**
     * 获取文件绝对路径
     * @param path （相对）路径
     * @param callback 回调函数
     */
    getAbsolutePath(path: string): string;
    /**
     * 是否为文件夹
     *
     * @param path 文件路径
     * @param callback 完成回调
     */
    isDirectory(path: string, callback: (result: boolean) => void): void;
    /**
     * 文件是否存在
     * @param path 文件路径
     * @param callback 回调函数
     */
    exists(path: string, callback: (exists: boolean) => void): void;
    /**
     * 读取文件夹中文件列表
     * @param path 路径
     * @param callback 回调函数
     */
    readdir(path: string, callback: (err: Error, files: string[]) => void): void;
    /**
     * 新建文件夹
     * @param path 文件夹路径
     * @param callback 回调函数
     */
    mkdir(path: string, callback?: (err: Error) => void): void;
    /**
     * 删除文件
     * @param path 文件路径
     * @param callback 回调函数
     */
    deleteFile(path: string, callback: (err: Error) => void): void;
    /**
     * 写文件
     * @param path 文件路径
     * @param data 文件数据
     * @param callback 回调函数
     */
    writeArrayBuffer(path: string, data: ArrayBuffer, callback?: (err: Error) => void): void;
    /**
     * 写文件
     * @param path 文件路径
     * @param data 文件数据
     * @param callback 回调函数
     */
    writeString(path: string, data: string, callback?: (err: Error) => void): void;
    /**
     * 写文件
     * @param path 文件路径
     * @param object 文件数据
     * @param callback 回调函数
     */
    writeObject(path: string, object: Object, callback?: (err: Error) => void): void;
    /**
     * 写图片
     * @param path 图片路径
     * @param image 图片
     * @param callback 回调函数
     */
    writeImage(path: string, image: HTMLImageElement, callback?: (err: Error) => void): void;
    /**
     * 复制文件
     * @param src    源路径
     * @param dest    目标路径
     * @param callback 回调函数
     */
    copyFile(src: string, dest: string, callback?: (err: Error) => void): void;
    /**
     * 是否存在指定项目
     * @param projectname 项目名称
     * @param callback 回调函数
     */
    hasProject(projectname: string, callback: (has: boolean) => void): void;
    /**
     * 初始化项目
     * @param projectname 项目名称
     * @param callback 回调函数
     */
    initproject(projectname: string, callback: (err: Error) => void): void;
}

/**
 * 索引数据文件系统
 */
export declare const indexedDBFS: IndexedDBFS;

/**
 * 可读文件系统
 */
export declare interface IReadFS {
    /**
     * 文件系统类型
     */
    type: FSType;
    /**
     * 读取文件为ArrayBuffer
     * @param path 路径
     * @param callback 读取完成回调 当err不为null时表示读取失败
     */
    readArrayBuffer(path: string, callback: (err: Error, arraybuffer: ArrayBuffer) => void): void;
    /**
     * 读取文件为字符串
     * @param path 路径
     * @param callback 读取完成回调 当err不为null时表示读取失败
     */
    readString(path: string, callback: (err: Error, str: string) => void): void;
    /**
     * 读取文件为Object
     * @param path 路径
     * @param callback 读取完成回调 当err不为null时表示读取失败
     */
    readObject(path: string, callback: (err: Error, object: Object) => void): void;
    /**
     * 加载图片
     * @param path 图片路径
     * @param callback 加载完成回调
     */
    readImage(path: string, callback: (err: Error, img: HTMLImageElement) => void): void;
    /**
     * 获取文件绝对路径
     * @param path （相对）路径
     */
    getAbsolutePath(path: string): string;
}

/**
 * 可读写文件系统
 *
 * 扩展基础可读写文件系统
 */
export declare interface IReadWriteFS extends IReadFS {
    /**
     * 项目名称（表单名称）
     */
    projectname: string;
    /**
     * 文件是否存在
     * @param path 文件路径
     * @param callback 回调函数
     */
    exists(path: string, callback: (exists: boolean) => void): void;
    /**
     * 读取文件夹中文件列表
     * @param path 路径
     * @param callback 回调函数
     */
    readdir(path: string, callback: (err: Error, files: string[]) => void): void;
    /**
     * 新建文件夹
     * @param path 文件夹路径
     * @param callback 回调函数
     */
    mkdir(path: string, callback?: (err: Error) => void): void;
    /**
     * 删除文件
     * @param path 文件路径
     * @param callback 回调函数
     */
    deleteFile(path: string, callback?: (err: Error) => void): void;
    /**
     * 写ArrayBuffer(新建)文件
     * @param path 文件路径
     * @param arraybuffer 文件数据
     * @param callback 回调函数
     */
    writeArrayBuffer(path: string, arraybuffer: ArrayBuffer, callback?: (err: Error) => void): void;
    /**
     * 写字符串到(新建)文件
     * @param path 文件路径
     * @param str 文件数据
     * @param callback 回调函数
     */
    writeString(path: string, str: string, callback?: (err: Error) => void): void;
    /**
     * 写Object到(新建)文件
     * @param path 文件路径
     * @param object 文件数据
     * @param callback 回调函数
     */
    writeObject(path: string, object: Object, callback?: (err: Error) => void): void;
    /**
     * 写图片
     * @param path 图片路径
     * @param image 图片
     * @param callback 回调函数
     */
    writeImage(path: string, image: HTMLImageElement, callback?: (err: Error) => void): void;
    /**
     * 复制文件
     * @param src    源路径
     * @param dest    目标路径
     * @param callback 回调函数
     */
    copyFile(src: string, dest: string, callback?: (err: Error) => void): void;
    /**
     * 是否为文件夹
     *
     * @param path 文件路径
     * @param callback 完成回调
     */
    isDirectory(path: string, callback: (result: boolean) => void): void;
    /**
     * 初始化项目
     * @param projectname 项目名称
     * @param callback 回调函数
     */
    initproject(projectname: string, callback: (err: Error) => void): void;
    /**
     * 是否存在指定项目
     * @param projectname 项目名称
     * @param callback 回调函数
     */
    hasProject(projectname: string, callback: (has: boolean) => void): void;
}

/**
 * 加载类
 */
export declare class Loader {
    /**
     * 加载文本
     * @param url   路径
     */
    loadText(url: string, onCompleted?: (content: string) => void, onRequestProgress?: () => void, onError?: (e: Error) => void): void;
    /**
     * 加载二进制
     * @param url   路径
     */
    loadBinary(url: string, onCompleted?: (content: ArrayBuffer) => void, onRequestProgress?: () => void, onError?: (e: Error) => void): void;
    /**
     * 加载图片
     * @param url   路径
     */
    loadImage(url: string, onCompleted?: (content: HTMLImageElement) => void, onRequestProgress?: () => void, onError?: (e: Error) => void): void;
}

/**
 * 加载类
 */
export declare const loader: Loader;

/**
 * 加载数据类型
 */
export declare enum LoaderDataFormat {
    /**
     * 以原始二进制数据形式接收下载的数据。
     */
    BINARY = "binary",
    /**
     * 以文本形式接收已下载的数据。
     */
    TEXT = "text",
    /**
     * 图片数据
     */
    IMAGE = "image"
}

/**
 * 路径工具
 */
export declare class PathUtils {
    /**
     * 标准化文件夹路径
     * @param path
     */
    normalizeDir(path: string): string;
    /**
     * 是否为HTTP地址
     *
     * @param path 地址
     */
    isHttpURL(path: string): any;
    /**
     * 获取不带后缀名称
     * @param path 路径
     */
    getName(path: string): string;
    /**
     * 获取带后缀名称
     * @param path 路径
     */
    basename(path: string): string;
    /**
     * 获取后缀
     * @param path 路径
     */
    extname(path: string): string;
    /**
     * 父路径
     * @param path 路径
     */
    dirname(path: string): string;
    /**
     * 获取子文件（非文件夹）路径
     *
     * @param parentPath 父文件夹路径
     * @param childName 子文件名称
     */
    getChildFilePath(parentPath: string, childName: string): string;
    /**
     * 获取子文件夹路径
     *
     * @param parentPath 父文件夹路径
     * @param childFolderName 子文件夹名称
     */
    getChildFolderPath(parentPath: string, childFolderName: string): string;
    /**
     * 是否文件夹
     * @param path 路径
     */
    isDirectory(path: string): boolean;
    /**
     * 获取目录深度
     * @param path 路径
     */
    getDirDepth(path: string): number;
}

/**
 * 路径工具
 */
export declare const pathUtils: PathUtils;

/**
 * 可读文件系统
 */
export declare class ReadFS {
    /**
     * 基础文件系统
     */
    get fs(): IReadFS;
    set fs(v: IReadFS);
    protected _fs: IReadFS;
    /**
     * 文件系统类型
     */
    get type(): FSType;
    constructor(fs?: IReadFS);
    /**
     * 读取文件为ArrayBuffer
     * @param path 路径
     * @param callback 读取完成回调 当err不为null时表示读取失败
     */
    readArrayBuffer(path: string, callback: (err: Error, arraybuffer: ArrayBuffer) => void): void;
    /**
     * 读取文件为字符串
     * @param path 路径
     * @param callback 读取完成回调 当err不为null时表示读取失败
     */
    readString(path: string, callback: (err: Error, str: string) => void): void;
    /**
     * 读取文件为Object
     * @param path 路径
     * @param callback 读取完成回调 当err不为null时表示读取失败
     */
    readObject(path: string, callback: (err: Error, object: Object) => void): void;
    /**
     * 加载图片
     * @param path 图片路径
     * @param callback 加载完成回调
     */
    readImage(path: string, callback: (err: Error, img: HTMLImageElement) => void): void;
    /**
     * 获取文件绝对路径
     * @param path （相对）路径
     */
    getAbsolutePath(path: string): string;
    /**
     * 读取文件列表为字符串列表
     *
     * @param path 路径
     * @param callback 读取完成回调 当err不为null时表示读取失败
     */
    readStrings(paths: string[], callback: (strs: (string | Error)[]) => void): void;
    protected _images: {
        [path: string]: HTMLImageElement;
    };
    private _state;
}

/**
 * 可读写文件系统
 *
 * 扩展基础可读写文件系统
 */
export declare class ReadWriteFS extends ReadFS {
    /**
     * 项目名称（表单名称）
     */
    projectname: string;
    get fs(): IReadWriteFS;
    set fs(value: IReadWriteFS);
    constructor(fs?: IReadWriteFS);
    /**
     * 文件是否存在
     * @param path 文件路径
     * @param callback 回调函数
     */
    exists(path: string, callback: (exists: boolean) => void): void;
    /**
     * 读取文件夹中文件列表
     * @param path 路径
     * @param callback 回调函数
     */
    readdir(path: string, callback: (err: Error, files: string[]) => void): void;
    /**
     * 新建文件夹
     * @param path 文件夹路径
     * @param callback 回调函数
     */
    mkdir(path: string, callback?: (err: Error) => void): void;
    /**
     * 删除文件
     * @param path 文件路径
     * @param callback 回调函数
     */
    deleteFile(path: string, callback?: (err: Error) => void): void;
    /**
     * 写(新建)文件
     * 自动根据文件类型保存为对应结构
     *
     * @param path 文件路径
     * @param arraybuffer 文件数据
     * @param callback 回调函数
     */
    writeFile(path: string, arraybuffer: ArrayBuffer, callback?: (err: Error) => void): void;
    /**
     * 写ArrayBuffer(新建)文件
     * @param path 文件路径
     * @param arraybuffer 文件数据
     * @param callback 回调函数
     */
    writeArrayBuffer(path: string, arraybuffer: ArrayBuffer, callback?: (err: Error) => void): void;
    /**
     * 写字符串到(新建)文件
     * @param path 文件路径
     * @param str 文件数据
     * @param callback 回调函数
     */
    writeString(path: string, str: string, callback?: (err: Error) => void): void;
    /**
     * 写Object到(新建)文件
     * @param path 文件路径
     * @param object 文件数据
     * @param callback 回调函数
     */
    writeObject(path: string, object: Object, callback?: (err: Error) => void): void;
    /**
     * 写图片
     * @param path 图片路径
     * @param image 图片
     * @param callback 回调函数
     */
    writeImage(path: string, image: HTMLImageElement, callback?: (err: Error) => void): void;
    /**
     * 复制文件
     * @param src    源路径
     * @param dest    目标路径
     * @param callback 回调函数
     */
    copyFile(src: string, dest: string, callback?: (err: Error) => void): void;
    /**
     * 是否为文件夹
     *
     * @param path 文件路径
     * @param callback 完成回调
     */
    isDirectory(path: string, callback: (result: boolean) => void): void;
    /**
     * 初始化项目
     * @param projectname 项目名称
     * @param callback 回调函数
     */
    initproject(projectname: string, callback: (err: Error) => void): void;
    /**
     * 是否存在指定项目
     * @param projectname 项目名称
     * @param callback 回调函数
     */
    hasProject(projectname: string, callback: (has: boolean) => void): void;
    /**
     * 获取指定文件下所有文件路径列表
     */
    getAllPathsInFolder(dirpath: string, callback: (err: Error, filepaths: string[]) => void): void;
    /**
     * 移动文件
     * @param src 源路径
     * @param dest 目标路径
     * @param callback 回调函数
     */
    moveFile(src: string, dest: string, callback?: (err: Error) => void): void;
    /**
     * 重命名文件
     * @param oldPath 老路径
     * @param newPath 新路径
     * @param callback 回调函数
     */
    renameFile(oldPath: string, newPath: string, callback?: (err: Error) => void): void;
    /**
     * 移动一组文件
     * @param movelists 移动列表
     * @param callback 回调函数
     */
    moveFiles(movelists: [string, string][], callback?: (err: Error) => void): void;
    /**
     * 复制一组文件
     * @param copylists 复制列表
     * @param callback 回调函数
     */
    copyFiles(copylists: [string, string][], callback?: (err: Error) => void): void;
    /**
     * 删除一组文件
     * @param deletelists 删除列表
     * @param callback 回调函数
     */
    deleteFiles(deletelists: string[], callback?: (err: Error) => void): void;
    /**
     * 重命名文件(夹)
     * @param oldPath 老路径
     * @param newPath 新路径
     * @param callback 回调函数
     */
    rename(oldPath: string, newPath: string, callback?: (err: Error) => void): void;
    /**
     * 移动文件(夹)
     *
     * @param src 源路径
     * @param dest 目标路径
     * @param callback 回调函数
     */
    move(src: string, dest: string, callback?: (err?: Error) => void): void;
    /**
     * 删除文件(夹)
     * @param path 路径
     * @param callback 回调函数
     */
    delete(path: string, callback?: (err: Error) => void): void;
}

export { }
