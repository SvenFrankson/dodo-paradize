interface IConstructionData {
    id?: number,
    i: number,
    j: number,
    content: string,
    token?: string,
    reserved?: number
}

class ConstructionMesh extends BABYLON.Mesh {

    constructor(public construction: Construction) {
        super("construction-mesh", construction.terrain.game.scene);
    }
}

class TextBrickMesh extends BABYLON.Mesh {

    constructor(public brick: TextBrick) {
        super("text-brick-mesh");
    }

    public updateMaterial(): void {
        let material = new BABYLON.StandardMaterial("name-tag-material");
        material.emissiveColor.copyFromFloats(0.2, 0.2, 0.2);
        material.specularColor.copyFromFloats(0, 0, 0);
        
        let h = 64;
        let w = this.brick.w * h / (3 * BRICK_H) * BRICK_S;
        let texture = new BABYLON.DynamicTexture("name-tag-texture", { width: w, height: h }, this.brick.construction.game.scene);

        let context = texture.getContext();
        context.fillStyle = DodoColors[this.brick.colorIndex].hex;
        context.fillRect(0, 0, w, h);
        context.font = (h * 0.6).toFixed(0) + "px Cartoon";
        context.fillStyle = DodoColors[this.brick.colorIndex].textColor;
        context.strokeStyle = DodoColors[this.brick.colorIndex].textColor;
        context.lineWidth = h / 32;
        let l = context.measureText(this.brick.text);
        //context.strokeText(this.brick.text, w / 2 - l.width * 0.5, h - h / 8);
        context.fillText(this.brick.text, w / 2 - l.width * 0.5, h - h / 8);
        
        texture.update();
        material.diffuseTexture = texture;

        this.material = material;
    }
}

class Construction extends BABYLON.Mesh {

    public static SIZE_m: number = BRICKS_PER_CONSTRUCTION * BRICK_S;

    public bricks: Nabu.UniqueList<Brick> = new Nabu.UniqueList<Brick>();
    public mesh: ConstructionMesh;
    public textBrickMeshes: TextBrickMesh[] = [];

    public limits: BABYLON.Mesh;
    public barycenter: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    public isMeshUpdated: boolean = false;

    public reserved: number = -1;

    public get game(): Game {
        return this.terrain.game;
    }

    constructor(public i: number, public j: number, public terrain: Terrain) {
        super("construction_" + i.toFixed(0) + "_" + j.toFixed(0));
        this.position.copyFromFloats(this.i * Construction.SIZE_m, 0, this.j * Construction.SIZE_m);
        this.barycenter.copyFrom(this.position);
        this.barycenter.x += Construction.SIZE_m * 0.5;
        this.barycenter.z += Construction.SIZE_m * 0.5;
    }

    public isPlayerAllowedToEdit(): boolean {
        return this.terrain.game.devMode.activated || this.reserved === 2 || (this.i === this.terrain.game.networkManager.claimedConstructionI && this.j === this.terrain.game.networkManager.claimedConstructionJ);
    }

    public static worldPosToIJ(pos: BABYLON.Vector3): { i: number, j: number} {
        let i = Math.floor((pos.x + BRICK_S * 0.5) / Construction.SIZE_m);
        let j = Math.floor((pos.z + BRICK_S * 0.5) / Construction.SIZE_m);

        return { i: i, j: j };
    }

    public async instantiate(): Promise<void> {
        if (this.terrain.game.devMode.activated || this.terrain.game.networkManager.claimedConstructionI === this.i && this.terrain.game.networkManager.claimedConstructionJ === this.j) {
            this.showLimits();
        }
    }

    public subMeshInfos: { faceId: number, brick: Brick }[];
    public getBrickForFaceId(faceId: number): Brick {
        for (let i = 0; i < this.subMeshInfos.length; i++) {
            if (this.subMeshInfos[i].faceId > faceId) {
                return this.subMeshInfos[i].brick;
            }
        }
    }

