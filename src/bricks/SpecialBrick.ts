///  <reference path="./Brick.ts"/>

abstract class SpecialBrick extends Brick {
    
    constructor(index: number, colorIndex: number, construction: Construction);
    constructor(brickName: string, colorIndex: number, construction: Construction);
    constructor(brickId: number | string, colorIndex: number, construction: Construction);
    constructor(arg1: any, colorIndex: number, construction: Construction) {
        super(arg1, colorIndex, construction);
    }
    
    protected abstract _constructSpecialBrickMesh(): SpecialBrickMesh;

    public async generateSpecialBrickMesh(): Promise<SpecialBrickMesh> {
        let vData = await this._generateSpecialBrickVertexData();
        let specialBrickMesh = this._constructSpecialBrickMesh();
        specialBrickMesh.updateMaterial();
        vData.applyToMesh(specialBrickMesh);
        return specialBrickMesh;
    }

    public dispose(): void {
        this.construction.bricks.remove(this);
        if (this.construction) {
            let index = this.construction.specialBrickMeshes.findIndex(sbm => {
                return sbm.specialBrick === this;
            })
            if (index != -1) {
                let pictureBrickMesh = this.construction.specialBrickMeshes[index];
                this.construction.specialBrickMeshes.splice(index, 1);
                pictureBrickMesh.dispose(false, true);
            }
        }
    }

    public async generateMeshVertexData(vDatas: BABYLON.VertexData[], subMeshInfos: { faceId: number, brick: Brick }[]): Promise<void> {

    }

    protected abstract _generateSpecialBrickVertexData(): Promise<BABYLON.VertexData>;
}

class SpecialBrickMesh extends BABYLON.Mesh {

    constructor(public specialBrick: SpecialBrick, name: string) {
        super(name);
    }

    public updateMaterial(): void { }
}

abstract class StationBrick extends SpecialBrick {

    public dodoStationPosition: BABYLON.Vector3 = new BABYLON.Vector3(0.168, 0, 1.7);
    public cameraStationTarget: BABYLON.Vector3 = new BABYLON.Vector3(0.168, 1.21 - 0.134, 0.178);
    
    public worldDodoStationPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public worldCameraStationTarget: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    public start(): void {
        this.game.playerBrain.inStation = this;
    }

    public stop(): void {
        this.game.playerBrain.inStation = undefined;
        
        if (this.onNextStop) {
            this.onNextStop();
            this.onNextStop = undefined;
        }
    }

    public onNextStop: () => void;

}