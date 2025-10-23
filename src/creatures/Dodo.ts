/// <reference path="Creature.ts"/>

interface IDodoProp {
    speed?: number;
    role?: string;
    stepDuration?: number;
    bounty?: number;
    hasWings?: boolean;
    style?: string;
}

interface IStyleNetworkData {
    name: string;
    style: string;
}

function IsStyleNetworkData(v: any): boolean {
    if (v.name && v.style) {
        return true;
    }
    return false;
}

/*
var DodoColors = [
    BABYLON.Color3.FromHexString("#17171c"),
    BABYLON.Color3.FromHexString("#282a30"),
    BABYLON.Color3.FromHexString("#49363a"),
    BABYLON.Color3.FromHexString("#404735"),
    BABYLON.Color3.FromHexString("#3b536a"),
    BABYLON.Color3.FromHexString("#9b3535"),
    BABYLON.Color3.FromHexString("#92583f"),
    BABYLON.Color3.FromHexString("#21927e"),
    BABYLON.Color3.FromHexString("#a16a41"),
    BABYLON.Color3.FromHexString("#7e7b71"),
    BABYLON.Color3.FromHexString("#71a14e"),
    BABYLON.Color3.FromHexString("#be8d68"),
    BABYLON.Color3.FromHexString("#7abbb9"),
    BABYLON.Color3.FromHexString("#d9bd66"),
    BABYLON.Color3.FromHexString("#e8c6a1"),
    BABYLON.Color3.FromHexString("#dcd6cf")
];
*/

enum StyleValueTypes {
    Color0,
    Color1,
    Color2,
    EyeColor,
    HatIndex,
    HatColor,
    COUNT
}

var DodoColors = [
    { name: "Chinese Black", color: BABYLON.Color3.FromHexString("#10121c"), textColor: "black", hex: "#000000" },
    { name: "Quartz", color: BABYLON.Color3.FromHexString("#494b57"), textColor: "black", hex: "#000000" },
    { name: "Dark Purple", color: BABYLON.Color3.FromHexString("#2c1e31"), textColor: "black", hex: "#000000" },
    { name: "Old Mauve", color: BABYLON.Color3.FromHexString("#6b2643"), textColor: "black", hex: "#000000" },
    { name: "Amaranth Purple", color: BABYLON.Color3.FromHexString("#ac2847"), textColor: "black", hex: "#000000" },
    { name: "Imperial Red", color: BABYLON.Color3.FromHexString("#ec273f"), textColor: "black", hex: "#000000" },
    { name: "Chestnut", color: BABYLON.Color3.FromHexString("#94493a"), textColor: "black", hex: "#000000" },
    { name: "Medium Vermilion", color: BABYLON.Color3.FromHexString("#de5d3a"), textColor: "black", hex: "#000000" },
    { name: "Cadmium Orange", color: BABYLON.Color3.FromHexString("#e98537"), textColor: "black", hex: "#000000" },
    { name: "Deep Saffron", color: BABYLON.Color3.FromHexString("#f3a833"), textColor: "black", hex: "#000000" },
    { name: "Royal Brown", color: BABYLON.Color3.FromHexString("#4d3533"), textColor: "black", hex: "#000000" },
    { name: "Coffee", color: BABYLON.Color3.FromHexString("#6e4c30"), textColor: "black", hex: "#000000" },
    { name: "Metallic Bronze", color: BABYLON.Color3.FromHexString("#a26d3f"), textColor: "black", hex: "#000000" },
    { name: "Peru", color: BABYLON.Color3.FromHexString("#ce9248"), textColor: "black", hex: "#000000" },
    { name: "Earth Yellow", color: BABYLON.Color3.FromHexString("#dab163"), textColor: "black", hex: "#000000" },
    { name: "Flax", color: BABYLON.Color3.FromHexString("#e8d282"), textColor: "black", hex: "#000000" },
    { name: "Blond", color: BABYLON.Color3.FromHexString("#f7f3b7"), textColor: "black", hex: "#000000" },
    { name: "Japanese Indigo", color: BABYLON.Color3.FromHexString("#1e4044"), textColor: "black", hex: "#000000" },
    { name: "Bangladesh Green", color: BABYLON.Color3.FromHexString("#006554"), textColor: "black", hex: "#000000" },
    { name: "Sea Green", color: BABYLON.Color3.FromHexString("#26854c"), textColor: "black", hex: "#000000" },
    { name: "Apple", color: BABYLON.Color3.FromHexString("#5ab552"), textColor: "black", hex: "#000000" },
    { name: "Kiwi", color: BABYLON.Color3.FromHexString("#9de64e"), textColor: "black", hex: "#000000" },
    { name: "Dark Cyan", color: BABYLON.Color3.FromHexString("#008b8b"), textColor: "black", hex: "#000000" },
    { name: "Forest Green", color: BABYLON.Color3.FromHexString("#62a477"), textColor: "black", hex: "#000000" },
    { name: "Laurel Green", color: BABYLON.Color3.FromHexString("#a6cb96"), textColor: "black", hex: "#000000" },
    { name: "Tea Green", color: BABYLON.Color3.FromHexString("#d3eed3"), textColor: "black", hex: "#000000" },
    { name: "American Blue", color: BABYLON.Color3.FromHexString("#3e3b65"), textColor: "black", hex: "#000000" },
    { name: "Violet-Blue", color: BABYLON.Color3.FromHexString("#3859b3"), textColor: "black", hex: "#000000" },
    { name: "Bleu De France", color: BABYLON.Color3.FromHexString("#3388de"), textColor: "black", hex: "#000000" },
    { name: "Picton Blue", color: BABYLON.Color3.FromHexString("#36c5f4"), textColor: "black", hex: "#000000" },
    { name: "Aquamarine", color: BABYLON.Color3.FromHexString("#6dead6"), textColor: "black", hex: "#000000" },
    { name: "Dark Blue-Gray", color: BABYLON.Color3.FromHexString("#5e5b8c"), textColor: "black", hex: "#000000" },
    { name: "Purple Mountain", color: BABYLON.Color3.FromHexString("#8c78a5"), textColor: "black", hex: "#000000" },
    { name: "Pastel Purple", color: BABYLON.Color3.FromHexString("#b0a7b8"), textColor: "black", hex: "#000000" },
    { name: "Soap", color: BABYLON.Color3.FromHexString("#deceed"), textColor: "black", hex: "#000000" },
    { name: "Sugar Plum", color: BABYLON.Color3.FromHexString("#9a4d76"), textColor: "black", hex: "#000000" },
    { name: "Sky Magenta", color: BABYLON.Color3.FromHexString("#c878af"), textColor: "black", hex: "#000000" },
    { name: "Pale Violet", color: BABYLON.Color3.FromHexString("#cc99ff"), textColor: "black", hex: "#000000" },
    { name: "Begonia", color: BABYLON.Color3.FromHexString("#fa6e79"), textColor: "black", hex: "#000000" },
    { name: "Baker-Miller Pink", color: BABYLON.Color3.FromHexString("#ffa2ac"), textColor: "black", hex: "#000000" },
    { name: "Light Red", color: BABYLON.Color3.FromHexString("#ffd1d5"), textColor: "black", hex: "#000000" },
    { name: "Misty Rose", color: BABYLON.Color3.FromHexString("#f6e8e0"), textColor: "black", hex: "#000000" },
    { name: "White", color: BABYLON.Color3.FromHexString("#ffffff"), textColor: "black", hex: "#000000" }
]

