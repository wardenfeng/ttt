namespace feng3d
{
    /**
     * 材质资源
     */
    export class MaterialAsset extends FileAsset
    {
        /**
         * 材质
         */
        @oav({ component: "OAVObjectView" })
        data: Material;

        assetType = AssetType.material;

        extenson = ".json";

        saveFile(callback?: (err: Error) => void)
        {
            this.data.assetId = this.assetId;
            this.rs.fs.writeObject(this.assetPath, this.data, callback);
        }

        /**
         * 读取文件
         * @param fs 刻度资源管理系统
         * @param callback 完成回调
         */
        readFile(callback?: (err: Error) => void)
        {
            this.rs.fs.readObject(this.assetPath, (err, data: Material) =>
            {
                this.data = data;
                this.data.assetId = this.assetId;
                callback && callback(err);
            });
        }
    }
}