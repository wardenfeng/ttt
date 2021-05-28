import { AnimationCurve } from '@feng3d/math';
import { Attributes } from '@feng3d/renderer';
import { Box3 } from '@feng3d/math';
import { Color3 } from '@feng3d/math';
import { Color4 } from '@feng3d/math';
import { Constructor } from '@feng3d/polyfill';
import { CoordinateSystem } from '@feng3d/math';
import { CullFace } from '@feng3d/renderer';
import { Event as Event_2 } from '@feng3d/event';
import { EventEmitter } from '@feng3d/event';
import { FrameBuffer } from '@feng3d/renderer';
import { Frustum } from '@feng3d/math';
import { FunctionPropertyNames } from '@feng3d/polyfill';
import { GL } from '@feng3d/renderer';
import { gPartial } from '@feng3d/polyfill';
import { Gradient } from '@feng3d/math';
import { IDisposable } from '@feng3d/polyfill';
import { Index } from '@feng3d/renderer';
import type { IVector3 } from '@feng3d/math';
import { Lazy } from '@feng3d/polyfill';
import { Matrix4x4 } from '@feng3d/math';
import { Quaternion } from '@feng3d/math';
import { Ray3 } from '@feng3d/math';
import { ReadFS } from '@feng3d/filesystem';
import { ReadWriteFS } from '@feng3d/filesystem';
import { Rectangle } from '@feng3d/math';
import { RenderAtomic } from '@feng3d/renderer';
import { RenderBuffer } from '@feng3d/renderer';
import { RenderParams } from '@feng3d/renderer';
import { RotationOrder } from '@feng3d/math';
import { Texture } from '@feng3d/renderer';
import { TextureDataType } from '@feng3d/renderer';
import { TextureFormat } from '@feng3d/renderer';
import { TextureMagFilter } from '@feng3d/renderer';
import { TextureMinFilter } from '@feng3d/renderer';
import { TextureType } from '@feng3d/renderer';
import { TextureWrap } from '@feng3d/renderer';
import { Vector2 } from '@feng3d/math';
import { Vector3 } from '@feng3d/math';
import { Vector4 } from '@feng3d/math';

declare class Animation_2 extends Behaviour {
    animation: AnimationClip;
    animations: AnimationClip[];
    /**
     * 动画事件，单位为ms
     */
    time: number;
    isplaying: boolean;
    /**
     * 播放速度
     */
    playspeed: number;
    /**
     * 动作名称
     */
    get clipName(): string;
    get frame(): number;
    update(interval: number): void;
    dispose(): void;
    private num;
    private _fps;
    private _objectCache;
    private _updateAni;
    private getPropertyHost;
    private _onAnimationChanged;
    private _onTimeChanged;
}
export { Animation_2 as Animation }

export declare class AnimationClip extends Feng3dObject {
    readonly assetType = AssetType.anim;
    get name(): string;
    set name(v: string);
    protected _name: string;
    /**
     * 动画时长，单位ms
     */
    length: number;
    loop: boolean;
    propertyClips: PropertyClip[];
}

/**
 * 资源数据
 *
 * 该对象可由资源文件中读取，或者保存为资源
 */
export declare class AssetData extends Feng3dObject {
    /**
     * 资源名称
     */
    get name(): string;
    set name(v: string);
    protected _name: string;
    /**
     * 资源编号
     */
    get assetId(): string;
    set assetId(v: string);
    private _assetId;
    /**
     * 资源类型，由具体对象类型决定
     */
    assetType: AssetType;
    /**
     * 新增资源数据
     *
     * @param assetId 资源编号
     * @param data 资源数据
     */
    static addAssetData<T extends any>(assetId: string, data: T): T;
    /**
     * 删除资源数据
     *
     * @param data 资源数据
     */
    static deleteAssetData(data: any): void;
    static deleteAssetDataById(assetId: string): void;
    private static _delete;
    /**
     * 判断是否为资源数据
     *
     * @param asset 可能的资源数据
     */
    static isAssetData(asset: any): asset is AssetData;
    /**
     * 资源属性标记名称
     */
    private static assetPropertySign;
    /**
     * 序列化
     *
     * @param asset 资源数据
     */
    static serialize(asset: AssetData): any;
    /**
     * 反序列化
     *
     * @param object 资源对象
     */
    static deserialize(object: any): any;
    /**
     * 获取已加载的资源数据
     *
     * @param assetId 资源编号
     */
    static getLoadedAssetData(assetId: string): any;
    /**
     * 获取所有已加载资源数据
     */
    static getAllLoadedAssetDatas(): any[];
    /**
     * 资源与编号对应表
     */
    static assetMap: Map<any, string>;
    /**
     * 编号与资源对应表
     */
    static idAssetMap: Map<string, any>;
}

/**
 * 资源元标签
 */
export declare interface AssetMeta {
    /**
     * 资源编号
     */
    guid: string;
    /**
     * 修改时间（单位为ms）
     */
    mtimeMs: number;
    /**
     * 创建时间（单位为ms）
     */
    birthtimeMs: number;
    /**
     * 资源类型，由具体对象类型决定；AssetExtension.folder 时为文件夹
     */
    assetType: AssetType;
}

/**
 * 资源扩展名
 */
export declare enum AssetType {
    /**
     * 文件夹
     */
    folder = "folder",
    /**
     * 音频
     */
    audio = "audio",
    /**
     * ts文件
     */
    ts = "ts",
    /**
     * js文件
     */
    js = "js",
    /**
     * 文本文件
     */
    txt = "txt",
    /**
     * json文件
     */
    json = "json",
    /**
     * OBJ模型资源附带的材质文件
     */
    mtl = "mtl",
    /**
     * OBJ模型文件
     */
    obj = "obj",
    /**
     * MD5模型文件
     */
    md5mesh = "md5mesh",
    /**
     * MD5动画
     */
    md5anim = "md5anim",
    /**
     * 魔兽MDL模型
     */
    mdl = "mdl",
    /**
     * 纹理
     */
    texture = "texture",
    /**
     * 立方体纹理
     */
    texturecube = "texturecube",
    /**
     * 材质
     */
    material = "material",
    /**
     * 几何体
     */
    geometry = "geometry",
    /**
     * 3d节点
     */
    node3d = "node3d",
    /**
     * 场景
     */
    scene = "scene",
    /**
     * 动画
     */
    anim = "anim",
    /**
     * 着色器
     */
    shader = "shader",
    /**
     * 脚本
     */
    script = "script"
}

export declare interface AssetTypeClassMap {
}

/**
 * 声音监听器
 */
declare class AudioListener_2 extends Behaviour {
    gain: GainNode;
    enabled: boolean;
    /**
     * 音量
     */
    get volume(): number;
    set volume(v: number);
    private _volume;
    constructor();
    init(): void;
    private _onScenetransformChanged;
    private _enabledChanged;
    dispose(): void;
}
export { AudioListener_2 as AudioListener }

/**
 * 声源
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
 */
export declare class AudioSource extends Behaviour {
    private panner;
    private source;
    private buffer;
    private gain;
    enabled: boolean;
    /**
     * 声音文件路径
     */
    url: string;
    /**
     * 是否循环播放
     */
    get loop(): boolean;
    set loop(v: boolean);
    private _loop;
    /**
     * 音量
     */
    get volume(): number;
    set volume(v: number);
    private _volume;
    /**
     * 是否启用位置影响声音
     */
    get enablePosition(): boolean;
    set enablePosition(v: boolean);
    private _enablePosition;
    get coneInnerAngle(): number;
    set coneInnerAngle(v: number);
    private _coneInnerAngle;
    get coneOuterAngle(): number;
    set coneOuterAngle(v: number);
    private _coneOuterAngle;
    get coneOuterGain(): number;
    set coneOuterGain(v: number);
    private _coneOuterGain;
    /**
     * 该接口的distanceModel属性PannerNode是一个枚举值，用于确定在音频源离开收听者时用于减少音频源音量的算法。
     *
     * 可能的值是：
     * * linear：根据以下公式计算由距离引起的增益的线性距离模型：
     *      1 - rolloffFactor * (distance - refDistance) / (maxDistance - refDistance)
     * * inverse：根据以下公式计算由距离引起的增益的反距离模型：
     *      refDistance / (refDistance + rolloffFactor * (distance - refDistance))
     * * exponential：按照下式计算由距离引起的增益的指数距离模型
     *      pow(distance / refDistance, -rolloffFactor)。
     *
     * inverse是的默认值distanceModel。
     */
    get distanceModel(): DistanceModelType_2;
    set distanceModel(v: DistanceModelType_2);
    private _distanceModel;
    /**
     * 表示音频源和收听者之间的最大距离，之后音量不会再降低。该值仅由linear距离模型使用。默认值是10000。
     */
    get maxDistance(): number;
    set maxDistance(v: number);
    private _maxDistance;
    get panningModel(): PanningModelType;
    set panningModel(v: PanningModelType);
    private _panningModel;
    /**
     * 表示随着音频源远离收听者而减小音量的参考距离。此值由所有距离模型使用。默认值是1。
     */
    get refDistance(): number;
    set refDistance(v: number);
    private _refDistance;
    /**
     * 描述了音源离开收听者音量降低的速度。此值由所有距离模型使用。默认值是1。
     */
    get rolloffFactor(): number;
    set rolloffFactor(v: number);
    private _rolloffFactor;
    constructor();
    init(): void;
    play(): void;
    stop(): void;
    private _onScenetransformChanged;
    private _onUrlChanged;
    private _connect;
    private _disconnect;
    private _getAudioNodes;
    private _enabledChanged;
    dispose(): void;
}

/**
 * 行为
 *
 * 可以控制开关的组件
 */
export declare class Behaviour extends Component3D {
    /**
     * 是否启用update方法
     */
    enabled: boolean;
    /**
     * 可运行环境
     */
    runEnvironment: RunEnvironment;
    /**
     * Has the Behaviour had enabled called.
     * 是否所在GameObject显示且该行为已启动。
     */
    get isVisibleAndEnabled(): boolean;
    /**
     * 每帧执行
     */
    update(interval?: number): void;
    dispose(): void;
}

export declare class BillboardComponent extends Component3D {
    __class__: "feng3d.BillboardComponent";
    /**
     * 相机
     */
    camera: Camera;
    init(): void;
    private _onCameraChanged;
    private _invalidHoldSizeMatrix;
    private _onUpdateLocalToWorldMatrix;
    dispose(): void;
}

/**
 * 轴对称包围盒
 *
 * 用于优化计算射线碰撞检测以及视锥剔除等。
 */
export declare class BoundingBox {
    private _node3d;
    protected _selfLocalBounds: Box3;
    protected _selfWorldBounds: Box3;
    protected _worldBounds: Box3;
    protected _selfBoundsInvalid: boolean;
    protected _selfWorldBoundsInvalid: boolean;
    protected _worldBoundsInvalid: boolean;
    constructor(node3d: Node3D);
    /**
     * 自身局部包围盒通常有Renderable组件提供
     */
    get selfLocalBounds(): Box3;
    /**
     * 自身世界空间的包围盒
     */
    get selfWorldBounds(): Box3;
    /**
     * 世界包围盒
     */
    get worldBounds(): Box3;
    /**
     * 更新自身包围盒
     *
     * 自身包围盒通常有Renderable组件提供
     */
    protected _updateSelfBounds(): void;
    /**
     * 更新自身世界包围盒
     */
    protected _updateSelfWorldBounds(): void;
    /**
     * 更新世界包围盒
     */
    protected _updateWorldBounds(): void;
    /**
     * 使自身包围盒失效
     */
    protected _invalidateSelfLocalBounds(): void;
    /**
     * 使自身世界包围盒失效
     */
    protected _invalidateSelfWorldBounds(): void;
    /**
     * 使世界包围盒失效
     */
    protected _invalidateWorldBounds(): void;
}

/**
 * 摄像机
 */
export declare class Camera extends Component3D {
    static create(name?: string): Camera;
    __class__: "feng3d.Camera";
    get projection(): Projection;
    set projection(v: Projection);
    /**
     * 镜头
     */
    get lens(): LensBase;
    set lens(v: LensBase);
    private _lens;
    /**
     * 场景投影矩阵，世界空间转投影空间
     */
    get viewProjection(): Matrix4x4;
    /**
     * 获取摄像机的截头锥体
     */
    get frustum(): Frustum;
    /**
     * 创建一个摄像机
     */
    init(): void;
    /**
     * 获取与坐标重叠的射线
     * @param x view3D上的X坐标
     * @param y view3D上的X坐标
     * @return
     */
    getRay3D(x: number, y: number, ray3D?: Ray3): Ray3;
    /**
     * 投影坐标（世界坐标转换为3D视图坐标）
     * @param point3d 世界坐标
     * @return 屏幕的绝对坐标
     */
    project(point3d: Vector3): Vector3;
    /**
     * 屏幕坐标投影到场景坐标
     * @param nX 屏幕坐标X ([0-width])
     * @param nY 屏幕坐标Y ([0-height])
     * @param sZ 到屏幕的距离
     * @param v 场景坐标（输出）
     * @return 场景坐标
     */
    unproject(sX: number, sY: number, sZ: number, v?: Vector3): Vector3;
    /**
     * 获取摄像机能够在指定深度处的视野；镜头在指定深度的尺寸。
     *
     * @param   depth   深度
     */
    getScaleByDepth(depth: number, dir?: Vector2): number;
    /**
     * 处理场景变换改变事件
     */
    protected invalidateViewProjection(): void;
    private _viewProjection;
    private _viewProjectionInvalid;
    private _backups;
    private _frustum;
    private _frustumInvalid;
}

export declare class CanvasTexture2D extends Texture2D {
    canvas: HTMLCanvasElement;
    private _canvasChanged;
}

/**
 * 胶囊体几何体
 */
export declare class CapsuleGeometry extends Geometry {
    __class__: "feng3d.CapsuleGeometry";
    /**
     * 胶囊体半径
     */
    radius: number;
    /**
     * 胶囊体高度
     */
    height: number;
    /**
     * 横向分割数
     */
    segmentsW: number;
    /**
     * 纵向分割数
     */
    segmentsH: number;
    /**
     * 正面朝向 true:Y+ false:Z+
     */
    yUp: boolean;
    protected _name: string;
    /**
     * 构建几何体数据
     * @param radius 胶囊体半径
     * @param height 胶囊体高度
     * @param segmentsW 横向分割数
     * @param segmentsH 纵向分割数
     * @param yUp 正面朝向 true:Y+ false:Z+
     */
    protected buildGeometry(): void;
    /**
     * 构建顶点索引
     * @param segmentsW 横向分割数
     * @param segmentsH 纵向分割数
     * @param yUp 正面朝向 true:Y+ false:Z+
     */
    private buildIndices;
    /**
     * 构建uv
     * @param segmentsW 横向分割数
     * @param segmentsH 纵向分割数
     */
    private buildUVs;
}

/**
 * 参考
 */
export declare class CartoonComponent extends Component {
    __class__: "feng3d.CartoonComponent";
    outlineSize: number;
    outlineColor: Color4;
    outlineMorphFactor: number;
    /**
     * 半兰伯特值diff，分段值 4个(0.0,1.0)
     */
    diffuseSegment: Vector4;
    /**
     * 半兰伯特值diff，替换分段值 4个(0.0,1.0)
     */
    diffuseSegmentValue: Vector4;
    specularSegment: number;
    get cartoon_Anti_aliasing(): boolean;
    set cartoon_Anti_aliasing(value: boolean);
    _cartoon_Anti_aliasing: boolean;
    beforeRender(renderAtomic: RenderAtomic, scene: Scene, camera: Camera): void;
}

export declare class ColorUniforms {
    __class__: "feng3d.ColorUniforms";
    /**
     * 颜色
     */
    u_diffuseInput: Color4;
}

/**
 * 组件
 *
 * 所有附加到Entity的基类。
 *
 * 注意，您的代码不会直接创建 Component，而是您编写脚本代码，然后将该脚本附加到 Entity。
 */
