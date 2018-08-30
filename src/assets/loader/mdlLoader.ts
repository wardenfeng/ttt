namespace feng3d
{
    export var mdlLoader: MDLLoader;

    export class MDLLoader
    {
        load(mdlurl: string, callback: (gameObject: GameObject) => void)
        {
            loader.loadText(mdlurl, (content) =>
            {
                war3.mdlParser.parse(content, (war3Model) =>
                {
                    war3Model.root = mdlurl.substring(0, mdlurl.lastIndexOf("/") + 1);

                    var showMesh = war3Model.getMesh();

                    callback(showMesh);
                });
            });
        }
    }

    mdlLoader = new MDLLoader();
}