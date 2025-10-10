/// <reference path="Creature.ts"/>

interface IDodoProp {
    speed?: number;
    stepDuration?: number;
    bounty?: number;
    hasWings?: boolean;
    style?: string;
}

interface IStyleNetworkData {
    style: string;
}

function IsStyleNetworkData(v: any): boolean {
    if (v.style) {
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

var DodoColors = [
    { name: "Chinese Black", color: BABYLON.Color3.FromHexString("#10121c") },
    { name: "Dark Purple", color: BABYLON.Color3.FromHexString("#2c1e31") },
    { name: "Old Mauve", color: BABYLON.Color3.FromHexString("#6b2643") },
    { name: "Amaranth Purple", color: BABYLON.Color3.FromHexString("#ac2847") },
    { name: "Imperial Red", color: BABYLON.Color3.FromHexString("#ec273f") },
    { name: "Chestnut", color: BABYLON.Color3.FromHexString("#94493a") },
    { name: "#Medium Vermilion", color: BABYLON.Color3.FromHexString("#de5d3a") },
    { name: "Cadmium Orange", color: BABYLON.Color3.FromHexString("#e98537") },
    { name: "Deep Saffron", color: BABYLON.Color3.FromHexString("#f3a833") },
    { name: "Royal Brown", color: BABYLON.Color3.FromHexString("#4d3533") },
    { name: "Coffee", color: BABYLON.Color3.FromHexString("#6e4c30") },
    { name: "Metallic Bronze", color: BABYLON.Color3.FromHexString("#a26d3f") },
    { name: "Peru", color: BABYLON.Color3.FromHexString("#ce9248") },
    { name: "Earth Yellow", color: BABYLON.Color3.FromHexString("#dab163") },
    { name: "Flax", color: BABYLON.Color3.FromHexString("#e8d282") },
    { name: "Blond", color: BABYLON.Color3.FromHexString("#f7f3b7") },
    { name: "Japanese Indigo", color: BABYLON.Color3.FromHexString("#1e4044") },
    { name: "Bangladesh Green", color: BABYLON.Color3.FromHexString("#006554") },
    { name: "Sea Green", color: BABYLON.Color3.FromHexString("#26854c") },
    { name: "Apple", color: BABYLON.Color3.FromHexString("#5ab552") },
    { name: "Kiwi", color: BABYLON.Color3.FromHexString("#9de64e") },
    { name: "Dark Cyan", color: BABYLON.Color3.FromHexString("#008b8b") },
    { name: "Forest Green", color: BABYLON.Color3.FromHexString("#62a477") },
    { name: "Laurel Green", color: BABYLON.Color3.FromHexString("#a6cb96") },
    { name: "Tea Green", color: BABYLON.Color3.FromHexString("#d3eed3") },
    { name: "American Blue", color: BABYLON.Color3.FromHexString("#3e3b65") },
    { name: "Violet-Blue", color: BABYLON.Color3.FromHexString("#3859b3") },
    { name: "Bleu De France", color: BABYLON.Color3.FromHexString("#3388de") },
    { name: "Picton Blue", color: BABYLON.Color3.FromHexString("#36c5f4") },
    { name: "Aquamarine", color: BABYLON.Color3.FromHexString("#6dead6") },
    { name: "Dark Blue-Gray", color: BABYLON.Color3.FromHexString("#5e5b8c") },
    { name: "Purple Mountain Majesty", color: BABYLON.Color3.FromHexString("#8c78a5") },
    { name: "Pastel Purple", color: BABYLON.Color3.FromHexString("#b0a7b8") },
    { name: "Soap", color: BABYLON.Color3.FromHexString("#deceed") },
    { name: "Sugar Plum", color: BABYLON.Color3.FromHexString("#9a4d76") },
    { name: "Sky Magenta", color: BABYLON.Color3.FromHexString("#c878af") },
    { name: "Pale Violet", color: BABYLON.Color3.FromHexString("#cc99ff") },
    { name: "Begonia", color: BABYLON.Color3.FromHexString("#fa6e79") },
    { name: "Baker-Miller Pink", color: BABYLON.Color3.FromHexString("#ffa2ac") },
    { name: "Light Red", color: BABYLON.Color3.FromHexString("#ffd1d5") },
    { name: "Misty Rose", color: BABYLON.Color3.FromHexString("#f6e8e0") },
    { name: "White", color: BABYLON.Color3.FromHexString("#ffffff") }
]

var DodoEyes = [
    { name: "Blue", file: "datas/textures/eye_0.png" },
    { name: "Green", file: "datas/textures/eye_1.png" },
    { name: "Yellow", file: "datas/textures/eye_2.png" },
    { name: "Brown", file: "datas/textures/eye_3.png" },
]

class DodoCollider extends BABYLON.Mesh {

    constructor(public dodo: Dodo) {
        super("dodo-collider");
    }
}

class Dodo extends Creature {

    public peerId: string = "";
    public gameId: number = -1;
    public stepDuration: number = 0.2;
    public colors: BABYLON.Color3[] = [];
    public eyeColor: number = 0;
    public style: string;
    public brain: Brain;

    public dodoCollider: DodoCollider;

    public targetLook: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    public body: BABYLON.Mesh;
    public bodyTargetPos: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public bodyVelocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public neck: BABYLON.Mesh;
    public head: BABYLON.Mesh;
    public headVelocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public eyes: BABYLON.Mesh[];
    public tail: BABYLON.Mesh;
    public tailTargetPos: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public tailFeathers: BABYLON.Mesh[];
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
    public feet: DodoFoot[];
    public hipPos: BABYLON.Vector3 = new BABYLON.Vector3(.20792, -0.13091, 0);
    public upperLegLength: number = 0.217;
    public lowerLegLength: number = 0.224;
    public upperLegs: BABYLON.Mesh[];
    public lowerLegs: BABYLON.Mesh[];
    public static OutlinedMesh(name: string): BABYLON.Mesh {
        let mesh = new BABYLON.Mesh(name);
        mesh.renderOutline = true;
        mesh.outlineColor.copyFromFloats(0, 0, 0);
        mesh.outlineWidth = 0.01;
        return mesh;
    }
    public eyeMaterial: BABYLON.StandardMaterial;

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

    constructor(name: string, game: Game, prop?: IDodoProp) {
        super(name, game);

        this.name = "Dodo_" + Math.floor(Math.random() * 10000).toFixed(0);
        this.peerId = name;

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
        }

        if (this.colors.length === 0) {
            let c1 = Math.floor(Math.random() * DodoColors.length);
            let c2 = Math.floor(Math.random() * DodoColors.length);
            let c3 = Math.floor(Math.random() * DodoColors.length);
            let c4 = Math.floor(Math.random() * DodoEyes.length);
            let style = c1.toString(16).padStart(2, "0") + c2.toString(16).padStart(2, "0") + c3.toString(16).padStart(2, "0") + c4.toString(16).padStart(2, "0");
            this.setStyle(style);
        }

        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.body = Dodo.OutlinedMesh("body");

        this.head = Dodo.OutlinedMesh("head");
        this.head.rotationQuaternion = BABYLON.Quaternion.Identity();

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
            Dodo.OutlinedMesh("tailFeatherR"),
            Dodo.OutlinedMesh("tailFeatherM"),
            Dodo.OutlinedMesh("tailFeatherL")
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
        this.dodoCollider.parent = this.body;
        BABYLON.CreateBoxVertexData({ width: 0.8, height: 1, depth: 1 }).applyToMesh(this.dodoCollider);
        this.dodoCollider.visibility = 0;

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
            Dodo.OutlinedMesh("upperLegR"),
            Dodo.OutlinedMesh("upperLegL")
        ];
        this.upperLegs[0].rotationQuaternion = BABYLON.Quaternion.Identity();
        this.upperLegs[1].rotationQuaternion = BABYLON.Quaternion.Identity();
        this.lowerLegs = [
            Dodo.OutlinedMesh("lowerLegR"),
            Dodo.OutlinedMesh("lowerLegL")
        ];
        this.lowerLegs[0].rotationQuaternion = BABYLON.Quaternion.Identity();
        this.lowerLegs[1].rotationQuaternion = BABYLON.Quaternion.Identity();

        this.feet = [
            new DodoFoot("footR", this),
            new DodoFoot("footL", this)
        ];
        this.feet[0].rotationQuaternion = BABYLON.Quaternion.Identity();
        this.feet[1].rotationQuaternion = BABYLON.Quaternion.Identity();

        this.neck = Dodo.OutlinedMesh("neck");

        this.hitCollider = new BABYLON.Mesh("hit-collider");
        this.hitCollider.parent = this;
        this.hitCollider.isVisible = false;
        this.hitCollider.parent = this.body;

        this.animateWait = Mummu.AnimationFactory.CreateWait(this);
        this.animateBodyHeight = Mummu.AnimationFactory.CreateNumber(this, this, "bodyHeight", undefined, undefined, Nabu.Easing.easeInOutSine);
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
    }

    public setStyle(style: string): void {
        this.style = style;
        this.colors[0] = DodoColors[parseInt(style.substring(0, 2), 16)].color;
        this.colors[1] = DodoColors[parseInt(style.substring(2, 4), 16)].color;
        this.colors[2] = DodoColors[parseInt(style.substring(4, 6), 16)].color;
        this.eyeColor = parseInt(style.substring(6, 8), 16);

        if (this._instantiated) {
            this.instantiate();
        }
    }

    private _instantiated: boolean = false;
    public async instantiate(): Promise<void> {
        this.material = this.game.defaultToonMaterial;

        this.body.material = this.material;
        this.head.material = this.material;

        this.eyeMaterial = new BABYLON.StandardMaterial("eye-material");
        this.eyeMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.eyeMaterial.diffuseTexture = new BABYLON.Texture(DodoEyes[this.eyeColor].file);
        this.eyeMaterial.emissiveColor.copyFromFloats(1, 1, 1);
        this.eyes[0].material = this.eyeMaterial;
        this.eyes[1].material = this.eyeMaterial;

        this.tailFeathers[0].material = this.material;
        this.tailFeathers[1].material = this.material;
        this.tailFeathers[2].material = this.material;

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

        //datas[1].applyToMesh(this.upperLegs[0]);
        //datas[1].applyToMesh(this.upperLegs[1]);
        //this.upperLegs[1].scaling.copyFromFloats(-1, 1, 1);
        //datas[2].applyToMesh(this.lowerLegs[0]);
        //datas[2].applyToMesh(this.lowerLegs[1]);
        //this.lowerLegs[1].scaling.copyFromFloats(-1, 1, 1);
        //datas[3].applyToMesh(this.feet[0]);
        //datas[3].applyToMesh(this.feet[1]);
        //this.feet[1].scaling.copyFromFloats(-1, 1, 1);
        datas[0].applyToMesh(this.hitCollider);
        //datas[10].applyToMesh(this);

        /*
        let base = BABYLON.MeshBuilder.CreateSphere("base", { diameter: 0.3 });
        base.parent = this;
        base.material = material;
        
        let dir = BABYLON.MeshBuilder.CreateBox("dir", { width: 0.1, height: 0.3, depth: 1 });
        dir.position.z = 0.5;
        dir.parent = this;
        dir.material = material;
        */
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
        //this.tailEnd.dispose();
    }

    public setWorldPosition(p: BABYLON.Vector3): void {
        this.position.copyFrom(p);

        this.computeWorldMatrix(true);

        this.body.position.copyFrom(p);
        this.body.position.y += this.bodyHeight;
        this.bodyTargetPos.copyFrom(this.body.position);

        this.head.position.copyFrom(p);
        this.head.position.y += this.bodyHeight + 0.5;
        
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
    public async kill(): Promise<void> {
        if (this.lifeState >= LifeState.Dying) {
            return;
        }
        this.lifeState = LifeState.Dying;
        await this.animateWait(0.3);
        this.blink(1);
        await this.animateBodyHeight(1.02, 1, Nabu.Easing.easeOutElastic);

        let explosionCloud = new Explosion(this.game);
        explosionCloud.origin.copyFrom(this.body.absolutePosition);
        explosionCloud.setRadius(0.6);
        explosionCloud.color = new BABYLON.Color3(0.2, 0.2, 0.2);
        explosionCloud.lifespan = 3;
        explosionCloud.maxOffset = new BABYLON.Vector3(0, 0.4, 0);
        explosionCloud.tZero = 0.8;
        explosionCloud.boom();

        await this.animateWait(0.1);

        let explosionFire = new Explosion(this.game);
        explosionFire.origin.copyFrom(this.body.absolutePosition);
        explosionFire.setRadius(0.45);
        explosionFire.color = BABYLON.Color3.FromHexString("#ff7b00");
        explosionFire.lifespan = 1;
        explosionFire.tZero = 1;
        explosionFire.boom();

        let explosionFireYellow = new Explosion(this.game);
        explosionFireYellow.origin.copyFrom(this.body.absolutePosition);
        explosionFireYellow.setRadius(0.45);
        explosionFireYellow.color = BABYLON.Color3.FromHexString("#ffdd00");
        explosionFireYellow.lifespan = 1;
        explosionFireYellow.tZero = 1;
        explosionFireYellow.boom();

        this.body.visibility = 0;
        this.body.getChildMeshes().forEach(child => {
            child.visibility = 0;
        })

        await this.animateWait(2);
        await this.animateBodyHeight(this.foldedBodyHeight, 0.5, Nabu.Easing.easeInCubic);
        await this.animateWait(0.3);
        
        this.dispose();
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
            let originQ = foot.rotationQuaternion.clone();
            let t0 = performance.now() / 1000;
            let step = () => {
                let t = performance.now() / 1000;
                let f = (t - t0) / duration;
                if (f < 1) {
                    //f = Nabu.Easing.easeInSine(f);
                    BABYLON.Quaternion.SlerpToRef(originQ, targetQ, f, foot.rotationQuaternion);
                    BABYLON.Vector3.LerpToRef(origin, target, f, foot.position);
                    foot.position.y += Math.min(dist, this.stepHeight) * Math.sin(f * Math.PI);
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

    public walking: number = 0;
    public footIndex: number = 0;
    public walk(): void {
        if (this.walking === 0 && this.isAlive) {
            let deltaPos = this.position.subtract(this.body.position);
            deltaPos.y = 0;
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
                spread += 0.15 * Math.abs(animatedSpeedRight) / (0.5 * this.speed)
                let origin = new BABYLON.Vector3(xFactor * spread, 1, 0);
                let up = BABYLON.Vector3.Up();
                BABYLON.Vector3.TransformCoordinatesToRef(origin, this.getWorldMatrix(), origin);
                origin.addInPlace(this.forward.scale(animatedSpeedForward * 0.2)).addInPlace(this.right.scale(animatedSpeedRight * 0.2));

                let ray = new BABYLON.Ray(origin, new BABYLON.Vector3(0, -1, 0));
                let pick = this._scene.pickWithRay(ray, (mesh => {
                    return mesh.name.startsWith("chunck") || mesh instanceof HomeMenuPlate;
                }));
                if (pick.hit) {
                    origin = pick.pickedPoint;
                    up = pick.getNormal(true, false);

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

    private _lastR: number = 0;
    public update(dt: number) {
        if (this.brain) {
            this.brain.update(dt);
        }

        this.walk();

        let dR = this.r - this._lastR;
        this._lastR = this.r;
        this.animatedRSpeed = dR / dt;

        let f = 0.5;
        let dy = this.feet[1].position.y - this.feet[0].position.y;
        this.position.y = Math.min(this.feet[0].position.y, this.feet[1].position.y);
        f += dy / this.stepHeight * 0.4;
        f = Nabu.MinMax(f, 0.2, 0.8);
        f = 0.5;

        let halfFeetDistance = BABYLON.Vector3.Distance(this.feet[0].position, this.feet[1].position) * 0.5;
        let totalLegLength = this.upperLegLength + this.lowerLegLength;
        let maxBodyHeight = Math.sqrt(Math.max(0, totalLegLength * totalLegLength - halfFeetDistance * halfFeetDistance)) - this.hipPos.y;
        maxBodyHeight = Math.max(maxBodyHeight, this.foldedBodyHeight);
        this.bodyTargetPos.copyFrom(this.feet[0].position).addInPlace(this.feet[1].position).scaleInPlace(0.5);
        this.bodyTargetPos.y += Math.min(this.bodyHeight, maxBodyHeight);

        //Mummu.DrawDebugPoint(this.position, 2, BABYLON.Color3.Blue());
        
        let pForce = this.bodyTargetPos.subtract(this.body.position);
        pForce.scaleInPlace(80 * dt);

        this.bodyVelocity.addInPlace(pForce);
        this.bodyVelocity.scaleInPlace(Nabu.Easing.smoothNSec(1 / dt, 0.2));
        //if (this.bodyVelocity.length() > this.speed * 3) {
        //    this.bodyVelocity.normalize().scaleInPlace(this.speed * 3);
        //} 

        this.body.position.addInPlace(this.bodyVelocity.scale(dt));
        //this.body.position.copyFrom(this.bodyTargetPos);

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

        let headForce = neck.subtract(this.head.position);
        headForce.scaleInPlace(60 * dt);
        this.headVelocity.scaleInPlace(Nabu.Easing.smoothNSec(1 / dt, 0.3));
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
        Mummu.CatmullRomPathInPlace(tailPoints, this.body.forward.scale(3), BABYLON.Vector3.Up().scale(2));

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
}