    public async updateMesh(): Promise<void> {
        while (this.textBrickMeshes.length > 0) {
            this.textBrickMeshes.pop().dispose(false, true);
        }

        this.isMeshUpdated = false;
        let vDatas: BABYLON.VertexData[] = [];
        let textBrickMeshes: BABYLON.Mesh[] = [];
        this.subMeshInfos = [];
        for (let i = 0; i < this.bricks.length; i++) {
            let brick = this.bricks.get(i);
            if (brick instanceof TextBrick) {
                let vData = await brick.generateTextBrickVertexData();
                let textBrickMesh = new TextBrickMesh(brick);
                this.textBrickMeshes.push(textBrickMesh);
                textBrickMesh.updateMaterial();
                vData.applyToMesh(textBrickMesh);
                textBrickMeshes.push(textBrickMesh);
            }
            else if (brick instanceof Brick) {
                await brick.generateMeshVertexData(vDatas, this.subMeshInfos);
            }
        }

        if (vDatas.length > 0 || textBrickMeshes.length > 0) {
            if (!this.mesh) {
                this.mesh = new ConstructionMesh(this);
                this.mesh.parent = this;

                this.mesh.material = this.terrain.game.defaultToonMaterial;
            }
            
            if (vDatas.length > 0) {
                let data = Construction.MergeVertexDatas(this.subMeshInfos, ...vDatas);
                data.applyToMesh(this.mesh);
            }
            if (textBrickMeshes.length > 0) {
                textBrickMeshes.forEach(textBrickMesh => {
                    textBrickMesh.parent = this.mesh;
                })
            }
        }
        else {
            if (this.mesh) {
                this.mesh.dispose();
                this.mesh = undefined;
            }
        }
        this.isMeshUpdated = true;
    }    

    public static MergeVertexDatas(subMeshInfos: { faceId: number, brick: Brick }[], ...datas: BABYLON.VertexData[]): BABYLON.VertexData {
        let mergedData = new BABYLON.VertexData();
        
        let positions = [];
        let indices = [];
        let normals = [];
        let uvs = [];
        let colors = [];

        for (let i = 0; i < datas.length; i++) {
            let offset = positions.length / 3;
            positions.push(...datas[i].positions);
            indices.push(...datas[i].indices.map(index => { return index + offset; }));
            normals.push(...datas[i].normals);
            if (datas[i].uvs) {
                uvs.push(...datas[i].uvs);
            }
            if (datas[i].colors) {
                colors.push(...datas[i].colors);
            }
            subMeshInfos[i].faceId = indices.length / 3;
        }

        mergedData.positions = positions;
        mergedData.indices = indices;
        mergedData.normals = normals;
        if (uvs.length > 0) {
            mergedData.uvs = uvs;
        }
        if (colors.length > 0) {
            mergedData.colors = colors;
        }

        return mergedData;
    }

