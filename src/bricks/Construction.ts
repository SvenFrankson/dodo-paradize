class Construction extends BABYLON.Mesh {

    public static LENGTH: number = BRICKS_PER_CONSTRUCTION * BRICK_S;

    public bricks: Nabu.UniqueList<Brick> = new Nabu.UniqueList<Brick>();

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

    public serialize(): string {
        let bricks = [];
        for (let i = 0; i < this.bricks.length; i++) {
            bricks.push(this.bricks.get(i).serialize());
        }

        return JSON.stringify(bricks);
    }

    public deserialize(dataString: string): void {
        console.log("deserialize");
        let data: IBrickData[] = JSON.parse(dataString);
        console.log(data);

        for (let i = 0; i < data.length; i++) {
            console.log("brick " + i.toFixed(0));
            let brick = Brick.Deserialize(data[i], this);
            brick.updateMesh();
            this.bricks.push(brick);
        }
    }
}