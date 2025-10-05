class Construction extends BABYLON.Mesh {

    public length: number = BRICKS_PER_CONSTRUCTION;

    public bricks: Brick[][][] = [];

    public mesh: BABYLON.Mesh;

    constructor(public i: number, public j: number, public terrain: Terrain) {
        super("construction_" + i.toFixed(0) + "_" + j.toFixed(0));
        this.position.copyFromFloats(this.i * this.terrain.chunckSize_m + BRICK_S * 0.5, 0, this.j * this.terrain.chunckSize_m + BRICK_S * 0.5);
    }

    public async instantiate(): Promise<void> {
        
    }
}