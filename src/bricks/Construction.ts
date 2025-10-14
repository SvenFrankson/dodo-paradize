class Construction extends BABYLON.Mesh {

    public static LENGTH: number = BRICKS_PER_CONSTRUCTION * BRICK_S;

    public bricks: Brick[] = [];

    public mesh: BABYLON.Mesh;

    constructor(public i: number, public j: number, public terrain: Terrain) {
        super("construction_" + i.toFixed(0) + "_" + j.toFixed(0));
        this.position.copyFromFloats(this.i * Construction.LENGTH, 0, this.j * Construction.LENGTH);
    }

    public static worldPosToIJ(pos: BABYLON.Vector3): { i: number, j: number} {
        let i = Math.floor((pos.x) / Construction.LENGTH);
        let j = Math.floor((pos.z) / Construction.LENGTH);

        return { i: i, j: j };
    }

    public async instantiate(): Promise<void> {
        
    }
}