///  <reference path="./SpecialBrick.ts"/>

class ArcadeBrick extends StationBrick {

    public arcadeEngine: ArcadeEngine;

    constructor(index: number, colorIndex: number, construction: Construction);
    constructor(brickName: string, colorIndex: number, construction: Construction);
    constructor(brickId: number | string, colorIndex: number, construction: Construction);
    constructor(arg1: any, colorIndex: number, construction: Construction) {
        super(arg1, colorIndex, construction);
    }

    public _constructSpecialBrickMesh(): SpecialBrickMesh {
        return new ArcadeBrickMesh(this);
    }

    public async generateSpecialBrickMesh(): Promise<SpecialBrickMesh> {
        let specialBrickMesh = await super.generateSpecialBrickMesh() as ArcadeBrickMesh;
        specialBrickMesh.position.copyFrom(this.position);
        specialBrickMesh.rotation.y = this.r * Math.PI * 0.5;

        this.worldDodoStationPosition.copyFrom(this.dodoStationPosition);
        Mummu.RotateInPlace(this.worldDodoStationPosition, BABYLON.Axis.Y, this.r * Math.PI * 0.5);
        this.worldDodoStationPosition.addInPlace(this.position);
        this.worldDodoStationPosition.addInPlace(this.construction.position);

        this.worldCameraStationTarget.copyFrom(this.cameraStationTarget);
        Mummu.RotateInPlace(this.worldCameraStationTarget, BABYLON.Axis.Y, this.r * Math.PI * 0.5);
        this.worldCameraStationTarget.addInPlace(this.position);
        this.worldCameraStationTarget.addInPlace(this.construction.position);

        let vDatas = await this.game.vertexDataLoader.get("datas/meshes/arcade.babylon");
        let screenVData = Mummu.CloneVertexData(vDatas[1]);
        screenVData.applyToMesh(specialBrickMesh.screenMesh);

        let material = new ToonMaterial("screen-material", this._scene);
        material.setNoColorOutline(true);
        material.setDiffuseSharpness(-1);
        material.setDiffuseCount(2);
        
        let h = 144;
        let w = 160;
        let texture = new BABYLON.DynamicTexture("screen-texture", { width: w, height: h }, this.construction.game.scene, true, BABYLON.Texture.LINEAR_NEAREST);

        material.setDiffuseTexture(texture);

        specialBrickMesh.screenMesh.material = material;
        
        this.arcadeEngine = new ArcadeEngine(texture);
        this.arcadeEngine.start();

        return specialBrickMesh;
    }

    public async generateMeshVertexData(vDatas: BABYLON.VertexData[], subMeshInfos: { faceId: number, brick: Brick }[]): Promise<void> {

    }

    public async _generateSpecialBrickVertexData(): Promise<BABYLON.VertexData> {
        let vDatas = await this.game.vertexDataLoader.get("datas/meshes/arcade.babylon");
        let bodyVData = Mummu.CloneVertexData(vDatas[0]);

        Mummu.ColorizeVertexDataInPlace(bodyVData, DodoColors[this.colorIndex].color, BABYLON.Color3.Red());

        let a = 2 * Math.PI * Math.random();
        a = 0;
        let cosa = Math.cos(a);
        let sina = Math.sin(a);
        let dU = Math.random();
        dU = 0;
        let dV = Math.random();
        dV = 0;
        let uvs = bodyVData.uvs;
        for (let i = 0; i < uvs.length / 2; i++) {
            let u = uvs[2 * i];
            let v = uvs[2 * i + 1];
            uvs[2 * i] = cosa * u - sina * v + dU;
            uvs[2 * i + 1] = sina * u + cosa * v + dV;
        }
        bodyVData.uvs = uvs;

        return bodyVData;
    }
    
    public dispose(): void {
        if (this.arcadeEngine) {
            this.arcadeEngine.stop();
        }
        super.dispose();
    }
}

class ArcadeBrickMesh extends SpecialBrickMesh {

    public screenMesh: BABYLON.Mesh;

    constructor(public arcadeBrick: ArcadeBrick) {
        super(arcadeBrick, "text-brick-mesh");
        this.material = arcadeBrick.game.defaultToonMaterial;

        this.screenMesh = new BABYLON.Mesh("arcade-screen-mesh");
        this.screenMesh.parent = this;
    }
}