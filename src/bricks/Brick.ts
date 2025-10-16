interface BrickProp {
    pos?: Nabu.IVector3XYZValue;
    dir?: number;

}

class BrickMesh extends BABYLON.Mesh {

    constructor(public brick: Brick) {
        super("brick");
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

    public get isRoot(): boolean {
        return !(this.parent instanceof Brick);
    }

    public anchored: boolean = false;
    public mesh: BrickMesh;
    public construction: Construction;
    public get root(): Brick {
        if (this.parent instanceof Brick) {
            return this.parent.root;
        }
        return this;
    }
    public index: number;
    public get brickName(): string {
        return BRICK_LIST[this.index];
    }

    public static BrickIdToIndex(brickID: number | string): number {
        if (typeof(brickID) === "number") {
            return brickID;
        }
        else {
            return BRICK_LIST.indexOf(brickID);
        }
    }

    public static BrickIdToName(brickID: number | string): string {
        if (typeof(brickID) === "string") {
            return brickID;
        }
        else {
            return BRICK_LIST[brickID];
        }
    }

    public setParent(node: BABYLON.Node, preserveScalingSign?: boolean, updatePivot?: boolean): BABYLON.TransformNode {
        if (node instanceof Brick) {
            this.anchored = false;
            this.construction = node.construction;
            this.construction.bricks.remove(this);
        }
        else {
            this.construction.bricks.push(this);
        }
        return super.setParent(node, preserveScalingSign, updatePivot);
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

    public get absoluteR(): number {
        if (this.isRoot) {
            return this.r;
        }
        let absR = (this.parent as Brick).absoluteR + this.r;
        while (absR < 0) {
            absR += 4;
        }
        while (absR >= 4) {
            absR -= 4;
        }
        return absR;
    }
    public set absoluteR(v: number) {
        if (this.isRoot) {
            this.r = v;
        }
        else {
            let parentAbsoluteRotation = (this.parent as Brick).absoluteR;
            this.r = v - parentAbsoluteRotation;
        }
    }

    constructor(index: number, colorIndex: number, construction?: Construction);
    constructor(brickName: string, colorIndex: number, construction?: Construction);
    constructor(brickId: number | string, colorIndex: number, construction?: Construction);
    constructor(arg1: any, public colorIndex: number, construction?: Construction) {
        super("brick");
        this.index = Brick.BrickIdToIndex(arg1);
        if (construction) {
            this.construction = construction;
            this.construction.bricks.push(this);
            this.parent = this.construction;
        }
    }

    public dispose(): void {
        if (this.isRoot) {
            this.construction.bricks.remove(this);
            if (this.mesh) {
                this.mesh.dispose();
            }
        }
        else {
            let root = this.root;
            this.setParent(undefined);
            root.updateMesh();
        }
    }

    public cloneWithChildren(): Brick {
        let data = this.serialize();
        return Brick.Deserialize(data, this.construction);
    }

    public posWorldToLocal(pos: BABYLON.Vector3): BABYLON.Vector3 {
        let matrix = this.getWorldMatrix().invert();
        return BABYLON.Vector3.TransformCoordinates(pos, matrix);
    }

    public async updateMesh(): Promise<void> {
        if (this != this.root) {
            if (this.mesh) {
                this.mesh.dispose();
                this.mesh = undefined;
            }
            this.subMeshInfos = undefined;
            this.root.updateMesh();
            return;
        }
        this.computeWorldMatrix(true);
        let vDatas: BABYLON.VertexData[] = []
        this.subMeshInfos = [];
        await this.generateMeshVertexData(vDatas, this.subMeshInfos);
        let data = Brick.MergeVertexDatas(this.subMeshInfos, ...vDatas);
        if (!this.mesh) {
            this.mesh = new BrickMesh(this);
            
            //this.mesh.renderOutline = true;
            //this.mesh.outlineColor.copyFromFloats(0, 0, 0);
            //this.mesh.outlineWidth = 0.005;
            this.mesh.layerMask |= 0x20000000;
            this.mesh.parent = this.construction;

            let brickMaterial = new BABYLON.StandardMaterial("brick-material");
            brickMaterial.specularColor.copyFromFloats(0, 0, 0);
            //brickMaterial.bumpTexture = new BABYLON.Texture("./datas/textures/test-steel-normal-dx.png", undefined, undefined, true);
            //brickMaterial.invertNormalMapX = true;
            //brickMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/red-white-squares.png");

            /*
            let steelMaterial = new ToonMaterial("steel", this.mesh._scene);
            steelMaterial.setDiffuse(BABYLON.Color3.FromHexString("#868b8a"));
            steelMaterial.setSpecularIntensity(1);
            steelMaterial.setSpecularCount(4);
            steelMaterial.setSpecularPower(32);
            steelMaterial.setUseVertexColor(true);

            let logoMaterial = new ToonMaterial("logo", this.mesh._scene);
            logoMaterial.setDiffuse(BABYLON.Color3.FromHexString("#262b2a"));
            logoMaterial.setSpecularIntensity(0.5);
            logoMaterial.setSpecularCount(1);
            logoMaterial.setSpecularPower(16);
            logoMaterial.setUseLightFromPOV(true);
            logoMaterial.setUseFlatSpecular(true);
            */

            this.mesh.material = this.construction.terrain.game.defaultToonMaterial;
            this.mesh.computeWorldMatrix(true);
            this.mesh.refreshBoundingInfo();
        }

        data.applyToMesh(this.mesh);
    }

    public highlight(): void {
        if (this != this.root) {
            return this.root.highlight();
        }
        if (this.mesh) {
            this.mesh.outlineColor = new BABYLON.Color3(0, 1, 1);
        }
    }

    public unlit(): void {
        if (this != this.root) {
            return this.root.unlit();
        }
        if (this.mesh) {
            this.mesh.outlineColor.copyFromFloats(0, 0, 0);
        }
    }

    private async generateMeshVertexData(vDatas: BABYLON.VertexData[], subMeshInfos: { faceId: number, brick: Brick }[], depth: number = 0): Promise<void> {
        this.computeWorldMatrix(true);
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

        Mummu.RotateAngleAxisVertexDataInPlace(vData, this.absoluteR * Math.PI * 0.5, BABYLON.Axis.Y);
        Mummu.TranslateVertexDataInPlace(vData, this.absolutePosition.subtract(this.construction.position));
        vDatas.push(vData);
        subMeshInfos.push({ faceId: 0, brick: this });

        let children = this.getChildTransformNodes(true);
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            if (child instanceof Brick) {
                await child.generateMeshVertexData(vDatas, subMeshInfos, depth + 1);
            }
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

    public serialize(): string {
        let s = "";
        s += this.index.toString(16).padStart(3, "0").substring(0, 3);
        s += this.colorIndex.toString(16).padStart(2, "0").substring(0, 2);
        s += (this.posI + 64).toString(16).padStart(2, "0").substring(0, 2);
        s += (this.posJ + 64).toString(16).padStart(2, "0").substring(0, 2);
        s += (this.posK + 64).toString(16).padStart(2, "0").substring(0, 2);
        s += this.r.toString(16).padStart(1, "0").substring(0, 1);

        let children = this.getChildTransformNodes(true).filter(n => { return n instanceof Brick; }) as Brick[];
        if (children.length > 0) {
            s += "[";
            for (let i = 0; i < children.length; i++) {
                let child = children[i];
                s += child.serialize();
                if (i < children.length - 1) {
                    s += ",";
                }
            }
            s += "]";
        }
        
        return s;
    }

    public static Deserialize(data: string, parent: Construction | Brick): Brick {
        let brick: Brick;
        let id = parseInt(data.substring(0, 3), 16);
        let colorIndex = parseInt(data.substring(3, 5), 16);
        let posI = parseInt(data.substring(5, 7), 16) - 64;
        let posJ = parseInt(data.substring(7, 9), 16) - 64;
        let posK = parseInt(data.substring(9, 11), 16) - 64;
        let r = parseInt(data.substring(11, 12), 16);
        if (parent instanceof Construction) {
            brick = new Brick(id, colorIndex, parent);
        }
        else {
            brick = new Brick(id, colorIndex);
            brick.parent = parent;
            brick.construction = parent.construction;
        }
        
        brick.posI = posI;
        brick.posJ = posJ;
        brick.posK = posK;
        brick.r = r;

        if (data[12] === "[") {
            let directChildIndexes = [];
            let closeIndex = 12;
            let nestedOpen = 1;
            let done = false;
            while (!done && closeIndex < data.length) {
                closeIndex++;
                let c = data[closeIndex];
                if (c === "[") {
                    nestedOpen++;
                }
                else if (c === "]") {
                    nestedOpen--;
                    if (nestedOpen === 0) {
                        directChildIndexes.push(closeIndex);
                        done = true;
                    }
                }
                else if (c === "," && nestedOpen === 1) {
                    directChildIndexes.push(closeIndex);
                }
            }
            let childrenDatas = data.substring(13, closeIndex);
            for (let i = 0; i < directChildIndexes.length; i++) {
                let c0 = 13;
                if (i > 0) {
                    c0 = directChildIndexes[i - 1] + 1;
                }
                let c1 = directChildIndexes[i];
                Brick.Deserialize(data.substring(c0, c1), brick);
            }
        }

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