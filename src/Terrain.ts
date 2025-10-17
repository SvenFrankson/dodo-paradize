var BRICK_S: number = 0.336;
var BRICK_H: number = 0.134;

var TILE_S: number = BRICK_S * 2;
var TILE_H: number = BRICK_H * 3;

class Chunck extends BABYLON.Mesh {

    constructor(public i: number, public j: number, public terrain: Terrain) {
        super("chunck_" + i.toFixed(0) + "_" + j.toFixed(0));
        this.position.copyFromFloats(this.i * this.terrain.chunckSize_m + BRICK_S * 0.5, 0, this.j * this.terrain.chunckSize_m + BRICK_S * 0.5);
    }
}

class Terrain {

    public worldZero = 100;
    public generator: Nabu.TerrainMapGenerator;
    public chuncks: Nabu.UniqueList<Chunck>;
    public material: TerrainMaterial;
    public waterMaterial: BABYLON.StandardMaterial;
    public position: BABYLON.Vector3;
    public chunckLength: number = 64;
    public chunckSize_m: number = this.chunckLength * TILE_S;
    public mapL: number = 512;

    constructor(public game: Game) {
        this.chuncks = new Nabu.UniqueList<Chunck>();

        let masterSeed = Nabu.MasterSeed.GetFor("Paulita&Sven");
        let seededMap = Nabu.SeededMap.CreateFromMasterSeed(masterSeed, 4, 512);
        this.mapL = 1024;
        this.generator = new Nabu.TerrainMapGenerator(seededMap, [2048, 512, 128, 64]);
        this.material = new TerrainMaterial("terrain", this.game.scene);

        this.waterMaterial = new BABYLON.StandardMaterial("water-material");
        this.waterMaterial.specularColor.copyFromFloats(0.4, 0.4, 0.4);
        this.waterMaterial.alpha = 0.5;
        this.waterMaterial.diffuseColor.copyFromFloats(0.1, 0.3, 0.9);
    }

    private _tmpMaps: Nabu.TerrainMap[][];
    public tmpMapGet(i: number, j: number): number {
        let iM = 1;
        let jM = 1;

        if (i < 0) {
            i += 1024;
            iM--;
        }
        if (j < 0) {
            j += 1024;
            jM--;
        }
        if (i >= 1024) {
            i -= 1024;
            iM++;
        }
        if (j >= 1024) {
            j -= 1024;
            jM++;
        }

        return this._tmpMaps[iM][jM].get(i, j);
    }

    public worldPosToTerrainAltitude(position: BABYLON.Vector3): number {
        let x = position.x - BRICK_S * 0.5;
        let z = position.z - BRICK_S * 0.5;
        let iTile = Math.floor(x / TILE_S);
        let jTile = Math.floor(z / TILE_S);

        let di = (x - iTile * TILE_S) / TILE_S;
        let dj = (z - jTile * TILE_S) / TILE_S;
        
        let IMap = this.worldZero + Math.floor(iTile / this.mapL);
        let JMap = this.worldZero + Math.floor(jTile / this.mapL);

        let map = this.generator.getMapIfLoaded(IMap, JMap);

        if (map) {
            let i = iTile % this.mapL;
            while (i < 0) {
                i += this.mapL;
            }
            let j = jTile % this.mapL;
            while (j < 0) {
                j += this.mapL;
            }

            let h00 = (map.getClamped(i, j) - 128) * TILE_H;
            let h10 = (map.getClamped(i + 1, j) - 128) * TILE_H;
            let h01 = (map.getClamped(i, j + 1) - 128) * TILE_H;
            let h11 = (map.getClamped(i + 1, j + 1) - 128) * TILE_H;
            
            let h0 = h00 * (1 - di) + h10 * di;
            let h1 = h01 * (1 - di) + h11 * di;

            return h0 * (1 - dj) + h1 * dj;
        }
        return 0;
    }

    public async generateChunck(iChunck: number, jChunck: number): Promise<Chunck> {
        let IMap = this.worldZero + Math.floor(iChunck * this.chunckLength / this.mapL);
        let JMap = this.worldZero + Math.floor(jChunck * this.chunckLength / this.mapL);
        this._tmpMaps = [];

        this._tmpMaps = [];
        for (let i = 0; i < 3; i++) {
            this._tmpMaps[i] = [];
            for (let j = 0; j < 3; j++) {
                this._tmpMaps[i][j] = await this.generator.getMap(IMap + i - 1, JMap + j - 1);
            }
        }

        let chunck = new Chunck(iChunck, jChunck, this);
        chunck.material = this.material;

        let water = new BABYLON.Mesh("water");
        BABYLON.CreateGroundVertexData({ size: this.chunckSize_m }).applyToMesh(water);
        water.position.copyFromFloats(this.chunckSize_m * 0.5, - 0.5 / 3, this.chunckSize_m * 0.5);
        water.material = this.waterMaterial;
        water.parent = chunck;

        let l = this.chunckLength;
        let lInc = l + 1;
        let vertexData = new BABYLON.VertexData();
        let positions = [];
        let indices = [];
        let normals = [];

        let iOffset = (iChunck * this.chunckLength) % this.mapL;
        if (iOffset < 0) {
            iOffset = this.mapL + iOffset;
        }
        let jOffset = (jChunck * this.chunckLength) % this.mapL;
        if (jOffset < 0) {
            jOffset = this.mapL + jOffset;
        }

        for (let j = 0; j <= l; j++) {
            for (let i = 0; i <= l; i++) {
                let h = this.tmpMapGet(iOffset + i, jOffset + j) - 128;
                positions.push(i * TILE_S, h * TILE_H, j * TILE_S);
            }
        }

        let pt0 = BABYLON.Vector3.Zero();
        let pt1 = BABYLON.Vector3.Zero();
        let pt2 = BABYLON.Vector3.Zero();
        let pt3 = BABYLON.Vector3.Zero();

        for (let j = 0; j <= l; j++) {
            for (let i = 0; i <= l; i++) {
                let h = this.tmpMapGet(iOffset + i, jOffset + j) - 128;
                let hIP = this.tmpMapGet(iOffset + i + 1, jOffset + j) - 128;
                let hIM = this.tmpMapGet(iOffset + i - 1, jOffset + j) - 128;
                let hJP = this.tmpMapGet(iOffset + i, jOffset + j + 1) - 128;
                let hJM = this.tmpMapGet(iOffset + i, jOffset + j - 1) - 128;

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

        vertexData.applyToMesh(chunck);

        return chunck;
    }
}