export declare class Component<T extends ComponentEventMap = ComponentEventMap> extends Feng3dObject<T> implements IDisposable {
    /**
     * 组件名称与类定义映射，由 @RegisterComponent 装饰器进行填充。
     * @private
     */
    static _componentMap: {
        [name: string]: Constructor<Component>;
    };
    /**
     * 获取组件依赖列表
     *
     * @param type 组件类定义
     */
    static getDependencies(type: Constructor<Component>): Constructor<Component<ComponentEventMap>>[];
    /**
     * 判断组件是否为唯一组件。
     *
     * @param type 组件类定义
     */
    static isSingleComponent(type: Constructor<Component>): boolean;
    /**
     * 此组件附加到的实体。组件总是附加到实体上。
     */
    get entity(): Entity<EntityEventMap>;
    set entity(v: Entity<EntityEventMap>);
    /**
     * 名称。
     *
     * 组件与实体及所有附加组件使用相同的名称。
     */
    get name(): string;
    set name(v: string);
    /**
     * 此实体的标签。
     *
     * 可使用标签来识别实体。
     */
    get tag(): string;
    set tag(v: string);
    /**
     * 创建一个组件
     */
    constructor();
    /**
     * 初始化组件
     *
     * 在添加到Entity时立即被调用。
     */
    init(): void;
    /**
     * 获取指定位置索引的子组件
     * @param index			位置索引
     * @return				子组件
     */
    getComponentAt(index: number): Component;
    /**
     * 添加指定组件类型到实体
     *
     * @type type 被添加组件
     */
    addComponent<T extends Components>(type: Constructor<T>, callback?: (component: T) => void): T;
    /**
     * 添加脚本
     * @param script   脚本路径
     */
    addScript(scriptName: string): ScriptComponent;
    /**
     * 获取实体上第一个指定类型的组件，不存在时返回null
     *
     * @param type				类定义
     * @return                  返回指定类型组件
     */
    getComponent<T extends Components>(type: Constructor<T>): T;
    /**
     * 获取实体上所有指定类型的组件数组
     *
     * @param type		类定义
     * @return			返回与给出类定义一致的组件
     */
    getComponents<T extends Components>(type: Constructor<T>): T[];
    /**
     * 设置子组件的位置
     * @param component				子组件
     * @param index				位置索引
     */
    setComponentIndex(component: Components, index: number): void;
    /**
     * 设置组件到指定位置
     * @param component		被设置的组件
     * @param index			索引
     */
    setComponentAt(component: Components, index: number): void;
    /**
     * 移除组件
     * @param component 被移除组件
     */
    removeComponent(component: Components): void;
    /**
     * 获取组件在容器的索引位置
     * @param component			查询的组件
     * @return				    组件在容器的索引位置
     */
    getComponentIndex(component: Components): number;
    /**
     * 移除组件
     * @param index		要删除的 Component 的子索引。
     */
    removeComponentAt(index: number): Component;
    /**
     * 交换子组件位置
     * @param index1		第一个子组件的索引位置
     * @param index2		第二个子组件的索引位置
     */
    swapComponentsAt(index1: number, index2: number): void;
    /**
     * 交换子组件位置
     * @param a		第一个子组件
     * @param b		第二个子组件
     */
    swapComponents(a: Components, b: Components): void;
    /**
     * 销毁
     */
    dispose(): void;
    beforeRender(renderAtomic: RenderAtomic, scene: Scene, camera: Camera): void;
    /**
     * 监听对象的所有事件并且传播到所有组件中
     */
    private _onAnyListener;
    /**
     * 该方法仅在Entity中使用
     * @private
     *
     * @param entity 实体
     */
    _setEntity(entity: Entity): void;
    protected _entity: Entity;
}

/**
 * 3D组件
 *
 * 所有基于3D空间的组件均可继承于该组件。
 */
declare class Component3D<T extends Component3DEventMap = Component3DEventMap> extends Component<T> {
    /**
     * The Node3D attached to this Entity (null if there is none attached).
     *
     * 附加到此 Entity 的 Node3D。
     */
    get node3d(): Node3D<Component3DEventMap>;
    /**
     * Returns all components of Type type in the Entity.
     *
     * 返回 Entity 或其任何子项中类型为 type 的所有组件。
     *
     * @param type		类定义
     * @return			返回与给出类定义一致的组件
     */
    getComponentsInChildren<T extends Components>(type?: Constructor<T>, filter?: (compnent: T) => {
        findchildren: boolean;
        value: boolean;
    }, result?: T[]): T[];
    /**
     * 从父类中获取组件
     * @param type		类定义
     * @return			返回与给出类定义一致的组件
     */
    getComponentsInParents<T extends Components>(type?: Constructor<T>, result?: T[]): T[];
}

declare interface Component3DEventMap extends ComponentEventMap, MouseEventMap {
}

declare interface ComponentEventMap extends EntityEventMap {
}

/**
 * 组件菜单
 */
export declare interface ComponentMenu {
    /**
     * 组件菜单中路径
     */
    path: string;
    /**
     * 组件菜单中组件的顺序(从低到高)。
     */
    order: number;
    /**
     * 组件类定义
     */
    type: ComponentNames;
}

declare type ComponentNames = keyof ComponentMap;

declare type Components = ComponentMap[ComponentNames];

/**
 * 圆锥体

 */
export declare class ConeGeometry extends CylinderGeometry {
    __class__: "feng3d.ConeGeometry";
    protected _name: string;
    /**
     * 底部半径 private
     */
    topRadius: number;
    /**
     * 顶部是否封口 private
     */
    topClosed: boolean;
    /**
     * 侧面是否封口 private
     */
    surfaceClosed: boolean;
}

export declare class ControllerBase {
    /**
     * 控制对象
     */
    protected _targetNode: Node3D<Component3DEventMap> | undefined;
    /**
     * 控制器基类，用于动态调整3D对象的属性
     */
    constructor(node3d?: Node3D);
    /**
     * 手动应用更新到目标3D对象
     */
    update(interpolate?: boolean): void;
    get targetNode(): Node3D<Component3DEventMap>;
    set targetNode(val: Node3D<Component3DEventMap>);
}

/**
 * 立（长）方体几何体
 */
export declare class CubeGeometry extends Geometry {
    __class__: "feng3d.CubeGeometry";
    protected _name: string;
    /**
     * 宽度
     */
    width: number;
    /**
     * 高度
     */
    height: number;
    /**
     * 深度
     */
    depth: number;
    /**
     * 宽度方向分割数
     */
    segmentsW: number;
    /**
     * 高度方向分割数
     */
    segmentsH: number;
    /**
     * 深度方向分割数
     */
    segmentsD: number;
    /**
     * 是否为6块贴图，默认true。
     */
    tile6: boolean;
    protected buildGeometry(): void;
    /**
     * 构建坐标
     * @param   width           宽度
     * @param   height          高度
     * @param   depth           深度
     * @param   segmentsW       宽度方向分割
     * @param   segmentsH       高度方向分割
     * @param   segmentsD       深度方向分割
     */
    private buildPosition;
    /**
     * 构建法线
     * @param   segmentsW       宽度方向分割
     * @param   segmentsH       高度方向分割
     * @param   segmentsD       深度方向分割
     */
    private buildNormal;
    /**
     * 构建切线
     * @param   segmentsW       宽度方向分割
     * @param   segmentsH       高度方向分割
     * @param   segmentsD       深度方向分割
     */
    private buildTangent;
    /**
     * 构建索引
     * @param   segmentsW       宽度方向分割
     * @param   segmentsH       高度方向分割
     * @param   segmentsD       深度方向分割
     */
    private buildIndices;
    /**
     * 构建uv
     * @param   segmentsW       宽度方向分割
     * @param   segmentsH       高度方向分割
     * @param   segmentsD       深度方向分割
     * @param   tile6           是否为6块贴图
     */
    private buildUVs;
}

export declare class CustomGeometry extends Geometry {
    __class__: "feng3d.CustomGeometry";
    /**
     * 顶点索引缓冲
     */
    get indices(): number[];
    /**
     * 属性数据列表
     */
    get attributes(): Attributes;
    set attributes(v: Attributes);
}

/**
 * 圆柱体几何体
 * @author DawnKing 2016-09-12
 */
export declare class CylinderGeometry extends Geometry {
    __class__: "feng3d.CylinderGeometry" | "feng3d.ConeGeometry";
    /**
     * 顶部半径
     */
    topRadius: number;
    /**
     * 底部半径
     */
    bottomRadius: number;
    /**
     * 高度
     */
    height: number;
    /**
     * 横向分割数
     */
    segmentsW: number;
    /**
     * 纵向分割数
     */
    segmentsH: number;
    /**
     * 顶部是否封口
     */
    topClosed: boolean;
    /**
     * 底部是否封口
     */
    bottomClosed: boolean;
    /**
     * 侧面是否封口
     */
    surfaceClosed: boolean;
    /**
     * 是否朝上
     */
    yUp: boolean;
    protected _name: string;
    /**
     * 构建几何体数据
     */
    protected buildGeometry(): void;
    /**
     * 构建顶点索引
     * @param segmentsW 横向分割数
     * @param segmentsH 纵向分割数
     * @param yUp 正面朝向 true:Y+ false:Z+
     */
    private buildIndices;
    /**
     * 构建uv
     * @param segmentsW 横向分割数
     * @param segmentsH 纵向分割数
     */
    private buildUVs;
}

/**
 * 调试工具
 */
export declare class Debug {
    constructor();
    /**
     * 测试代码运行时间
     * @param fn 被测试的方法
     * @param labal 标签
     */
    time(fn: Function, labal?: string): void;
}

/**
 * 调试工具
 */
export declare const debug: Debug;

/**
 * 方向光源
 */
export declare class DirectionalLight extends Light {
    static create(name?: string): DirectionalLight;
    __class__: "feng3d.DirectionalLight";
    lightType: LightType;
    /**
     * 用于计算方向光
     */
    private orthographicLens;
    /**
     * 光源位置
     */
    get position(): Vector3;
    constructor();
    /**
     * 通过视窗摄像机进行更新
     * @param viewCamera 视窗摄像机
     */
    updateShadowByCamera(scene: Scene, viewCamera: Camera, models: Renderable[]): void;
}

/**
 * 音量与距离算法
 * @see https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/distanceModel
 * @see https://mdn.github.io/webaudio-examples/panner-node/
 * @see https://github.com/mdn/webaudio-examples
 */
declare enum DistanceModelType_2 {
    /**
     * 1 - rolloffFactor * (distance - refDistance) / (maxDistance - refDistance)
     */
    linear = "linear",
    /**
     * refDistance / (refDistance + rolloffFactor * (distance - refDistance))
     */
    inverse = "inverse",
    /**
     * pow(distance / refDistance, -rolloffFactor)
     */
    exponential = "exponential"
}
export { DistanceModelType_2 as DistanceModelType }

/**
 * 实体，场景唯一存在的对象类型
 */
export declare class Entity<T extends EntityEventMap = EntityEventMap> extends Feng3dObject<T> implements IDisposable {
    __class__: "feng3d.Entity";
    /**
     * 名称
     */
    get name(): string;
    set name(v: string);
    protected _name: string;
    /**
     * 标签
     */
    tag: string;
    /**
     * 子组件个数
     */
    get numComponents(): number;
    get components(): Components[];
    set components(value: Components[]);
    /**
     * 构建3D对象
     */
    constructor();
    /**
     * 获取指定位置索引的子组件
     *
     * @param index			位置索引
     * @return				子组件
     */
    getComponentAt(index: number): Component;
    /**
     * 添加指定组件类型到实体
     *
     * @type type 被添加组件类定义
     */
    addComponent<T extends Components>(type: Constructor<T>, callback?: (component: T) => void): T;
    /**
     * 添加脚本
     *
     * @param script   脚本路径
     */
    addScript(scriptName: string): ScriptComponent;
    /**
     * 获取实体上第一个指定类型的组件，不存在时返回null
     *
     * @param type				类定义
     * @return                  返回指定类型组件
     */
    getComponent<T extends Components>(type: Constructor<T>): T;
    /**
     * 获取实体上所有指定类型的组件数组
     *
     * @param type		类定义
     * @return			返回与给出类定义一致的组件
     */
    getComponents<T extends Components>(type: Constructor<T>): T[];
    /**
     * 设置子组件的位置
     *
     * @param component				子组件
     * @param index				位置索引
     */
    setComponentIndex(component: Components, index: number): void;
    /**
     * 设置组件到指定位置
     *
     * @param component		被设置的组件
     * @param index			索引
     */
    setComponentAt(component: Components, index: number): void;
    /**
     * 移除组件
     *
     * @param component 被移除组件
     */
    removeComponent(component: Components): void;
    /**
     * 获取组件在容器的索引位置
     *
     * @param component			查询的组件
     * @return				    组件在容器的索引位置
     */
    getComponentIndex(component: Components): number;
    /**
     * 移除组件
     *
     * @param index		要删除的 Component 的子索引。
     */
    removeComponentAt(index: number): Component;
    /**
     * 交换子组件位置
     *
     * @param index1		第一个子组件的索引位置
     * @param index2		第二个子组件的索引位置
     */
    swapComponentsAt(index1: number, index2: number): void;
    /**
     * 交换子组件位置
     *
     * @param a		第一个子组件
     * @param b		第二个子组件
     */
    swapComponents(a: Components, b: Components): void;
    /**
     * 获取指定类型组件
     *
     * @param type 组件类型
     */
    getComponentsByType<T extends Components>(type: Constructor<T>): T[];
    /**
     * 移除指定类型组件
     *
     * @param type 组件类型
     */
    removeComponentsByType<T extends Components>(type: Constructor<T>): T[];
    /**
     * 监听对象的所有事件并且传播到所有组件中
     */
    private _onAnyListener;
    /**
     * 销毁
     */
    dispose(): void;
    /**
     * 查找指定名称的实体
     *
     * @param name
     */
    static find(name: string): Entity<EntityEventMap>;
    /**
     * 组件列表
     */
    protected _components: Components[];
    /**
     * 判断是否拥有组件
     *
     * @param com	被检测的组件
     * @return		true：拥有该组件；false：不拥有该组件。
     */
    private hasComponent;
    /**
     * 添加组件到指定位置
     *
     * @param component		被添加的组件
     * @param index			插入的位置
     */
    private addComponentAt;
    /**
     * 为了兼容以往json序列化格式
     *
     * @deprecated
     */
    set children(v: Entity[]);
    private _children;
    /**
     * 创建指定类型的实体。
     *
     * @param type 实体类型。
     * @param param 实体参数。
     */
    static createPrimitive<K extends keyof PrimitiveEntity>(type: K, param?: gPartial<Entity>): Node3D<Component3DEventMap>;
    /**
     * 注册原始实体，被注册后可以使用 Entity.createPrimitive 进行创建。
     *
     * @param type 原始实体类型。
     * @param handler 构建原始实体的函数。
     */
    static registerPrimitive<K extends keyof PrimitiveEntity>(type: K, handler: (entity: Entity) => void): void;
    static _registerPrimitives: {
        [type: string]: (gameObject: Entity) => void;
    };
}

declare interface EntityEventMap {
    /**
     * 添加子组件事件
     */
    addComponent: {
        entity: Entity;
        component: Component;
    };
    /**
     * 移除子组件事件
     */
    removeComponent: {
        entity: Entity;
        component: Component;
    };
    /**
     * 包围盒失效
     */
    boundsInvalid: Geometry;
    /**
     * 刷新界面
     */
    refreshView: any;
}

/**
 * 所有feng3d对象的基类
 */
export declare class Feng3dObject<T = any> extends EventEmitter<T> implements IDisposable {
    /**
     * 名称
     */
    get name(): string;
    set name(v: string);
    protected _name: string;
    /**
     * 隐藏标记，用于控制是否在层级界面、检查器显示，是否保存
     */
    hideFlags: HideFlags;
    /**
     * 通用唯一标识符（Universally Unique Identifier）
     */
    readonly uuid: string;
    /**
     * 是否已销毁
     */
    get disposed(): boolean;
    protected _disposed: boolean;
    /**
     * 构建
     *
     * 新增不可修改属性 guid
     */
    constructor();
    /**
     * 销毁
     */
    dispose(): void;
    /**
     * 获取对象
     *
     * @param uuid 通用唯一标识符
     */
    static getObject(uuid: string): Feng3dObject<any>;
    /**
     * 获取对象
     *
     * @param type
     */
    static getObjects<T extends Feng3dObject>(type?: Constructor<T>): T[];
    /**
     * 对象库
     */
    private static objectLib;
}

/**
 * feng3d资源
 */
