class PlayerCamera extends BABYLON.FreeCamera {

    public player: Dodo;
    private _verticalAngle: number = 0;
    public get verticalAngle(): number {
        return this._verticalAngle;
    }
    public set verticalAngle(v: number) {
        this._verticalAngle = Nabu.MinMax(v, - Math.PI / 2, Math.PI / 2);
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
        this.minZ = 0.1;
        this.maxZ = 1000;
    }

    public onUpdate(dt: number): void {
        if (this.player) {
            if (this.game.gameMode === GameMode.Home) {
                let target = new BABYLON.Vector3(0, 0, - this.pivotRecoil);
                Mummu.RotateInPlace(target, BABYLON.Axis.X, this.verticalAngle);
                let targetLook = target.clone().scaleInPlace(-5);

                let fYSmooth = Nabu.Easing.smoothNSec(1 / dt, 1);
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
                    this.dialogRotation = this.dialogRotation * fDialogTransition + Math.PI * 0.5 * (1 - fDialogTransition);
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

                let fRecoilSmooth = Nabu.Easing.smoothNSec(1 / dt, 0.3);
                let pick = this.game.scene.pickWithRay(ray, (mesh => { return mesh instanceof ConstructionMesh; }));
                if (pick && pick.hit) {
                    this.currentPivotRecoil = this.currentPivotRecoil * fRecoilSmooth + pick.distance * (1 - fRecoilSmooth);
                }
                else {
                    this.currentPivotRecoil = this.currentPivotRecoil * fRecoilSmooth + this.pivotRecoil * (1 - fRecoilSmooth);
                }
                console.log(this.currentPivotRecoil.toFixed(3));

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