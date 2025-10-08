/// <reference path="Creature.ts"/>

interface IDodoProp {
    speed?: number;
    stepDuration?: number;
    color?: BABYLON.Color3;
    bounty?: number;
    hasWings?: boolean;
}

class Dodo extends Creature {

    public dodoId: string = "";
    public stepDuration: number = 0.2;
    public colors: BABYLON.Color3[] = [];
    public brain: Brain;

    public targetLook: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    public body: BABYLON.Mesh;
    public bodyTargetPos: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public bodyVelocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public neck: BABYLON.Mesh;
    public head: BABYLON.Mesh;
    public headVelocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public eyes: BABYLON.Mesh[];
    //public topEyelids: BABYLON.Mesh[];
    //public bottomEyelids: BABYLON.Mesh[];
    //public wing: BABYLON.Mesh;
    //public canon: BABYLON.Mesh;
    public stepHeight: number = 0.2;
    public foldedBodyHeight: number = 0.1;
    public unfoldedBodyHeight: number = 0.6;
    public bodyHeight: number = this.foldedBodyHeight;
    public animateWait = Mummu.AnimationFactory.EmptyVoidCallback;
    public animateBodyHeight = Mummu.AnimationFactory.EmptyNumberCallback;
    //public animateCanonRotX = Mummu.AnimationFactory.EmptyNumberCallback;
    //public animateTopEyeLids = [Mummu.AnimationFactory.EmptyNumberCallback];
    //public animateBottomEyeLids = [Mummu.AnimationFactory.EmptyNumberCallback];
    public feet: DodoFoot[];
    public upperLegLength: number = 0.27;
    public lowerLegLength: number = 0.48;
    public upperLegs: BABYLON.Mesh[];
    public lowerLegs: BABYLON.Mesh[];
    public static OutlinedMesh(name: string): BABYLON.Mesh {
        let mesh = new BABYLON.Mesh(name);
        //mesh.renderOutline = true;
        //mesh.outlineColor.copyFromFloats(0, 0, 0);
        //mesh.outlineWidth = 0.03;
        return mesh;
    }

    constructor(name: string, game: Game, prop?: IDodoProp) {
        super(name, game);

        this.name = "Dodo_" + Math.floor(Math.random() * 10000).toFixed(0);
        this.dodoId = name;

        this.colors = [
            new BABYLON.Color3(Math.random(), Math.random(), Math.random()),
            new BABYLON.Color3(Math.random(), Math.random(), Math.random()),
            new BABYLON.Color3(Math.random(), Math.random(), Math.random())
        ];

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
            if (prop.color) {
                this.colors[0] = prop.color;
            }
        }

        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.body = Dodo.OutlinedMesh("body");

        this.head = Dodo.OutlinedMesh("head");
        this.head.rotationQuaternion = BABYLON.Quaternion.Identity();

        this.eyes = [
            Dodo.OutlinedMesh("eyeR"),
            Dodo.OutlinedMesh("eyeL")
        ];
        this.eyes[0].parent = this.head;
        this.eyes[0].position.copyFromFloats(0.11, 0.1, 0.12).scaleInPlace(0.6);
        this.eyes[1].parent = this.head;
        this.eyes[1].position.copyFromFloats(-0.11, 0.1, 0.12).scaleInPlace(0.6);

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

        this.neck = new BABYLON.Mesh("neck");

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

