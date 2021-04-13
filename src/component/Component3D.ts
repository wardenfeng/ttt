namespace feng3d
{

    export interface Component3DEventMap extends ComponentEventMap, MouseEventMap
    {
    }

    /**
     * 3D组件
     * 
     * 所有基于3D空间的组件均可继承于该组件。
     */
    @RegisterComponent({ dependencies: [Node3D] })
    export class Component3D<T extends Component3DEventMap = Component3DEventMap> extends Component<T>
    {
        /**
         * The Node3D attached to this Entity (null if there is none attached).
         * 
         * 附加到此 Entity 的 Node3D。
         */
        get node3d()
        {
            console.assert(!!this.entity);
            this._node3d = this._node3d || this.entity.getComponent(Node3D);
            console.assert(!!this._node3d);
            return this._node3d;
        }
        private _node3d: Node3D;

        /**
         * Returns all components of Type type in the Entity.
         * 
         * 返回 Entity 或其任何子项中类型为 type 的所有组件。
         * 
         * @param type		类定义
         * @return			返回与给出类定义一致的组件
         */
        getComponentsInChildren<T extends Components>(type?: Constructor<T>, filter?: (compnent: T) => { findchildren: boolean, value: boolean }, result?: T[]): T[]
        {
            return this.node3d.getComponentsInChildren(type, filter, result);
        }

        /**
         * 从父类中获取组件
         * @param type		类定义
         * @return			返回与给出类定义一致的组件
         */
        getComponentsInParents<T extends Components>(type?: Constructor<T>, result?: T[]): T[]
        {
            return this.node3d.getComponentsInParents(type, result);
        }
    }
}