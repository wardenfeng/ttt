namespace feng3d
{
    /**
     * 刚体
     */
    export class Rigidbody extends Behaviour
    {
        __class__: "feng3d.Rigidbody" = "feng3d.Rigidbody";

        runEnvironment = RunEnvironment.feng3d;

        @oav()
        @serialize
        mass = 0;

        init()
        {

        }

        /**
         * 每帧执行
         */
        update(interval?: number)
        {
        }
    }
}