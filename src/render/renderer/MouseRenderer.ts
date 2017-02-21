module feng3d
{

    /**
     * 鼠标拾取渲染器
     * @author feng 2017-02-06
     */
    export class MouseRenderer extends Renderer
    {

        private shaderName = "mouse";
        public selectedObject3D: Object3D;
        private frameBufferObject: FrameBufferObject;

        constructor()
        {

            super();
            this.frameBufferObject = new FrameBufferObject();
            this.frameBufferObject.colorAttachments["objectID"] = new RenderBuffer(0);
        }

        /**
		 * 渲染
		 */
        public draw(context3D: Context3D, scene3D: Scene3D, camera: Camera3D)
        {

            this.frameBufferObject.activate(context3D,
                context3D.drawingBufferWidth,
                context3D.drawingBufferHeight);

            //启动裁剪，只绘制一个像素
            context3D.enable(Context3D.SCISSOR_TEST);
            context3D.scissor(0, 0, 1, 1);
            super.draw(context3D, scene3D, camera);
            context3D.disable(Context3D.SCISSOR_TEST);

            //读取鼠标拾取索引
            this.frameBufferObject.readBuffer(context3D, "objectID");

            var data = new Uint8Array(4);
            context3D.readPixels(0, 0, 1, 1, Context3D.RGBA, Context3D.UNSIGNED_BYTE, data);
            var id = data[0] + data[1] * 255 + data[2] * 255 * 255 + data[3] * 255 * 255 * 255 - data[3];//最后（- data[3]）表示很奇怪，不过data[3]一般情况下为0
            console.log(`选中索引3D对象${id}`, data.toString());

            this.selectedObject3D = Object3D.getObject3D(id);

            this.frameBufferObject.deactivate(context3D);
        }

        /**
         * 激活渲染程序
         */
        protected activeShaderProgram(context3D: Context3D, vertexCode: string, fragmentCode: string)
        {

            vertexCode = ShaderLib.getShaderCode(this.shaderName + ".vertex");
            fragmentCode = ShaderLib.getShaderCode(this.shaderName + ".fragment");
            return super.activeShaderProgram(context3D, vertexCode, fragmentCode);
        }
    }
}