export declare abstract class FileAsset {
    /**
     * 资源路径
     */
    assetPath: string;
    /**
     * 资源编号
     */
    assetId: string;
    /**
     * 资源元标签，该对象也用来判断资源是否被加载，值为null表示未加载，否则已加载。
     *
     * 并且该对象还会用于存储主文件无法存储的数据，比如 TextureAsset 中存储了 Texture2D 信息
     */
    meta: AssetMeta;
    /**
     * 资源系统
     *
     * 加载或者创建该资源的资源系统
     */
    rs: ReadWriteRS;
    /**
     * 资源类型，由具体对象类型决定
     */
    assetType: AssetType;
    /**
     * 是否已加载
     */
    isLoaded: boolean;
    /**
     * 是否正在加载中
     */
    isLoading: boolean;
    /**
     * 文件后缀
     */
    get extenson(): string;
    /**
     * 父资源
     */
    get parentAsset(): FolderAsset;
    /**
     * 文件名称
     *
     * 不包含后缀
     */
    get fileName(): string;
    /**
     * 资源对象
     */
    data: any;
    /**
     * 初始化资源
     */
    initAsset(): void;
    /**
     * 获取资源数据
     *
     * @param callback 完成回调，当资源已加载时会立即调用回调，否则在资源加载完成后调用。
     */
    getAssetData(callback?: (result: any) => void): any;
    /**
     * 资源已加载时获取资源数据，内部使用
     */
    protected _getAssetData(): any;
    /**
     * 读取资源
     *
     * @param callback 完成回调
     */
    read(callback: (err?: Error) => void): void;
    /**
     * 写入资源
     *
     * @param callback 完成回调
     */
    write(callback?: (err: Error) => void): void;
    /**
     * 删除资源
     *
     * @param callback 完成回调
     */
    delete(callback?: (err?: Error) => void): void;
    /**
     * 读取资源预览图标
     *
     * @param callback 完成回调
     */
    readPreview(callback: (err: Error, image: HTMLImageElement) => void): void;
    /**
     * 读取资源预览图标
     *
     * @param image 预览图
     * @param callback 完成回调
     */
    writePreview(image: HTMLImageElement, callback?: (err: Error) => void): void;
    /**
     * 删除资源预览图标
     *
     * @param callback 完成回调
     */
    deletePreview(callback?: (err: Error) => void): void;
    /**
     * 读取文件
     *
     * @param callback 完成回调
     */
    abstract readFile(callback?: (err: Error) => void): void;
    /**
     * 保存文件
     *
     * @param callback 完成回调
     */
    abstract saveFile(callback?: (err: Error) => void): void;
    /**
     * 删除文件
     *
     * @param callback 完成回调
     */
    protected deleteFile(callback?: (err: Error) => void): void;
    /**
     * 元标签路径
     */
    protected get metaPath(): string;
    /**
     * 读取元标签
     *
     * @param callback 完成回调
     */
    protected readMeta(callback?: (err?: Error) => void): void;
    /**
     * 写元标签
     *
     * @param callback 完成回调
     */
    protected writeMeta(callback?: (err: Error) => void): void;
    /**
     * 删除元标签
     *
     * @param callback 完成回调
     */
    protected deleteMeta(callback?: (err: Error) => void): void;
    /**
     * 预览图
     */
    private _preview;
    /**
     * 预览图路径
     */
    private get previewPath();
}

/**
 * 雾模式
 */
export declare enum FogMode {
    NONE = 0,
    EXP = 1,
    EXP2 = 2,
    LINEAR = 3
}

/**
 * 文件夹资源
 */
export declare class FolderAsset extends FileAsset {
    static extenson: string;
    assetType: AssetType;
    /**
     * 子资源列表
     */
    get childrenAssets(): FileAsset[];
    initAsset(): void;
    /**
     * 删除资源
     *
     * @param callback 完成回调
     */
    delete(callback?: (err: Error) => void): void;
    /**
     * 保存文件
     * @param callback 完成回调
     */
    saveFile(callback?: (err: Error) => void): void;
    /**
     * 读取文件
     * @param callback 完成回调
     */
    readFile(callback?: (err: Error) => void): void;
}

declare interface FormatInputPathObject {
    /**
     * 路径的根，如'/'或'c:\'
     */
    root?: string;
    /**
     * 完整的目录路径，如'/home/user/dir'或'c:\path\dir'
     */
    dir?: string;
    /**
     * 包含扩展名(如有)的文件名，如'index.html'
     */
    base?: string;
    /**
     * 文件扩展名(如果有)，如'.html'
     */
    ext?: string;
    /**
     * 没有扩展名(如果有)的文件名，如'index'
     */
    name?: string;
}

/**
 * 前向渲染器
 */
export declare class ForwardRenderer {
    /**
     * 渲染
     */
    draw(gl: GL, scene: Scene, camera: Camera): void;
}

/**
 * FPS模式控制器
 */
export declare class FPSController extends Behaviour {
    /**
     * 加速度
     */
    acceleration: number;
    runEnvironment: RunEnvironment;
    /**
     * 按键记录
     */
    private keyDownDic;
    /**
     * 按键方向字典
     */
    private keyDirectionDic;
    /**
     * 速度
     */
    private velocity;
    /**
     * 上次鼠标位置
     */
    private preMousePoint;
    private ischange;
    private _auto;
    get auto(): boolean;
    set auto(value: boolean);
    init(): void;
    onMousedown(): void;
    onMouseup(): void;
    /**
     * 销毁
     */
    dispose(): void;
    /**
     * 手动应用更新到目标3D对象
     */
    update(): void;
    private mousePoint;
    /**
     * 处理鼠标移动事件
     */
    private onMouseMove;
    /**
     * 键盘按下事件
     */
    private onKeydown;
    /**
     * 键盘弹起事件
     */
    private onKeyup;
    /**
     * 停止xyz方向运动
     * @param direction     停止运动的方向
     */
    private stopDirectionVelocity;
}

/**
 * 帧缓冲对象
 */
export declare class FrameBufferObject {
    OFFSCREEN_WIDTH: number;
    OFFSCREEN_HEIGHT: number;
    frameBuffer: FrameBuffer;
    texture: RenderTargetTexture2D;
    depthBuffer: RenderBuffer;
    constructor(width?: number, height?: number);
    static active(gl: GL, frameBufferObject: FrameBufferObject): {
        framebuffer: WebGLFramebuffer;
        texture: WebGLTexture;
        depthBuffer: WebGLRenderbuffer;
    };
    deactive(gl: GL): void;
    /**
     * 是否失效
     */
    private _invalid;
    /**
     * 使失效
     */
    protected invalidate(): void;
    private invalidateSize;
    static clear(frameBufferObject: FrameBufferObject): void;
}

/**
 * 函数经
 *
 * 包装函数，以及对应的拆包
 */
export declare class FunctionWrap {
    /**
     * 扩展继承函数
     *
     * 可用于扩展原型中原有API中的实现
     *
     * ```
    class A
    {
        a = "a";

        f(p: string = "p", p1: string = "")
        {
            return p + p1;
        }

        extendF: (p?: string, p1?: string) => string;
        oldf: (p?: string, p1?: string) => string;
    }

    var a = new A();
    a.oldf = a.f;
    a.extendF = function (p: string = "p", p1: string = "")
    {
        return ["polyfill", this.a, this.oldf()].join("-")
    }
    functionwrap.extendFunction(a, "f", function (r)
    {
        return ["polyfill", this.a, r].join("-");
    });
    // 验证 被扩展的a.f方法是否等价于 a.extendF
    assert.ok(a.f() == a.extendF()); //true
    
     * ```
     *
     * @param object 被扩展函数所属对象或者原型
     * @param funcName 被扩展函数名称
     * @param extendFunc 在函数执行后执行的扩展函数
     */
    extendFunction<T, K extends FunctionPropertyNames<T>, V extends T[K]>(object: T, funcName: K, extendFunc: (this: T, r: ReturnType<V>, ...ps: Parameters<V>) => ReturnType<V>): void;
    /**
     * 包装函数
     *
     * 一般用于调试
     * 使用场景示例：
     * 1. 在函数执行前后记录时间来计算函数执行时间。
     * 1. 在console.error调用前使用 debugger 进行断点调试。
     *
     * @param object 函数所属对象或者原型
     * @param funcName 函数名称
     * @param beforeFunc 在函数执行前执行的函数
     * @param afterFunc 在函数执行后执行的函数
     */
    wrap<T, K extends FunctionPropertyNames<T>, F extends T[K]>(object: T, funcName: K, beforeFunc?: F, afterFunc?: F): void;
    /**
     * 取消包装函数
     *
     * 与wrap函数对应
     *
     * @param object 函数所属对象或者原型
     * @param funcName 函数名称
     * @param wrapFunc 在函数执行前执行的函数
     * @param before 运行在原函数之前
     */
    unwrap<T, K extends FunctionPropertyNames<T>, V extends T[K]>(object: T, funcName: K, wrapFunc?: V): void;
    /**
     * 包装一个异步函数，使其避免重复执行
     *
     * 使用场景示例：同时加载同一资源时，使其只加载一次，完成后调用所有相关回调函数。
     *
     * @param funcHost 函数所属对象
     * @param func 函数
     * @param params 函数除callback外的参数列表
     * @param callback 完成回调函数
     */
    wrapAsyncFunc(funcHost: Object, func: Function, params: any[], callback: (...args: any[]) => void): void;
    private _wrapFResult;
    private _state;
}

/**
 * 几何体
 */
export declare class Geometry<T extends GeometryEventMap = GeometryEventMap> extends Feng3dObject<T> {
    private preview;
    get name(): string;
    set name(v: string);
    protected _name: string;
    /**
     * 资源编号
     */
    assetId: string;
    assetType: AssetType;
    /**
     * 几何体信息
     */
    get geometryInfo(): string;
    /**
     * 索引数据
     */
    get indices(): number[];
    /**
     * 更新顶点索引数据
     */
    set indices(value: number[]);
    /**
     * 坐标数据
     */
    get positions(): number[];
    set positions(value: number[]);
    /**
     * 颜色数据
     */
    get colors(): number[];
    set colors(value: number[]);
    /**
     * uv数据
     */
    get uvs(): number[];
    set uvs(value: number[]);
    /**
     * 法线数据
     */
    get normals(): number[];
    set normals(value: number[]);
    /**
     * 切线数据
     */
    get tangents(): number[];
    set tangents(value: number[]);
    /**
     * 蒙皮索引，顶点关联的关节索引
     */
    get skinIndices(): number[];
    set skinIndices(value: number[]);
    /**
     * 蒙皮权重，顶点关联的关节权重
     */
    get skinWeights(): number[];
    set skinWeights(value: number[]);
    /**
     * 蒙皮索引，顶点关联的关节索引
     */
    get skinIndices1(): number[];
    set skinIndices1(value: number[]);
    /**
     * 蒙皮权重，顶点关联的关节权重
     */
    get skinWeights1(): number[];
    set skinWeights1(value: number[]);
    /**
     * 创建一个几何体
     */
    constructor();
    /**
     * 标记需要更新几何体，在更改几何体数据后需要调用该函数。
     */
    invalidateGeometry(): void;
    /**
     * 更新几何体
     */
    updateGrometry(): void;
    /**
     * 构建几何体
     */
    protected buildGeometry(): void;
    /**
     * 顶点数量
     */
    get numVertex(): number;
    /**
     * 三角形数量
     */
    get numTriangles(): number;
    /**
     * 添加几何体
     * @param geometry          被添加的几何体
     * @param matrix         变换矩阵，把克隆被添加几何体的数据变换后再添加到该几何体中
     */
    addGeometry(geometry: Geometry, matrix?: Matrix4x4): void;
    /**
     * 应用变换矩阵
     * @param matrix 变换矩阵
     */
    applyTransformation(matrix: Matrix4x4): void;
    /**
     * 纹理U缩放，默认为1。
     */
    scaleU: number;
    /**
     * 纹理V缩放，默认为1。
     */
    scaleV: number;
    /**
     * 包围盒失效
     */
    invalidateBounds(): void;
    get bounding(): Box3;
    /**
     * 射线投影几何体
     * @param ray                           射线
     * @param shortestCollisionDistance     当前最短碰撞距离
     * @param cullFace                      裁剪面枚举
     */
    raycast(ray: Ray3, shortestCollisionDistance?: number, cullFace?: CullFace): {
        rayEntryDistance: number;
        localPosition: Vector3;
        localNormal: Vector3;
        uv: Vector2;
        index: number;
    };
    /**
     * 获取顶点列表
     *
     * @param result
     */
    getVertices(result?: Vector3[]): Vector3[];
    getFaces(result?: number[][]): number[][];
    /**
     * 克隆一个几何体
     */
    clone(): Geometry<GeometryEventMap>;
    /**
     * 从一个几何体中克隆数据
     */
    cloneFrom(geometry: Geometry): void;
    beforeRender(renderAtomic: RenderAtomic): void;
    /**
     * 顶点索引缓冲
     */
    protected _indexBuffer: Index;
    /**
     * 属性数据列表
     */
    protected _attributes: Attributes;
    /**
     * 清理数据
     */
    clear(): void;
    private _geometryInvalid;
    private _useFaceWeights;
    private _bounding;
    /**
     * 设置默认几何体
     *
     * @param name 默认几何体名称
     * @param geometry 默认几何体
     */
    static setDefault<K extends keyof DefaultGeometry>(name: K, geometry: DefaultGeometry[K], param?: gPartial<DefaultGeometry[K]>): void;
    /**
     * 获取默认几何体
     *
     * @param name 默认几何体名称
     */
    static getDefault<K extends keyof DefaultGeometry>(name: K): DefaultGeometry[K];
    private static _defaultGeometry;
}

declare interface GeometryEventMap {
    /**
     * 包围盒失效
     */
    boundsInvalid: Geometry;
}

declare type GeometryLike = GeometryTypes[keyof GeometryTypes];

export declare class GeometryUtils {
    /**
     * 根据顶点数量按顺序创建顶点索引
     * @param positions 顶点数据
     */
    createIndices(positions: number[]): number[];
    /**
     * 创建循环uv数据
     * @param positions 顶点数据
     */
    createUVs(positions: number[]): number[];
    /**
     * 计算顶点法线数据
     * @param indices 顶点索引
     * @param positions 顶点数据
     * @param useFaceWeights 是否使用面权重计算法线
     */
    createVertexNormals(indices: number[], positions: number[], useFaceWeights?: boolean): number[];
    /**
     * 计算顶点切线数据
     * @param indices 顶点索引
     * @param positions 顶点数据
     * @param uvs uv数据
     * @param useFaceWeights 是否使用面权重计算切线数据
     */
    createVertexTangents(indices: number[], positions: number[], uvs: number[], useFaceWeights?: boolean): number[];
    /**
     * 计算面切线数据
     * @param indices 顶点索引数据
     * @param positions 顶点数据
     * @param uvs uv数据
     * @param useFaceWeights 是否计算面权重
     */
    createFaceTangents(indices: number[], positions: number[], uvs: number[], useFaceWeights?: boolean): {
        faceTangents: number[];
        faceWeights: number[];
    };
    /**
     * 计算面法线数据
     * @param indices 顶点索引数据
     * @param positions 顶点数据
     * @param useFaceWeights 是否计算面权重
     */
    createFaceNormals(indices: number[], positions: number[], useFaceWeights?: boolean): {
        faceNormals: number[];
        faceWeights: number[];
    };
    /**
     * 应用变换矩阵
     * @param matrix 变换矩阵
     * @param positions 顶点数据
     * @param normals 顶点法线数据
     * @param tangents 顶点切线数据
     */
    applyTransformation(matrix: Matrix4x4, positions: number[], normals?: number[], tangents?: number[]): void;
    /**
     * 合并几何体
     * @param geometrys 几何体列表
     */
    mergeGeometry(geometrys: {
        indices: number[];
        positions: number[];
        uvs?: number[];
        normals?: number[];
        tangents?: number[];
    }[]): {
        indices: number[];
        positions: number[];
        uvs?: number[];
        normals?: number[];
        tangents?: number[];
    };
    /**
     * 射线投影几何体
     * @param ray                           射线
     * @param shortestCollisionDistance     当前最短碰撞距离
     * @param cullFace                      裁剪面枚举
     *
     * @todo
     * @see 3D数学基础：图形与游戏开发 P278 是否可用该内容优化运算效率？
     *
     * @see 优化参考 three.js Ray.intersectTriangle
     */
    raycast(ray: Ray3, indices: number[], positions: number[], uvs: number[], shortestCollisionDistance?: number, cullFace?: CullFace): {
        rayEntryDistance: number;
        localPosition: Vector3;
        localNormal: Vector3;
        uv: Vector2;
        index: number;
    };
    /**
     * 获取包围盒
     * @param positions 顶点数据
     */
    getAABB(positions: number[]): Box3;
}

/**
 * Graphics 类包含一组可用来创建矢量形状的方法。
 */
export declare class Graphics extends Component {
    __class__: "feng3d.Graphics";
    private image;
    private context2D;
    private canvas;
    private width;
    private height;
    constructor();
    draw(width: number, height: number, callback: (context2D: CanvasRenderingContext2D) => void): this;
}

/**
 * 在检查器中控制对象销毁、保存和可见性的位掩码。
 */
