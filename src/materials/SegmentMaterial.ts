namespace feng3d
{
    export interface UniformsMap { segment: SegmentUniforms }

    /**
     * 线段材质
     * 目前webgl不支持修改线条宽度，参考：https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/lineWidth
     */
    export class SegmentUniforms
    {
        __class__: "feng3d.SegmentUniforms" = "feng3d.SegmentUniforms";

        /** 
         * 颜色
         */
        @serialize
        @oav()
        u_segmentColor = new Color4();
    }

    shaderConfig.shaders["segment"].cls = SegmentUniforms;
    shaderConfig.shaders["segment"].renderParams = { renderMode: feng3d.RenderMode.LINES };

    export interface DefaultMaterial
    {
        "Default-SegmentMaterial": Material;
    }

    Material.setDefaultMaterial("Default-SegmentMaterial", { shaderName: "segment", renderParams: { renderMode: feng3d.RenderMode.LINES } });
}