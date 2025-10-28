interface BrickProp {
    pos?: Nabu.IVector3XYZValue;
    dir?: number;

}

class BrickFactory {

    public static NewBrick(index: number, colorIndex: number, construction: Construction): Brick;
    public static NewBrick(brickName: string, colorIndex: number, construction: Construction): Brick;
    public static NewBrick(brickId: number | string, colorIndex: number, construction: Construction): Brick;
    public static NewBrick(arg1: any, colorIndex: number, construction: Construction): Brick {
        let name = Brick.BrickIdToName(arg1);
        if (name.startsWith("text_")) {
            return new TextBrick(arg1, colorIndex, construction);
        }
        else {
            return new Brick(arg1, colorIndex, construction);
        }
    }
}

class Brick extends BABYLON.TransformNode {

    public static depthColors = [
        new BABYLON.Color4(1, 1, 1, 1),
        new BABYLON.Color4(1, 0, 0, 1),
        new BABYLON.Color4(0, 1, 0, 1),
        new BABYLON.Color4(0, 0, 1, 1),
        new BABYLON.Color4(1, 1, 0, 1),
        new BABYLON.Color4(0, 1, 1, 1),
        new BABYLON.Color4(1, 0, 1, 1),
        new BABYLON.Color4(1, 0.5, 0, 1),
        new BABYLON.Color4(0, 1, 0.5, 1),
        new BABYLON.Color4(0.5, 0, 1, 1),
        new BABYLON.Color4(1, 1, 0.5, 1),
        new BABYLON.Color4(0.5, 1, 1, 1),
        new BABYLON.Color4(1, 0.5, 1, 1),
        new BABYLON.Color4(0.2, 0.2, 0.2, 1)
    ]

    public construction: Construction;
    public get game(): Game {
        return this.construction.game;
    }
    public index: number;
    public get brickName(): string {
        return BRICK_LIST[this.index].name;
    }

    public static BrickIdToIndex(brickID: number | string): number {
        if (typeof(brickID) === "number") {
            return brickID;
        }
        else {
            return BRICK_LIST.findIndex(template => { return template.name === brickID; });
        }
    }

    public static BrickIdToName(brickID: number | string): string {
        if (typeof(brickID) === "string") {
            return brickID;
        }
        else {
            return BRICK_LIST[brickID].name;
        }
    }

    public get stackable(): boolean {
        return BRICK_LIST[this.index].stackable;
    }

    public get posI(): number {
        return Math.round(this.position.x / BRICK_S)
    }
    public set posI(v: number) {
        this.position.x = v * BRICK_S;
    }

    public get posJ(): number {
        return Math.round(this.position.z / BRICK_S)
    }
    public set posJ(v: number) {
        this.position.z = v * BRICK_S;
    }

    public get posK(): number {
        return Math.round(this.position.y / BRICK_H)
    }
    public set posK(v: number) {
        this.position.y = v * BRICK_H;
    }