export declare enum HideFlags {
    /**
     * 一个正常的,可见对象。这是默认的。
     */
    None = 0,
    /**
     * 不会出现在层次界面中。
     */
    HideInHierarchy = 1,
    /**
     * 不会出现在检查器界面中。
     */
    HideInInspector = 2,
    /**
     * 不会保存到编辑器中的场景中。
     */
    DontSaveInEditor = 4,
    /**
     * 在检查器中不可编辑。
     */
    NotEditable = 8,
    /**
     * 在构建播放器时对象不会被保存。
     */
    DontSaveInBuild = 16,
    /**
     * 对象不会被Resources.UnloadUnusedAssets卸载。
     */
    DontUnloadUnusedAsset = 32,
    /**
     * 不能被变换
     */
    DontTransform = 64,
    /**
     * 隐藏
     */
    Hide = 3,
    /**
     * 对象不会保存到场景中。加载新场景时不会被销毁。相当于DontSaveInBuild | HideFlags。DontSaveInEditor | HideFlags.DontUnloadUnusedAsset
     */
    DontSave = 20,
    /**
     * 不显示在层次界面中，不保存到场景中，加载新场景时不会被销毁。
     */
    HideAndDontSave = 61
}

export declare class HoldSizeComponent extends Component3D {
    __class__: "feng3d.HoldSizeComponent";
    /**
     * 保持缩放尺寸
     */
    holdSize: number;
    /**
     * 相机
     */
    camera: Camera;
    init(): void;
    dispose(): void;
    private _onCameraChanged;
    private _invalidateSceneTransform;
    private _onUpdateLocalToWorldMatrix;
    private _getDepthScale;
}

export declare class HoverController extends LookAtController {
    _currentPanAngle: number;
    _currentTiltAngle: number;
    private _panAngle;
    private _tiltAngle;
    private _distance;
    private _minPanAngle;
    private _maxPanAngle;
    private _minTiltAngle;
    private _maxTiltAngle;
    private _steps;
    private _yFactor;
    private _wrapPanAngle;
    get steps(): number;
    set steps(val: number);
    get panAngle(): number;
    set panAngle(val: number);
    get tiltAngle(): number;
    set tiltAngle(val: number);
    get distance(): number;
    set distance(val: number);
    get minPanAngle(): number;
    set minPanAngle(val: number);
    get maxPanAngle(): number;
    set maxPanAngle(val: number);
    get minTiltAngle(): number;
    set minTiltAngle(val: number);
    get maxTiltAngle(): number;
    set maxTiltAngle(val: number);
    get yFactor(): number;
    set yFactor(val: number);
    get wrapPanAngle(): boolean;
    set wrapPanAngle(val: boolean);
    constructor(node3d?: Node3D, lookAtObject?: Node3D, panAngle?: number, tiltAngle?: number, distance?: number, minTiltAngle?: number, maxTiltAngle?: number, minPanAngle?: number, maxPanAngle?: number, steps?: number, yFactor?: number, wrapPanAngle?: boolean);
    update(interpolate?: boolean): void;
}

declare enum ImageDatas {
    black = "black",
    white = "white",
    red = "red",
    green = "green",
    blue = "blue",
    defaultNormal = "defaultNormal",
    defaultParticle = "defaultParticle"
}

export declare class ImageDataTexture2D extends Texture2D {
    imageData: ImageData;
    private _imageDataChanged;
}

/**
 * 2D纹理
 */
export declare class ImageTexture2D extends Texture2D {
    get image(): HTMLImageElement;
    private _imageChanged;
}

/**
 * 图片相关工具
 */
export declare class ImageUtil {
    imageData: ImageData;
    /**
     * 获取图片数据
     * @param image 加载完成的图片元素
     */
    static fromImage(image: HTMLImageElement): ImageUtil;
    /**
     * 创建ImageData
     * @param width 数据宽度
     * @param height 数据高度
     * @param fillcolor 填充颜色
     */
    constructor(width?: number, height?: number, fillcolor?: Color4);
    /**
     * 初始化
     * @param width 宽度
     * @param height 高度
     * @param fillcolor 填充颜色
     */
    init(width?: number, height?: number, fillcolor?: Color4): void;
    /**
     * 获取图片数据
     * @param image 加载完成的图片元素
     */
    fromImage(image: HTMLImageElement): this;
    /**
     * 绘制图片数据指定位置颜色
     * @param x 图片数据x坐标
     * @param y 图片数据y坐标
     * @param color 颜色值
     */
    drawPixel(x: number, y: number, color: Color4): this;
    /**
     * 获取图片指定位置颜色值
     * @param x 图片数据x坐标
     * @param y 图片数据y坐标
     */
    getPixel(x: number, y: number): Color4;
    /**
     * 设置指定位置颜色值
     * @param imageData 图片数据
     * @param x 图片数据x坐标
     * @param y 图片数据y坐标
     * @param color 颜色值
     */
    setPixel(x: number, y: number, color: Color4): this;
    /**
     * 清理图片数据
     * @param clearColor 清理时填充颜色
     */
    clear(clearColor?: Color4): void;
    /**
     * 填充矩形
     * @param rect 填充的矩形
     * @param fillcolor 填充颜色
     */
    fillRect(rect: Rectangle, fillcolor?: Color4): void;
    /**
     * 绘制线条
     * @param start 起始坐标
     * @param end 终止坐标
     * @param color 线条颜色
     */
    drawLine(start: Vector2, end: Vector2, color: Color4): this;
    /**
     * 绘制点
     * @param x x坐标
     * @param y y坐标
     * @param color 颜色
     * @param size 尺寸
     */
    drawPoint(x: number, y: number, color: Color4, size?: number): this;
    /**
     * 绘制图片数据
     * @param imageData 图片数据
     * @param x x坐标
     * @param y y坐标
     */
    drawImageData(imageData: ImageData, x: number, y: number): this;
    /**
     * 转换为DataUrl字符串数据
     */
    toDataURL(): string;
    /**
     * 创建默认粒子贴图
     * @param size 尺寸
     */
    drawDefaultParticle(size?: number): this;
    /**
     * 创建颜色拾取矩形
     * @param color 基色
     * @param width 宽度
     * @param height 高度
     */
    drawColorPickerRect(color: number): this;
    drawColorRect(color: Color4): this;
    /**
     *
     * @param gradient
     * @param dirw true为横向条带，否则纵向条带
     */
    drawMinMaxGradient(gradient: Gradient, dirw?: boolean): this;
    /**
     * 绘制曲线
     * @param curve 曲线
     * @param between0And1 是否显示值在[0,1]区间，否则[-1,1]区间
     * @param color 曲线颜色
     */
    drawCurve(curve: AnimationCurve, between0And1: boolean, color: Color4, rect?: any): this;
    /**
     * 绘制双曲线
     * @param curve 曲线
     * @param curve1 曲线
     * @param between0And1  是否显示值在[0,1]区间，否则[-1,1]区间
     * @param curveColor 颜色
     */
    drawBetweenTwoCurves(curve: AnimationCurve, curve1: AnimationCurve, between0And1: boolean, curveColor?: Color4, fillcolor?: Color4, rect?: any): this;
    /**
     * 清理背景颜色，目前仅用于特定的抠图，例如 editor\resource\assets\3d\terrain\terrain_brushes.png
     * @param backColor 背景颜色
     */
    clearBackColor(backColor: Color4): void;
}

/**
 * 摄像机镜头
 *
 * 镜头主要作用是投影以及逆投影。
 * 投影指的是从摄像机空间可视区域内的坐标投影至GPU空间可视区域内的坐标。
 *
 * 摄像机可视区域：由近、远，上，下，左，右组成的四棱柱
 * GPU空间可视区域：立方体 [(-1, -1, -1), (1, 1, 1)]
 *
 */
export declare abstract class LensBase extends Feng3dObject {
    /**
     * 摄像机投影类型
     */
    get projectionType(): Projection;
    protected _projectionType: Projection;
    /**
     * 最近距离
     */
    near: number;
    /**
     * 最远距离
     */
    far: number;
    /**
     * 视窗缩放比例(width/height)，在渲染器中设置
     */
    aspect: number;
    /**
     * 创建一个摄像机镜头
     */
    constructor(aspectRatio?: number, near?: number, far?: number);
    /**
     * 投影矩阵
     */
    get matrix(): Matrix4x4;
    /**
     * 逆矩阵
     */
    get inverseMatrix(): Matrix4x4;
    /**
     * 摄像机空间坐标投影到GPU空间坐标
     * @param point3d 摄像机空间坐标
     * @param v GPU空间坐标
     * @return GPU空间坐标
     */
    project(point3d: Vector3, v?: Vector3): Vector3;
    /**
     * GPU空间坐标投影到摄像机空间坐标
     * @param point3d GPU空间坐标
     * @param v 摄像机空间坐标（输出）
     * @returns 摄像机空间坐标
     */
    unproject(point3d: Vector3, v?: Vector3): Vector3;
    /**
     * 逆投影求射线
     *
     * 通过GPU空间坐标x与y值求出摄像机空间坐标的射线
     *
     * @param x GPU空间坐标x值
     * @param y GPU空间坐标y值
     */
    unprojectRay(x: number, y: number, ray?: Ray3): Ray3;
    /**
     * 指定深度逆投影
     *
     * 获取投影在指定GPU坐标且摄像机前方（深度）sZ处的点的3D坐标
     *
     * @param nX GPU空间坐标X
     * @param nY GPU空间坐标Y
     * @param sZ 到摄像机的距离
     * @param v 摄像机空间坐标（输出）
     * @return 摄像机空间坐标
     */
    unprojectWithDepth(nX: number, nY: number, sZ: number, v?: Vector3): Vector3;
    private _inverseMatrix;
    private _invertMatrixInvalid;
    protected _matrix: Matrix4x4;
    private _matrixInvalid;
    /**
     * 投影矩阵失效
     */
    protected invalidate(): void;
    private _updateInverseMatrix;
    /**
     * 更新投影矩阵
     */
    protected abstract _updateMatrix(): void;
    /**
     * 克隆
     */
    abstract clone(): LensBase;
}

/**
 * 灯光
 */
export declare class Light extends Behaviour {
    /**
     * 灯光类型
     */
    lightType: LightType;
    /**
     * 颜色
     */
    color: Color3;
    /**
     * 光照强度
     */
    intensity: number;
    /**
     * 阴影类型
     */
    shadowType: ShadowType;
    /**
     * 光源位置
     */
    get position(): Vector3;
    /**
     * 光照方向
     */
    get direction(): Vector3;
    /**
     * 阴影偏差，用来解决判断是否为阴影时精度问题
     */
    shadowBias: number;
    /**
     * 阴影半径，边缘宽度
     */
    shadowRadius: number;
    /**
     * 阴影近平面距离
     */
    get shadowCameraNear(): number;
    /**
     * 阴影近平面距离
     */
    get shadowCameraFar(): number;
    /**
     * 投影摄像机
     */
    shadowCamera: Camera;
    /**
     * 阴影图尺寸
     */
    get shadowMapSize(): Vector2;
    get shadowMap(): RenderTargetTexture2D;
    /**
     * 帧缓冲对象，用于处理光照阴影贴图渲染
     */
    frameBufferObject: FrameBufferObject;
    debugShadowMap: boolean;
    private debugShadowMapModel;
    constructor();
    updateDebugShadowMap(scene: Scene, viewCamera: Camera): void;
}

export declare class LightPicker {
    private _model;
    constructor(model: Renderable);
    beforeRender(renderAtomic: RenderAtomic): void;
}

/**
 * 灯光类型

 */
export declare enum LightType {
    /**
     * 方向光
     */
    Directional = 0,
    /**
     * 点光
     */
    Point = 1,
    /**
     * 聚光灯
     */
    Spot = 2
}

export declare class LookAtController extends ControllerBase {
    protected _lookAtPosition: Vector3;
    protected _lookAtNode3D: Node3D;
    protected _origin: Vector3;
    protected _upAxis: Vector3;
    protected _pos: Vector3;
    constructor(node3d?: Node3D, Node3D?: Node3D);
    get upAxis(): Vector3;
    set upAxis(upAxis: Vector3);
    get lookAtPosition(): Vector3;
    set lookAtPosition(val: Vector3);
    get lookAtObject(): Node3D<Component3DEventMap>;
    set lookAtObject(value: Node3D<Component3DEventMap>);
    update(interpolate?: boolean): void;
}

/**
 * 材质
 */
export declare class Material extends Feng3dObject {
    __class__: "feng3d.Material";
    static create<K extends keyof UniformsTypes>(shaderName: K, uniforms?: gPartial<UniformsTypes[K]>, renderParams?: gPartial<RenderParams>): Material;
    init<K extends keyof UniformsTypes>(shaderName: K, uniforms?: gPartial<UniformsTypes[K]>, renderParams?: gPartial<RenderParams>): this;
    private renderAtomic;
    private preview;
    /**
     * shader名称
     */
    shaderName: ShaderNames;
    get name(): string;
    set name(v: string);
    protected _name: string;
    /**
     * Uniform数据
     */
    uniforms: UniformsLike;
    /**
     * 渲染参数
     */
    renderParams: RenderParams;
    constructor();
    beforeRender(renderAtomic: RenderAtomic): void;
    /**
     * 是否加载完成
     */
    get isLoaded(): boolean;
    /**
     * 已加载完成或者加载完成时立即调用
     * @param callback 完成回调
     */
    onLoadCompleted(callback: () => void): void;
    private _onShaderChanged;
    private _onUniformsChanged;
    private _onRenderParamsChanged;
    /**
     * 设置默认材质
     *
     * 资源名称与材质名称相同，且无法在检查器界面中编辑。
     *
     * @param name 材质名称
     * @param material 材质数据
     */
    static setDefault<K extends keyof DefaultMaterial>(name: K, material: gPartial<Material>): void;
    /**
     * 获取材质
     *
     * @param name 材质名称
     */
    static getDefault<K extends keyof DefaultMaterial>(name: K): DefaultMaterial[K];
    private static _defaultMaterials;
}

/**
 * 菜单配置
 */
export declare interface MenuConfig {
    /**
     * 组件菜单
     */
    component?: ComponentMenu[];
}

/**
 * 菜单配置
 */
export declare const menuConfig: MenuConfig;

/**
 * 网格渲染器
 */
export declare class MeshRenderer extends Renderable {
    __class__: "feng3d.MeshRenderer";
    static create(name?: string, callback?: (component: MeshRenderer) => void): MeshRenderer;
}

/**
 * 鼠标事件管理
 */
export declare class Mouse3DManager {
    mouseInput: MouseInput;
    get selectedTransform(): Node3D<Component3DEventMap>;
    set selectedTransform(v: Node3D<Component3DEventMap>);
    /**
     * 视窗，鼠标在该矩形内时为有效事件
     */
    viewport: Lazy<Rectangle>;
    /**
     * 拾取
     * @param scene 场景
     * @param camera 摄像机
     */
    pick(view: View, scene: Scene, camera: Camera): Node3D<Component3DEventMap>;
    constructor(mouseInput: MouseInput, viewport?: Lazy<Rectangle>);
    private _selectedTransform;
    private _mouseEventTypes;
    /**
     * 鼠标按下时的对象，用于与鼠标弹起时对象做对比，如果相同触发click
     */
    private preMouseDownNode3D;
    /**
     * 统计处理click次数，判断是否达到dblclick
     */
    private node3DClickNum;
    private _mouseInputChanged;
    private dispatch;
    /**
     * 监听鼠标事件收集事件类型
     */
    private onMouseEvent;
    /**
     * 设置选中对象
     */
    private setSelectedNode3D;
}

declare interface MouseEventMap {
    /**
     * 鼠标移出对象
     */
    mouseout: {
        clientX: number;
        clientY: number;
    };
    /**
     * 鼠标移入对象
     */
    mouseover: {
        clientX: number;
        clientY: number;
    };
    /**
     * 鼠标在对象上移动
     */
    mousemove: {
        clientX: number;
        clientY: number;
    };
    /**
     * 鼠标左键按下
     */
    mousedown: {
        clientX: number;
        clientY: number;
    };
    /**
     * 鼠标左键弹起
     */
    mouseup: {
        clientX: number;
        clientY: number;
    };
    /**
     * 单击
     */
    click: {
        clientX: number;
        clientY: number;
    };
    /**
     * 鼠标中键按下
     */
    middlemousedown: {
        clientX: number;
        clientY: number;
    };
    /**
     * 鼠标中键弹起
     */
    middlemouseup: {
        clientX: number;
        clientY: number;
    };
    /**
     * 鼠标中键单击
     */
    middleclick: {
        clientX: number;
        clientY: number;
    };
    /**
     * 鼠标右键按下
     */
    rightmousedown: {
        clientX: number;
        clientY: number;
    };
    /**
     * 鼠标右键弹起
     */
    rightmouseup: {
        clientX: number;
        clientY: number;
    };
    /**
     * 鼠标右键单击
     */
    rightclick: {
        clientX: number;
        clientY: number;
    };
    /**
     * 鼠标双击
     */
    dblclick: {
        clientX: number;
        clientY: number;
    };
}

