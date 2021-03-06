import { globalEmitter } from "@feng3d/event";
import { oav } from "@feng3d/objectview";
import { gPartial, objectIsEmpty } from "@feng3d/polyfill";
import { RenderAtomic, RenderMode, RenderParams, Shader, shaderlib } from "@feng3d/renderer";
import { serialization, serialize } from "@feng3d/serialization";
import { watch } from "@feng3d/watcher";
import { AssetData } from "../core/AssetData";
import { Feng3dObject } from "../core/Feng3dObject";
import { HideFlags } from "../core/HideFlags";
import { Texture2D } from "../textures/Texture2D";
import { TextureCube } from "../textures/TextureCube";

export interface UniformsTypes { }
export type ShaderNames = keyof UniformsTypes;
export type UniformsLike = UniformsTypes[keyof UniformsTypes];

/**
 * 材质
 */
export class Material extends Feng3dObject
{
    __class__: "feng3d.Material";

    static create<K extends keyof UniformsTypes>(shaderName: K, uniforms?: gPartial<UniformsTypes[K]>, renderParams?: gPartial<RenderParams>)
    {
        var material = new Material();
        material.init(shaderName, uniforms, renderParams);
        return material;
    }

    init<K extends keyof UniformsTypes>(shaderName: K, uniforms?: gPartial<UniformsTypes[K]>, renderParams?: gPartial<RenderParams>)
    {
        this.shaderName = shaderName;
        //
        uniforms && serialization.setValue(this.uniforms, uniforms);
        renderParams && serialization.setValue(this.renderParams, renderParams);
        return this;
    }

    //
    private renderAtomic = new RenderAtomic();

    @oav({ component: "OAVFeng3dPreView" })
    private preview = "";

    /**
     * shader名称
     */
    @oav({ component: "OAVMaterialName" })
    @serialize
    @watch("_onShaderChanged")
    shaderName: ShaderNames;

    @oav()
    @serialize
    get name()
    {
        return this._name;
    }
    set name(v)
    {
        this._name = v;
    }
    protected _name = "";

    /**
     * Uniform数据
     */
    @serialize
    @oav({ component: "OAVObjectView" })
    @watch("_onUniformsChanged")
    uniforms: UniformsLike;

    /**
     * 渲染参数
     */
    @serialize
    @oav({ block: "渲染参数", component: "OAVObjectView" })
    @watch("_onRenderParamsChanged")
    renderParams: RenderParams;

    constructor()
    {
        super();
        globalEmitter.on("asset.shaderChanged", this._onShaderChanged, this);
        this.shaderName = "standard";
    }

    beforeRender(renderAtomic: RenderAtomic)
    {
        Object.assign(renderAtomic.uniforms, this.renderAtomic.uniforms);

        renderAtomic.shader = this.renderAtomic.shader;
        renderAtomic.renderParams = this.renderAtomic.renderParams;
        renderAtomic.shaderMacro.IS_POINTS_MODE = this.renderParams.renderMode === RenderMode.POINTS;
    }

    /**
     * 是否加载完成
     */
    get isLoaded()
    {
        var uniforms = this.uniforms;
        for (const key in uniforms)
        {
            var texture = uniforms[key];
            if (texture instanceof Texture2D || texture instanceof TextureCube)
            {
                if (!texture.isLoaded) return false;
            }
        }
        return true;
    }

    /**
     * 已加载完成或者加载完成时立即调用
     * @param callback 完成回调
     */
    onLoadCompleted(callback: () => void)
    {
        var loadingNum = 0;
        var uniforms = this.uniforms;
        for (const key in uniforms)
        {
            var texture = uniforms[key];
            if (texture instanceof Texture2D || texture instanceof TextureCube)
            {
                if (!texture.isLoaded)
                {
                    loadingNum++;
                    (texture as Texture2D).on("loadCompleted", () =>
                    {
                        loadingNum--;
                        if (loadingNum === 0) callback();
                    });
                }
            }
        }
        if (loadingNum === 0) callback();
    }

    private _onShaderChanged()
    {
        var cls = shaderlib.shaderConfig.shaders[this.shaderName].cls;
        if (cls)
        {
            if (objectIsEmpty(this.uniforms) || this.uniforms.constructor !== cls)
            {
                var newuniforms = new cls();
                this.uniforms = newuniforms;
            }
        } else
        {
            this.uniforms = {} as any;
        }

        var renderParams = shaderlib.shaderConfig.shaders[this.shaderName].renderParams;
        renderParams && serialization.setValue(this.renderParams, renderParams);

        this.renderAtomic.shader = new Shader(this.shaderName);
    }

    private _onUniformsChanged()
    {
        this.renderAtomic.uniforms = this.uniforms as any;
    }

    private _onRenderParamsChanged()
    {
        this.renderAtomic.renderParams = this.renderParams;
    }

    /**
     * 设置默认材质
     * 
     * 资源名称与材质名称相同，且无法在检查器界面中编辑。
     * 
     * @param name 材质名称
     * @param material 材质数据
     */
    static setDefault<K extends keyof DefaultMaterial>(name: K, material: gPartial<Material>)
    {
        var newMaterial = this._defaultMaterials[name] = new Material();
        serialization.setValue(newMaterial, material);
        serialization.setValue(newMaterial, { name: name, hideFlags: HideFlags.NotEditable });
        AssetData.addAssetData(name, newMaterial);
    }

    /**
     * 获取材质
     * 
     * @param name 材质名称
     */
    static getDefault<K extends keyof DefaultMaterial>(name: K)
    {
        return this._defaultMaterials[name];
    }
    private static _defaultMaterials: DefaultMaterial = {} as any;
}

/**
 * 默认材质
 */
export interface DefaultMaterial
{
}
