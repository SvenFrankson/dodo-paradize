class Construction extends BABYLON.Mesh {

    public static SIZE_m: number = BRICKS_PER_CONSTRUCTION * BRICK_S;

    public bricks: Nabu.UniqueList<Brick> = new Nabu.UniqueList<Brick>();

    public limits: BABYLON.Mesh;
    public barycenter: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    constructor(public i: number, public j: number, public terrain: Terrain) {
        super("construction_" + i.toFixed(0) + "_" + j.toFixed(0));
        this.position.copyFromFloats(this.i * Construction.SIZE_m, 0, this.j * Construction.SIZE_m);
        this.barycenter.copyFrom(this.position);
        this.barycenter.x += Construction.SIZE_m * 0.5;
        this.barycenter.z += Construction.SIZE_m * 0.5;
    }

    public static worldPosToIJ(pos: BABYLON.Vector3): { i: number, j: number} {
        let i = Math.floor((pos.x + BRICK_S * 0.5) / Construction.SIZE_m);
        let j = Math.floor((pos.z + BRICK_S * 0.5) / Construction.SIZE_m);

        return { i: i, j: j };
    }

    public async instantiate(): Promise<void> {
        
    }

    public showLimits(): void {
        if (this.limits) {
            this.limits.dispose();
        }

        let min = new BABYLON.Vector3(- BRICK_S * 0.5, 0, - BRICK_S * 0.5);
        let max = min.add(new BABYLON.Vector3(Construction.SIZE_m, 0, Construction.SIZE_m));

        this.limits = BABYLON.MeshBuilder.CreateBox("limits", { width: Construction.SIZE_m, height: 256, depth: Construction.SIZE_m, sideOrientation: BABYLON.Mesh.DOUBLESIDE });
        let material = new BABYLON.StandardMaterial("limit-material");
        material.specularColor.copyFromFloats(0, 0, 0);
        material.diffuseColor.copyFromFloats(0, 1, 1);
        this.limits.material = material;
        this.limits.position.copyFrom(min).addInPlace(max).scaleInPlace(0.5);
        this.limits.visibility = 0.3;
        this.limits.parent = this;

        for (let i = 0; i <= 1; i++) {
            for (let j = 0; j <= 1; j++) {
                let corner = BABYLON.MeshBuilder.CreateBox("corner", { width: 0.03, height: 256, depth: 0.03 });
                corner.position.x = (i - 0.5) * Construction.SIZE_m;
                corner.position.z = (j - 0.5) * Construction.SIZE_m;
                corner.parent = this.limits;
            }
        }
    }

    public hideLimits(): void {
        if (this.limits) {
            this.limits.dispose();
        }
    }

    public async saveToServer(): Promise<void> {
        let constructionData = {
            i: this.i,
            j: this.j,
            content: this.serialize()
        }

        let dataString = JSON.stringify(constructionData);
        try {
            const response = await fetch(SHARE_SERVICE_PATH + "set_construction", {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                },
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
            console.log(responseText);
            if (responseText) {
                let response = JSON.parse(responseText);
                this.deserialize(response.content);
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
        console.log("deserialize");
        let data: string[] = JSON.parse(dataString);
        console.log(data);

        for (let i = 0; i < data.length; i++) {
            console.log("brick " + i.toFixed(0));
            let brick = Brick.Deserialize(data[i], this);
            brick.updateMesh();
            this.bricks.push(brick);
        }
    }
}