class Terrain {

    public generator: Nabu.TerrainMapGenerator;
    public mesh: BABYLON.Mesh;
    public material: TerrainMaterial;

    constructor(public game: Game) {
        let masterSeed = Nabu.MasterSeed.GetFor("Paulita");
        let seededMap = Nabu.SeededMap.CreateFromMasterSeed(masterSeed, 4, 512);
        this.generator = new Nabu.TerrainMapGenerator(seededMap, [2048, 512, 128, 64]);

        this.material = new TerrainMaterial("terrain", this.game.scene);
    }

    public async draw(): Promise<void> {
        let map = await this.generator.getMap(0, 0);
        this.mesh = new BABYLON.Mesh("terrain");
        this.mesh.material = this.material;

        let l = 256;
        let vertexData = new BABYLON.VertexData();
        let positions = [];
        let indices = [];
        let normals = [];

        for (let j = 0; j < l; j++) {
            for (let i = 0; i < l; i++) {
                let h = map.get(i, j) - 128;
                positions.push(i, h / 3, j);
            }
        }


        let pt0 = BABYLON.Vector3.Zero();
        let pt1 = BABYLON.Vector3.Zero();
        let pt2 = BABYLON.Vector3.Zero();
        let pt3 = BABYLON.Vector3.Zero();

        for (let j = 0; j < l; j++) {
            for (let i = 0; i < l; i++) {
                let h = map.get(i, j) - 128;
                let hIP = map.get(i + 1, j) - 128;
                let hIM = map.get(i - 1, j) - 128;
                let hJP = map.get(i, j + 1) - 128;
                let hJM = map.get(i, j - 1) - 128;

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

        for (let j = 0; j < l - 1; j++) {
            for (let i = 0; i < l - 1; i++) {
                let p = i + j * l;
                pt0.copyFromFloats(positions[3 * p], positions[3 * p + 1], positions[3 * p + 2]);
                pt1.copyFromFloats(positions[3 * (p + 1)], positions[3 * (p + 1) + 1], positions[3 * (p + 1) + 2]);
                pt2.copyFromFloats(positions[3 * (p + l + 1)], positions[3 * (p + l + 1) + 1], positions[3 * (p + l + 1) + 2]);
                pt3.copyFromFloats(positions[3 * (p + l)], positions[3 * (p + l) + 1], positions[3 * (p + l) + 2]);

                
                if (BABYLON.Vector3.DistanceSquared(pt0, pt2) > BABYLON.Vector3.DistanceSquared(pt1, pt3)) {
                    indices.push(p, p + 1, p + l);
                    indices.push(p + 1, p + 1 + l, p + l);
                }
                else {
                    indices.push(p, p + 1, p + 1 + l);
                    indices.push(p, p + 1 + l, p + l);
                }
            }
        }

        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;

        vertexData.applyToMesh(this.mesh);
    }
}