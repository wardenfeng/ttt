import { Material } from "../materials/Material";
import { Color3 } from "@feng3d/math";
import { Matrix4x4 } from "@feng3d/math";
import { Vector3 } from "@feng3d/math";
import { shaderlib } from "@feng3d/renderer";
import { Texture2D, Texture2DEventMap } from "../textures/Texture2D";
import { oav } from "@feng3d/objectview";
import { serialize } from "@feng3d/serialization";

declare module "../materials/Material"
{
    export interface UniformsTypes { water: WaterUniforms }

    export interface DefaultMaterial
    {
        "Water-Material": Material;
    }
}

export class WaterUniforms
{
    __class__: "feng3d.WaterUniforms";

    @serialize
    @oav({ tooltip: "透明度" })
    u_alpha = 1.0;

    /**
     * 水体运动时间，默认自动递增
     */
    // @serialize
    // @oav({ tooltip: "水体运动时间，默认自动递增" })
    u_time = 0.0;

    @serialize
    @oav({ tooltip: "水体展现的尺寸" })
    u_size = 10.0;

    @oav()
    @serialize
    u_distortionScale = 20.0;

    @serialize
    @oav({ tooltip: "水体颜色" })
    u_waterColor = new Color3().fromUnit(0x555555);

    @oav()
    @serialize
    @oav({ tooltip: "水体法线图" })
    s_normalSampler: Texture2D<Texture2DEventMap> = Texture2D.default;

    /**
     * 镜面反射贴图
     */
    @oav()
    // s_mirrorSampler = new RenderTargetTexture2D();
    s_mirrorSampler = Texture2D.default;

    u_textureMatrix = new Matrix4x4();
    u_sunColor = new Color3().fromUnit(0x7F7F7F);
    u_sunDirection = new Vector3(0.70707, 0.70707, 0);
}

shaderlib.shaderConfig.shaders["water"].cls = WaterUniforms;

Material.setDefault("Water-Material", { shaderName: "water" });