    public stack(): void {
        if (this.stackable) {
            let i = this.posI;
            let j = this.posJ;
            let rootNameSplit = this.name.split("x");
            let h = parseInt(rootNameSplit.pop());
            let rootName = rootNameSplit.reduce((s1, s2) => { return s1 + "x" + s2; });
            let potentialMatches = this.construction.bricks.array.filter(b => {
                if (b.posI === i) {
                    if (b.posJ === j) {
                        if (b.r === this.r) {
                            if (b.name.startsWith(rootName)) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            });

            let match: Brick;
            let matchH: number;
            for (let dk = 0; dk < MAX_STACK && !match; dk++) {
                let k = this.posK - MAX_STACK - 1 + dk;
                match = potentialMatches.find(b => {
                    if (b.posK === k) {
                        let mH = parseInt(b.name.split("x").pop());
                        if (b.posK + mH === this.posK) {
                            matchH = mH;
                            return true;
                        }
                    }
                })
            }

            if (match) {
                let newH = matchH + h;
                if (newH <= MAX_STACK) {
                    let newName = match.name.split("x");
                }
            }
        }
    }

    public clampToConstruction(): void {
        let posInConstruction = this.absolutePosition.subtract(this.construction.position);
        let iInConstruction = Math.round(posInConstruction.x / BRICK_S);
        let jInConstruction = Math.round(posInConstruction.z / BRICK_S);

        let overshoot = new BABYLON.Vector3(0, 0, 0);
        if (iInConstruction < 0) {
            overshoot.x = iInConstruction;
        }
        else if (iInConstruction >= BRICKS_PER_CONSTRUCTION) {
            overshoot.x = iInConstruction - (BRICKS_PER_CONSTRUCTION - 1);
        }
        if (jInConstruction < 0) {
            overshoot.z = jInConstruction;
        }
        else if (jInConstruction >= BRICKS_PER_CONSTRUCTION) {
            overshoot.z = jInConstruction - (BRICKS_PER_CONSTRUCTION - 1);
        }
        Mummu.RotateInPlace(overshoot, BABYLON.Axis.Y, - this.r * Math.PI / 0.5);
        this.posI -= overshoot.x;
        this.posJ -= overshoot.z;
    }

    public get r(): number {
        let r = Math.round(this.rotation.y / (Math.PI * 0.5));
        while (r < 0) {
            r += 4;
        }
        while (r >= 4) {
            r -= 4;
        }
        return r;
    }
    public set r(v: number) {
        this.rotation.y = v * Math.PI * 0.5;
    }

    constructor(index: number, colorIndex: number, construction: Construction);
    constructor(brickName: string, colorIndex: number, construction: Construction);
    constructor(brickId: number | string, colorIndex: number, construction: Construction);
    constructor(arg1: any, public colorIndex: number, construction: Construction) {
        super("brick");
        this.index = Brick.BrickIdToIndex(arg1);
        this.name = Brick.BrickIdToName(arg1);
        if (construction) {
            this.construction = construction;
            this.construction.bricks.push(this);
            this.parent = this.construction;
        }
    }
    
    public tryToStack(): void {

    }

    public dispose(): void {
        this.construction.bricks.remove(this);
    }

    public cloneWithChildren(): Brick {
        let data = this.serialize();
        return Brick.Deserialize(data, this.construction);
    }

    public posWorldToLocal(pos: BABYLON.Vector3): BABYLON.Vector3 {
        let matrix = this.getWorldMatrix().invert();
        return BABYLON.Vector3.TransformCoordinates(pos, matrix);
    }

    public lightMesh: BABYLON.Mesh;
    public highlight(): void {
        if (!this.lightMesh) {
            this.lightMesh = new BABYLON.Mesh("light-mesh");
            this.lightMesh.material = this.construction.terrain.game.defaultHighlightMaterial;
            BrickTemplateManager.Instance.getTemplate(this.index).then(template => {
                if (this.lightMesh && !this.lightMesh.isDisposed()) {
                    let vData = Mummu.ShrinkVertexDataInPlace(Mummu.CloneVertexData(template.vertexData), 0.01);
                    console.log(vData);
                    vData.applyToMesh(this.lightMesh);
                }
            })
        }
        this.lightMesh.position = this.position;
        this.lightMesh.rotation = this.rotation;
        this.lightMesh.parent = this.construction;
    }

    public unlit(): void {
        if (this.lightMesh) {
            this.lightMesh.dispose();
            this.lightMesh = undefined;
        }
    }

    public async generateMeshVertexData(vDatas: BABYLON.VertexData[], subMeshInfos: { faceId: number, brick: Brick }[]): Promise<void> {
        let template = await BrickTemplateManager.Instance.getTemplate(this.index);
        let vData = Mummu.CloneVertexData(template.vertexData);
        let colors = [];
        let color = BABYLON.Color3.FromHexString(DodoColors[this.colorIndex].hex);
        for (let i = 0; i < vData.positions.length / 3; i++) {
            colors.push(color.r, color.g, color.b, 1);
        }
        vData.colors = colors;

        let a = 2 * Math.PI * Math.random();
        a = 0;
        let cosa = Math.cos(a);
        let sina = Math.sin(a);
        let dU = Math.random();
        dU = 0;
        let dV = Math.random();
        dV = 0;
        let uvs = vData.uvs;
        for (let i = 0; i < uvs.length / 2; i++) {
            let u = uvs[2 * i];
            let v = uvs[2 * i + 1];
            uvs[2 * i] = cosa * u - sina * v + dU;
            uvs[2 * i + 1] = sina * u + cosa * v + dV;
        }
        vData.uvs = uvs;

        Mummu.RotateAngleAxisVertexDataInPlace(vData, this.r * Math.PI * 0.5, BABYLON.Axis.Y);
        Mummu.TranslateVertexDataInPlace(vData, this.position);
        
        vDatas.push(vData);
        subMeshInfos.push({ faceId: 0, brick: this });
    }

    public serialize(): string {
        let s = "";
        s += this.index.toString(16).padStart(3, "0").substring(0, 3);
        s += this.colorIndex.toString(16).padStart(2, "0").substring(0, 2);
        s += (this.posI + 64).toString(16).padStart(2, "0").substring(0, 2);
        s += (this.posJ + 64).toString(16).padStart(2, "0").substring(0, 2);
        s += (this.posK + 64).toString(16).padStart(2, "0").substring(0, 2);
        s += this.r.toString(16).padStart(1, "0").substring(0, 1);
        
        return s;
    }

    public static Deserialize(data: string, construction: Construction): Brick {
        let brick: Brick;
        let id = parseInt(data.substring(0, 3), 16);
        let colorIndex = parseInt(data.substring(3, 5), 16);
        let posI = parseInt(data.substring(5, 7), 16) - 64;
        let posJ = parseInt(data.substring(7, 9), 16) - 64;
        let posK = parseInt(data.substring(9, 11), 16) - 64;
        let r = parseInt(data.substring(11, 12), 16);

        brick = BrickFactory.NewBrick(id, colorIndex, construction);
        brick.posI = posI;
        brick.posJ = posJ;
        brick.posK = posK;
        brick.r = r;

        return brick;
    }
}

var ALLBRICKS: number[] = [];

interface IBrickData {
    id: number;
    col: number;
    anc?: boolean;
    r?: number;
    i?: number;
    j?: number;
    k?: number;
    c?: IBrickData[];
}