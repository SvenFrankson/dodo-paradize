class Terrain {

    public worldZero = 10;
    public generator: Nabu.TerrainMapGenerator;
    public meshes: BABYLON.Mesh[][];
    public material: TerrainMaterial;
    public position: BABYLON.Vector3;
    public chunckL: number = 128;
    public mapL: number = 512;

    constructor(public game: Game) {
        let masterSeed = Nabu.MasterSeed.GetFor("Paulita");
        let seededMap = Nabu.SeededMap.CreateFromMasterSeed(masterSeed, 4, 512);
        this.mapL = 1024;
        this.generator = new Nabu.TerrainMapGenerator(seededMap, [2048, 512, 128, 64]);

        this.material = new TerrainMaterial("terrain", this.game.scene);
    }

    public async drawChunck(iChunck: number, jChunck: number): Promise<void> {
        console.log("chunck " + iChunck + " " + jChunck);
        let IMap = this.worldZero + Math.floor(iChunck * this.chunckL / this.mapL);
        let JMap = this.worldZero + Math.floor(jChunck * this.chunckL / this.mapL);
        console.log("map " + IMap + " " + JMap);
        let map = await this.generator.getMap(IMap, JMap);
        if (!this.meshes) {
            this.meshes = [];
        }
        if (!this.meshes[iChunck]) {
            this.meshes[iChunck] = [];
        }
        let chunck = new BABYLON.Mesh("terrain");
        chunck.position.copyFromFloats(iChunck * this.chunckL, 0, jChunck * this.chunckL);
        chunck.material = this.material;
        this.meshes[iChunck][jChunck] = chunck;

        let l = this.chunckL;
        let lInc = l + 1;
        let vertexData = new BABYLON.VertexData();
        let positions = [];
        let indices = [];
        let normals = [];

        let iOffset = (iChunck * this.chunckL) % this.mapL;
        if (iOffset < 0) {
            iOffset = this.mapL + iOffset;
        }
        let jOffset = (jChunck * this.chunckL) % this.mapL;
        if (jOffset < 0) {
            jOffset = this.mapL + jOffset;
        }
        console.log("offset " + iOffset + " " + jOffset);

        for (let j = 0; j <= l; j++) {
            for (let i = 0; i <= l; i++) {
                let h = map.get(iOffset + i, jOffset + j) - 128;
                positions.push(i, h / 3, j);
            }
        }


        let pt0 = BABYLON.Vector3.Zero();
        let pt1 = BABYLON.Vector3.Zero();
        let pt2 = BABYLON.Vector3.Zero();
        let pt3 = BABYLON.Vector3.Zero();

        for (let j = 0; j <= l; j++) {
            for (let i = 0; i <= l; i++) {
                let h = map.get(iOffset + i, jOffset + j) - 128;
                let hIP = map.get(iOffset + i + 1, jOffset + j) - 128;
                let hIM = map.get(iOffset + i - 1, jOffset + j) - 128;
                let hJP = map.get(iOffset + i, jOffset + j + 1) - 128;
                let hJM = map.get(iOffset + i, jOffset + j - 1) - 128;

                pt0.copyFromFloats(1, hIP - h, 0);
                pt1.copyFromFloats(0, hJP - h, 1);
                pt2.copyFromFloats(- 1, hIM - h, 0);
                pt3.copyFromFloats(0, hJM - h, - 1);

                let c1 = BABYLON.Vector3.Cross(pt1, pt0);
                let c2 = BABYLON.Vector3.Cross(pt3, pt2);

                let n = c1.add(c2).normalize();
                normals.push(n.x, n.y, n.z);
            }
        }

        for (let j = 0; j < l; j++) {
            for (let i = 0; i < l; i++) {
                let p = i + j * (l + 1);

                pt0.copyFromFloats(positions[3 * p], positions[3 * p + 1], positions[3 * p + 2]);
                pt1.copyFromFloats(positions[3 * (p + 1)], positions[3 * (p + 1) + 1], positions[3 * (p + 1) + 2]);
                pt2.copyFromFloats(positions[3 * (p + lInc + 1)], positions[3 * (p + lInc + 1) + 1], positions[3 * (p + lInc + 1) + 2]);
                pt3.copyFromFloats(positions[3 * (p + lInc)], positions[3 * (p + lInc) + 1], positions[3 * (p + lInc) + 2]);
                
                if (BABYLON.Vector3.DistanceSquared(pt0, pt2) > BABYLON.Vector3.DistanceSquared(pt1, pt3)) {
                    indices.push(p, p + 1, p + lInc);
                    indices.push(p + 1, p + 1 + lInc, p + lInc);
                }
                else {
                    indices.push(p, p + 1, p + 1 + lInc);
                    indices.push(p, p + 1 + lInc, p + lInc);
                }
            }
        }

        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;

        vertexData.applyToMesh(this.meshes[iChunck][jChunck]);
    }
}