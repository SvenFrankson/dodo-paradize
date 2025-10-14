class Construction extends BABYLON.Mesh {

    public static SIZE_m: number = BRICKS_PER_CONSTRUCTION * BRICK_S;

    public bricks: Nabu.UniqueList<Brick> = new Nabu.UniqueList<Brick>();

    public mesh: BABYLON.Mesh;

    constructor(public i: number, public j: number, public terrain: Terrain) {
        super("construction_" + i.toFixed(0) + "_" + j.toFixed(0));
        this.position.copyFromFloats(this.i * Construction.SIZE_m, 0, this.j * Construction.SIZE_m);
    }

    public static worldPosToIJ(pos: BABYLON.Vector3): { i: number, j: number} {
        let i = Math.floor((pos.x) / Construction.SIZE_m);
        let j = Math.floor((pos.z) / Construction.SIZE_m);

        return { i: i, j: j };
    }

    public async instantiate(): Promise<void> {
        
    }

    public saveToLocalStorage(): void {
        window.localStorage.setItem("construction_" + this.i.toFixed(0) + "_" + this.j.toFixed(0), this.serialize())
    }

    public buildFromLocalStorage(): void {
        let dataString = window.localStorage.getItem("construction_" + this.i.toFixed(0) + "_" + this.j.toFixed(0));
        if (dataString) {
            this.deserialize(dataString);
        }
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