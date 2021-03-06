import { EventEmitter } from './EventEmitter';

/**
 * 全局事件
 */
export const globalEmitter = new EventEmitter<GlobalEvents>();

/**
 * 事件列表
 */
export interface GlobalEvents
{
    /**
     * shader资源发生变化
     */
    'asset.shaderChanged': any;
    /**
     * 脚本发生变化
     */
    'asset.scriptChanged': any;
    /**
     * 图片资源发生变化
     */
    'asset.imageAssetChanged': { url: string };
    /**
     * 解析出资源
     */
    'asset.parsed': any;
    /**
     * 删除文件
     */
    'fs.delete': string;
    /**
     * 写文件
     */
    'fs.write': string;
}
