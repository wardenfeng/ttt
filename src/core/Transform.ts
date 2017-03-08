module feng3d
{
    /**
     * 变换
     * @author feng 2016-04-26
     */
    export class Transform extends Object3DComponent
    {

        private readonly transformChanged = new TransformEvent(TransformEvent.TRANSFORM_CHANGED, this);
        private readonly sceneTransformChanged = new TransformEvent(TransformEvent.SCENETRANSFORM_CHANGED, this);
        /**
         * 位移
         */
        public position = new Vector3D();

        /**
         * 旋转
         */
        public rotation = new Vector3D();

        /**
         * 缩放
         */
        public scale = new Vector3D();

        //
        protected _matrix3D = new Matrix3D();
        protected _inverseMatrix3D = new Matrix3D();
        /**
         * 全局矩阵
         */
        protected _globalMatrix3D = new Matrix3D();
        protected _inverseGlobalMatrix3D = new Matrix3D();
        //
        protected _matrix3DDirty = true;
        protected _inverseMatrix3DDirty = true;
        /**
         * 全局矩阵是否变脏
         */
        protected _globalMatrix3DDirty = true;
        protected _inverseGlobalMatrix3DDirty = true;

        /**
         * 构建变换
         * @param x X坐标
         * @param y Y坐标
         * @param z Z坐标
         * @param rx X旋转
         * @param ry Y旋转
         * @param rz Z旋转
         * @param sx X缩放
         * @param sy Y缩放
         * @param sz Z缩放
         */
        constructor(x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1)
        {
            super();
            //矫正值
            this.position.setTo(x || 0, y || 0, z || 0);
            this.rotation.setTo(rx || 0, ry || 0, rz || 0);
            this.scale.setTo(rx || 0.000001, ry || 0.000001, rz || 0.000001);
            //
            Watcher.watch(this, ["position", "x"], this.invalidateMatrix3D, this);
            Watcher.watch(this, ["position", "y"], this.invalidateMatrix3D, this);
            Watcher.watch(this, ["position", "z"], this.invalidateMatrix3D, this);
            Watcher.watch(this, ["rotation", "x"], this.invalidateMatrix3D, this);
            Watcher.watch(this, ["rotation", "y"], this.invalidateMatrix3D, this);
            Watcher.watch(this, ["rotation", "z"], this.invalidateMatrix3D, this);
            Watcher.watch(this, ["scale", "x"], this.invalidateMatrix3D, this);
            Watcher.watch(this, ["scale", "y"], this.invalidateMatrix3D, this);
            Watcher.watch(this, ["scale", "z"], this.invalidateMatrix3D, this);
            Watcher.watch(this, ["position"], this.invalidateMatrix3D, this);
            Watcher.watch(this, ["rotation"], this.invalidateMatrix3D, this);
            Watcher.watch(this, ["rotation"], this.invalidateMatrix3D, this);
        }

        /**
         * 全局坐标
         */
        public get globalPosition()
        {
            return this.globalMatrix3D.position;
        }

        public set globalPosition(value)
        {
            var globalMatrix3D = this.globalMatrix3D.clone();
            globalMatrix3D.position = value;
            this.globalMatrix3D = globalMatrix3D;
        }

        /**
         * 变换矩阵
         */
        public get matrix3d(): Matrix3D
        {
            if (this._matrix3DDirty)
                this.updateMatrix3D();
            return this._matrix3D;
        }

        public set matrix3d(value: Matrix3D)
        {
            //延迟事件
            this.delay();

            this._matrix3DDirty = false;
            this._matrix3D.rawData.set(value.rawData);
            var vecs = this._matrix3D.decompose();
            this.position.copyFrom(vecs[0]);
            this.rotation.copyFrom(vecs[1]);
            this.rotation.scaleBy(MathConsts.RADIANS_TO_DEGREES);
            this.scale.copyFrom(vecs[2]);
            this.adjust();

            this.notifyMatrix3DChanged();
            this.invalidateGlobalMatrix3D();
            //释放事件
            this.release();
        }

        /**
         * 逆变换矩阵
         */
        public get inverseMatrix3D(): Matrix3D
        {
            if (this._inverseMatrix3DDirty)
            {
                this._inverseMatrix3D.copyFrom(this.matrix3d);
                this._inverseMatrix3D.invert();
                this._inverseMatrix3DDirty = false;
            }
            return this._inverseMatrix3D;
        }

        /**
         * 看向目标位置
         * @param target    目标位置
         * @param upAxis    向上朝向
         */
        public lookAt(target: Vector3D, upAxis: Vector3D = null): void
        {
            this.matrix3d.lookAt(target, upAxis);
            this.matrix3d = this.matrix3d;
        }

        /**
         * 全局矩阵
         */
        public get globalMatrix3D(): Matrix3D
        {
            this._globalMatrix3DDirty && this.updateGlobalMatrix3D();
            return this._globalMatrix3D;
        }

        public set globalMatrix3D(value)
        {
            value = value.clone();
            if (this.object3D && this.object3D.parent)
            {
                value.append(this.object3D.parent.transform.inverseGlobalMatrix3D);
            }
            this.matrix3d = value;
        }

        /**
         * 逆全局矩阵
         */
        public get inverseGlobalMatrix3D(): Matrix3D
        {
            this._inverseGlobalMatrix3DDirty && this.updateInverseGlobalMatrix3D();
            return this._inverseGlobalMatrix3D;
        }

        /**
         * 变换矩阵
         */
        protected updateMatrix3D()
        {
            //矫正值
            this.adjust();
            //
            var rotation = this.rotation.clone();
            rotation.scaleBy(MathConsts.DEGREES_TO_RADIANS);
            this._matrix3D.recompose([
                this.position,
                rotation,
                this.scale
            ]);
            this._matrix3DDirty = false;
        }

        /**
         * 使变换矩阵无效
         */
        protected invalidateMatrix3D()
        {
            //延迟事件
            this.delay();
            this.adjust();

            this._matrix3DDirty = true;
            this.notifyMatrix3DChanged();
            //
            this.invalidateGlobalMatrix3D();
            this.release();
        }

        /**
         * 矫正数值
         */
        private adjust()
        {
            this.position || (this.position = new Vector3D());
            this.rotation || (this.rotation = new Vector3D());
            this.scale || (this.scale = new Vector3D(1, 1, 1));

            this.position.setTo(this.position.x || 0, this.position.y || 0, this.position.z || 0);
            this.rotation.setTo(this.rotation.x || 0, this.rotation.y || 0, this.rotation.z || 0);
            this.scale.setTo(this.scale.x || 0.000001, this.scale.y || 0.000001, this.scale.z || 0.000001);
        }

        /**
		 * 发出状态改变消息
		 */
        protected notifyMatrix3DChanged()
        {
            this.dispatchEvent(this.transformChanged);
        }

        /**
         * 更新全局矩阵
         */
        protected updateGlobalMatrix3D()
        {
            this._globalMatrix3DDirty = false;
            this._globalMatrix3D.copyFrom(this.matrix3d);
            if (this.object3D && this.object3D.parent)
            {
                var parentGlobalMatrix3D = this.object3D.parent.transform.globalMatrix3D;
                this._globalMatrix3D.append(parentGlobalMatrix3D);
            }
        }

        /**
         * 更新逆全局矩阵
         */
        protected updateInverseGlobalMatrix3D()
        {
            this._inverseGlobalMatrix3DDirty = false;
            this._inverseGlobalMatrix3D.copyFrom(this.globalMatrix3D);
            this._inverseGlobalMatrix3D.invert();
        }

        /**
		 * 通知全局变换改变
		 */
        protected notifySceneTransformChange()
        {
            this.dispatchEvent(this.sceneTransformChanged);
        }

        /**
		 * 全局变换矩阵失效
         * @private
		 */
        protected invalidateGlobalMatrix3D()
        {
            this._globalMatrix3DDirty = true;
            this._inverseGlobalMatrix3DDirty = true;
            this.notifySceneTransformChange();

            //
            if (this.object3D)
            {
                for (var i = 0; i < this.object3D.numChildren; i++)
                {
                    var element = this.object3D.getChildAt(i)
                    element.transform.invalidateGlobalMatrix3D();
                }
            }
        }

		/**
		 * 更新渲染数据
		 */
        public updateRenderData(renderContext: RenderContext)
        {
            super.updateRenderData(renderContext);
            this._renderData.uniforms[RenderDataID.u_modelMatrix] = this.globalMatrix3D;
        }
    }

    /**
	 * 变换事件(3D状态发生改变、位置、旋转、缩放)
	 * @author feng 2014-3-31
	 */
    export class TransformEvent extends Event
    {
		/**
		 * 变换
		 */
        public static TRANSFORM_CHANGED: string = "transformChanged";

        /**
		 * 场景变换矩阵发生变化
		 */
        public static SCENETRANSFORM_CHANGED: string = "scenetransformChanged";

		/**
		 * 发出事件的3D元素
		 */
        public data: Transform;

        /**
		 * 创建一个作为参数传递给事件侦听器的 Event 对象。
		 * @param type 事件的类型，可以作为 Event.type 访问。
         * @param data 携带数据
		 * @param bubbles 确定 Event 对象是否参与事件流的冒泡阶段。默认值为 false。
		 */
        constructor(type: string, data: Transform, bubbles = false)
        {
            super(type, data, bubbles);
        }
    }
}