    public async instantiate(): Promise<void> {

        this.material = this.game.defaultToonMaterial;

        this.body.material = this.material;
        this.head.material = this.material;

        this.eyes[0].material = this.material;
        this.eyes[1].material = this.material;

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

        this.hitpoint = this.stamina;

        setInterval(() => {
            this.eyeBlink();
        }, 5000);
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
        
        let pRight = new BABYLON.Vector3(0.4, 0.2, this.speed * 0.2);
        BABYLON.Vector3.TransformCoordinatesToRef(pRight, this.getWorldMatrix(), this.feet[0].position);
        let pLeft = new BABYLON.Vector3(-0.4, 0.2, this.speed * 0.2);
        BABYLON.Vector3.TransformCoordinatesToRef(pLeft, this.getWorldMatrix(), this.feet[1].position);
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
            let xFactor = this.footIndex === 0 ? 1 : - 1;
            let spread = 0.25;
            let animatedSpeedForward = BABYLON.Vector3.Dot(this.animatedSpeed, this.forward);
            let animatedSpeedRight = BABYLON.Vector3.Dot(this.animatedSpeed, this.right);
            spread += 0.15 * Math.abs(animatedSpeedRight) / (0.5 * this.speed)
            let origin = new BABYLON.Vector3(xFactor * spread, 1, 0);
            let up = BABYLON.Vector3.Up();
            BABYLON.Vector3.TransformCoordinatesToRef(origin, this.getWorldMatrix(), origin);
            origin.addInPlace(this.forward.scale(animatedSpeedForward * 0.4)).addInPlace(this.right.scale(animatedSpeedRight * 0.4));

            let ray = new BABYLON.Ray(origin, new BABYLON.Vector3(0, -1, 0));
            let pick = this._scene.pickWithRay(ray, (mesh => {
                return mesh.name.startsWith("chunck");
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

    public static FlatManhattan(from: BABYLON.Vector3, to: BABYLON.Vector3): number {
        return Math.abs(from.x - to.x) + Math.abs(from.z - to.z);
    }

    public update(dt: number) {
        if (this.brain) {
            this.brain.update(dt);
        }

        this.walk();

        let f = 0.5;
        let dy = this.feet[1].position.y - this.feet[0].position.y;
        this.position.y = Math.min(this.feet[0].position.y, this.feet[1].position.y);
        f += dy / this.stepHeight * 0.4;
        f = Nabu.MinMax(f, 0.2, 0.8);

        this.bodyTargetPos.copyFrom(this.feet[0].position.scale(f)).addInPlace(this.feet[1].position.scale(1 - f));
        Mummu.DrawDebugPoint(this.feet[0].position, 2, BABYLON.Color3.Red());
        Mummu.DrawDebugPoint(this.feet[1].position, 2, BABYLON.Color3.Green());
        this.bodyTargetPos.y += this.bodyHeight;

        Mummu.DrawDebugPoint(this.position, 2, BABYLON.Color3.Blue());
        
        let pForce = this.bodyTargetPos.subtract(this.body.position);
        pForce.scaleInPlace(60 * dt);

        this.bodyVelocity.addInPlace(pForce);
        this.bodyVelocity.scaleInPlace(Nabu.Easing.smoothNSec(1 / dt, 0.25));
        //if (this.bodyVelocity.length() > this.speed * 3) {
        //    this.bodyVelocity.normalize().scaleInPlace(this.speed * 3);
        //} 

        this.body.position.addInPlace(this.bodyVelocity.scale(dt));
        //this.body.position.copyFrom(this.bodyTargetPos);

        let right = this.feet[0].position.subtract(this.feet[1].position);
        right.normalize();
        right.addInPlace(this.right.scale(3));
        right.normalize();
        this.body.rotationQuaternion = BABYLON.Quaternion.Slerp(this.rotationQuaternion, Mummu.QuaternionFromXYAxis(right, this.up), 0.9);

        this.body.freezeWorldMatrix();

        let hipR = new BABYLON.Vector3(0.25, 0, -0.12);
        BABYLON.Vector3.TransformCoordinatesToRef(hipR, this.body.getWorldMatrix(), hipR);

        let kneeR = hipR.clone().addInPlace(this.feet[0].position).scaleInPlace(0.5);
        kneeR.subtractInPlace(this.forward);
        kneeR.addInPlace(this.right.scale(0.1));

        Mummu.ForceDistanceFromOriginInPlace(kneeR, hipR, this.upperLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeR, this.feet[0].position, this.lowerLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeR, hipR, this.upperLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeR, this.feet[0].position, this.lowerLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeR, hipR, this.upperLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeR, this.feet[0].position, this.lowerLegLength);

        Mummu.QuaternionFromZYAxisToRef(kneeR.subtract(hipR), hipR.subtract(this.feet[0].position), this.upperLegs[0].rotationQuaternion);
        Mummu.QuaternionFromZYAxisToRef(this.feet[0].position.subtract(kneeR), hipR.subtract(this.feet[0].position), this.lowerLegs[0].rotationQuaternion);

        this.upperLegs[0].position.copyFrom(hipR);
        this.lowerLegs[0].position.copyFrom(kneeR);

        let hipL = new BABYLON.Vector3(- 0.25, 0, -0.12);
        BABYLON.Vector3.TransformCoordinatesToRef(hipL, this.body.getWorldMatrix(), hipL);

        let kneeL = hipL.clone().addInPlace(this.feet[1].position).scaleInPlace(0.5);
        kneeL.subtractInPlace(this.forward);
        kneeL.subtractInPlace(this.right.scale(0.1));

        Mummu.ForceDistanceFromOriginInPlace(kneeL, hipL, this.upperLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeL, this.feet[1].position, this.lowerLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeL, hipL, this.upperLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeL, this.feet[1].position, this.lowerLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeL, hipL, this.upperLegLength);
        Mummu.ForceDistanceFromOriginInPlace(kneeL, this.feet[1].position, this.lowerLegLength);

        Mummu.QuaternionFromZYAxisToRef(kneeL.subtract(hipL), hipL.subtract(this.feet[1].position), this.upperLegs[1].rotationQuaternion);
        Mummu.QuaternionFromZYAxisToRef(this.feet[1].position.subtract(kneeL), hipL.subtract(this.feet[1].position), this.lowerLegs[1].rotationQuaternion);

        this.upperLegs[1].position.copyFrom(hipL);
        this.lowerLegs[1].position.copyFrom(kneeL);

        let feetDeltaY = Math.abs(this.feet[0].position.y - this.feet[1].position.y);
        let neck = new BABYLON.Vector3(0, 0, 0);        
        neck.copyFrom(this.feet[0].position.scale(f)).addInPlace(this.feet[1].position.scale(1 - f));
        neck.y += this.bodyHeight + 0.42 - feetDeltaY * 0.25;
        neck.addInPlace(this.forward.scale(0.4));

        let headForce = neck.subtract(this.head.position);
        headForce.scaleInPlace(60 * dt);
        this.headVelocity.scaleInPlace(Nabu.Easing.smoothNSec(1 / dt, 0.3));
        this.headVelocity.addInPlace(headForce);

        this.head.position.addInPlace(this.headVelocity.scale(dt));

        let forward = this.forward;
        if (this.targetLook) {
            forward.copyFrom(this.targetLook).subtractInPlace(this.head.position).normalize();
        }
        let q = Mummu.QuaternionFromZYAxis(forward, this.up);
        BABYLON.Quaternion.SlerpToRef(this.head.rotationQuaternion, BABYLON.Quaternion.Slerp(this.body.rotationQuaternion, q, 0.5), 0.01, this.head.rotationQuaternion);

        let db = this.head.absolutePosition.add(this.head.forward.scale(0.5)).subtract(this.bodyTargetPos);
        db.scaleInPlace(2);
        let rComp = this.right.scale(BABYLON.Vector3.Dot(db, this.right));
        db.subtractInPlace(rComp.scale(2));

        let tailPoints = [new BABYLON.Vector3(0, 0.0, 0.21), this.head.absolutePosition];
        BABYLON.Vector3.TransformCoordinatesToRef(tailPoints[0], this.body.getWorldMatrix(), tailPoints[0]);

        Mummu.CatmullRomPathInPlace(tailPoints, this.body.forward.scale(2), BABYLON.Vector3.Up().scale(2));
        Mummu.CatmullRomPathInPlace(tailPoints, this.body.forward.scale(2), BABYLON.Vector3.Up().scale(2));

        let data = Mummu.CreateWireVertexData({
            path: tailPoints,
            radiusFunc: (f) => {
                return 0.20 - 0.15 * f;
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