var DodoColorDefaultIndex = DodoColors.length - 1;

DodoColors.forEach(c => {
    let sum = c.color.r + c.color.g + c.color.b;
    if (sum < 2) {
        c.textColor = "white";
    }
    else {
        c.textColor = "black";
    }
    c.hex = c.color.toHexString();
})

function DodoColorIdToIndex(colorID: number | string): number {
        if (typeof(colorID) === "number") {
            return colorID;
        }
        else {
            return DodoColors.findIndex(color => { return color.name === colorID });
        }
    }

function DodoColorIdToName(colorID: number | string): string {
    if (typeof(colorID) === "string") {
        return colorID;
    }
    else {
        return DodoColors[colorID].name;
    }
}

class DodoCollider extends BABYLON.Mesh {

    constructor(public dodo: Dodo) {
        super("dodo-collider");
    }

    public highlight(): void {
        
    }

    public unlit(): void {
        
    }
}

class DodoInteractCollider extends BABYLON.Mesh {

    constructor(public dodo: Dodo) {
        super("dodo-collider");
    }

    public highlight(): void {
        this.dodo.meshes.forEach(mesh => {
            mesh.renderOutline = true;
        })
    }

    public unlit(): void {
        this.dodo.meshes.forEach(mesh => {
            mesh.renderOutline = false;
        })
    }
}

enum DodoUpdateLoopQuality {
    Zero,
    Low,
    Max
}

class Dodo extends Creature {

    public updateLoopQuality: DodoUpdateLoopQuality = DodoUpdateLoopQuality.Max;
    public peerId: string = null;
    public conn: Peer.DataConnection;
    public gameId: number = -1;
    public get isPlayerControlled(): boolean {
        return this === this.game.playerDodo;
    }
    public role: string = "";
    public stepDuration: number = 0.2;
    public colors: BABYLON.Color3[] = [];
    public eyeColor: number = 0;
    public style: string;
    public brain: Brain;