/**
 * 鼠标事件输入
 */
declare class MouseInput<T = MouseEventMap> extends EventEmitter<T> {
    /**
     * 是否启动
     */
    enable: boolean;
    /**
     * 是否捕获鼠标移动
     */
    catchMouseMove: boolean;
    /**
     * 将事件调度到事件流中. 事件目标是对其调用 dispatchEvent() 方法的 IEvent 对象。
     * @param type                      事件的类型。类型区分大小写。
     * @param data                      事件携带的自定义数据。
     * @param bubbles                   表示事件是否为冒泡事件。如果事件可以冒泡，则此值为 true；否则为 false。
     */
    emit<K extends keyof T & string>(type: K, data?: T[K], bubbles?: boolean): boolean;
    /**
     * 派发事件
     * @param event   事件对象
     */
    emitEvent<K extends keyof T & string>(event: Event_2<T[K]>): boolean;
}

/**
 * 鼠标拾取渲染器
 */
export declare class MouseRenderer extends EventEmitter {
    private objects;
    /**
     * 渲染
     */
    draw(gl: GL, viewRect: Rectangle): Entity<EntityEventMap>;
    protected drawRenderables(gl: GL, renderable: Renderable): void;
    /**
     * 绘制3D对象
     */
    protected drawGameObject(gl: GL, renderAtomic: RenderAtomic): void;
}

/**
 * 变换
 *
 * 物体的位置、旋转和比例。
 *
 * 场景中的每个对象都有一个变换。它用于存储和操作对象的位置、旋转和缩放。每个转换都可以有一个父元素，它允许您分层应用位置、旋转和缩放
 */
export declare class Node3D<T extends Component3DEventMap = Component3DEventMap> extends Component<T> {
    __class__: "feng3d.Node3D";
    assetType: AssetType;
    /**
     * 预设资源编号
     */
    prefabId: string;
    /**
     * 资源编号
     */
    assetId: string;
    /**
     * 自身以及子对象是否支持鼠标拾取
     */
    mouseEnabled: boolean;
    /**
     * 创建一个实体，该类为虚类
     */
    constructor();
    /**
     * 世界坐标
     */
    get worldPosition(): Vector3;
    /**
     * X轴坐标。
     */
    get x(): number;
    set x(v: number);
    private _x;
    /**
     * Y轴坐标。
     */
    get y(): number;
    set y(v: number);
    private _y;
    /**
     * Z轴坐标。
     */
    get z(): number;
    set z(v: number);
    private _z;
    /**
     * X轴旋转角度。
     */
    get rx(): number;
    set rx(v: number);
    private _rx;
    /**
     * Y轴旋转角度。
     */
    get ry(): number;
    set ry(v: number);
    private _ry;
    /**
     * Z轴旋转角度。
     */
    get rz(): number;
    set rz(v: number);
    private _rz;
    /**
     * X轴缩放。
     */
    get sx(): number;
    set sx(v: number);
    private _sx;
    /**
     * Y轴缩放。
     */
    get sy(): number;
    set sy(v: number);
    private _sy;
    /**
     * Z轴缩放。
     */
    get sz(): number;
    set sz(v: number);
    private _sz;
    getPosition<T extends IVector3 = Vector3>(p?: T): T;
    setPosition<T extends IVector3>(p: T): this;
    getRotation<T extends IVector3 = Vector3>(p?: T): T;
    setRotation<T extends IVector3>(p: T): this;
    getScale<T extends IVector3 = Vector3>(p?: T): T;
    /**
     * 本地四元素旋转
     */
    get orientation(): Quaternion;
    set orientation(value: Quaternion);
    /**
     * 是否显示
     */
    get visible(): boolean;
    set visible(v: boolean);
    private _visible;
    /**
     * 全局是否可见
     */
    get globalVisible(): boolean;
    protected _globalVisible: boolean;
    protected _globalVisibleInvalid: boolean;
    /**
     * 本地变换矩阵
     */
    get matrix(): Matrix4x4;
    set matrix(v: Matrix4x4);
    /**
     * 本地旋转矩阵
     */
    get rotationMatrix(): Matrix4x4;
    /**
     * 轴对称包围盒
     */
    get boundingBox(): BoundingBox;
    private _boundingBox;
    get parent(): Node3D<Component3DEventMap>;
    get scene(): Scene;
    /**
     * 子对象
     */
    get children(): Node3D<Component3DEventMap>[];
    set children(value: Node3D<Component3DEventMap>[]);
    get numChildren(): number;
    moveForward(distance: number): void;
    moveBackward(distance: number): void;
    moveLeft(distance: number): void;
    moveRight(distance: number): void;
    moveUp(distance: number): void;
    moveDown(distance: number): void;
    translate(axis: Vector3, distance: number): void;
    translateLocal(axis: Vector3, distance: number): void;
    pitch(angle: number): void;
    yaw(angle: number): void;
    roll(angle: number): void;
    rotateTo(ax: number, ay: number, az: number): void;
    /**
     * 绕指定轴旋转，不受位移与缩放影响
     * @param    axis               旋转轴
     * @param    angle              旋转角度
     * @param    pivotPoint         旋转中心点
     *
     */
    rotate(axis: Vector3, angle: number, pivotPoint?: Vector3): void;
    /**
     * 看向目标位置
     *
     * @param target    目标位置
     * @param upAxis    向上朝向
     */
    lookAt(target: Vector3, upAxis?: Vector3): void;
    /**
     * 将一个点从局部空间变换到世界空间的矩阵。
     */
    get localToWorldMatrix(): Matrix4x4;
    set localToWorldMatrix(value: Matrix4x4);
    /**
     * 本地转世界逆转置矩阵
     */
    get ITlocalToWorldMatrix(): Matrix4x4;
    /**
     * 将一个点从世界空间转换为局部空间的矩阵。
     */
    get worldToLocalMatrix(): Matrix4x4;
    get localToWorldRotationMatrix(): Matrix4x4;
    get worldToLocalRotationMatrix(): Matrix4x4;
    /**
     * 根据名称查找对象
     *
     * @param name 对象名称
     */
    find(name: string): Node3D;
    /**
     * 是否包含指定对象
     *
     * @param child 可能的子孙对象
     */
    contains(child: Node3D): boolean;
    /**
     * 添加子对象
     *
     * @param child 子对象
     */
    addChild(child: Node3D): Node3D<Component3DEventMap>;
    /**
     * 添加子对象
     *
     * @param children 子对象
     */
    addChildren(...children: Node3D[]): void;
    /**
     * 移除自身
     */
    remove(): void;
    /**
     * 移除所有子对象
     */
    removeChildren(): void;
    /**
     * 移除子对象
     *
     * @param child 子对象
     */
    removeChild(child: Node3D): void;
    /**
     * 删除指定位置的子对象
     *
     * @param index 需要删除子对象的所有
     */
    removeChildAt(index: number): void;
    /**
     * 获取指定位置的子对象
     *
     * @param index
     */
    getChildAt(index: number): Node3D<Component3DEventMap>;
    /**
     * 获取子对象列表（备份）
     */
    getChildren(): Node3D<Component3DEventMap>[];
    /**
     * 将方向从局部空间转换到世界空间。
     *
     * @param direction 局部空间方向
     */
    transformDirection(direction: Vector3): Vector3;
    /**
     * 将方向从局部空间转换到世界空间。
     *
     * @param direction 局部空间方向
     */
    localToWolrdDirection(direction: Vector3): Vector3;
    /**
     * 将包围盒从局部空间转换到世界空间
     *
     * @param box 变换前的包围盒
     * @param out 变换之后的包围盒
     *
     * @returns 变换之后的包围盒
     */
    localToWolrdBox(box: Box3, out?: Box3): Box3;
    /**
     * 将位置从局部空间转换为世界空间。
     *
     * @param position 局部空间位置
     */
    transformPoint(position: Vector3): Vector3;
    /**
     * 将位置从局部空间转换为世界空间。
     *
     * @param position 局部空间位置
     */
    localToWorldPoint(position: Vector3): Vector3;
    /**
     * 将向量从局部空间变换到世界空间。
     *
     * @param vector 局部空间向量
     */
    transformVector(vector: Vector3): Vector3;
    /**
     * 将向量从局部空间变换到世界空间。
     *
     * @param vector 局部空间位置
     */
    localToWorldVector(vector: Vector3): Vector3;
    /**
     * Transforms a direction from world space to local space. The opposite of Transform.TransformDirection.
     *
     * 将一个方向从世界空间转换到局部空间。
     */
    inverseTransformDirection(direction: Vector3): Vector3;
    /**
     * 将一个方向从世界空间转换到局部空间。
     */
    worldToLocalDirection(direction: Vector3): Vector3;
    /**
     * 将位置从世界空间转换为局部空间。
     *
     * @param position 世界坐标系中位置
     */
    worldToLocalPoint(position: Vector3, out?: Vector3): Vector3;
    /**
     * 将向量从世界空间转换为局部空间
     *
     * @param vector 世界坐标系中向量
     */
    worldToLocalVector(vector: Vector3): Vector3;
    /**
     * 将 Ray3 从世界空间转换为局部空间。
     *
     * @param worldRay 世界空间射线。
     * @param localRay 局部空间射线。
     */
    rayWorldToLocal(worldRay: Ray3, localRay?: Ray3): Ray3;
    /**
     * 从自身与子代（孩子，孩子的孩子，...）Entity 中获取所有指定类型的组件
     *
     * @param type		要检索的组件的类型。
     * @return			返回与给出类定义一致的组件
     */
    getComponentsInChildren<T extends Components>(type?: Constructor<T>, filter?: (compnent: T) => {
        /**
         * 是否继续查找子项
         */
        findchildren: boolean;
        /**
         * 是否为需要查找的组件
         */
        value: boolean;
    }, result?: T[]): T[];
    /**
     * 从父代（父亲，父亲的父亲，...）中获取组件
     *
     * @param type		类定义
     * @return			返回与给出类定义一致的组件
     */
    getComponentsInParents<T extends Components>(type?: Constructor<T>, result?: T[]): T[];
    beforeRender(renderAtomic: RenderAtomic, scene: Scene, camera: Camera): void;
    /**
     * 销毁
     */
    dispose(): void;
    disposeWithChildren(): void;
    private readonly _orientation;
    protected readonly _matrix: Matrix4x4;
    protected _matrixInvalid: boolean;
    protected readonly _rotationMatrix: Matrix4x4;
    protected _rotationMatrixInvalid: boolean;
    protected readonly _localToWorldMatrix: Matrix4x4;
    protected _localToWorldMatrixInvalid: boolean;
    protected readonly _ITlocalToWorldMatrix: Matrix4x4;
    protected _ITlocalToWorldMatrixInvalid: boolean;
    protected readonly _worldToLocalMatrix: Matrix4x4;
    protected _worldToLocalMatrixInvalid: boolean;
    protected readonly _localToWorldRotationMatrix: Matrix4x4;
    protected _localToWorldRotationMatrixInvalid: boolean;
    protected _parent: Node3D;
    protected _children: Node3D[];
    protected _scene: Scene;
    private _renderAtomic;
    private _positionChanged;
    private _rotationChanged;
    private _scaleChanged;
    private _setParent;
    private updateScene;
    /**
     * @private
     */
    private _updateChildrenScene;
    private removeChildInternal;
    private _invalidateTransform;
    private _invalidateSceneTransform;
    private _updateMatrix;
    private _updateLocalToWorldMatrix;
    /**
     * 是否加载完成
     */
    get isLoaded(): boolean;
    /**
     * 已加载完成或者加载完成时立即调用
     * @param callback 完成回调
     */
    onLoadCompleted(callback: () => void): void;
    protected _updateGlobalVisible(): void;
    protected _invalidateGlobalVisible(): void;
    /**
     * 申明冒泡函数
     * feng3d.__event_bubble_function__
     */
    protected __event_bubble_function__(): any[];
    /**
     * @private
     * @param v
     */
    _setScene(v: Scene): void;
}

/**
 * 正射投影镜头
 */
export declare class OrthographicLens extends LensBase {
    /**
     * 尺寸
     */
    size: number;
    /**
     * 构建正射投影镜头
     * @param size 尺寸
     */
    constructor(size?: number, aspect?: number, near?: number, far?: number);
    protected _updateMatrix(): void;
    clone(): OrthographicLens;
}

export declare class OutLineComponent extends Component {
    __class__: "feng3d.OutLineComponent";
    size: number;
    color: Color4;
    outlineMorphFactor: number;
    beforeRender(renderAtomic: RenderAtomic, scene: Scene, camera: Camera): void;
}

/**
 * 轮廓渲染器
 */
export declare class OutlineRenderer {
    renderAtomic: RenderAtomic;
    init(): void;
    draw(gl: GL, scene: Scene, camera: Camera): void;
}

export declare class ParametricGeometry extends Geometry {
    /**
     * @author zz85 / https://github.com/zz85
     * Parametric Surfaces Geometry
     * based on the brilliant article by @prideout http://prideout.net/blog/?p=44
     *
     * new ParametricGeometry( parametricFunction, uSegments, ySegements );
     *
     */
    constructor(func: (u: number, v: number) => Vector3, slices?: number, stacks?: number, doubleside?: boolean);
    /**
     * 构建几何体
     */
    protected buildGeometry(): void;
}

/**
 * 由path.parse()生成或由path.format()使用的已解析路径对象。
 */
declare interface ParsedPath {
    /**
     * 路径的根，如'/'或'c:\'
     */
    root: string;
    /**
     * 完整的目录路径，如'/home/user/dir'或'c:\path\dir'
     */
    dir: string;
    /**
     * 包含扩展名(如有)的文件名，如'index.html'
     */
    base: string;
    /**
     * 文件扩展名(如果有)，如'.html'
     */
    ext: string;
    /**
     * 没有扩展名(如果有)的文件名，如'index'
     */
    name: string;
}

/**
 * 路径
 */
declare interface Path {
    /**
     * 规范化字符串路径，减少'.'和'.'的部分。当发现多个斜杠时，它们被单个斜杠替换;当路径包含尾部斜杠时，它将被保留。在Windows上使用反斜杠。
     *
     * @param p 要规范化的字符串路径。
     */
    normalize(p: string): string;
    /**
     * 将所有参数连接在一起，并规范化生成的路径。参数必须是字符串。在v0.8中，非字符串参数被悄悄地忽略。在v0.10及以上版本中，会抛出异常。
     *
     * @param paths 用于连接的路径列表
     */
    join(...paths: string[]): string;
    /**
     * 最右边的参数被认为是{to}。其他参数被认为是{from}的数组。
     *
     * 从最左边的{from}参数开始，将{to}解析为一个绝对路径。
     *
     * 如果{to}还不是绝对的，则{from}参数将按从右到左的顺序预先设置，直到找到绝对路径为止。如果在使用所有{from}路径之后仍然没有找到绝对路径，则还将使用当前工作目录。得到的路径是规范化的，除非路径被解析到根目录，否则尾部斜杠将被删除。
     *
     * @param pathSegments 要连接的字符串路径。非字符串参数将被忽略。
     */
    resolve(...pathSegments: string[]): string;
    /**
     * 确定{path}是否是一个绝对路径。无论工作目录如何，绝对路径总是解析到相同的位置。
     *
     * @param path 用于测试的路径。
     */
    isAbsolute(path: string): boolean;
    /**
     * 解决从{from}到{to}的相对路径。有时我们有两条绝对路径，我们需要推导出一条到另一条的相对路径。这实际上是path.resolve的逆变换。
     *
     * @param from 起始路径
     * @param to 目标路径
     */
    relative(from: string, to: string): string;
    /**
     * 返回路径的目录名。类似于Unix的dirname命令。
     *
     * @param p 求值的路径。
     */
    dirname(p: string): string;
    /**
     * 返回路径的最后一部分。类似于Unix basename命令。通常用于从完全限定的路径中提取文件名。
     *
     * @param p 求值的路径。
     * @param ext 可选地，从结果中删除的扩展。
     */
    basename(p: string, ext?: string): string;
    /**
     * 返回路径的扩展名，在路径的最后一部分从最后一个'.'到字符串末尾。如果在路径的最后部分没有'.'或者最后一个字符时'.'则返回一个空字符串。
     *
     * @param p 求值的路径。
     */
    extname(p: string): string;
    /**
     * 特定平台的文件分隔符。'\\'或'/'。
     */
    sep: '\\' | '/';
    /**
     * 特定平台的文件分隔符。 ';' 或者 ':'.
     */
    delimiter: ';' | ':';
    /**
     * 从路径字符串返回一个对象 —— 与format()相反。
     *
     * @param pathString 路径字符串。
     */
    parse(pathString: string): ParsedPath;
    /**
     * 从对象返回路径字符串——与parse()相反。
     *
     * @param pathObject 路径对象。
     */
    format(pathObject: FormatInputPathObject): string;
    win32: Path;
    posix: Path;
}

