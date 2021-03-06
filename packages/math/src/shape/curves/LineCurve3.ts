import { Vector3 } from '../../geom/Vector3';
import { Curve } from '../core/Curve';

export class LineCurve3 extends Curve<Vector3>
{
    v1: Vector3;
    v2: Vector3;

    constructor(v1 = new Vector3(), v2 = new Vector3())
    {
        super();

        this.v1 = v1;
        this.v2 = v2;
    }

    getResolution(_divisions: number): number
    {
        return 1;
    }

    getPoint(t: number, optionalTarget = new Vector3())
    {
        const point = optionalTarget;

        if (t === 1)
        {
            point.copy(this.v2);
        }
        else
        {
            point.copy(this.v2).sub(this.v1);
            point.multiplyNumber(t).add(this.v1);
        }

        return point;
    }

    // Line curve is linear, so we can overwrite default getPointAt

    getPointAt(u: number, optionalTarget = new Vector3())
    {
        return this.getPoint(u, optionalTarget);
    }
}