    public dodoCollider: DodoCollider;
    public dodoInteractCollider: DodoInteractCollider;
    public currentChuncks: Chunck[][] = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];
    public currentConstructions: Construction[][] = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];

    public targetLook: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    public meshes: BABYLON.Mesh[] = [];
    public body: BABYLON.Mesh;
    public bodyTargetPos: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public bodyVelocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public neck: BABYLON.Mesh;
    public head: BABYLON.Mesh;
    public headVelocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public eyes: BABYLON.Mesh[];
    public jaw: BABYLON.Mesh;
    public tail: BABYLON.Mesh;
    public tailTargetPos: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public tailFeathers: BABYLON.Mesh[];
    public hat: BABYLON.Mesh;
    public hatIndex: number = 0;
    public hatColor: number = 0;
    //public topEyelids: BABYLON.Mesh[];
    //public bottomEyelids: BABYLON.Mesh[];
    //public wing: BABYLON.Mesh;
    //public canon: BABYLON.Mesh;
    public stepHeight: number = 0.1;
    public foldedBodyHeight: number = 0.1;
    public unfoldedBodyHeight: number = 0.5;
    public bodyHeight: number = this.foldedBodyHeight;
    public animateWait = Mummu.AnimationFactory.EmptyVoidCallback;
    public animateBodyHeight = Mummu.AnimationFactory.EmptyNumberCallback;
    //public animateCanonRotX = Mummu.AnimationFactory.EmptyNumberCallback;
    //public animateTopEyeLids = [Mummu.AnimationFactory.EmptyNumberCallback];
    //public animateBottomEyeLids = [Mummu.AnimationFactory.EmptyNumberCallback];
    public animateJaw = Mummu.AnimationFactory.EmptyNumberCallback;
    public feet: DodoFoot[];
    public hipPos: BABYLON.Vector3 = new BABYLON.Vector3(.20792, -0.13091, 0);
    public upperLegLength: number = 0.217;
    public lowerLegLength: number = 0.224;
    public upperLegs: BABYLON.Mesh[];
    public lowerLegs: BABYLON.Mesh[];
    public static OutlinedMesh(name: string, dodo: Dodo): BABYLON.Mesh {
        let mesh = new BABYLON.Mesh(name);
        mesh.renderOutline = false;
        mesh.outlineColor.copyFromFloats(1, 1, 1);
        mesh.outlineWidth = 0.01;
        dodo.meshes.push(mesh);
        return mesh;
    }
    public eyeMaterial: BABYLON.StandardMaterial;
    public nameTag: BABYLON.Mesh;
    public closenessRank: number = 0;

    private _tmpForwardAxis: BABYLON.Vector3 = BABYLON.Vector3.Forward();
    public get r(): number {
        return Mummu.AngleFromToAround(BABYLON.Axis.Z, this.forward, BABYLON.Axis.Y);
    }
    public set r(v: number) {
        Mummu.RotateToRef(BABYLON.Axis.Z, BABYLON.Axis.Y, v, this._tmpForwardAxis);
        Mummu.QuaternionFromZYAxisToRef(this._tmpForwardAxis, BABYLON.Axis.Y, this.rotationQuaternion);
    }
    public get bodyR(): number {
        return Mummu.AngleFromToAround(BABYLON.Axis.Z, this.body.forward, BABYLON.Axis.Y);
    }

    constructor(peerId: string, name: string, game: Game, prop?: IDodoProp) {
        super(peerId, game);

        this.name = name;
        this.peerId = peerId;

        this.colors = [];

        if (prop) {
            if (isFinite(prop.speed)) {
                this.speed = prop.speed;
            }
            if (isFinite(prop.stepDuration)) {
                this.stepDuration = prop.stepDuration;
            }
            if (isFinite(prop.bounty)) {
                this.bounty = prop.bounty;
            }
            if (prop.style) {
                this.setStyle(prop.style);
            }
            if (prop.role) {
                this.role = prop.role;
            }
        }

        if (this.colors.length === 0) {
            let c1 = Math.floor(Math.random() * DodoColors.length);
            let c2 = Math.floor(Math.random() * DodoColors.length);
            let c3 = Math.floor(Math.random() * DodoColors.length);
            let c4 = Math.floor(Math.random() * DodoColors.length);
            let style = c1.toString(16).padStart(2, "0") + c2.toString(16).padStart(2, "0") + c3.toString(16).padStart(2, "0") + c4.toString(16).padStart(2, "0");
            this.setStyle(style);
        }

        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.body = Dodo.OutlinedMesh("body", this);

        this.head = Dodo.OutlinedMesh("head", this);
        this.head.rotationQuaternion = BABYLON.Quaternion.Identity();

        this.hat = Dodo.OutlinedMesh("hat", this);
        this.hat.parent = this.head;

        
        this.jaw = Dodo.OutlinedMesh("jaw", this);
        this.jaw.parent = this.head;
        this.jaw.position.copyFromFloats(0, -0.078575, 0.055646);

        this.eyes = [
            new BABYLON.Mesh("eyeR"),
            new BABYLON.Mesh("eyeL")
        ];
        this.eyes[0].parent = this.head;
        this.eyes[0].position.copyFromFloats(0.09299, 0.125989, 0.076938);
        this.eyes[1].parent = this.head;
        this.eyes[1].position.copyFromFloats(-0.09299, 0.125989, 0.076938);

        this.tail = new BABYLON.Mesh("tail");
        this.tail.position.copyFromFloats(0, -0.08, -0.33);
        this.tail.parent = this.body;

        this.tailFeathers = [
            Dodo.OutlinedMesh("tailFeatherR", this),
            Dodo.OutlinedMesh("tailFeatherM", this),
            Dodo.OutlinedMesh("tailFeatherL", this)
        ];
        this.tailFeathers[0].parent = this.tail;
        this.tailFeathers[0].position.copyFromFloats(0.020, - 0.03, -0.02);
        this.tailFeathers[0].rotation.y = - Math.PI / 14;
        this.tailFeathers[0].scaling.scaleInPlace(0.8 + 0.4 * Math.random());

        this.tailFeathers[1].parent = this.tail;
        this.tailFeathers[1].position.copyFromFloats(0, 0.015, 0);
        this.tailFeathers[1].rotation.x = Math.PI / 14;
        this.tailFeathers[1].scaling.scaleInPlace(0.8 + 0.4 * Math.random());

        this.tailFeathers[2].parent = this.tail;
        this.tailFeathers[2].position.copyFromFloats(-0.020, - 0.03, -0.02);
        this.tailFeathers[2].rotation.y = Math.PI / 14;
        this.tailFeathers[2].scaling.scaleInPlace(0.8 + 0.4 * Math.random());BABYLON

        this.dodoCollider = new DodoCollider(this);
        this.dodoCollider.parent = this;
        this.dodoCollider.position.copyFromFloats(0, this.unfoldedBodyHeight + 0.05, 0);
        BABYLON.CreateSphereVertexData({ diameter: 2 * BRICK_S }).applyToMesh(this.dodoCollider);
        this.dodoCollider.visibility = 0;

        this.dodoInteractCollider = new DodoInteractCollider(this);
        this.dodoInteractCollider.parent = this.body;
        this.dodoInteractCollider.position.copyFromFloats(0, 0.2, 0.1);
        BABYLON.CreateBoxVertexData({ width: 0.6, height: 1, depth: 1 }).applyToMesh(this.dodoInteractCollider);
        this.dodoInteractCollider.visibility = 0;

        this.nameTag = Mummu.CreateQuad("name-tag", {
            width: 1,
            height: 0.25
        });

        this.setName(this.name);

        /*
        this.topEyelids = [
            Dodo.OutlinedMesh("topEyelidR"),
            Dodo.OutlinedMesh("topEyelidL")
        ];
        this.topEyelids[0].parent = this.head;
        this.topEyelids[0].position.copyFromFloats(0.236, 0.046, 0.705);
        this.topEyelids[0].rotation.x = Math.PI / 4;
        this.topEyelids[1].parent = this.head;
        this.topEyelids[1].position.copyFromFloats(-0.236, 0.046, 0.705);
        this.topEyelids[1].rotation.x = Math.PI / 4;

        this.bottomEyelids = [
            Dodo.OutlinedMesh("bottomEyelidR"),
            Dodo.OutlinedMesh("bottomEyelidL")
        ];
        this.bottomEyelids[0].parent = this.head;
        this.bottomEyelids[0].position.copyFromFloats(0.236, 0.046, 0.705);
        this.bottomEyelids[0].rotation.x = - Math.PI / 4;
        this.bottomEyelids[1].parent = this.head;
        this.bottomEyelids[1].position.copyFromFloats(-0.236, 0.046, 0.705);
        this.bottomEyelids[1].rotation.x = - Math.PI / 4;

        this.canon = Dodo.OutlinedMesh("canon");
        this.canon.position.copyFromFloats(0, - 0.04, 0.46);
        this.canon.parent = this.body;

        if (prop && prop.hasWings) {
            this.wing = Dodo.OutlinedMesh("body");
            this.wing.parent = this.body;
        }
        */
        this.upperLegs = [
            Dodo.OutlinedMesh("upperLegR", this),
            Dodo.OutlinedMesh("upperLegL", this)
        ];
        this.upperLegs[0].rotationQuaternion = BABYLON.Quaternion.Identity();
        this.upperLegs[1].rotationQuaternion = BABYLON.Quaternion.Identity();
        this.lowerLegs = [
            Dodo.OutlinedMesh("lowerLegR", this),
            Dodo.OutlinedMesh("lowerLegL", this)
        ];
        this.lowerLegs[0].rotationQuaternion = BABYLON.Quaternion.Identity();
        this.lowerLegs[1].rotationQuaternion = BABYLON.Quaternion.Identity();

        this.feet = [
            new DodoFoot("footR", this),
            new DodoFoot("footL", this)
        ];
        this.feet[0].rotationQuaternion = BABYLON.Quaternion.Identity();
        this.feet[1].rotationQuaternion = BABYLON.Quaternion.Identity();

        this.neck = Dodo.OutlinedMesh("neck", this);

        this.hitCollider = new BABYLON.Mesh("hit-collider");
        this.hitCollider.parent = this;
        this.hitCollider.isVisible = false;
        this.hitCollider.parent = this.body;

        this.animateWait = Mummu.AnimationFactory.CreateWait(this);
        this.animateBodyHeight = Mummu.AnimationFactory.CreateNumber(this, this, "bodyHeight", undefined, undefined, Nabu.Easing.easeInOutSine);
        this.animateJaw = Mummu.AnimationFactory.CreateNumber(this, this.jaw.rotation, "x");
        /*
        this.animateCanonRotX = Mummu.AnimationFactory.CreateNumber(this, this.canon.rotation, "x");
        this.animateTopEyeLids = [
            Mummu.AnimationFactory.CreateNumber(this.topEyelids[0], this.topEyelids[0].rotation, "x"),
            Mummu.AnimationFactory.CreateNumber(this.topEyelids[1], this.topEyelids[1].rotation, "x")
        ];
        this.animateBottomEyeLids = [
            Mummu.AnimationFactory.CreateNumber(this.bottomEyelids[0], this.bottomEyelids[0].rotation, "x"),
            Mummu.AnimationFactory.CreateNumber(this.bottomEyelids[1], this.bottomEyelids[1].rotation, "x")
        ];
        */

        this.game.allDodos.push(this);
    }

    public getStyleValue(type: StyleValueTypes): number {
        if (this.style.length != 2 * StyleValueTypes.COUNT) {
            this.style = this.style.padEnd(2 * StyleValueTypes.COUNT, "0");
            this.style = this.style.substring(0, 2 * StyleValueTypes.COUNT);
        }
        return parseInt(this.style.substring(2 * type, 2 * (type + 1)), 16);
    }

    public setStyleValue(value: number, type: StyleValueTypes): void {
        if (this.style.length != 2 * StyleValueTypes.COUNT) {
            this.style = this.style.padEnd(2 * StyleValueTypes.COUNT, "0");
            this.style = this.style.substring(0, 2 * StyleValueTypes.COUNT);
        }

        let style = "";
        if (type > StyleValueTypes.Color0) {
            style += this.style.substring(0, 2 * (type));
        }
        style += value.toString(16).padStart(2, "0");
        if (type < StyleValueTypes.COUNT - 1) {
            style += this.style.substring(2 * (type + 1));
        }
        this.setStyle(style);
    }

    public setStyle(style: string): void {
        this.style = style;
        this.colors[0] = DodoColors[this.getStyleValue(StyleValueTypes.Color0)].color;
        this.colors[1] = DodoColors[this.getStyleValue(StyleValueTypes.Color1)].color;
        this.colors[2] = DodoColors[this.getStyleValue(StyleValueTypes.Color2)].color;
        this.eyeColor = this.getStyleValue(StyleValueTypes.EyeColor);
        this.hatIndex = this.getStyleValue(StyleValueTypes.HatIndex);
        this.hatColor = this.getStyleValue(StyleValueTypes.HatColor);

        SavePlayerToLocalStorage(this.game);

        if (this._instantiated) {
            this.instantiate();
        }
    }

    public setName(name: string): void {
        this.name = name;
        if (this.nameTag) {
            if (this.nameTag.material) {
                this.nameTag.material.dispose(true, true);
            }
            let material = new BABYLON.StandardMaterial("name-tag-material");
            material.emissiveColor.copyFromFloats(1, 1, 1);
            material.useAlphaFromDiffuseTexture = true;
            
            let s = 512;
            let texture = new BABYLON.DynamicTexture("name-tag-texture", { width: s, height: s / 4 },this.game.scene);
            texture.hasAlpha = true;

            let context = texture.getContext();
            context.fillStyle = "#00000000";
            context.fillRect(0, 0, s, s / 4);
            context.font = (s / 10).toFixed(0) + "px Roboto";
            context.fillStyle = "#ffffffff";
            context.strokeStyle = "#000000ff";
            context.lineWidth = s / 128;
            let l = context.measureText(this.name);
            context.strokeText(this.name, s / 2 - l.width * 0.5, s / 8);
            context.fillText(this.name, s / 2 - l.width * 0.5, s / 8);
            
            context.font = (s / 12).toFixed(0) + "px Roboto";
            let l2 = context.measureText(this.role);
            context.strokeText(this.role, s / 2 - l2.width * 0.5, s / 4 - s / 32);
            context.fillText(this.role, s / 2 - l2.width * 0.5, s / 4 - s / 32);
            
            texture.update();
            material.diffuseTexture = texture;

            this.nameTag.material = material;
        }
    }

    private _instantiated: boolean = false;
    public async instantiate(): Promise<void> {
        this.material = this.game.defaultToonMaterial;

        this.body.material = this.material;
        this.head.material = this.material;
        this.jaw.material = this.material;

        if (this.eyeMaterial) {
            this.eyeMaterial.dispose(true, true);
        }

        this.eyeMaterial = new BABYLON.StandardMaterial("eye-material");
        this.eyeMaterial.specularColor.copyFromFloats(0, 0, 0);

        let eyeTexture = new BABYLON.DynamicTexture("eye-texture", 256);
        let context = eyeTexture.getContext();
        context.fillStyle = "white";

        context.fillRect(0, 0, 256, 256);

        context.beginPath();
        context.fillStyle = DodoColors[this.eyeColor].hex;
        context.arc(128, 128, 64, 0, 2 * Math.PI);
        context.closePath();
        context.fill();

        context.beginPath();
        context.fillStyle = "black";
        context.arc(128, 128, 32, 0, 2 * Math.PI);
        context.closePath();
        context.fill();

        context.beginPath();
        context.fillStyle = "white";
        context.arc(91, 91, 7, 0, 2 * Math.PI);
        context.closePath();
        context.fill();

        context.beginPath();
        context.fillStyle = "white";
        context.arc(150, 150, 15, 0, 2 * Math.PI);
        context.closePath();
        context.fill();

        eyeTexture.update();

        this.eyeMaterial.diffuseTexture = eyeTexture;
        this.eyeMaterial.emissiveColor.copyFromFloats(1, 1, 1);
        this.eyes[0].material = this.eyeMaterial;
        this.eyes[1].material = this.eyeMaterial;

        this.tailFeathers[0].material = this.material;
        this.tailFeathers[1].material = this.material;
        this.tailFeathers[2].material = this.material;

        this.hat.material = this.material;

        //this.topEyelids[0].material = this.material;
        //this.topEyelids[1].material = this.material;

        //this.bottomEyelids[0].material = this.material;
        //this.bottomEyelids[1].material = this.material;

        this.upperLegs[0].material = this.material;
        this.upperLegs[1].material = this.material;

        this.lowerLegs[0].material = this.material;
        this.lowerLegs[1].material = this.material;

        //this.tailEnd.material = this.material;
        this.neck.material = this.material;

        let datas = await this.game.vertexDataLoader.get("./datas/meshes/dodo.babylon");
        datas = datas.map(vertexData => {
            let clonedVertexData = Mummu.CloneVertexData(vertexData);
            Mummu.ColorizeVertexDataInPlace(clonedVertexData, this.colors[0], new BABYLON.Color3(0, 1, 0));
            Mummu.ColorizeVertexDataInPlace(clonedVertexData, this.colors[1], new BABYLON.Color3(0, 0, 1));
            Mummu.ColorizeVertexDataInPlace(clonedVertexData, this.colors[2], new BABYLON.Color3(1, 0, 0));
            return clonedVertexData;
        });
        let roboDatas = await this.game.vertexDataLoader.get("./datas/meshes/robododo.babylon");
        roboDatas = roboDatas.map(vertexData => {
            let clonedVertexData = Mummu.CloneVertexData(vertexData);
            Mummu.ColorizeVertexDataInPlace(clonedVertexData, this.colors[0], new BABYLON.Color3(0, 1, 0));
            Mummu.ColorizeVertexDataInPlace(clonedVertexData, this.colors[1], new BABYLON.Color3(0, 0, 1));
            Mummu.ColorizeVertexDataInPlace(clonedVertexData, this.colors[2], new BABYLON.Color3(1, 0, 0));
            return clonedVertexData;
        });
        datas[0].applyToMesh(this.body);

        datas[3].applyToMesh(this.head);

        datas[4].applyToMesh(this.eyes[0]);
        datas[4].applyToMesh(this.eyes[1]);

        datas[5].applyToMesh(this.tailFeathers[0]);
        datas[5].applyToMesh(this.tailFeathers[1]);
        datas[5].applyToMesh(this.tailFeathers[2]);

        //datas[3].applyToMesh(this.topEyelids[0]);
        //datas[3].applyToMesh(this.topEyelids[1]);

        //datas[4].applyToMesh(this.bottomEyelids[0]);
        //datas[4].applyToMesh(this.bottomEyelids[1]);

        datas[1].applyToMesh(this.upperLegs[0]);
        datas[1].applyToMesh(this.upperLegs[1]);

        datas[2].applyToMesh(this.lowerLegs[0]);
        datas[2].applyToMesh(this.lowerLegs[1]);

        await this.feet[0].instantiate();
        await this.feet[1].instantiate();
        
        datas[7].applyToMesh(this.jaw);

        if (this.hatIndex === 0) {
            this.hat.isVisible = false;
        }
        else {
            this.hat.isVisible = true;
            if (this.hatIndex === 1) {
                Mummu.ColorizeVertexDataInPlace(Mummu.CloneVertexData(datas[8]), DodoColors[this.hatColor].color).applyToMesh(this.hat);
            }
            else if (this.hatIndex === 2) {
                Mummu.ColorizeVertexDataInPlace(Mummu.CloneVertexData(datas[9]), DodoColors[this.hatColor].color).applyToMesh(this.hat);
            }
            else if (this.hatIndex === 3) {
                Mummu.ColorizeVertexDataInPlace(Mummu.CloneVertexData(datas[10]), DodoColors[this.hatColor].color).applyToMesh(this.hat);
            }
            else if (this.hatIndex === 4) {
                Mummu.ColorizeVertexDataInPlace(Mummu.CloneVertexData(datas[11]), DodoColors[this.hatColor].color).applyToMesh(this.hat);
            }
        }

        datas[0].applyToMesh(this.hitCollider);

        this._instantiated = true;
    }

    public dispose(): void {
        super.dispose();
        this.feet[0].dispose();
        this.feet[1].dispose();
        this.upperLegs[0].dispose();
        this.upperLegs[1].dispose();
        this.lowerLegs[0].dispose();
        this.lowerLegs[1].dispose();
        this.body.dispose();
        this.head.dispose();
        this.neck.dispose();

        if (this.nameTag) {
            this.nameTag.dispose();
        }

        let allDodoIndex = this.game.allDodos.indexOf(this);
        if (allDodoIndex != - 1) {
            this.game.allDodos.splice(allDodoIndex, 1);
        }
        let networkDodoIndex = this.game.networkDodos.indexOf(this);
        if (networkDodoIndex != - 1) {
            this.game.networkDodos.splice(networkDodoIndex, 1);
        }
        let npcDodoIndex = this.game.npcDodos.indexOf(this);
        if (npcDodoIndex != - 1) {
            this.game.npcDodos.splice(npcDodoIndex, 1);
        }
    }

    public setWorldPosition(p: BABYLON.Vector3): void {
        ScreenLoger.Log("setWorldPosition " + p)
        this.position.copyFrom(p);

        this.computeWorldMatrix(true);

        this.body.position.copyFrom(p);
        this.body.position.y += this.bodyHeight;
        this.bodyTargetPos.copyFrom(this.body.position);

        this.head.position.copyFrom(p);
        this.head.position.y += this.bodyHeight + 0.5;

        this.targetLook.copyFrom(this.head.position).addInPlace(this.forward.scale(5));
        
        this.feet[0].position.copyFrom(p);
        this.feet[1].position.copyFrom(p);
    }

    public barycenterWorldPositionToRef(ref: BABYLON.Vector3): void {
        BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(0, 0.2, 0.2), this.body.getWorldMatrix(), ref);
    }

    public async fold(): Promise<void> {
        this.lifeState = LifeState.Folded;
        await this.animateBodyHeight(this.foldedBodyHeight, 1.5);
    }
    public async unfold(): Promise<void> {
        await this.animateBodyHeight(this.unfoldedBodyHeight, 1.5);
        this.lifeState = LifeState.Ok;
    }

    public async blink(duration: number): Promise<void> {
        let t0 = performance.now() / 1000;
        let t = performance.now() / 1000;
        
        while (t - t0 < duration) {
            await this.animateWait(0.04);
            await this.animateWait(0.08);
            this.body.material = this.game.defaultToonMaterial;
            await this.animateWait(0.04);
        }
    }

    public async animateFoot(foot: DodoFoot, target: BABYLON.Vector3, targetQ: BABYLON.Quaternion): Promise<void> {
        return new Promise<void>(resolve => {
            let origin = foot.position.clone();
            let dist = BABYLON.Vector3.Distance(origin, target);
            let duration = this.stepDuration;
            if (!this.isGrounded) {
                duration *= 0.5;
            }
            let originQ = foot.rotationQuaternion.clone();
            let t0 = performance.now() / 1000;
            let step = () => {
                let t = performance.now() / 1000;
                let f = (t - t0) / duration;
                if (f < 1) {
                    //f = Nabu.Easing.easeInSine(f);
                    BABYLON.Quaternion.SlerpToRef(originQ, targetQ, f, foot.rotationQuaternion);
                    BABYLON.Vector3.LerpToRef(origin, target, f, foot.position);
                    if (this.isGrounded) {
                        foot.position.y += Math.min(dist, this.stepHeight) * Math.sin(f * Math.PI);
                    }
                    else {
                        let paddle = this.forward.clone();
                        paddle.scaleInPlace(0.3 * Math.sin(f * Math.PI));
                        foot.position.addInPlace(paddle);
                    }
                    requestAnimationFrame(step);
                }
                else {
                    foot.position.copyFrom(target);
                    foot.rotationQuaternion.copyFrom(targetQ);
                    resolve();
                }
            }
            step();
        });
    }

    public isGrounded: boolean = false;
    public jumping: boolean = false;
    public walking: number = 0;
    public footIndex: number = 0;
    public walk(): void {
        if (this.jumping) {
            this.isGrounded = false;
        }

        if (this.walking === 0 && this.isAlive && !this.jumping) {
            let deltaPos = this.position.subtract(this.body.position);
            let doWalk = false;
            if (deltaPos.length() > 0) {
                doWalk = true;
            }
            else {
                if (Math.abs(this.r - this.bodyR) > Math.PI / 8) {
                    doWalk = true;
                }
            }
            if (doWalk) {
                let xFactor = this.footIndex === 0 ? 1 : - 1;
                let spread = 0.2;
                let animatedSpeedForward = BABYLON.Vector3.Dot(this.animatedSpeed, this.forward);
                let animatedSpeedRight = BABYLON.Vector3.Dot(this.animatedSpeed, this.right);
                let origin = new BABYLON.Vector3(xFactor * spread, 0, 0);
                let up = BABYLON.Vector3.Up();
                BABYLON.Vector3.TransformCoordinatesToRef(origin, this.getWorldMatrix(), origin);

                if (this.updateLoopQuality === DodoUpdateLoopQuality.Max) {
                    origin.y += this.bodyHeight;
                    origin.addInPlace(this.forward.scale(animatedSpeedForward * 0.4)).addInPlace(this.right.scale(animatedSpeedRight * 0.4));

                    let ray = new BABYLON.Ray(origin, new BABYLON.Vector3(0, -1, 0), 1);
                    let bestIntersection: BABYLON.PickingInfo;

                    if (this.isPlayerControlled && this.game.gameMode === GameMode.Home) {
                        bestIntersection = ray.intersectsMesh(this.game.homeMenuPlate);
                    }

                    if (!bestIntersection) {
                        for (let di = this._constructionRange.di0; di <= this._constructionRange.di1; di++) {
                            for (let dj = this._constructionRange.dj0; dj <= this._constructionRange.dj1; dj++) {
                                let construction = this.getCurrentConstruction(di, dj);
                                if (construction) {
                                    if (construction.mesh) {
                                        let intersection = ray.intersectsMesh(construction.mesh);
                                        if (intersection.hit) {
                                            if (!bestIntersection || bestIntersection.distance > intersection.distance) {
                                                bestIntersection = intersection;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (!bestIntersection) {
                        for (let di = this._chunckRange.di0; di <= this._chunckRange.di1; di++) {
                            for (let dj = this._chunckRange.dj0; dj <= this._chunckRange.dj1; dj++) {
                                let chunck = this.getCurrentChunck(di, dj);
                                if (chunck) {
                                    let intersection = ray.intersectsMesh(chunck);
                                    if (intersection.hit) {
                                        if (!bestIntersection || bestIntersection.distance > intersection.distance) {
                                            bestIntersection = intersection;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (bestIntersection && bestIntersection.hit) {
                        origin = bestIntersection.pickedPoint;
                        up = bestIntersection.getNormal(true, false);
                        this.isGrounded = true;
                    }
                    else {
                        this.isGrounded = false;
                    }
                }
                else {
                    this.isGrounded = true;
                }

                if (this.isGrounded) {
                    let foot = this.feet[this.footIndex];
                    if (BABYLON.Vector3.DistanceSquared(foot.position, origin.add(up.scale(0.0))) > 0.01) {
                        this.walking = 1;
                        let footDir = this.forward.add(this.right.scale(0.5 * xFactor)).normalize();
                        foot.groundPos = origin;
                        foot.groundUp = up;
                        this.animateFoot(foot, origin.add(up.scale(0.0)), Mummu.QuaternionFromYZAxis(up, footDir)).then(() => {
                            this.walking = 0;
                            this.footIndex = (this.footIndex + 1) % 2;
                        });
                    }
                    else {
                        this.footIndex = (this.footIndex + 1) % 2;
                    }
                }
            }
        }
    }

    public static FlatManhattan(from: BABYLON.Vector3, to: BABYLON.Vector3): number {
        return Math.abs(from.x - to.x) + Math.abs(from.z - to.z);
    }

    private _jumpTimer: number = 0;
    public jump(): void {
        if (!this.jumping) {
            this._jumpTimer = 0;
            this.jumping = true;
            this.isGrounded = false;
            this.gravityVelocity = -5;
            setTimeout(() => {
                this.jumping = false;
            }, 800);
        }
    }
    private _jumpingFootTargets: BABYLON.Vector3[] = [BABYLON.Vector3.Zero(), BABYLON.Vector3.Zero()];

    private _lastR: number = 0;
    public gravityVelocity: number = 0;
    public update(dt: number) {
        if (this.brain) {
            this.brain.update(dt);
        }

        if (Math.random() < 0.01) {
            this.kwak();
        }

        if (this.game.gameMode === GameMode.Home) {
            this.walk();
        }
        else if (!this.isPlayerControlled) {
            this.walk();
        }
        else {
            if (this.currentChuncks[1][1]) {
                if (this.currentConstructions[1][1] && this.currentConstructions[1][1].isMeshUpdated) {
                    this.walk();
                }
            }
        }

        let dR = this.r - this._lastR;
        this._lastR = this.r;
        this.animatedRSpeed = dR / dt;

        if (this.isGrounded) {
            if (this.isPlayerControlled) {
                this.position.y = Math.min(this.feet[0].position.y, this.feet[1].position.y);
            }
            this.gravityVelocity = 0;
            this._jumpTimer = 0;
        }
        else {
            this._jumpTimer += dt;

            this._jumpingFootTargets[0].copyFromFloats(0.25, 0, 0.3 * Math.cos(this._jumpTimer * 8 * Math.PI));
            this._jumpingFootTargets[1].copyFromFloats(- 0.25, 0, - 0.3 * Math.cos(this._jumpTimer * 8 * Math.PI));
            BABYLON.Vector3.TransformCoordinatesToRef(this._jumpingFootTargets[0], this.getWorldMatrix(), this._jumpingFootTargets[0]); 
            BABYLON.Vector3.TransformCoordinatesToRef(this._jumpingFootTargets[1], this.getWorldMatrix(), this._jumpingFootTargets[1]);
            BABYLON.Vector3.LerpToRef(this.feet[0].position, this._jumpingFootTargets[0], 0.2, this.feet[0].position);
            BABYLON.Vector3.LerpToRef(this.feet[1].position, this._jumpingFootTargets[1], 0.2, this.feet[1].position);
            if (this.isPlayerControlled) {
                if (this.currentChuncks[1][1]) {
                    if (this.currentConstructions[1][1] && this.currentConstructions[1][1].isMeshUpdated) {
                        this.position.y -= this.gravityVelocity * dt;
                        this.gravityVelocity += 5 * dt;
                    }
                }
            }
        }

        // panik
        if (this.game.gameMode === GameMode.Playing && this.position.y < -5) {
            let y = this.game.terrain.worldPosToTerrainAltitude(this.position);
            if (y != null) {
                this.position.y = y;
            }
            else {
                this.position.y = 5;
            }
            this.gravityVelocity = 0;
        }

        let f = 0.5;

        let halfFeetDistance = BABYLON.Vector3.Distance(this.feet[0].position, this.feet[1].position) * 0.5;
        let totalLegLength = this.upperLegLength + this.lowerLegLength;
        let maxBodyHeight = Math.sqrt(Math.max(0, totalLegLength * totalLegLength - halfFeetDistance * halfFeetDistance)) - this.hipPos.y;
        maxBodyHeight = Math.max(maxBodyHeight, this.foldedBodyHeight);
        this.bodyTargetPos.copyFrom(this.feet[0].position).addInPlace(this.feet[1].position).scaleInPlace(0.5);
        if (this.isGrounded) {
            this.bodyTargetPos.addInPlace(this.animatedSpeed.scale(0.15));
            this.bodyTargetPos.y += Math.min(this.bodyHeight, maxBodyHeight);
        }
        else {
            this.bodyTargetPos.y += Math.min(0.5 * this.bodyHeight, maxBodyHeight);
        }

        //Mummu.DrawDebugPoint(this.position, 2, BABYLON.Color3.Blue());
        //let altitude = this.game.terrain.worldPosToTerrainAltitude(this.position);
        //Mummu.DrawDebugPoint(new BABYLON.Vector3(this.position.x, altitude, this.position.z), 2, BABYLON.Color3.Red());
        
        let pForce = this.bodyTargetPos.subtract(this.body.position);
        let pForceValue = 80;
        if (!this.isGrounded) {
            pForceValue = 200;
        }
        pForce.scaleInPlace(pForceValue * dt);

        this.bodyVelocity.addInPlace(pForce);
        this.bodyVelocity.scaleInPlace(Nabu.Easing.smoothNSec(1 / dt, 0.2));
        //if (this.bodyVelocity.length() > this.speed * 3) {
        //    this.bodyVelocity.normalize().scaleInPlace(this.speed * 3);
        //} 

        this.body.position.addInPlace(this.bodyVelocity.scale(dt));
        //this.body.position.copyFrom(this.bodyTargetPos);

        if (this.updateLoopQuality === DodoUpdateLoopQuality.Max && !this.brain.inDialog) {
            this.updateConstructionDIDJRange();
            for (let di = this._constructionRange.di0; di <= this._constructionRange.di1; di++) {
                for (let dj = this._constructionRange.dj0; dj <= this._constructionRange.dj1; dj++) {
                    let construction = this.getCurrentConstruction(di, dj);
                    if (construction) {
                        if (construction.mesh) {
                            let col = Mummu.SphereMeshIntersection(this.dodoCollider.absolutePosition, BRICK_S, construction.mesh, true);
                            if (col.hit) {
                                let delta = col.normal.scale(col.depth * 1.2);
                                this.position.addInPlace(delta);

                                let speedComp = BABYLON.Vector3.Dot(this.animatedSpeed, col.normal);
                                this.animatedSpeed.subtractInPlace(col.normal.scale(speedComp));
                                if (col.normal.y > 0.5) {
                                    this.gravityVelocity *= 0.5;
                                }
                                else if (col.normal.y < -0.5) {
                                    this.gravityVelocity = Math.min(this.gravityVelocity, 0);
                                }
                            }
                        }
                    }
                }
            }
        }
        

        let right = this.feet[0].position.subtract(this.feet[1].position);
        right.normalize();
        right.addInPlace(this.right.scale(2 + 2 * this.animatedSpeed.length() / this.speed));
        right.normalize();
        this.body.rotationQuaternion = BABYLON.Quaternion.Slerp(this.rotationQuaternion, Mummu.QuaternionFromXYAxis(right, this.up), 0.95);

        this.body.freezeWorldMatrix();

        let hipR = this.hipPos.clone();
        BABYLON.Vector3.TransformCoordinatesToRef(hipR, this.body.getWorldMatrix(), hipR);

        let kneeR = hipR.clone().addInPlace(this.feet[0].position).scaleInPlace(0.5);
        kneeR.subtractInPlace(this.forward);
        kneeR.addInPlace(this.right.scale(0.1));

        Mummu.ForceDistanceFromOriginInPlace(kneeR, this.feet[0].position, this.lowerLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeR, hipR, this.upperLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeR, this.feet[0].position, this.lowerLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeR, hipR, this.upperLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeR, this.feet[0].position, this.lowerLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeR, hipR, this.upperLegLength);

        Mummu.QuaternionFromZYAxisToRef(kneeR.subtract(hipR), hipR.subtract(this.feet[0].position), this.upperLegs[0].rotationQuaternion);
        Mummu.QuaternionFromZYAxisToRef(this.feet[0].position.subtract(kneeR), hipR.subtract(this.feet[0].position), this.lowerLegs[0].rotationQuaternion);

        this.upperLegs[0].position.copyFrom(hipR);
        this.lowerLegs[0].position.copyFrom(kneeR);

        let hipL = this.hipPos.clone();
        hipL.x = - hipL.x;
        BABYLON.Vector3.TransformCoordinatesToRef(hipL, this.body.getWorldMatrix(), hipL);

        let kneeL = hipL.clone().addInPlace(this.feet[1].position).scaleInPlace(0.5);
        kneeL.subtractInPlace(this.forward);
        kneeL.subtractInPlace(this.right.scale(0.1));

        Mummu.ForceDistanceFromOriginInPlace(kneeL, this.feet[1].position, this.lowerLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeL, hipL, this.upperLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeL, this.feet[1].position, this.lowerLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeL, hipL, this.upperLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeL, this.feet[1].position, this.lowerLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeL, hipL, this.upperLegLength);

        Mummu.QuaternionFromZYAxisToRef(kneeL.subtract(hipL), hipL.subtract(this.feet[1].position), this.upperLegs[1].rotationQuaternion);
        Mummu.QuaternionFromZYAxisToRef(this.feet[1].position.subtract(kneeL), hipL.subtract(this.feet[1].position), this.lowerLegs[1].rotationQuaternion);

        this.upperLegs[1].position.copyFrom(hipL);
        this.lowerLegs[1].position.copyFrom(kneeL);

        let feetDeltaY = Math.abs(this.feet[0].position.y - this.feet[1].position.y);
        let neck = new BABYLON.Vector3(0, 0, 0);        
        neck.copyFrom(this.feet[0].position.scale(f)).addInPlace(this.feet[1].position.scale(1 - f));
        neck.y += this.bodyHeight + 0.51793 - feetDeltaY * 0.25;
        neck.addInPlace(this.body.forward.scale(0.37652));

        neck.copyFrom(this.body.absolutePosition);
        neck.y = this.feet[0].position.y * (f) + this.feet[1].position.y * (1 - f);
        neck.y += this.bodyHeight + 0.51793 - feetDeltaY * 0.25;
        neck.addInPlace(this.body.forward.scale(0.37652));

        let headForce = neck.subtract(this.head.position);
        headForce.scaleInPlace(200 * dt);
        this.headVelocity.scaleInPlace(Nabu.Easing.smoothNSec(1 / dt, 0.2));
        this.headVelocity.addInPlace(headForce);

        this.head.position.addInPlace(this.headVelocity.scale(dt));

        let forward = this.forward;
        if (this.targetLook) {
            forward.copyFrom(this.targetLook).subtractInPlace(this.head.position).normalize();
        }
        this.head.rotationQuaternion = Mummu.QuaternionFromZYAxis(forward, this.up);

        let db = this.head.absolutePosition.add(this.head.forward.scale(0.5)).subtract(this.bodyTargetPos);
        db.scaleInPlace(2);
        let rComp = this.right.scale(BABYLON.Vector3.Dot(db, this.right));
        db.subtractInPlace(rComp.scale(2));

        let tailPoints = [new BABYLON.Vector3(0, 0.050484, 0.165269), this.head.absolutePosition];
        BABYLON.Vector3.TransformCoordinatesToRef(tailPoints[0], this.body.getWorldMatrix(), tailPoints[0]);

        Mummu.CatmullRomPathInPlace(tailPoints, this.body.forward.scale(3), BABYLON.Vector3.Up().scale(2));
        if (this.updateLoopQuality >= DodoUpdateLoopQuality.Low) {
            Mummu.CatmullRomPathInPlace(tailPoints, this.body.forward.scale(3), BABYLON.Vector3.Up().scale(2));
        }

        let data = Mummu.CreateWireVertexData({
            path: tailPoints,
            radiusFunc: (f) => {
                return 0.2 - 0.15 * f;
            },
            tesselation: 8,
            pathUps: tailPoints.map(() => { return this.body.up.subtract(this.body.forward); }),
            color: BABYLON.Color4.FromColor3(this.colors[1])
        })
        data.applyToMesh(this.neck);

        /*
        let dFoot = BABYLON.Vector3.Dot(this.feet[0].position.subtract(this.feet[1].position), this.forward);
        if (dFoot > 0) {
            let a = dFoot * Math.PI * 0.3;
            let up = this.feet[1].groundUp;
            up = Mummu.Rotate(up, this.feet[1].right, a);
            this.feet[1].rotationQuaternion = Mummu.QuaternionFromYZAxis(up, this.feet[1].forward);
        }
        else {
            let a = - dFoot * Math.PI * 0.3;
            let up = this.feet[0].groundUp;
            up = Mummu.Rotate(up, this.feet[0].right, a);
            this.feet[0].rotationQuaternion = Mummu.QuaternionFromYZAxis(up, this.feet[0].forward);
        }
        */
        this.feet[0].update(dt);
        this.feet[1].update(dt);

        if (!this.isPlayerControlled) {
            this.nameTag.position.copyFrom(this.body.position);
            this.nameTag.position.y = Math.min(this.feet[0].position.y, this.feet[1].position.y);
            this.nameTag.position.y += 1.8;
            let cam = this.game.camera;
            let dir = this.nameTag.position.subtract(cam.position);
            let dist = dir.length();
            this.nameTag.rotationQuaternion = Mummu.QuaternionFromZYAxis(dir, BABYLON.Axis.Y);
            let size = Nabu.MinMax(dist / 20, 0, 1) * 2 + 1;
            this.nameTag.scaling.copyFromFloats(size, size, size);
        }

        if (this.updateLoopQuality === DodoUpdateLoopQuality.Max) {
            if (this.needUpdateCurrentConstruction()) {
                this.updateCurrentConstruction();
            }

            this.updateChunckDIDJRange();
            if (this.needUpdateCurrentChunck()) {
                this.updateCurrentChunck();
            }
        }
    }

    private _constructionRange: { di0: number, di1: number, dj0: number, dj1: number } = { di0: 0, di1: 0, dj0: 0, dj1: 0 }
    public updateConstructionDIDJRange(): void {
        this._constructionRange.di0 = 0;
        this._constructionRange.di1 = 0;
        this._constructionRange.dj0 = 0;
        this._constructionRange.dj1 = 0;

        let center = this.currentConstructions[1][1];
        if (center) {
            let dx = Math.abs(this.position.x - center.position.x);
            if (dx < Construction.SIZE_m * 0.2) {
                this._constructionRange.di0--;
            }
            if (dx > Construction.SIZE_m * 0.8) {
                this._constructionRange.di1++;
            }

            let dz = Math.abs(this.position.z - center.position.z);
            if (dz < Construction.SIZE_m * 0.2) {
                this._constructionRange.dj0--;
            }
            if (dz > Construction.SIZE_m * 0.8) {
                this._constructionRange.dj1++;
            }
        }
    }

    public needUpdateCurrentConstruction(): boolean {
        let center = this.currentConstructions[1][1];
        if (!center) {
            return true;
        }

        let dx = Math.abs(this.position.x - center.barycenter.x);
        let dz = Math.abs(this.position.z - center.barycenter.z);

        if (dx > Construction.SIZE_m * 0.5 * 1.1) {
            return true;
        }
        if (dz > Construction.SIZE_m * 0.5 * 1.1) {
            return true;
        }
    }

    public getCurrentConstruction(di: number, dj: number): Construction {
        if (!this.currentConstructions[1 + di][1 + dj]) {
            let center = this.currentConstructions[1][1];
            if (!center) {
                this.updateCurrentConstruction();
                center = this.currentConstructions[1][1];
            }
            if (center) {
                this.currentConstructions[1 + di][1 + dj] = this.game.terrainManager.getConstruction(center.i + di, center.j + dj);
            }
        }
        return this.currentConstructions[1 + di][1 + dj];
    }

    public updateCurrentConstruction(): void {
        let iConstruction = Math.floor(this.position.x / Construction.SIZE_m);
        let jConstruction = Math.floor(this.position.z / Construction.SIZE_m);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.currentConstructions[i][j] = undefined;
            }
        }
        this.currentConstructions[1][1] = this.game.terrainManager.getConstruction(iConstruction, jConstruction);
    }

    private _chunckRange: { di0: number, di1: number, dj0: number, dj1: number } = { di0: 0, di1: 0, dj0: 0, dj1: 0 }
    public updateChunckDIDJRange(): void {
        this._chunckRange.di0 = 0;
        this._chunckRange.di1 = 0;
        this._chunckRange.dj0 = 0;
        this._chunckRange.dj1 = 0;

        let center = this.currentChuncks[1][1];
        if (center) {
            let dx = Math.abs(this.position.x - center.position.x);
            if (dx < Chunck.SIZE_m * 0.5) {
                this._chunckRange.di0--;
            }
            if (dx > Chunck.SIZE_m * 0.5) {
                this._chunckRange.di1++;
            }

            let dz = Math.abs(this.position.z - center.position.z);
            if (dz < Chunck.SIZE_m * 0.5) {
                this._chunckRange.dj0--;
            }
            if (dz > Chunck.SIZE_m * 0.5) {
                this._chunckRange.dj1++;
            }
        }
    }

    public needUpdateCurrentChunck(): boolean {
        let center = this.currentChuncks[1][1];
        if (!center) {
            return true;
        }

        let dx = Math.abs(this.position.x - center.barycenter.x);
        let dz = Math.abs(this.position.z - center.barycenter.z);

        if (dx > Chunck.SIZE_m * 0.5 * 1.1) {
            return true;
        }
        if (dz > Chunck.SIZE_m * 0.5 * 1.1) {
            return true;
        }
    }

    public getCurrentChunck(di: number, dj: number): Chunck {
        if (!this.currentChuncks[1 + di][1 + dj]) {
            let center = this.currentChuncks[1][1];
            if (!center) {
                this.updateCurrentChunck();
                center = this.currentChuncks[1][1];
            }
            if (center) {
                this.currentChuncks[1 + di][1 + dj] = this.game.terrain.getChunck(center.i + di, center.j + dj);
            }
        }
        return this.currentChuncks[1 + di][1 + dj];
    }

    public updateCurrentChunck(): void {
        let iChunck = Math.floor(this.position.x / Chunck.SIZE_m);
        let jChunck = Math.floor(this.position.z / Chunck.SIZE_m);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.currentChuncks[i][j] = undefined;
            }
        }
        this.currentChuncks[1][1] = this.game.terrain.getChunck(iChunck, jChunck);
    }

    public async eyeBlink(eyeIndex: number = -1): Promise<void> {
        let eyeIndexes = [0, 1];
        if (eyeIndex != -1) {
            eyeIndexes = [eyeIndex];
        }
        eyeIndexes.forEach(i => {
            //this.animateTopEyeLids[i](Math.PI / 2, 0.15)
            //this.animateBottomEyeLids[i](- Math.PI / 2, 0.15)
        })
        await this.animateWait(0.25);
        eyeIndexes.forEach(i => {
            //this.animateTopEyeLids[i](Math.PI / 4, 0.15)
            //this.animateBottomEyeLids[i](- Math.PI / 4, 0.15)
        })
        await this.animateWait(0.15);
    }

    public async kwak(): Promise<void> {
        await this.animateJaw(Math.PI / 6, 0.1);
        await this.animateJaw(0, 0.1);
    }
}