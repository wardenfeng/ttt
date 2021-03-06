import { Camera } from "../cameras/Camera";
import { OrthographicLens } from "../cameras/lenses/OrthographicLens";
import { RegisterComponent } from "../component/Component";
import { Entity } from "../core/Entity";
import { Renderable } from "../core/Renderable";
import { Box3 } from "@feng3d/math";
import { Vector3 } from "@feng3d/math";
import { AddComponentMenu } from "../Menu";
import { Scene } from "../scene/Scene";
import { serialization } from "@feng3d/serialization";
import { Light } from "./Light";
import { LightType } from "./LightType";

declare module "../component/Component"
{
    export interface ComponentMap { DirectionalLight: DirectionalLight; }
}

/**
 * 方向光源
 */
@AddComponentMenu("Rendering/DirectionalLight")
@RegisterComponent({ name: 'DirectionalLight' })
export class DirectionalLight extends Light
{
    static create(name = "DirectionalLight")
    {
        var entity = new Entity();
        entity.name = name;
        var directionalLight = entity.addComponent(DirectionalLight);
        return directionalLight;
    }
    __class__: "feng3d.DirectionalLight";

    lightType = LightType.Directional;

    /**
     * 用于计算方向光   
     */
    private orthographicLens: OrthographicLens;

    /**
     * 光源位置
     */
    get position()
    {
        return this.shadowCamera.node3d.worldPosition;
    }

    constructor()
    {
        super();
    }

    /**
     * 通过视窗摄像机进行更新
     * @param viewCamera 视窗摄像机
     */
    updateShadowByCamera(scene: Scene, viewCamera: Camera, models: Renderable[])
    {
        var worldBounds: Box3 = models.reduce((pre: Box3, i) =>
        {
            var box = i.node3d.boundingBox.worldBounds;
            if (!pre)
                return box.clone();
            pre.union(box);
            return pre;
        }, null) || new Box3(new Vector3(), new Vector3(1, 1, 1));

        // 
        var center = worldBounds.getCenter();
        var radius = worldBounds.getSize().length / 2;
        // 
        const position = center.addTo(this.direction.scaleNumberTo(radius + this.shadowCameraNear).negate());
        this.shadowCamera.node3d.x = position.x;
        this.shadowCamera.node3d.y = position.y;
        this.shadowCamera.node3d.z = position.z;
        this.shadowCamera.node3d.lookAt(center, this.shadowCamera.node3d.matrix.getAxisY());
        //
        if (!this.orthographicLens)
        {
            this.shadowCamera.lens = this.orthographicLens = new OrthographicLens(radius, 1, this.shadowCameraNear, this.shadowCameraNear + radius * 2);
        } else
        {
            serialization.setValue(this.orthographicLens, { size: radius, near: this.shadowCameraNear, far: this.shadowCameraNear + radius * 2 });
        }
    }
}

Entity.registerPrimitive("Directional light", (g) =>
{
    g.addComponent(DirectionalLight);
});

declare module "../core/Entity"
{
    export interface PrimitiveEntity
    {
        "Directional light": Entity;
    }
}