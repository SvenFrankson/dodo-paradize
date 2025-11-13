///  <reference path="./SpecialBrick.ts"/>

class PictureBrick extends SpecialBrick {
    
    public w: number = 1;
    public text: string;

    constructor(index: number, colorIndex: number, construction: Construction);
    constructor(brickName: string, colorIndex: number, construction: Construction);
    constructor(brickId: number | string, colorIndex: number, construction: Construction);
    constructor(arg1: any, colorIndex: number, construction: Construction) {
        super(arg1, colorIndex, construction);
        let split = this.brickName.split("_");
        this.text = split.pop();
        this.w = parseInt(split.pop());
    }

    public constructSpecialBrickMesh(): SpecialBrickMesh {
        return new PictureBrickMesh(this);
    }

    public async generateMeshVertexData(vDatas: BABYLON.VertexData[], subMeshInfos: { faceId: number, brick: Brick }[]): Promise<void> {

    }

    public async generateSpecialBrickVertexData(): Promise<BABYLON.VertexData> {
        let template = await BrickTemplateManager.Instance.getTemplate(this.index);
        let vData = Mummu.CloneVertexData(template.vertexData);
        let colors = [];
        for (let i = 0; i < vData.positions.length / 3; i++) {
            colors.push(1, 1, 1, 1);
        }
        vData.colors = colors;

        Mummu.RotateAngleAxisVertexDataInPlace(vData, this.r * Math.PI * 0.5, BABYLON.Axis.Y);
        Mummu.TranslateVertexDataInPlace(vData, this.position);

        return vData;
    }
}

class PictureBrickMesh extends SpecialBrickMesh {

    constructor(brick: PictureBrick) {
        super(brick, "picture-brick-mesh");
    }

    public updateMaterial(): void {
        let material = new ToonMaterial("name-tag-material", this._scene);
        material.setNoColorOutline(true);
        material.setDiffuseSharpness(-1);
        material.setDiffuseCount(2);
        material.setAutoLight(0.75);
        
        let texture = new BABYLON.DynamicTexture("picture-brick-texture", { width: 256, height: 230 }, this.specialBrick.construction.game.scene);

        let context = texture.getContext();

        let img = document.createElement("img");
        let brickTemplate = BRICK_LIST[this.specialBrick.index];
        if (brickTemplate && brickTemplate.src) {
            img.src = brickTemplate.src;
            img.onload = () => {
                context.drawImage(img, 0, 0, 256, 230, 0, 0, 256, 230);
                texture.update();
                material.setDiffuseTexture(texture);
            }   
        }      

        this.material = material;
    }
}