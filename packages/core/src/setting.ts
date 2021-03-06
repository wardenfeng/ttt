import { CoordinateSystem, RotationOrder } from "@feng3d/math";

export class Setting
{
    /**
     * 版本号
     */
    version = "0.1.3";

    /**
     * 引擎中使用的坐标系统，默认左手坐标系统。
     * 
     * three.js 右手坐标系统。
     * playcanvas 右手坐标系统。
     * unity    左手坐标系统。
     */
    coordinateSystem = CoordinateSystem.LEFT_HANDED;

    /**
     * 引擎中使用的旋转顺序。
     * 
     * unity YXZ
     * playcanvas ZYX
     * three.js XYZ
     */
    defaultRotationOrder = RotationOrder.YXZ;
}

export const setting = new Setting();