namespace feng3d
{
	export interface ConeGeometryRaw
	{
		__class__?: "feng3d.ConeGeometry",
		bottomClosed?: boolean,
		bottomRadius?: number,
		height?: number,
		segmentsH?: number,
		segmentsW?: number,
		surfaceClosed?: boolean,
		topClosed?: boolean,
		topRadius?: number,
		yUp?: boolean
	}

	/**
	 * 圆锥体
     * @author feng 2017-02-07
	 */
	export class ConeGeometry extends CylinderGeometry implements ConeGeometryRaw
	{
		/**
		 * 创建圆锥体
		 * @param radius 底部半径
		 * @param height 高度
		 * @param segmentsW
		 * @param segmentsH
		 * @param yUp
		 */
		constructor(radius = 0.5, height = 1, segmentsW = 16, segmentsH = 1, closed = true, yUp = true)
		{
			super(0, radius, height, segmentsW, segmentsH, false, closed, true, yUp);
			this.name = "Cone";
		}
	}
}