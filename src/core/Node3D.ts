namespace feng3d
{
    export interface Component3DEventMap
    {
        /**
         * 添加了子对象，当child被添加到parent中时派发冒泡事件
         */
        addChild: { parent: Node3D, child: Node3D }
        /**
         * 删除了子对象，当child被parent移除时派发冒泡事件
         */
        removeChild: { parent: Node3D, child: Node3D };

        /**
         * 自身被添加到父对象中事件
         */
        added: { parent: Node3D };

        /**
         * 自身从父对象中移除事件
         */
        removed: { parent: Node3D };

        /**
         * 当GameObject的scene属性被设置是由Scene派发
         */
        addedToScene: Node3D;

        /**
         * 当GameObject的scene属性被清空时由Scene派发
         */
        removedFromScene: Node3D;

        /**
         * 变换矩阵变化
         */
        transformChanged: Node3D;
        /**
         * 
         */
        updateLocalToWorldMatrix: Node3D;

        /**
         * 场景矩阵变化
         */
        scenetransformChanged: Node3D;
    }

    export interface ComponentMap { Node3D: Node3D; }

    /**
     * 变换
     * 
     * 物体的位置、旋转和比例。
     * 
     * 场景中的每个对象都有一个变换。它用于存储和操作对象的位置、旋转和缩放。每个转换都可以有一个父元素，它允许您分层应用位置、旋转和缩放
     */
    @RegisterComponent({ single: true })
    export class Node3D<T extends Component3DEventMap = Component3DEventMap> extends Component<T>
    {
        __class__: "feng3d.Node3D";

        assetType = AssetType.node3d;

        create()
        {
            new Entity().addComponent(Node3D);
        }

        /**
         * 预设资源编号
         */
        @serialize
        prefabId: string;

        /**
         * 资源编号
         */
        @serialize
        assetId: string;

        /**
         * 自身以及子对象是否支持鼠标拾取
         */
        @serialize
        mouseEnabled = true;

        /**
         * 创建一个实体，该类为虚类
         */
        constructor()
        {
            super();

            watcher.watch(this._position, "x", this._positionChanged, this);
            watcher.watch(this._position, "y", this._positionChanged, this);
            watcher.watch(this._position, "z", this._positionChanged, this);
            watcher.watch(this._rotation, "x", this._rotationChanged, this);
            watcher.watch(this._rotation, "y", this._rotationChanged, this);
            watcher.watch(this._rotation, "z", this._rotationChanged, this);
            watcher.watch(this._scale, "x", this._scaleChanged, this);
            watcher.watch(this._scale, "y", this._scaleChanged, this);
            watcher.watch(this._scale, "z", this._scaleChanged, this);

            this._renderAtomic.uniforms.u_modelMatrix = () => this.localToWorldMatrix;
            this._renderAtomic.uniforms.u_ITModelMatrix = () => this.ITlocalToWorldMatrix;
        }

        /**
         * 世界坐标
         */
        get worldPosition()
        {
            return this.localToWorldMatrix.getPosition();
        }

        /**
         * X轴坐标。
         */
        @serialize
        get x() { return this._position.x; }
        set x(v) { this._position.x = v; }

        /**
         * Y轴坐标。
         */
        @serialize
        get y() { return this._position.y; }
        set y(v) { this._position.y = v; }

        /**
         * Z轴坐标。
         */
        @serialize
        get z() { return this._position.z; }
        set z(v) { this._position.z = v; }

        /**
         * X轴旋转角度。
         */
        @serialize
        get rx() { return this._rotation.x; }
        set rx(v) { this._rotation.x = v; }

        /**
         * Y轴旋转角度。
         */
        @serialize
        get ry() { return this._rotation.y; }
        set ry(v) { this._rotation.y = v; }

        /**
         * Z轴旋转角度。
         */
        @serialize
        get rz() { return this._rotation.z; }
        set rz(v) { this._rotation.z = v; }

        /**
         * X轴缩放。
         */
        @serialize
        get sx() { return this._scale.x; }
        set sx(v) { this._scale.x = v; }

        /**
         * Y轴缩放。
         */
        @serialize
        get sy() { return this._scale.y; }
        set sy(v) { this._scale.y = v; }

        /**
         * Z轴缩放。
         */
        @serialize
        get sz() { return this._scale.z; }
        set sz(v) { this._scale.z = v; }

        /**
         * 本地位移
         */
        @oav({ tooltip: "本地位移" })
        get position() { return this._position; }
        set position(v) { this._position.copy(v); }

        /**
         * 本地旋转
         */
        @oav({ tooltip: "本地旋转", component: "OAVVector3", componentParam: { step: 0.001, stepScale: 30, stepDownup: 30 } })
        get rotation() { return this._rotation; }
        set rotation(v) { this._rotation.copy(v); }

        /**
         * 本地四元素旋转
         */
        get orientation()
        {
            this._orientation.fromMatrix(this.matrix);
            return this._orientation;
        }

        set orientation(value)
        {
            var angles = value.toEulerAngles();
            angles.scaleNumber(Math.RAD2DEG);
            this.rotation = angles;
        }

        /**
         * 本地缩放
         */
        @oav({ tooltip: "本地缩放" })
        get scale() { return this._scale; }
        set scale(v) { this._scale.copy(v); }

        /**
         * 是否显示
         */
        @serialize
        get visible()
        {
            return this._visible;
        }
        set visible(v)
        {
            if (this._visible == v) return;
            this._visible = v;
            this._invalidateGlobalVisible();
        }
        private _visible = true;

        /**
         * 全局是否可见
         */
        get globalVisible()
        {
            if (this._globalVisibleInvalid)
            {
                this._updateGlobalVisible();
                this._globalVisibleInvalid = false;
            }
            return this._globalVisible;
        }
        protected _globalVisible = false;
        protected _globalVisibleInvalid = true;

        /**
         * 本地变换矩阵
         */
        get matrix()
        {
            if (this._matrixInvalid)
            {
                this._matrixInvalid = false;
                this._updateMatrix();
            }
            return this._matrix;
        }

        set matrix(v)
        {
            v.toTRS(this._position, this._rotation, this._scale);
            this._matrix.fromArray(v.elements);
            this._matrixInvalid = false;
        }

        /**
         * 本地旋转矩阵
         */
        get rotationMatrix()
        {
            if (this._rotationMatrixInvalid)
            {
                this._rotationMatrix.setRotation(this._rotation);
                this._rotationMatrixInvalid = false;
            }
            return this._rotationMatrix;
        }

        /**
         * 轴对称包围盒
         */
        get boundingBox()
        {
            if (!this._boundingBox)
            {
                this._boundingBox = new BoundingBox(this);
            }
            return this._boundingBox;
        }
        private _boundingBox: BoundingBox;

        get parent()
        {
            return this._parent;
        }

        get scene()
        {
            return this._scene;
        }

        /**
         * 子对象
         */
        @serialize
        get children()
        {
            return this._children.concat();
        }

        set children(value)
        {
            if (!value) return;
            for (var i = this._children.length - 1; i >= 0; i--)
            {
                this.removeChildAt(i)
            }
            for (var i = 0; i < value.length; i++)
            {
                this.addChild(value[i]);
            }
        }

        get numChildren()
        {
            return this._children.length;
        }

        moveForward(distance: number)
        {
            this.translateLocal(Vector3.Z_AXIS, distance);
        }

        moveBackward(distance: number)
        {
            this.translateLocal(Vector3.Z_AXIS, -distance);
        }

        moveLeft(distance: number)
        {
            this.translateLocal(Vector3.X_AXIS, -distance);
        }

        moveRight(distance: number)
        {
            this.translateLocal(Vector3.X_AXIS, distance);
        }

        moveUp(distance: number)
        {
            this.translateLocal(Vector3.Y_AXIS, distance);
        }

        moveDown(distance: number)
        {
            this.translateLocal(Vector3.Y_AXIS, -distance);
        }

        translate(axis: Vector3, distance: number)
        {
            var x = axis.x, y = axis.y, z = axis.z;
            var len = distance / Math.sqrt(x * x + y * y + z * z);
            this.x += x * len;
            this.y += y * len;
            this.z += z * len;
        }

        translateLocal(axis: Vector3, distance: number)
        {
            var x = axis.x, y = axis.y, z = axis.z;
            var len = distance / Math.sqrt(x * x + y * y + z * z);
            var matrix = this.matrix.clone();
            matrix.prependTranslation(x * len, y * len, z * len);
            var p = matrix.getPosition();
            this.x = p.x;
            this.y = p.y;
            this.z = p.z;
            this._invalidateSceneTransform();
        }

        pitch(angle: number)
        {
            this.rotate(Vector3.X_AXIS, angle);
        }

        yaw(angle: number)
        {
            this.rotate(Vector3.Y_AXIS, angle);
        }

        roll(angle: number)
        {
            this.rotate(Vector3.Z_AXIS, angle);
        }

        rotateTo(ax: number, ay: number, az: number)
        {
            this._rotation.set(ax, ay, az);
        }

        /**
         * 绕指定轴旋转，不受位移与缩放影响
         * @param    axis               旋转轴
         * @param    angle              旋转角度
         * @param    pivotPoint         旋转中心点
         * 
         */
        rotate(axis: Vector3, angle: number, pivotPoint?: Vector3): void
        {
            //转换位移
            var positionMatrix = Matrix4x4.fromPosition(this.position.x, this.position.y, this.position.z);
            positionMatrix.appendRotation(axis, angle, pivotPoint);
            this.position = positionMatrix.getPosition();
            //转换旋转
            var rotationMatrix = Matrix4x4.fromRotation(this.rx, this.ry, this.rz);
            rotationMatrix.appendRotation(axis, angle, pivotPoint);
            var newrotation = rotationMatrix.toTRS()[1];
            var v = Math.round((newrotation.x - this.rx) / 180);
            if (v % 2 != 0)
            {
                newrotation.x += 180;
                newrotation.y = 180 - newrotation.y;
                newrotation.z += 180;
            }
            //
            var toRound = (a: number, b: number, c = 360) =>
            {
                return Math.round((b - a) / c) * c + a;
            }
            newrotation.x = toRound(newrotation.x, this.rx);
            newrotation.y = toRound(newrotation.y, this.ry);
            newrotation.z = toRound(newrotation.z, this.rz);
            this.rotation = newrotation;
            this._invalidateSceneTransform();
        }

        /**
         * 看向目标位置
         * 
         * @param target    目标位置
         * @param upAxis    向上朝向
         */
        lookAt(target: Vector3, upAxis?: Vector3)
        {
            this._updateMatrix();
            this._matrix.lookAt(target, upAxis);
            this._matrix.toTRS(this._position, this._rotation, this._scale);
            this._matrixInvalid = false;
        }

        /**
         * 将一个点从局部空间变换到世界空间的矩阵。
         */
        get localToWorldMatrix()
        {
            if (this._localToWorldMatrixInvalid)
            {
                this._localToWorldMatrixInvalid = false;
                this._updateLocalToWorldMatrix();
            }
            return this._localToWorldMatrix;
        }

        set localToWorldMatrix(value)
        {
            value = value.clone();
            this.parent && value.append(this.parent.worldToLocalMatrix);
            this.matrix = value;
        }

        /**
         * 本地转世界逆转置矩阵
         */
        get ITlocalToWorldMatrix()
        {
            if (this._ITlocalToWorldMatrixInvalid)
            {
                this._ITlocalToWorldMatrixInvalid = false;
                this._ITlocalToWorldMatrix.copy(this.localToWorldMatrix)
                this._ITlocalToWorldMatrix.invert().transpose();
            }
            return this._ITlocalToWorldMatrix;
        }

        /**
         * 将一个点从世界空间转换为局部空间的矩阵。
         */
        get worldToLocalMatrix()
        {
            if (this._worldToLocalMatrixInvalid)
            {
                this._worldToLocalMatrixInvalid = false;
                this._worldToLocalMatrix.copy(this.localToWorldMatrix).invert();
            }
            return this._worldToLocalMatrix;
        }

        get localToWorldRotationMatrix()
        {
            if (this._localToWorldRotationMatrixInvalid)
            {
                this._localToWorldRotationMatrix.copy(this.rotationMatrix);
                if (this.parent)
                    this._localToWorldRotationMatrix.append(this.parent.localToWorldRotationMatrix);

                this._localToWorldRotationMatrixInvalid = false;
            }
            return this._localToWorldRotationMatrix;
        }

        get worldToLocalRotationMatrix()
        {
            var mat = this.localToWorldRotationMatrix.clone();
            mat.invert();
            return mat;
        }

        /**
         * 根据名称查找对象
         * 
         * @param name 对象名称
         */
        find(name: string): Node3D
        {
            if (this.name == name)
                return this;
            for (var i = 0; i < this._children.length; i++)
            {
                var target = this._children[i].find(name);
                if (target)
                    return target;
            }
            return null;
        }

        /**
         * 是否包含指定对象
         * 
         * @param child 可能的子孙对象
         */
        contains(child: Node3D)
        {
            var checkitem = child;
            do
            {
                if (checkitem == this)
                    return true;
                checkitem = checkitem.parent;
            } while (checkitem);
            return false;
        }

        /**
         * 添加子对象
         * 
         * @param child 子对象
         */
        addChild(child: Node3D)
        {
            if (child == null)
                return;
            if (child.parent == this)
            {
                // 把子对象移动到最后
                var childIndex = this._children.indexOf(child);
                if (childIndex != -1) this._children.splice(childIndex, 1);
                this._children.push(child);
            } else
            {
                if (child.contains(this))
                {
                    console.error("无法添加到自身中!");
                    return;
                }
                if (child._parent) child._parent.removeChild(child);
                child._setParent(this);
                this._children.push(child);
                child.emit("added", { parent: this });
                this.emit("addChild", { child: child, parent: this }, true);
            }
            return child;
        }

        /**
         * 添加子对象
         * 
         * @param children 子对象
         */
        addChildren(...children: Node3D[])
        {
            for (let i = 0; i < children.length; i++)
            {
                this.addChild(children[i]);
            }
        }

        /**
         * 移除自身
         */
        remove()
        {
            if (this.parent) this.parent.removeChild(this);
        }

        /**
         * 移除所有子对象
         */
        removeChildren()
        {
            for (let i = this.numChildren - 1; i >= 0; i--)
            {
                this.removeChildAt(i);
            }
        }

        /**
         * 移除子对象
         * 
         * @param child 子对象
         */
        removeChild(child: Node3D)
        {
            if (child == null) return;
            var childIndex = this._children.indexOf(child);
            if (childIndex != -1) this.removeChildInternal(childIndex, child);
        }

        /**
         * 删除指定位置的子对象
         * 
         * @param index 需要删除子对象的所有
         */
        removeChildAt(index: number)
        {
            var child = this._children[index];
            return this.removeChildInternal(index, child);
        }

        /**
         * 获取指定位置的子对象
         * 
         * @param index 
         */
        getChildAt(index: number)
        {
            index = index;
            return this._children[index];
        }

        /**
         * 获取子对象列表（备份）
         */
        getChildren()
        {
            return this._children.concat();
        }

        /**
         * 将方向从局部空间转换到世界空间。
         * 
         * @param direction 局部空间方向
         */
        transformDirection(direction: Vector3)
        {
            direction = this.localToWolrdDirection(direction);
            return direction;
        }

        /**
         * 将方向从局部空间转换到世界空间。
         * 
         * @param direction 局部空间方向
         */
        localToWolrdDirection(direction: Vector3)
        {
            if (!this.parent)
                return direction.clone();
            var matrix = this.parent.localToWorldRotationMatrix;
            direction = matrix.transformPoint3(direction);
            return direction;
        }

        /**
         * 将包围盒从局部空间转换到世界空间
         * 
         * @param box 变换前的包围盒
         * @param out 变换之后的包围盒
         * 
         * @returns 变换之后的包围盒
         */
        localToWolrdBox(box: Box3, out = new Box3())
        {
            if (!this.parent)
                return out.copy(box);
            var matrix = this.parent.localToWorldMatrix;
            box.applyMatrixTo(matrix, out);
            return out;
        }

        /**
         * 将位置从局部空间转换为世界空间。
         * 
         * @param position 局部空间位置
         */
        transformPoint(position: Vector3)
        {
            position = this.localToWorldPoint(position);
            return position;
        }

        /**
         * 将位置从局部空间转换为世界空间。
         * 
         * @param position 局部空间位置
         */
        localToWorldPoint(position: Vector3)
        {
            if (!this.parent)
                return position.clone();
            position = this.parent.localToWorldMatrix.transformPoint3(position);
            return position;
        }

        /**
         * 将向量从局部空间变换到世界空间。
         * 
         * @param vector 局部空间向量
         */
        transformVector(vector: Vector3)
        {
            vector = this.localToWorldVector(vector);
            return vector;
        }

        /**
         * 将向量从局部空间变换到世界空间。
         * 
         * @param vector 局部空间位置
         */
        localToWorldVector(vector: Vector3)
        {
            if (!this.parent)
                return vector.clone();
            var matrix = this.parent.localToWorldMatrix;
            vector = matrix.transformVector3(vector);
            return vector;
        }

        /**
         * Transforms a direction from world space to local space. The opposite of Transform.TransformDirection.
         * 
         * 将一个方向从世界空间转换到局部空间。
         */
        inverseTransformDirection(direction: Vector3)
        {
            direction = this.worldToLocalDirection(direction)
            return direction;
        }

        /**
         * 将一个方向从世界空间转换到局部空间。
         */
        worldToLocalDirection(direction: Vector3)
        {
            if (!this.parent)
                return direction.clone();
            var matrix = this.parent.localToWorldRotationMatrix.clone().invert();
            direction = matrix.transformPoint3(direction);
            return direction;
        }

        /**
         * 将位置从世界空间转换为局部空间。
         * 
         * @param position 世界坐标系中位置
         */
        worldToLocalPoint(position: Vector3, out = new Vector3())
        {
            if (!this.parent)
                return out.copy(position);
            position = this.parent.worldToLocalMatrix.transformPoint3(position, out);
            return position;
        }

        /**
         * 将向量从世界空间转换为局部空间
         * 
         * @param vector 世界坐标系中向量
         */
        worldToLocalVector(vector: Vector3)
        {
            if (!this.parent)
                return vector.clone();
            vector = this.parent.worldToLocalMatrix.transformVector3(vector);
            return vector;
        }

        /**
         * 将 Ray3 从世界空间转换为局部空间。
         * 
         * @param worldRay 世界空间射线。
         * @param localRay 局部空间射线。
         */
        rayWorldToLocal(worldRay: Ray3, localRay = new Ray3())
        {
            this.worldToLocalMatrix.transformRay(worldRay, localRay);
            return localRay;
        }

        /**
         * 从自身与子代（孩子，孩子的孩子，...）Entity 中获取所有指定类型的组件
         * 
         * @param type		要检索的组件的类型。
         * @return			返回与给出类定义一致的组件
         */
        getComponentsInChildren<T extends Components>(type?: Constructor<T>, filter?: (compnent: T) => {
            /**
             * 是否继续查找子项
             */
            findchildren: boolean,
            /**
             * 是否为需要查找的组件
             */
            value: boolean
        }, result?: T[]): T[]
        {
            result = result || [];
            var findchildren = true;
            var cls = type;
            var components = this.entity.components;
            for (var i = 0, n = components.length; i < n; i++)
            {
                var item = <T>components[i];
                if (!cls)
                {
                    result.push(item);
                } else if (item instanceof cls)
                {
                    if (filter)
                    {
                        var filterresult = filter(item);
                        filterresult && filterresult.value && result.push(item);
                        findchildren = filterresult ? (filterresult && filterresult.findchildren) : false;
                    }
                    else
                    {
                        result.push(item);
                    }
                }
            }
            if (findchildren)
            {
                for (var i = 0, n = this.numChildren; i < n; i++)
                {
                    this.getChildAt(i).getComponentsInChildren(type, filter, result);
                }
            }
            return result;
        }

        /**
         * 从父代（父亲，父亲的父亲，...）中获取组件
         * 
         * @param type		类定义
         * @return			返回与给出类定义一致的组件
         */
        getComponentsInParents<T extends Components>(type?: Constructor<T>, result?: T[]): T[]
        {
            result = result || [];
            var parent = this.parent;
            while (parent)
            {
                var compnent = parent.getComponent(type);
                compnent && result.push(compnent);
                parent = parent.parent;
            }
            return result;
        }

        beforeRender(renderAtomic: RenderAtomic, scene: Scene, camera: Camera)
        {
            Object.assign(renderAtomic.uniforms, this._renderAtomic.uniforms);
        }

        /**
         * 销毁
         */
        dispose()
        {
            if (this.parent)
                this.parent.removeChild(this);
            for (var i = this._children.length - 1; i >= 0; i--)
            {
                this.removeChildAt(i);
            }
            super.dispose();
        }

        disposeWithChildren()
        {
            this.dispose();
            while (this.numChildren > 0)
                this.getChildAt(0).dispose();
        }

        private readonly _position = new Vector3();
        private readonly _rotation = new Vector3();
        private readonly _orientation = new Quaternion();
        private readonly _scale = new Vector3(1, 1, 1);

        protected readonly _matrix = new Matrix4x4();
        protected _matrixInvalid = false;

        protected readonly _rotationMatrix = new Matrix4x4();
        protected _rotationMatrixInvalid = false;

        protected readonly _localToWorldMatrix = new Matrix4x4();
        protected _localToWorldMatrixInvalid = false;

        protected readonly _ITlocalToWorldMatrix = new Matrix4x4();
        protected _ITlocalToWorldMatrixInvalid = false;

        protected readonly _worldToLocalMatrix = new Matrix4x4();
        protected _worldToLocalMatrixInvalid = false;

        protected readonly _localToWorldRotationMatrix = new Matrix4x4();
        protected _localToWorldRotationMatrixInvalid = false;

        protected _parent: Node3D;
        protected _children: Node3D[] = [];
        protected _scene: Scene;

        private _renderAtomic = new RenderAtomic();

        private _positionChanged(newValue: number, oldValue: number, object: Vector3, property: string)
        {
            if (!Math.equals(newValue, oldValue))
                this._invalidateTransform();
        }

        private _rotationChanged(newValue: number, oldValue: number, object: Vector3, property: string)
        {
            if (!Math.equals(newValue, oldValue))
            {
                this._invalidateTransform();
                this._rotationMatrixInvalid = true;
            }
        }

        private _scaleChanged(newValue: number, oldValue: number, object: Vector3, property: string)
        {
            if (!Math.equals(newValue, oldValue))
                this._invalidateTransform();
        }


        private _setParent(value: Node3D)
        {
            this._parent = value;
            this.updateScene();
            this._invalidateSceneTransform();
        }

        private updateScene()
        {
            var newScene = this._parent?._scene;
            if (this._scene == newScene)
                return;
            if (this._scene)
            {
                this.emit("removedFromScene", this);
            }
            this._scene = newScene;
            if (this._scene)
            {
                this.emit("addedToScene", this);
            }
            this._updateChildrenScene();
        }

        /**
         * @private
         */
        private _updateChildrenScene()
        {
            for (let i = 0, n = this._children.length; i < n; i++)
            {
                this._children[i].updateScene();
            }
        }

        private removeChildInternal(childIndex: number, child: Node3D)
        {
            childIndex = childIndex;
            this._children.splice(childIndex, 1);
            child._setParent(null);

            child.emit("removed", { parent: this });
            this.emit("removeChild", { child: child, parent: this }, true);
        }

        private _invalidateTransform()
        {
            if (this._matrixInvalid) return;
            this._matrixInvalid = true;

            this.emit("transformChanged", this);
            this._invalidateSceneTransform();
        }

        private _invalidateSceneTransform()
        {
            if (this._localToWorldMatrixInvalid) return;

            this._localToWorldMatrixInvalid = true;
            this._worldToLocalMatrixInvalid = true;
            this._ITlocalToWorldMatrixInvalid = true;
            this._localToWorldRotationMatrixInvalid = true;

            this.emit("scenetransformChanged", this);
            //
            if (this.entity)
            {
                for (var i = 0, n = this.numChildren; i < n; i++)
                {
                    this.getChildAt(i)._invalidateSceneTransform();
                }
            }
        }

        private _updateMatrix()
        {
            this._matrix.fromTRS(this._position, this._rotation, this._scale);
        }

        private _updateLocalToWorldMatrix()
        {
            this._localToWorldMatrix.copy(this.matrix);
            if (this.parent)
                this._localToWorldMatrix.append(this.parent.localToWorldMatrix);
            this.emit("updateLocalToWorldMatrix", this);
            console.assert(!isNaN(this._localToWorldMatrix.elements[0]));
        }

        /**
         * 是否加载完成
         */
        get isSelfLoaded()
        {
            var model = this.getComponent(Renderable);
            if (model) return model.isLoaded
            return true;
        }

        /**
         * 已加载完成或者加载完成时立即调用
         * @param callback 完成回调
         */
        onSelfLoadCompleted(callback: () => void)
        {
            if (this.isSelfLoaded)
            {
                callback();
                return;
            }
            var model = this.getComponent(Renderable);
            if (model)
            {
                model.onLoadCompleted(callback);
            }
            else callback();
        }

        /**
         * 是否加载完成
         */
        get isLoaded()
        {
            if (!this.isSelfLoaded) return false;
            for (let i = 0; i < this.children.length; i++)
            {
                const element = this.children[i];
                if (!element.isLoaded) return false;
            }
            return true;
        }

        /**
         * 已加载完成或者加载完成时立即调用
         * @param callback 完成回调
         */
        onLoadCompleted(callback: () => void)
        {
            var loadingNum = 0;
            if (!this.isSelfLoaded) 
            {
                loadingNum++;
                this.onSelfLoadCompleted(() =>
                {
                    loadingNum--;
                    if (loadingNum == 0) callback();
                });
            }
            for (let i = 0; i < this.children.length; i++)
            {
                const element = this.children[i];
                if (!element.isLoaded) 
                {
                    loadingNum++;
                    element.onLoadCompleted(() =>
                    {
                        loadingNum--;
                        if (loadingNum == 0) callback();
                    });
                }
            }
            if (loadingNum == 0) callback();
        }

        protected _updateGlobalVisible()
        {
            var visible = this.visible;
            if (this.parent)
            {
                visible = visible && this.parent.globalVisible;
            }
            this._globalVisible = visible;
        }

        protected _invalidateGlobalVisible()
        {
            if (this._globalVisibleInvalid) return;

            this._globalVisibleInvalid = true;

            this._children.forEach(c =>
            {
                c._invalidateGlobalVisible();
            });
        }

        /**
         * 申明冒泡函数
         * feng3d.__event_bubble_function__
         */
        protected __event_bubble_function__(): any[]
        {
            return [this.parent];
        }

        /**
         * @private
         * @param v 
         */
        _setScene(v: Scene)
        {
            this._scene = v;
            this._updateChildrenScene();
        }
    }
}
