namespace feng3d
{
    /**
     * 3d对象脚本
     */
    export class Script
    {
        /**
         * The game object this component is attached to. A component is always attached to a game object.
         */
        get gameObject()
        {
            return this._component.gameObject;
        }

        /**
         * The Transform attached to this GameObject (null if there is none attached).
         */
        get transform()
        {
            return this.gameObject.transform;
        }

        /**
         * 宿主组件
         */
        get component()
        {
            return this._component;
        }
        private _component: ScriptComponent;

        constructor(component: ScriptComponent, runinit = true)
        {
            assert(!!component);
            this._component = component;
            if (runinit)
                this.init();
        }

        /**
         * Use this for initialization
         */
        init()
        {

        }

        /**
         * Update is called once per frame
         * 每帧执行一次
         */
        update()
        {

        }

        /**
         * 销毁
         */
        dispose()
        {

        }
    }
}