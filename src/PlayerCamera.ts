class PlayerCamera extends BABYLON.FreeCamera {

    public useOutline: boolean = true;
    public noOutlineCamera: BABYLON.FreeCamera;

    public player: Dodo;
    private _verticalAngle: number = 0;
    public get verticalAngle(): number {
        return this._verticalAngle;
    }
    public set verticalAngle(v: number) {
        this._verticalAngle = Nabu.MinMax(v, - Math.PI / 2 * 0.99, Math.PI / 2 * 0.99);
    }
    public pivotHeight: number = 1.7;
    public pivotHeightHome: number = 0.5;
    public pivotRecoil: number = 4;
    public currentPivotRecoil: number = 4;
    public playerPosY: number = 0;
    public dialogOffset: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public dialogRotation: number = 0;

    constructor(public game: Game) {
        super("player-camera", BABYLON.Vector3.Zero());
        this.minZ = 0.2;
        this.maxZ = 2000;

        if (this.useOutline) {
            const rtt = new BABYLON.RenderTargetTexture('render target', { width: this.game.engine.getRenderWidth(), height: this.game.engine.getRenderHeight() }, this.game.scene);
            rtt.samples = 1;
            this.outputRenderTarget = rtt;
    
            this.noOutlineCamera = new BABYLON.FreeCamera(
                "no-outline-camera",
                BABYLON.Vector3.Zero(),
                this.game.scene
            );

            this.noOutlineCamera.minZ = 0.2;
            this.noOutlineCamera.maxZ = 2000;
            this.noOutlineCamera.layerMask = NO_OUTLINE_LAYERMASK;
            this.noOutlineCamera.parent = this;
    
            let postProcess = OutlinePostProcess.AddOutlinePostProcess(this);
            postProcess.onSizeChangedObservable.add(() => {
                if (!postProcess.inputTexture.depthStencilTexture) {
                    postProcess.inputTexture.createDepthStencilTexture(0, true, false, 4);
                    postProcess.inputTexture._shareDepth(rtt.renderTarget);
                }
            });
            
            const pp = new BABYLON.PassPostProcess("pass", 1, this.noOutlineCamera);
            pp.inputTexture = rtt.renderTarget;
            pp.autoClear = false;

            this.game.engine.onResizeObservable.add(() => {
                //console.log("w " + this.game.engine.getRenderWidth());
                //console.log("h " + this.game.engine.getRenderHeight());
                //postProcess.getEffect().setFloat("width", this.game.engine.getRenderWidth());
                //postProcess.getEffect().setFloat("height", this.game.engine.getRenderHeight());
                rtt.resize({ width: this.game.engine.getRenderWidth(), height: this.game.engine.getRenderHeight() });
                postProcess.inputTexture.createDepthStencilTexture(0, true, false, 4);
                postProcess.inputTexture._shareDepth(rtt.renderTarget);
                this.outputRenderTarget = rtt;
                pp.inputTexture = rtt.renderTarget;
            });

            this.game.scene.activeCameras = [this, this.noOutlineCamera];
        }
        else {
            this.layerMask |= NO_OUTLINE_LAYERMASK;
        }
    }

    public bestDialogRotation: number = Math.PI * 0.5;
    public onUpdate(dt: number): void {
        if (this.player) {
            if (this.game.gameMode === GameMode.Home) {
                let target = new BABYLON.Vector3(0, 0, - this.pivotRecoil);
                Mummu.RotateInPlace(target, BABYLON.Axis.X, this.verticalAngle);
                let targetLook = target.clone().scaleInPlace(-5);

                let fYSmooth = Nabu.Easing.smoothNSec(1 / dt, 0.1);
                this.playerPosY = this.playerPosY * fYSmooth + this.player.position.y * (1 - fYSmooth);
                target.y += this.pivotHeightHome;
                target.x += this.player.position.x;
                target.y += this.playerPosY;
                target.z += this.player.position.z;

                targetLook.y += this.pivotHeightHome;
                targetLook.x += this.player.position.x;
                targetLook.y += this.player.position.y;
                targetLook.z += this.player.position.z;

                this.position.copyFrom(target);
                
                if (IsVertical) {
                    this.position.x += 0.4;
                }

                let dir = targetLook.subtract(this.position);
                this.rotationQuaternion = Mummu.QuaternionFromZYAxis(dir, BABYLON.Axis.Y);
            }
            else if (this.game.gameMode === GameMode.Playing) {
                let fDialogTransition = Nabu.Easing.smoothNSec(1 / dt, 0.5);
                if (this.game.playerBrain.inDialog) {
                    let dialogOffset = this.game.playerBrain.inDialog.dodo.position.subtract(this.player.position).scale(0.5);
                    dialogOffset.y -= this.pivotHeight;
                    dialogOffset.y += 0.5;
                    BABYLON.Vector3.LerpToRef(this.dialogOffset, dialogOffset, 1 - fDialogTransition, this.dialogOffset);
                    this.dialogRotation = this.dialogRotation * fDialogTransition + this.bestDialogRotation * (1 - fDialogTransition);
                    this.verticalAngle = this.verticalAngle * fDialogTransition + Math.PI / 8 * (1 - fDialogTransition);
                }
                else {
                    this.dialogOffset.scaleInPlace(fDialogTransition);
                    this.dialogRotation *= fDialogTransition;
                }

                let fYSmooth = Nabu.Easing.smoothNSec(1 / dt, 0.1);
                this.playerPosY = this.playerPosY * fYSmooth + this.player.position.y * (1 - fYSmooth);

                let camDir = this.player.forward;
                Mummu.RotateInPlace(camDir, this.player.right, this.verticalAngle);
                Mummu.RotateInPlace(camDir, BABYLON.Axis.Y, this.dialogRotation);

                let camPivot = new BABYLON.Vector3(this.player.position.x, this.pivotHeight + this.playerPosY, this.player.position.z);
                camPivot.addInPlace(this.dialogOffset);

                let ray = new BABYLON.Ray(camPivot, camDir.scale(-1), this.pivotRecoil);

                let fRecoilSmooth = Nabu.Easing.smoothNSec(1 / dt, this.game.playerBrain.inDialog ? 0.5 : 0.1);
                let pick = this.game.scene.pickWithRay(ray, (mesh => { return mesh instanceof ConstructionMesh; }));
                if (pick && pick.hit) {
                    this.currentPivotRecoil = this.currentPivotRecoil * fRecoilSmooth + pick.distance * (1 - fRecoilSmooth);
                }
                else {
                    this.currentPivotRecoil = this.currentPivotRecoil * fRecoilSmooth + this.pivotRecoil * (1 - fRecoilSmooth);
                }

                let target = camDir.scale(- this.currentPivotRecoil);
                target.addInPlace(camPivot);

                let targetLook = camDir.scale(10);
                targetLook.addInPlace(camPivot);

                this.position.copyFrom(target);

                let dir = targetLook.subtract(this.position);
                this.rotationQuaternion = Mummu.QuaternionFromZYAxis(dir, BABYLON.Axis.Y);
            }
        }
    }
}