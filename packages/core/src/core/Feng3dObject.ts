import { EventEmitter } from "@feng3d/event";
import { Constructor, IDisposable, mathUtil } from "@feng3d/polyfill";
import { serialization, serialize } from "@feng3d/serialization";
import { HideFlags } from "./HideFlags";

/**
 * 所有feng3d对象的基类
 */
export class Feng3dObject<T = any> extends EventEmitter<T> implements IDisposable
{
    /**
     * 名称
     */
    get name()
    {
        return this._name;
    }
    set name(v)
    {
        this._name = v;
    }
    protected _name: string;

    /**
     * 隐藏标记，用于控制是否在层级界面、检查器显示，是否保存
     */
    @serialize
    hideFlags = HideFlags.None;

    /**
     * 通用唯一标识符（Universally Unique Identifier）
     */
    readonly uuid: string;

    /**
     * 是否已销毁
     */
    get disposed() { return this._disposed; }
    protected _disposed = false;

    /**
     * 构建
     * 
     * 新增不可修改属性 guid
     */
    constructor()
    {
        super();
        Object.defineProperty(this, "uuid", { value: mathUtil.uuid() });
        Object.defineProperty(this, "disposed", { value: false, configurable: true });
        console.assert(!Feng3dObject.objectLib[this.uuid], `唯一标识符存在重复！？`);
        Feng3dObject.objectLib[this.uuid] = this;
    }

    /**
     * 销毁
     */
    dispose()
    {
        Object.defineProperty(this, "disposed", { value: true, configurable: false });
    }

    /**
     * 获取对象
     * 
     * @param uuid 通用唯一标识符
     */
    static getObject(uuid: string)
    {
        return this.objectLib[uuid];
    }

    /**
     * 获取对象
     * 
     * @param type 
     */
    static getObjects<T extends Feng3dObject>(type?: Constructor<T>): T[]
    {
        var objects = Object.keys(this.objectLib).map(v => this.objectLib[v]);
        //
        var filterResult = objects;
        if (type)
        {
            filterResult = objects.filter(v => v instanceof type);
        }
        return filterResult as T[];
    }

    /**
     * 对象库
     */
    private static objectLib: { [guid: string]: Feng3dObject };
}
Object.defineProperty(Feng3dObject, "objectLib", { value: {} });

serialization.serializeHandlers.push(
    // 处理 Feng3dObject
    {
        priority: 0,
        handler: function (target, source, property)
        {
            var spv = source[property];
            if (spv instanceof Feng3dObject && (spv.hideFlags & HideFlags.DontSave))
            {
                return true;
            }
            return false;
        }
    },
);