/**
 * 路径
 *
 * 从nodeJs的path移植
 *
 * @see http://nodejs.cn/api/path.html
 * @see https://github.com/nodejs/node/blob/master/lib/path.js
 */
export declare const path: Win32Path | PosixPath;

/**
 * 透视摄像机镜头
 */
export declare class PerspectiveLens extends LensBase {
    /**
     * 垂直视角，视锥体顶面和底面间的夹角；单位为角度，取值范围 [1,179]
     */
    fov: number;
    /**
     * 创建一个透视摄像机镜头
     * @param fov 垂直视角，视锥体顶面和底面间的夹角；单位为角度，取值范围 [1,179]
     *
     */
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
    /**
     * 焦距
     */
    get focalLength(): number;
    set focalLength(value: number);
    /**
     * 投影
     *
     * 摄像机空间坐标投影到GPU空间坐标
     *
     * @param point3d 摄像机空间坐标
     * @param v GPU空间坐标
     * @return GPU空间坐标
     */
    project(point3d: Vector3, v?: Vector3): Vector3;
    /**
     * 逆投影
     *
     * GPU空间坐标投影到摄像机空间坐标
     *
     * @param point3d GPU空间坐标
     * @param v 摄像机空间坐标（输出）
     * @returns 摄像机空间坐标
     */
    unproject(point3d: Vector3, v?: Vector3): Vector3;
    protected _updateMatrix(): void;
    clone(): PerspectiveLens;
}

/**
 * 拾取的碰撞数据
 */
declare interface PickingCollisionVO {
    /**
     * 第一个穿过的物体
     */
    node3d: Node3D;
    /**
     * 碰撞的uv坐标
     */
    uv?: Vector2;
    /**
     * 实体上碰撞本地坐标
     */
    localPosition?: Vector3;
    /**
     * 射线顶点到实体的距离
     */
    rayEntryDistance: number;
    /**
     * 本地坐标系射线
     */
    localRay: Ray3;
    /**
     * 本地坐标碰撞法线
     */
    localNormal: Vector3;
    /**
     * 射线坐标是否在边界内
     */
    rayOriginIsInsideBounds: boolean;
    /**
     * 碰撞三角形索引
     */
    index?: number;
    /**
     * 碰撞关联的渲染对象
     */
    geometry: Geometry;
    /**
     * 剔除面
     */
    cullFace: CullFace;
}

/**
 * 平面几何体
 */
export declare class PlaneGeometry extends Geometry {
    __class__: "feng3d.PlaneGeometry";
    /**
     * 宽度
     */
    width: number;
    /**
     * 高度
     */
    height: number;
    /**
     * 横向分割数
     */
    segmentsW: number;
    /**
     * 纵向分割数
     */
    segmentsH: number;
    /**
     * 是否朝上
     */
    yUp: boolean;
    protected _name: string;
    /**
     * 构建几何体数据
     */
    protected buildGeometry(): void;
    /**
     * 构建顶点坐标
     * @param this.width 宽度
     * @param this.height 高度
     * @param this.segmentsW 横向分割数
     * @param this.segmentsH 纵向分割数
     * @param this.yUp 正面朝向 true:Y+ false:Z+
     */
    private buildPosition;
    /**
     * 构建顶点法线
     * @param this.segmentsW 横向分割数
     * @param this.segmentsH 纵向分割数
     * @param this.yUp 正面朝向 true:Y+ false:Z+
     */
    private buildNormal;
    /**
     * 构建顶点切线
     * @param this.segmentsW 横向分割数
     * @param this.segmentsH 纵向分割数
     * @param this.yUp 正面朝向 true:Y+ false:Z+
     */
    private buildTangent;
    /**
     * 构建顶点索引
     * @param this.segmentsW 横向分割数
     * @param this.segmentsH 纵向分割数
     * @param this.yUp 正面朝向 true:Y+ false:Z+
     */
    private buildIndices;
    /**
     * 构建uv
     * @param this.segmentsW 横向分割数
     * @param this.segmentsH 纵向分割数
     */
    private buildUVs;
}

/**
 * 点几何体
 */
export declare class PointGeometry extends Geometry {
    __class__: "feng3d.PointGeometry";
    /**
     * 点数据列表
     * 修改数组内数据时需要手动调用 invalidateGeometry();
     */
    points: PointInfo[];
    /**
     * 构建几何体
     */
    buildGeometry(): void;
}

/**
 * 点信息
 */
declare interface PointInfo {
    position?: Vector3;
    color?: Color4;
    normal?: Vector3;
    uv?: Vector2;
}

/**
 * 点光源
 */
export declare class PointLight extends Light {
    __class__: "feng3d.PointLight";
    lightType: LightType;
    /**
     * 光照范围
     */
    get range(): number;
    set range(v: number);
    private _range;
    /**
     * 阴影图尺寸
     */
    get shadowMapSize(): Vector2;
    constructor();
    private invalidRange;
}

export declare class PointUniforms {
    __class__: "feng3d.PointUniforms";
    /**
     * 颜色
     */
    u_color: Color4;
    /**
     * 点绘制时点的尺寸
     */
    u_PointSize: number;
}

/**
 * 对象池
 *
 * 对象池并不能带来性能的提升，反而会严重影响性能。但是在管理内存时可以考虑使用。
 *
 * js虚拟机会在对象没有被引用时自动释放内存，谨慎使用对象池。
 *
 */
export declare class Pool<T> {
    private _objects;
    private _type;
    constructor(type: Constructor<T>);
    /**
     * 获取对象
     */
    get(): T;
    /**
     * 释放对象
     *
     * @param args 被释放对象列表
     */
    release(...args: T[]): void;
    /**
     * 获取指定数量的对象
     *
     * @param num 数量
     */
    getArray(num: number): T[];
    /**
     * 释放对象
     *
     * @param objects 被释放对象列表
     */
    releaseArray(objects: T[]): void;
}

declare class PosixPath implements Path {
    resolve(...pathSegments: string[]): string;
    normalize(path: string): string;
    isAbsolute(path: string): boolean;
    join(): string;
    relative(from: string, to: string): string;
    toNamespacedPath(path: string): string;
    dirname(path: string): string;
    basename(path: string, ext: string): string;
    extname(path: string): string;
    format(pathObject: {
        dir: string;
        root: string;
        base: string;
        name: string;
        ext: string;
    }): string;
    parse(path: string): {
        root: string;
        dir: string;
        base: string;
        ext: string;
        name: string;
    };
    sep: "\\" | "/";
    delimiter: ";" | ":";
    win32: Win32Path;
    posix: PosixPath;
}

/**
 * 摄像机投影类型
 */
export declare enum Projection {
    /**
     * 透视投影
     */
    Perspective = 0,
    /**
     * 正交投影
     */
    Orthographic = 1
}

export declare class PropertyClip {
    /**
     * 属性路径
     */
    path: PropertyClipPath;
    propertyName: string;
    type: "Number" | "Vector3" | "Quaternion";
    propertyValues: [number, number[]][];
    private _cacheValues;
    private _propertyValues;
    getValue(cliptime: number, fps: number): any;
    private interpolation;
    private getpropertyValue;
    cacheIndex: number;
}

declare type PropertyClipPath = [PropertyClipPathItemType, string][];

declare enum PropertyClipPathItemType {
    Entity = 0,
    Component = 1
}

/**
 * 四边形面皮几何体
 */
export declare class QuadGeometry extends Geometry {
    __class__: "feng3d.QuadGeometry";
    constructor();
}

/**
 * 可射线捕获
 */
export declare class RayCastable extends Behaviour {
    protected _selfLocalBounds: Box3;
    protected _selfWorldBounds: Box3;
    /**
     * 自身局部包围盒
     */
    get selfLocalBounds(): Box3;
    /**
     * 自身世界包围盒
     */
    get selfWorldBounds(): Box3;
    /**
     * 与世界空间射线相交
     *
     * @param worldRay 世界空间射线
     *
     * @return 相交信息
     */
    worldRayIntersection(worldRay: Ray3): PickingCollisionVO;
    protected _onScenetransformChanged(): void;
    /**
     * 更新世界边界
     */
    protected _updateWorldBounds(): void;
    /**
     * 处理包围盒变换事件
     */
    protected _onBoundsInvalid(): void;
    protected _updateBounds(): void;
}

/**
 * 射线投射拾取器
 */
export declare class Raycaster {
    /**
     * 获取射线穿过的实体
     * @param ray3D 射线
     * @param transforms 实体列表
     * @return
     */
    pick(ray3D: Ray3, transforms: Node3D[]): PickingCollisionVO;
    /**
     * 获取射线穿过的实体
     * @param ray3D 射线
     * @param node3ds 实体列表
     * @return
     */
    pickAll(ray3D: Ray3, node3ds: Node3D[]): PickingCollisionVO[];
}

/**
 * 可读资源系统
 */
export declare class ReadRS {
    /**
     * 文件系统
     */
    get fs(): ReadFS;
    protected _fs: ReadFS;
    /**
     * 根资源路径
     */
    get rootPath(): string;
    private _rootPath;
    /**
     * 根资源
     */
    get root(): FolderAsset;
    /**
     * 资源编号映射
     */
    protected _idMap: {
        [id: string]: FileAsset;
    };
    /**
     * 资源路径映射
     */
    protected _pathMap: {
        [path: string]: FileAsset;
    };
    /**
     * 资源树保存路径
     */
    protected resources: string;
    /**
     * 构建可读资源系统
     *
     * @param fs 可读文件系统
     */
    constructor(fs?: ReadFS);
    /**
     * 初始化
     *
     * @param callback 完成回调
     */
    init(callback?: () => void): void;
    /**
     * 新建资源
     *
     * @param cls 资源类定义
     * @param fileName 文件名称
     * @param value 初始数据
     * @param parent 所在文件夹，如果值为null时默认添加到根文件夹中
     * @param callback 完成回调函数
     */
    createAsset<T extends FileAsset>(cls: new () => T, fileName?: string, value?: gPartial<T>, parent?: FolderAsset, callback?: (err: Error, asset: T) => void): void;
    /**
     * 获取有效子文件名称
     *
     * @param parent 父文件夹
     * @param fileName 文件名称
     */
    getValidChildName(parent: FolderAsset, fileName: string): string;
    /**
     * 读取文件为资源对象
     * @param id 资源编号
     * @param callback 读取完成回调
     */
    readAsset(id: string, callback: (err: Error, asset: FileAsset) => void): void;
    /**
     * 读取资源数据
     *
     * @param id 资源编号
     * @param callback 完成回调
     */
    readAssetData(id: string, callback: (err: Error, data: AssetData) => void): void;
    /**
     * 读取资源数据列表
     *
     * @param assetids 资源编号列表
     * @param callback 完成回调
     */
    readAssetDatas(assetids: string[], callback: (err: Error, data: AssetData[]) => void): void;
    /**
     * 获取指定类型资源
     *
     * @param type 资源类型
     */
    getAssetsByType<T extends FileAsset>(type: Constructor<T>): T[];
    /**
     * 获取指定类型资源数据
     *
     * @param type 资源类型
     */
    getLoadedAssetDatasByType<T extends any>(type: Constructor<T>): T[];
    /**
     * 获取指定编号资源
     *
     * @param id 资源编号
     */
    getAssetById(id: string): FileAsset;
    /**
     * 获取指定路径资源
     *
     * @param path 资源路径
     */
    getAssetByPath(path: string): FileAsset;
    /**
     * 获取文件夹内子文件路径列表
     *
     * @param path 路径
     */
    getChildrenPathsByPath(path: string): string[];
    /**
     * 获取文件夹内子文件列表
     *
     * @param path 文件夹路径
     */
    getChildrenAssetByPath(path: string): FileAsset[];
    /**
     * 新增资源
     *
     * @param asset 资源
     */
    addAsset(asset: FileAsset): void;
    /**
     * 获取所有资源编号列表
     */
    getAllIds(): string[];
    /**
     * 获取所有资源路径列表
     */
    getAllPaths(): string[];
    /**
     * 获取所有资源
     */
    getAllAssets(): FileAsset[];
    /**
     * 删除指定编号的资源
     *
     * @param id 资源编号
     */
    deleteAssetById(id: string): void;
    /**
     * 删除指定路径的资源
     *
     * @param path 资源路径
     */
    deleteAssetByPath(path: string): void;
    /**
     * 删除资源
     *
     * @param asset 资源
     */
    deleteAsset0(asset: FileAsset): void;
    /**
     * 获取需要反序列化对象中的资源id列表
     */
    getAssetsWithObject(object: any, assetids?: string[]): string[];
    /**
     * 反序列化包含资源的对象
     *
     * @param object 反序列化的对象
     * @param callback 完成回调
     */
    deserializeWithAssets(object: any, callback: (result: any) => void): void;
}

/**
 * 可读写资源系统
 */
export declare class ReadWriteRS extends ReadRS {
    /**
     * 文件系统
     */
    get fs(): ReadWriteFS;
    protected _fs: ReadWriteFS;
    /**
     * 延迟保存执行函数
     */
    private laterSaveFunc;
    /**
     * 延迟保存，避免多次操作时频繁调用保存
     */
    private laterSave;
    /**
     * 构建可读写资源系统
     *
     * @param fs 可读写文件系统
     */
    constructor(fs?: ReadWriteFS);
    /**
     * 在更改资源结构（新增，移动，删除）时会自动保存
     *
     * @param callback 完成回调
     */
    private save;
    /**
     * 新建资源
     *
     * @param cls 资源类定义
     * @param fileName 文件名称
     * @param value 初始数据
     * @param parent 所在文件夹，如果值为null时默认添加到根文件夹中
     * @param callback 完成回调函数
     */
    createAsset<T extends FileAsset>(cls: new () => T, fileName?: string, value?: gPartial<T>, parent?: FolderAsset, callback?: (err: Error, asset: T) => void): void;
    /**
     * 写（保存）资源
     *
     * @param asset 资源对象
     * @param callback 完成回调
     */
    writeAsset(asset: FileAsset, callback?: (err: Error) => void): void;
    /**
     * 移动资源到指定文件夹
     *
     * @param asset 被移动资源
     * @param folder 目标文件夹
     * @param callback 完成回调
     */
    moveAsset(asset: FileAsset, folder: FolderAsset, callback?: (err: Error) => void): void;
    /**
     * 删除资源
     *
     * @param asset 资源
     * @param callback 完成回调
     */
    deleteAsset(asset: FileAsset, callback?: (err: Error) => void): void;
}

/**
 * 常用正则表示式
 */
export declare class RegExps {
    /**
     * json文件
     */
    json: RegExp;
    /**
     * 图片
     */
    image: RegExp;
    /**
     * 声音
     */
    audio: RegExp;
    /**
     * 命名空间
     */
    namespace: RegExp;
    /**
     * 类
     */
    classReg: RegExp;
}

/**
 * 可渲染组件
 *
 * General functionality for all renderers.
 *
 * A renderer is what makes an object appear on the screen. Use this class to access the renderer of any object, mesh or Particle System. Renderers can be disabled to make objects invisible (see enabled), and the materials can be accessed and modified through them (see material).
 *
 * See Also: Renderer components for meshes, particles, lines and trails.
 */
