class TextBrick extends SpecialBrick {
    
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

    public _constructSpecialBrickMesh(): SpecialBrickMesh {
        return new TextBrickMesh(this);
    }

    public async generateMeshVertexData(vDatas: BABYLON.VertexData[], subMeshInfos: { faceId: number, brick: Brick }[]): Promise<void> {

    }

    public async _generateSpecialBrickVertexData(): Promise<BABYLON.VertexData> {
        let template = await BrickTemplateManager.Instance.getTemplate(this.index);
        let vData = Mummu.CloneVertexData(template.vertexData);
        let colors = [];
        for (let i = 0; i < vData.positions.length / 3; i++) {
            colors.push(1, 1, 1, 1);
        }
        vData.colors = colors;

        let a = 2 * Math.PI * Math.random();
        a = 0;
        let cosa = Math.cos(a);
        let sina = Math.sin(a);
        let dU = Math.random();
        dU = 0;
        let dV = Math.random();
        dV = 0;
        let uvs = vData.uvs;
        for (let i = 0; i < uvs.length / 2; i++) {
            let u = uvs[2 * i];
            let v = uvs[2 * i + 1];
            uvs[2 * i] = cosa * u - sina * v + dU;
            uvs[2 * i + 1] = sina * u + cosa * v + dV;
        }
        vData.uvs = uvs;

        Mummu.RotateAngleAxisVertexDataInPlace(vData, this.r * Math.PI * 0.5, BABYLON.Axis.Y);
        Mummu.TranslateVertexDataInPlace(vData, this.position);

        return vData;
    }
}

class TextBrickMesh extends SpecialBrickMesh {

    constructor(public textBrick: TextBrick) {
        super(textBrick, "text-brick-mesh");
    }

    public updateMaterial(): void {
        let material = new ToonMaterial("name-tag-material", this._scene);
        material.setNoColorOutline(true);
        material.setDiffuseSharpness(-1);
        material.setDiffuseCount(2);
        
        let h = 64;
        let w = this.textBrick.w * h / (3 * BRICK_H) * BRICK_S;
        let texture = new BABYLON.DynamicTexture("name-tag-texture", { width: w, height: h }, this.textBrick.construction.game.scene);

        let context = texture.getContext();
        context.fillStyle = DodoColors[this.textBrick.colorIndex].hex;
        context.fillRect(0, 0, w, h);
        context.font = (h * 0.6).toFixed(0) + "px Cartoon";
        context.fillStyle = DodoColors[this.textBrick.colorIndex].textColor;
        context.strokeStyle = DodoColors[this.textBrick.colorIndex].textColor;
        context.lineWidth = h / 32;
        let l = context.measureText(this.textBrick.text);
        //context.strokeText(this.textBrick.text, w / 2 - l.width * 0.5, h - h / 8);
        context.fillText(this.textBrick.text, w / 2 - l.width * 0.5, h - h / 8);
        
        texture.update();
        material.setDiffuseTexture(texture);

        this.material = material;
    }
}