    public async showLimits(): Promise<void> {
        if (this.limits) {
            this.limits.dispose();
        }
        if (!this.game.devMode.activated && !this.isPlayerAllowedToEdit()) {
            return;
        }

        let min = new BABYLON.Vector3(- BRICK_S * 0.5, 0, - BRICK_S * 0.5);
        let max = min.add(new BABYLON.Vector3(Construction.SIZE_m, 0, Construction.SIZE_m));

        this.limits = BABYLON.MeshBuilder.CreateBox("limits", { width: Construction.SIZE_m, height: 256, depth: Construction.SIZE_m, sideOrientation: BABYLON.Mesh.BACKSIDE });
        let material = new BABYLON.StandardMaterial("limit-material");
        material.specularColor.copyFromFloats(0, 0, 0);
        material.diffuseColor.copyFromFloats(0, 1, 1);
        this.limits.material = material;
        this.limits.position.copyFrom(min).addInPlace(max).scaleInPlace(0.5);
        this.limits.visibility = 0.2;
        this.limits.isVisible = false;
        this.limits.parent = this;

        let worldOffset = this.position.add(this.limits.position);
        let points = [
            new BABYLON.Vector3(- 0.5 * Construction.SIZE_m, 0, - 0.5 * Construction.SIZE_m),
            new BABYLON.Vector3(0.5 * Construction.SIZE_m, 0, - 0.5 * Construction.SIZE_m),
            new BABYLON.Vector3(0.5 * Construction.SIZE_m, 0, 0.5 * Construction.SIZE_m),
            new BABYLON.Vector3(- 0.5 * Construction.SIZE_m, 0, 0.5 * Construction.SIZE_m),
            new BABYLON.Vector3(- 0.5 * Construction.SIZE_m, 0, - 0.5 * Construction.SIZE_m)
        ];

        let N = BRICKS_PER_CONSTRUCTION;
        let subdividedPoints = [];
        for (let i = 0; i < 4; i++) {
            let start = points[i];
            let end = points[i + 1];
            for (let n = 0; n < N; n++) {
                let f = n / N;
                let p = BABYLON.Vector3.Lerp(start, end, f)
                if (n === 0) {
                    //let r = p.clone().normalize();
                    //p.subtractInPlace(r.scale(Construction.SIZE_m / N * 0.3));
                }
                subdividedPoints.push(p);
            }
        }
        points = subdividedPoints;

        points.forEach(pt => {
            pt.addInPlace(worldOffset);
            pt.y = this.terrain.worldPosToTerrainAltitude(pt);
            if (pt.y === null) {
                pt.y = 0;
            }
            pt.subtractInPlace(worldOffset);

        });
        //Mummu.CatmullRomClosedPathInPlace(points);
        //Mummu.CatmullRomClosedPathInPlace(points);
        points.push(points[0]);

        //let border = BABYLON.MeshBuilder.CreateLines("border", { points: points });
        //border.position.y = 1 * BRICK_H;
        //border.parent = this.limits;

        let lines = [
            //points.map(pt => { return pt.clone().addInPlaceFromFloats(0, + 2 * BRICK_H, 0); }),
            points.map(pt => { return pt.clone().addInPlaceFromFloats(0, + 3 * BRICK_H, 0); }),
        ]
        let color = new BABYLON.Color4(1, 1, 1, 1);
        if (this.reserved === 1) {
            color.copyFromFloats(1, 0, 0, 1);
        }
        else if (this.reserved === 2) {
            color.copyFromFloats(1, 1, 0, 1);
        }
        let colors = lines.map(line => { return line.map(v => { return color; }); });

        //for (let i = 0; i < points.length; i++) {
        //    let pt = points[i];
        //    lines.push([
        //        pt.clone().addInPlaceFromFloats(0, + 2 * BRICK_H, 0),
        //        pt.clone().addInPlaceFromFloats(0, + 3 * BRICK_H, 0)
        //    ])
        //}

        let border2 = BABYLON.MeshBuilder.CreateLineSystem("border2", { lines: lines, colors: colors });
        border2.parent = this.limits;
        if (this.reserved === 1) {
            border2.position.y += BRICK_H;
        }
    }

    public hideLimits(): void {
        if (this.limits) {
            this.limits.dispose();
        }
    }

    public async saveToServer(): Promise<void> {
        if (!this.game.devMode.activated && this.reserved === 2) {
            return;
        }

        let constructionData = {
            i: this.i,
            j: this.j,
            content: this.serialize(),
            token: this.terrain.game.networkManager.token
        }

        let headers = {
            "Content-Type": "application/json",
        };
        if (this.terrain.game.devMode.activated) {
            headers["Authorization"] = 'Basic ' + btoa("carillon:" + this.terrain.game.devMode.getPassword());
        }
        let dataString = JSON.stringify(constructionData);
        try {
            const response = await fetch(SHARE_SERVICE_PATH + "set_construction", {
                method: "POST",
                mode: "cors",
                headers: headers,
                body: dataString,
            });
            let responseText = await response.text();
            console.log("Construction.saveToServer" + responseText);
        }
        catch(e) {
            console.error(e);
            ScreenLoger.Log("saveToServer error");
            ScreenLoger.Log(e);
        }
    }

    public async buildFromServer(): Promise<void> {
        try {
            const response = await fetch(SHARE_SERVICE_PATH + "get_construction/" + this.i.toFixed(0) + "/" + this.j.toFixed(0), {
                method: "GET",
                mode: "cors"
            });
            let responseText = await response.text();
            if (responseText) {
                let response = JSON.parse(responseText);
                console.log(response);
                this.reserved = response.reserved;
                this.deserialize(response.content);
                this.showLimits();
            }
        }
        catch(e) {
            console.error(e);
            ScreenLoger.Log("buildFromServer error");
            ScreenLoger.Log(e);
        }
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
        let data: string[] = JSON.parse(dataString);

        for (let i = 0; i < data.length; i++) {
            Brick.Deserialize(data[i], this);
        }
        this.updateMesh();
    }
}