export declare class Renderable extends RayCastable {
    readonly renderAtomic: RenderAtomic;
    /**
     * 几何体
     */
    geometry: GeometryLike;
    /**
     * 材质
     */
    get material(): Material;
    set material(v: Material);
    protected _material: Material;
    castShadows: boolean;
    receiveShadows: boolean;
    constructor();
    init(): void;
    /**
     * 渲染前执行函数
     *
     * 可用于渲染前收集渲染数据，或者更新显示效果等
     *
     * @param renderAtomic
     * @param scene
     * @param camera
     */
    beforeRender(renderAtomic: RenderAtomic, scene: Scene, camera: Camera): void;
    /**
     * 与世界空间射线相交
     *
     * @param worldRay 世界空间射线
     *
     * @return 相交信息
     */
    worldRayIntersection(worldRay: Ray3): PickingCollisionVO;
    /**
     * 与局部空间射线相交
     *
     * @param ray3D 局部空间射线
     *
     * @return 相交信息
     */
    localRayIntersection(localRay: Ray3): PickingCollisionVO;
    /**
     * 是否加载完成
     */
    get isLoaded(): boolean;
    /**
     * 已加载完成或者加载完成时立即调用
     * @param callback 完成回调
     */
    onLoadCompleted(callback: () => void): void;
    /**
     * 销毁
     */
    dispose(): void;
    private _lightPicker;
    private _onGeometryChanged;
    protected _updateBounds(): void;
    protected _onGetSelfBounds(event: Event_2<{
        bounds: Box3[];
    }>): void;
}

/**
 * 渲染目标纹理
 */
export declare class RenderTargetTexture2D extends Texture2D {
    OFFSCREEN_WIDTH: number;
    OFFSCREEN_HEIGHT: number;
    format: TextureFormat;
    minFilter: TextureMinFilter;
    magFilter: TextureMagFilter;
    isRenderTarget: boolean;
}

/**
 * 运行环境枚举
 */
export declare enum RunEnvironment {
    /**
     * 在feng3d模式下运行
     */
    feng3d = 1,
    /**
     * 运行在编辑器中
     */
    editor = 2,
    /**
     * 在所有环境中运行
     */
    all = 255
}

/**
 * 3D场景
 */
export declare class Scene extends Component3D {
    __class__: "feng3d.Scene";
    /**
     * 背景颜色
     */
    background: Color4;
    /**
     * 环境光强度
     */
    ambientColor: Color4;
    /**
     * 指定所运行环境
     *
     * 控制运行符合指定环境场景中所有 Behaviour.update 方法
     *
     * 用于处理某些脚本只在在feng3d引擎或者编辑器中运行的问题。例如 FPSController 默认只在feng3d中运行，在编辑器模式下不会运行。
     */
    runEnvironment: RunEnvironment;
    /**
     * 鼠标射线，在渲染时被设置
     */
    mouseRay3D: Ray3;
    init(): void;
    update(interval?: number): void;
    /**
     * 所有 Model
     */
    get models(): Renderable[];
    /**
     * 所有 可见且开启的 Model
     */
    get visibleAndEnabledModels(): Renderable[];
    /**
     * 所有 SkyBox
     */
    get skyBoxs(): SkyBox[];
    get activeSkyBoxs(): SkyBox[];
    get directionalLights(): DirectionalLight[];
    get activeDirectionalLights(): DirectionalLight[];
    get pointLights(): PointLight[];
    get activePointLights(): PointLight[];
    get spotLights(): SpotLight[];
    get activeSpotLights(): SpotLight[];
    get animations(): Animation_2[];
    get activeAnimations(): Animation_2[];
    get behaviours(): Behaviour[];
    get activeBehaviours(): Behaviour[];
    get mouseCheckObjects(): Node3D[];
    /**
     * 获取拾取缓存
     * @param camera
     */
    getPickCache(camera: Camera): ScenePickCache;
    /**
     * 获取接收光照渲染对象列表
     * @param light
     */
    getPickByDirectionalLight(light: DirectionalLight): Renderable[];
    /**
     * 获取 可被摄像机看见的 Model 列表
     * @param camera
     */
    getModelsByCamera(camera: Camera): Renderable[];
    private _mouseCheckTransforms;
    private _models;
    private _visibleAndEnabledModels;
    private _skyBoxs;
    private _activeSkyBoxs;
    private _directionalLights;
    private _activeDirectionalLights;
    private _pointLights;
    private _activePointLights;
    private _spotLights;
    private _activeSpotLights;
    private _animations;
    private _activeAnimations;
    private _behaviours;
    private _activeBehaviours;
    private _pickMap;
}

/**
 * 场景拾取缓存
 */
export declare class ScenePickCache {
    private scene;
    private camera;
    private _activeModels;
    private _blenditems;
    private _unblenditems;
    constructor(scene: Scene, camera: Camera);
    /**
     * 获取需要渲染的对象
     *
     * #### 渲染需求条件
     * 1. visible == true
     * 1. 在摄像机视锥内
     * 1. model.enabled == true
     *
     * @param gameObject
     * @param camera
     */
    get activeModels(): Renderable[];
    /**
     * 半透明渲染对象
     */
    get blenditems(): Renderable[];
    /**
     * 半透明渲染对象
     */
    get unblenditems(): Renderable[];
    clear(): void;
}

/**
 * 用于处理从场景中获取特定数据
 */
export declare class SceneUtil {
    /**
     * 获取场景中可视需要混合的渲染对象
     *
     * @param scene 场景
     * @param camera 摄像机
     */
    getBlenditems(scene: Scene, camera: Camera): void;
    /**
     * 获取需要渲染的对象
     *
     * #### 渲染需求条件
     * 1. visible == true
     * 1. 在摄像机视锥内
     * 1. model.enabled == true
     *
     * @param gameObject
     * @param camera
     */
    getActiveRenderers(scene: Scene, camera: Camera): Renderable[];
}

export declare const sceneUtil: SceneUtil;

/**
 * 3d对象脚本
 */
export declare class Script {
    /**
     * The game object this component is attached to. A component is always attached to a game object.
     */
    get entity(): Entity;
    /**
     * The Transform attached to this Entity (null if there is none attached).
     */
    get node3d(): Node3D;
    /**
     * 宿主组件
     */
    component: ScriptComponent;
    constructor();
    /**
     * Use this for initialization
     */
    init(): void;
    /**
     * Update is called once per frame
     * 每帧执行一次
     */
    update(): void;
    /**
     * 销毁
     */
    dispose(): void;
}

/**
 * 3d对象脚本
 */
export declare class ScriptComponent extends Behaviour {
    runEnvironment: RunEnvironment;
    scriptName: string;
    /**
     * 脚本对象
     */
    get scriptInstance(): Script;
    private _scriptInstance;
    private _invalid;
    private scriptInit;
    init(): void;
    private _updateScriptInstance;
    private _invalidateScriptInstance;
    /**
     * 每帧执行
     */
    update(): void;
    /**
     * 销毁
     */
    dispose(): void;
}

/**
 * 线段
 */
declare class Segment {
    /**
     * 起点坐标
     */
    start: Vector3;
    /**
     * 终点坐标
     */
    end: Vector3;
    /**
     * 起点颜色
     */
    startColor: Color4;
    /**
     * 终点颜色
     */
    endColor: Color4;
}

/**
 * 线段组件
 */
export declare class SegmentGeometry extends Geometry {
    __class__: "feng3d.SegmentGeometry";
    protected _name: string;
    /**
     * 线段列表
     * 修改数组内数据时需要手动调用 invalidateGeometry();
     */
    segments: Segment[];
    /**
     * 添加线段
     *
     * @param segment 线段
     */
    addSegment(segment: Partial<Segment>): void;
    constructor();
    /**
     * 更新几何体
     */
    protected buildGeometry(): void;
}

/**
 * 线段材质
 * 目前webgl不支持修改线条宽度，参考：https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/lineWidth
 */
export declare class SegmentUniforms {
    __class__: "feng3d.SegmentUniforms";
    /**
     * 颜色
     */
    u_segmentColor: Color4;
}

export declare class Setting {
    /**
     * 版本号
     */
    version: string;
    /**
     * 引擎中使用的坐标系统，默认左手坐标系统。
     *
     * three.js 右手坐标系统。
     * playcanvas 右手坐标系统。
     * unity    左手坐标系统。
     */
    coordinateSystem: CoordinateSystem;
    /**
     * 引擎中使用的旋转顺序。
     *
     * unity YXZ
     * playcanvas ZYX
     * three.js XYZ
     */
    defaultRotationOrder: RotationOrder;
}

export declare const setting: Setting;

declare type ShaderNames = keyof UniformsTypes;

export declare class ShadowRenderer {
    private renderAtomic;
    /**
     * 渲染
     */
    draw(gl: GL, scene: Scene, camera: Camera): void;
    private drawForSpotLight;
    private drawForPointLight;
    private drawForDirectionalLight;
    /**
     * 绘制3D对象
     */
    private drawGameObject;
}

/**
 * 阴影类型
 */
export declare enum ShadowType {
    /**
     * 没有阴影
     */
    No_Shadows = 0,
    /**
     * 硬阴影
     */
    Hard_Shadows = 1,
    /**
     * PCF 阴影
     */
    PCF_Shadows = 2,
    /**
     * PCF 软阴影
     */
    PCF_Soft_Shadows = 3
}

export declare class SkeletonComponent extends Component3D {
    __class__: "feng3d.SkeletonComponent";
    /** 骨骼关节数据列表 */
    joints: SkeletonJoint[];
    /**
     * 当前骨骼姿势的全局矩阵
     * @see #globalPose
     */
    get globalMatrices(): Matrix4x4[];
    private isInitJoints;
    private jointNode3Ds;
    private jointNode3DMap;
    private _globalPropertiesInvalid;
    private _jointsInvalid;
    private _globalMatrixsInvalid;
    private globalMatrixs;
    private _globalMatrices;
    initSkeleton(): void;
    /**
     * 更新骨骼全局变换矩阵
     */
    private updateGlobalProperties;
    private invalidjoint;
    private createSkeletonNode3D;
}

/**
 * 骨骼关节数据
 */
export declare class SkeletonJoint {
    /** 父关节索引 （-1说明本身是总父结点，这个序号其实就是行号了，譬如上面”origin“结点的序号就是0，无父结点； "body"结点序号是1，父结点序号是0，也就是说父结点是”origin“）*/
    parentIndex: number;
    /** 关节名字 */
    name: string;
    /** 骨骼全局矩阵 */
    matrix: Matrix4x4;
    children: number[];
    get invertMatrix(): Matrix4x4;
    private _invertMatrix;
}

export declare class SkinnedMeshRenderer extends Renderable {
    __class__: "feng3d.SkinnedMeshRenderer";
    skinSkeleton: SkinSkeleton;
    initMatrix: Matrix4x4;
    /**
     * 创建一个骨骼动画类
     */
    init(): void;
    beforeRender(renderAtomic: RenderAtomic, scene: Scene, camera: Camera): void;
    /**
     * 销毁
     */
    dispose(): void;
    /**
     * 缓存，通过寻找父结点获得
     */
    private cacheSkeletonComponent;
    private cacheU_skeletonGlobalMatriices;
    private get u_modelMatrix();
    private get u_ITModelMatrix();
    private get u_skeletonGlobalMatriices();
}

declare class SkinSkeleton {
    /**
     * [在整个骨架中的编号，骨骼名称]
     */
    joints: [number, string][];
    /**
     * 当前模型包含骨骼数量
     */
    numJoint: number;
}

/**
 * 天空盒组件
 */
export declare class SkyBox extends Component3D {
    __class__: "feng3d.SkyBox";
    s_skyboxTexture: TextureCube;
    beforeRender(renderAtomic: RenderAtomic, scene: Scene, camera: Camera): void;
}

/**
 * 天空盒渲染器
 */
export declare class SkyBoxRenderer {
    private renderAtomic;
    init(): void;
    /**
     * 绘制场景中天空盒
     * @param gl
     * @param scene 场景
     * @param camera 摄像机
     */
    draw(gl: GL, scene: Scene, camera: Camera): void;
    /**
     * 绘制天空盒
     * @param gl
     * @param skybox 天空盒
     * @param camera 摄像机
     */
    drawSkyBox(gl: GL, skybox: SkyBox, scene: Scene, camera: Camera): void;
}

/**
 * 球体几何体
 * @author DawnKing 2016-09-12
 */
export declare class SphereGeometry extends Geometry {
    __class__: "feng3d.SphereGeometry";
    /**
     * 球体半径
     */
    radius: number;
    /**
     * 横向分割数
     */
    segmentsW: number;
    /**
     * 纵向分割数
     */
    segmentsH: number;
    /**
     * 是否朝上
     */
    yUp: boolean;
    protected _name: string;
    /**
     * 构建几何体数据
     * @param this.radius 球体半径
     * @param this.segmentsW 横向分割数
     * @param this.segmentsH 纵向分割数
     * @param this.yUp 正面朝向 true:Y+ false:Z+
     */
    protected buildGeometry(): void;
    /**
     * 构建顶点索引
     * @param this.segmentsW 横向分割数
     * @param this.segmentsH 纵向分割数
     * @param this.yUp 正面朝向 true:Y+ false:Z+
     */
    private buildIndices;
    /**
     * 构建uv
     * @param this.segmentsW 横向分割数
     * @param this.segmentsH 纵向分割数
     */
    private buildUVs;
}

/**
 * 聚光灯光源
 */
export declare class SpotLight extends Light {
    lightType: LightType;
    /**
     * 光照范围
     */
    range: number;
    /**
     *
     */
    angle: number;
    /**
     * 半影.
     */
    penumbra: number;
    /**
     * 椎体cos值
     */
    get coneCos(): number;
    get penumbraCos(): number;
    private perspectiveLens;
    constructor();
    private _invalidRange;
    private _invalidAngle;
}

export declare class StandardUniforms {
    __class__: "feng3d.StandardUniforms" | "feng3d.TerrainUniforms" | "feng3d.ParticleUniforms";
    /**
     * 点绘制时点的尺寸
     */
    u_PointSize: number;
    /**
     * 漫反射纹理
     */
    s_diffuse: Texture2D<Texture2DEventMap>;
    /**
     * 基本颜色
     */
    u_diffuse: Color4;
    /**
     * 透明阈值，透明度小于该值的像素被片段着色器丢弃
     */
    u_alphaThreshold: number;
    /**
     * 法线纹理
     */
    s_normal: Texture2D<Texture2DEventMap>;
    /**
     * 镜面反射光泽图
     */
    s_specular: Texture2D<Texture2DEventMap>;
    /**
     * 镜面反射颜色
     */
    u_specular: Color3;
    /**
     * 高光系数
     */
    u_glossiness: number;
    /**
     * 环境纹理
     */
    s_ambient: Texture2D<Texture2DEventMap>;
    /**
     * 环境光颜色
     */
    u_ambient: Color4;
    /**
     * 环境映射贴图
     */
    s_envMap: TextureCube<TextureCubeEventMap>;
    /**
     * 反射率
     */
    u_reflectivity: number;
    /**
     * 出现雾效果的最近距离
     */
    u_fogMinDistance: number;
    /**
     * 最远距离
     */
    u_fogMaxDistance: number;
    /**
     * 雾的颜色
     */
    u_fogColor: Color3;
    /**
     * 雾的密度
     */
    u_fogDensity: number;
    /**
     * 雾模式
     */
    u_fogMode: FogMode;
}

export declare class Stats {
    static instance: Stats;
    static init(parent?: HTMLElement): void;
    REVISION: number;
    dom: HTMLDivElement;
    domElement: HTMLDivElement;
    addPanel: (panel: StatsPanel) => StatsPanel;
    showPanel: (id: number) => void;
    setMode: (id: number) => void;
    begin: () => void;
    end: () => number;
    update: () => void;
    constructor();
}

declare class StatsPanel {
    dom: HTMLCanvasElement;
    update: (value: number, maxValue: number) => void;
    constructor(name: string, fg: string, bg: string);
}

/**
 * 2D纹理
 */
export declare class Texture2D<T extends Texture2DEventMap = Texture2DEventMap> extends TextureInfo<T> {
    __class__: "feng3d.Texture2D";
    /**
     * 纹理类型
     */
    textureType: TextureType;
    assetType: AssetType;
    /**
     * 当贴图数据未加载好等情况时代替使用
     */
    noPixels: ImageDatas;
    /**
     * 是否已加载
     */
    get isLoaded(): boolean;
    private _loadings;
    get image(): HTMLImageElement;
    /**
     * 用于表示初始化纹理的数据来源
     */
    get source(): {
        url: string;
    };
    set source(v: {
        url: string;
    });
    constructor();
    private onItemLoadCompleted;
    /**
     * 已加载完成或者加载完成时立即调用
     * @param callback 完成回调
     */
    onLoadCompleted(callback: () => void): void;
    private _source;
    /**
     * 默认贴图
     */
    static white: Texture2D;
    /**
     * 默认贴图
     */
    static default: Texture2D;
    /**
     * 默认法线贴图
     */
    static defaultNormal: Texture2D;
    /**
     * 默认粒子贴图
     */
    static defaultParticle: Texture2D;
    /**
     * 从url初始化纹理
     *
     * @param url 路径
     */
    static fromUrl(url: string): Texture2D<Texture2DEventMap>;
}

