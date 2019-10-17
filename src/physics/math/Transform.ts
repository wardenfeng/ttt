namespace CANNON
{
    export interface ITransform
    {
        position: feng3d.Vector3;
        quaternion: feng3d.Quaternion;
    }

    export class Transform
    {
        position: feng3d.Vector3;
        quaternion: feng3d.Quaternion;

        constructor(position = new feng3d.Vector3(), quaternion = new feng3d.Quaternion())
        {
            this.position = position;
            this.quaternion = quaternion;
        }

        toMatrix3D()
        {
            var matrix3D = this.quaternion.toMatrix3D();
            matrix3D.appendTranslation(this.position.x, this.position.y, this.position.z);
            return matrix3D;
        }

        /**
         * @param position
         * @param quaternion
         * @param worldPoint
         * @param result
         */
        static pointToLocalFrame(transform: Transform, worldPoint: feng3d.Vector3, result = new feng3d.Vector3())
        {
            var mat = transform.toMatrix3D().invert();
            mat.transformVector(worldPoint, result);
            return result;
        }

        /**
         * @param position
         * @param quaternion
         * @param localPoint
         * @param result
         */
        static pointToWorldFrame(transform: Transform, localPoint: feng3d.Vector3, result = new feng3d.Vector3())
        {
            var mat = transform.toMatrix3D();
            mat.transformVector(localPoint, result);
            return result;
        }

        static vectorToWorldFrame(transform: ITransform, localVector: feng3d.Vector3, result = new feng3d.Vector3())
        {
            transform.quaternion.rotatePoint(localVector, result);
            return result;
        }

        static vectorToLocalFrame(transform: ITransform, worldVector: feng3d.Vector3, result = new feng3d.Vector3())
        {
            transform.quaternion.w *= -1;
            transform.quaternion.rotatePoint(worldVector, result);
            transform.quaternion.w *= -1;
            return result;
        }
    }
}