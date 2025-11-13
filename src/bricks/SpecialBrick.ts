abstract class SpecialBrick extends Brick {
    
    constructor(index: number, colorIndex: number, construction: Construction);
    constructor(brickName: string, colorIndex: number, construction: Construction);
    constructor(brickId: number | string, colorIndex: number, construction: Construction);
    constructor(arg1: any, colorIndex: number, construction: Construction) {
        super(arg1, colorIndex, construction);
    }
    
    public abstract constructSpecialBrickMesh(): SpecialBrickMesh;

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

    public abstract generateSpecialBrickVertexData(): Promise<BABYLON.VertexData>;
}

class SpecialBrickMesh extends BABYLON.Mesh {

    constructor(public specialBrick: SpecialBrick, name: string) {
        super(name);
    }

    public updateMaterial(): void { }
}