declare interface Texture2DEventMap {
    /**
     * 加载完成
     */
    loadCompleted: any;
}

/**
 * 立方体纹理
 */
export declare class TextureCube<T extends TextureCubeEventMap = TextureCubeEventMap> extends TextureInfo<T> {
    __class__: "feng3d.TextureCube";
    textureType: TextureType;
    assetType: AssetType;
    static ImageNames: TextureCubeImageName[];
    OAVCubeMap: string;
    /**
     * 原始数据
     */
    rawData: {
        type: "texture";
        textures: Texture2D[];
    } | {
        type: "path";
        paths: string[];
    };
    noPixels: ImageDatas[];
    protected _pixels: any[];
    /**
     * 是否加载完成
     */
    get isLoaded(): boolean;
    private _loading;
    setTexture2D(pos: TextureCubeImageName, texture: Texture2D): void;
    setTexture2DPath(pos: TextureCubeImageName, path: string): void;
    getTextureImage(pos: TextureCubeImageName, callback: (img?: HTMLImageElement) => void): void;
    private _rawDataChanged;
    /**
     * 加载单个贴图
     *
     * @param texture 贴图
     * @param index 索引
     */
    private _loadItemTexture;
    /**
     * 加载单个图片
     *
     * @param imagepath 图片路径
     * @param index 索引
     */
    private _loadItemImagePath;
    private _onItemLoadCompleted;
    /**
     * 已加载完成或者加载完成时立即调用
     * @param callback 完成回调
     */
    onLoadCompleted(callback: () => void): void;
    static default: TextureCube;
}

declare interface TextureCubeEventMap {
    /**
     * 加载完成
     */
    loadCompleted: any;
}

declare type TextureCubeImageName = "positive_x_url" | "positive_y_url" | "positive_z_url" | "negative_x_url" | "negative_y_url" | "negative_z_url";

/**
 * 纹理信息
 */
export declare abstract class TextureInfo<T = any> extends Feng3dObject<T> implements Texture {
    /**
     * 纹理类型
     */
    textureType: TextureType;
    /**
     * 格式
     */
    format: TextureFormat;
    /**
     * 数据类型
     */
    type: TextureDataType;
    /**
     * 是否生成mipmap
     */
    generateMipmap: boolean;
    /**
     * 对图像进行Y轴反转。默认值为false
     */
    flipY: boolean;
    /**
     * 将图像RGB颜色值得每一个分量乘以A。默认为false
     */
    premulAlpha: boolean;
    minFilter: TextureMinFilter;
    magFilter: TextureMagFilter;
    /**
     * 表示x轴的纹理的回环方式，就是当纹理的宽度小于需要贴图的平面的宽度的时候，平面剩下的部分应该p以何种方式贴图的问题。
     */
    get wrapS(): TextureWrap.REPEAT | TextureWrap;
    set wrapS(v: TextureWrap);
    private _wrapS;
    /**
     * 表示y轴的纹理回环方式。 magFilter和minFilter表示过滤的方式，这是OpenGL的基本概念，我将在下面讲一下，目前你不用担心它的使用。当您不设置的时候，它会取默认值，所以，我们这里暂时不理睬他。
     */
    get wrapT(): TextureWrap.REPEAT | TextureWrap;
    set wrapT(v: TextureWrap);
    private _wrapT;
    /**
     * 各向异性过滤。使用各向异性过滤能够使纹理的效果更好，但是会消耗更多的内存、CPU、GPU时间。默认为0。
     */
    anisotropy: number;
    invalid: boolean;
    /**
     * 需要使用的贴图数据
     */
    protected _pixels: TexImageSource | TexImageSource[];
    /**
     * 当贴图数据未加载好等情况时代替使用
     */
    noPixels: string | string[];
    /**
     * 当前使用的贴图数据
     */
    protected _activePixels: TexImageSource | TexImageSource[];
    /**
     * 是否为渲染目标纹理
     */
    isRenderTarget: boolean;
    OFFSCREEN_WIDTH: number;
    OFFSCREEN_HEIGHT: number;
    /**
     * 是否为2的幂贴图
     */
    get isPowerOfTwo(): boolean;
    /**
     * 纹理尺寸
     */
    getSize(): Vector2;
    /**
     * 判断数据是否满足渲染需求
     */
    private checkRenderData;
    /**
     * 使纹理失效
     */
    invalidate(): void;
    get activePixels(): HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | ImageBitmap | OffscreenCanvas | ImageData | TexImageSource[];
    /**
     *
     */
    get dataURL(): string;
    private _dataURL;
    private updateActivePixels;
}

export declare class TextureUniforms {
    __class__: "feng3d.TextureUniforms";
    /**
     * 颜色
     */
    u_color: Color4;
    /**
     * 纹理数据
     */
    s_texture: Texture2D<Texture2DEventMap>;
}

/**
 * 心跳计时器
 */
export declare class Ticker {
    /**
     * 帧率
     */
    frameRate: number;
    /**
     * 注册帧函数
     * @param func  执行方法
     * @param thisObject    方法this指针
     * @param priority      执行优先级
     */
    onframe(func: (interval: number) => void, thisObject?: Object, priority?: number): this;
    /**
     * 下一帧执行方法
     * @param func  执行方法
     * @param thisObject    方法this指针
     * @param priority      执行优先级
     */
    nextframe(func: (interval: number) => void, thisObject?: Object, priority?: number): this;
    /**
     * 注销帧函数（只执行一次）
     * @param func  执行方法
     * @param thisObject    方法this指针
     * @param priority      执行优先级
     */
    offframe(func: (interval: number) => void, thisObject?: Object): this;
    /**
     * 注册周期函数
     * @param interval  执行周期，以ms为单位
     * @param func  执行方法
     * @param thisObject    方法this指针
     * @param priority      执行优先级
     */
    on(interval: Lazy<number>, func: (interval: number) => void, thisObject?: Object, priority?: number): this;
    /**
     * 注册周期函数（只执行一次）
     * @param interval  执行周期，以ms为单位
     * @param func  执行方法
     * @param thisObject    方法this指针
     * @param priority      执行优先级
     */
    once(interval: Lazy<number>, func: (interval: number) => void, thisObject?: Object, priority?: number): this;
    /**
     * 注销周期函数
     * @param interval  执行周期，以ms为单位
     * @param func  执行方法
     * @param thisObject    方法this指针
     */
    off(interval: Lazy<number>, func: (interval: number) => void, thisObject?: Object): this;
    /**
     * 重复指定次数 执行函数
     * @param interval  执行周期，以ms为单位
     * @param 	repeatCount     执行次数
     * @param func  执行方法
     * @param thisObject    方法this指针
     * @param priority      执行优先级
     */
    repeat(interval: Lazy<number>, repeatCount: number, func: (interval: number) => void, thisObject?: Object, priority?: number): Timer;
}

/**
 * 心跳计时器
 */
export declare const ticker: Ticker;

declare class Timer {
    private ticker;
    private interval;
    private priority;
    private func;
    private thisObject;
    /**
     * 计时器从 0 开始后触发的总次数。
     */
    currentCount: number;
    /**
     * 计时器事件间的延迟（以毫秒为单位）。
     */
    delay: number;
    /**
     * 设置的计时器运行总次数。
     */
    repeatCount: number;
    constructor(ticker: Ticker, interval: Lazy<number>, repeatCount: number, func: (interval: number) => void, thisObject?: Object, priority?: number);
    /**
     * 如果计时器尚未运行，则启动计时器。
     */
    start(): this;
    /**
     * 停止计时器。
     */
    stop(): this;
    /**
     * 如果计时器正在运行，则停止计时器，并将 currentCount 属性设回为 0，这类似于秒表的重置按钮。
     */
    reset(): this;
    private runfunc;
}

/**
 * 圆环几何体
 */
export declare class TorusGeometry extends Geometry {
    __class__: "feng3d.TorusGeometry";
    /**
     * 半径
     */
    radius: number;
    /**
     * 管道半径
     */
    tubeRadius: number;
    /**
     * 半径方向分割数
     */
    segmentsR: number;
    /**
     * 管道方向分割数
     */
    segmentsT: number;
    /**
     * 是否朝上
     */
    yUp: boolean;
    protected _name: string;
    protected _vertexPositionData: number[];
    protected _vertexNormalData: number[];
    protected _vertexTangentData: number[];
    private _rawIndices;
    private _vertexIndex;
    private _currentTriangleIndex;
    private _numVertices;
    private _vertexPositionStride;
    private _vertexNormalStride;
    private _vertexTangentStride;
    /**
     * 添加顶点数据
     */
    private addVertex;
    /**
     * 添加三角形索引数据
     * @param currentTriangleIndex		当前三角形索引
     * @param cwVertexIndex0			索引0
     * @param cwVertexIndex1			索引1
     * @param cwVertexIndex2			索引2
     */
    private addTriangleClockWise;
    /**
     * @inheritDoc
     */
    protected buildGeometry(): void;
    /**
     * @inheritDoc
     */
    protected buildUVs(): void;
}

/**
 * 变换布局
 *
 * 提供了比Transform更加适用于2D元素的API
 *
 * 通过修改Transform的数值实现
 */
export declare class TransformLayout extends Component3D {
    /**
     * 创建一个实体，该类为虚类
     */
    constructor();
    private _onAdded;
    private _onRemoved;
    /**
     * 位移
     */
    get position(): Vector3;
    set position(v: Vector3);
    private readonly _position;
    /**
     * 尺寸，宽高。
     */
    get size(): Vector3;
    set size(v: Vector3);
    private _size;
    /**
     * 与最小最大锚点形成的边框的left、right、top、bottom距离。当 anchorMin.x != anchorMax.x 时对 layout.x layout.y 赋值生效，当 anchorMin.y != anchorMax.y 时对 layout.z layout.w 赋值生效，否则赋值无效，自动被覆盖。
     */
    get leftTop(): Vector3;
    set leftTop(v: Vector3);
    private _leftTop;
    /**
     * 与最小最大锚点形成的边框的left、right、top、bottom距离。当 anchorMin.x != anchorMax.x 时对 layout.x layout.y 赋值生效，当 anchorMin.y != anchorMax.y 时对 layout.z layout.w 赋值生效，否则赋值无效，自动被覆盖。
     */
    get rightBottom(): Vector3;
    set rightBottom(v: Vector3);
    private _rightBottom;
    /**
     * 最小锚点，父Transform2D中左上角锚定的规范化位置。
     */
    anchorMin: Vector3;
    /**
     * 最大锚点，父Transform2D中左上角锚定的规范化位置。
     */
    anchorMax: Vector3;
    /**
     * The normalized position in this RectTransform that it rotates around.
     */
    pivot: Vector3;
    beforeRender(renderAtomic: RenderAtomic, scene: Scene, camera: Camera): void;
    private _updateLayout;
    /**
     * 布局是否失效
     */
    private _layoutInvalid;
    private _invalidateLayout;
    private _invalidateSize;
    private _invalidatePivot;
}

declare type UniformsLike = UniformsTypes[keyof UniformsTypes];

/**
 * 通用唯一标识符（Universally Unique Identifier）
 *
 * 用于给所有对象分配一个通用唯一标识符
 */
export declare class Uuid {
    /**
     * 获取数组 通用唯一标识符
     *
     * @param arr 数组
     * @param separator 分割符
     */
    getArrayUuid(arr: any[], separator?: string): string;
    /**
     * 获取对象 通用唯一标识符
     *
     * 当参数object非Object对象时强制转换为字符串返回
     *
     * @param object 对象
     */
    getObjectUuid(object: Object): any;
    objectUuid: WeakMap<Object, string>;
}

export declare class VideoTexture2D extends Texture2D {
    video: HTMLVideoElement;
    private _videoChanged;
}

/**
 * 视图
 */
export declare class View extends Feng3dObject {
    canvas: HTMLCanvasElement;
    private _contextAttributes;
    /**
     * 摄像机
     */
    get camera(): Camera;
    set camera(v: Camera);
    private _camera;
    /**
     * 3d场景
     */
    scene: Scene;
    /**
     * 根结点
     */
    get root(): Node3D<Component3DEventMap>;
    get gl(): GL;
    /**
     * 鼠标在3D视图中的位置
     */
    get mousePos(): Vector2;
    private _mousePos;
    /**
     * 视窗区域
     */
    get viewRect(): Rectangle;
    private _viewRect;
    /**
     * 获取鼠标射线（与鼠标重叠的摄像机射线）
     */
    get mouseRay3D(): Ray3;
    private _mouseRay3D;
    /**
     * 鼠标事件管理
     */
    mouse3DManager: Mouse3DManager;
    protected contextLost: boolean;
    /**
     * 构建3D视图
     * @param canvas    画布
     * @param scene     3D场景
     * @param camera    摄像机
     */
    constructor(canvas?: HTMLCanvasElement, scene?: Scene, camera?: Camera, contextAttributes?: WebGLContextAttributes);
    /**
     * 修改canvas尺寸
     * @param width 宽度
     * @param height 高度
     */
    setSize(width: number, height: number): void;
    start(): void;
    stop(): void;
    update(interval?: number): void;
    /**
     * 绘制场景
     */
    render(interval?: number): void;
    /**
     * 屏幕坐标转GPU坐标
     * @param screenPos 屏幕坐标 (x: [0-width], y: [0 - height])
     * @return GPU坐标 (x: [-1, 1], y: [-1, 1])
     */
    screenToGpuPosition(screenPos: Vector2): Vector2;
    /**
     * 投影坐标（世界坐标转换为3D视图坐标）
     * @param point3d 世界坐标
     * @return 屏幕的绝对坐标
     */
    project(point3d: Vector3): Vector3;
    /**
     * 屏幕坐标投影到场景坐标
     * @param nX 屏幕坐标X ([0-width])
     * @param nY 屏幕坐标Y ([0-height])
     * @param sZ 到屏幕的距离
     * @param v 场景坐标（输出）
     * @return 场景坐标
     */
    unproject(sX: number, sY: number, sZ: number, v?: Vector3): Vector3;
    /**
     * 获取单位像素在指定深度映射的大小
     * @param   depth   深度
     */
    getScaleByDepth(depth: number, dir?: Vector2): number;
    /**
     * 获取屏幕区域内所有实体
     * @param start 起点
     * @param end 终点
     */
    getObjectsInGlobalArea(start: Vector2, end: Vector2): Node3D<Component3DEventMap>[];
    protected selectedTransform: Node3D;
    static createNewScene(): Scene;
}

/**
 * The Water component renders the terrain.
 */
export declare class Water extends Renderable {
    __class__: "feng3d.Water";
    geometry: PlaneGeometry;
    protected _material: Material;
    /**
     * 帧缓冲对象，用于处理水面反射
     */
    private frameBufferObject;
    beforeRender(renderAtomic: RenderAtomic, scene: Scene, camera: Camera): void;
}

export declare class WaterUniforms {
    __class__: "feng3d.WaterUniforms";
    u_alpha: number;
    /**
     * 水体运动时间，默认自动递增
     */
    u_time: number;
    u_size: number;
    u_distortionScale: number;
    u_waterColor: Color3;
    s_normalSampler: Texture2D<Texture2DEventMap>;
    /**
     * 镜面反射贴图
     */
    s_mirrorSampler: Texture2D<Texture2DEventMap>;
    u_textureMatrix: Matrix4x4;
    u_sunColor: Color3;
    u_sunDirection: Vector3;
}

declare class Win32Path implements Path {
    resolve(...pathSegments: string[]): string;
    normalize(path: string): any;
    isAbsolute(path: string): boolean;
    join(): any;
    relative(from: string, to: string): string;
    toNamespacedPath(path: string): string;
    dirname(path: string): string;
    basename(path: string, ext: string): string;
    extname(path: string): string;
    format(pathObject: {
        dir: string;
        root: string;
        base: string;
        name: string;
        ext: string;
    }): string;
    parse(path: string): {
        root: string;
        dir: string;
        base: string;
        ext: string;
        name: string;
    };
    sep: "\\" | "/";
    delimiter: ";" | ":";
    win32: Win32Path;
    posix: PosixPath;
}

/**
 * 线框组件，将会对拥有该组件的对象绘制线框
 */
export declare class WireframeComponent extends Component3D {
    __class__: "feng3d.WireframeComponent";
    color: Color4;
}

export declare class WireframeRenderer {
    private renderAtomic;
    init(): void;
    /**
     * 渲染
     */
    draw(gl: GL, scene: Scene, camera: Camera): void;
    /**
     * 绘制3D对象
     */
    drawGameObject(gl: GL, renderable: Renderable, scene: Scene, camera: Camera, wireframeColor?: Color4): void;
}

export { }
