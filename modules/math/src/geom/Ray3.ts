namespace feng3d
{

	/**
	 * 3D射线
	 */
    export class Ray3 extends Line3
    {
        constructor(position?: Vector3, direction?: Vector3)
        {
            super(position, direction);
        }
    }
}