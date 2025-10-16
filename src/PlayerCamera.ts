class PlayerCamera extends BABYLON.FreeCamera {

    public player: Dodo;
    private _verticalAngle: number = 0;
    public get verticalAngle(): number {
        return this._verticalAngle;
    }
    public set verticalAngle(v: number) {
        this._verticalAngle = Nabu.MinMax(v, - Math.PI / 2, Math.PI / 2);
    }
    public pivotHeight: number = 1.5;
    public pivotHeightHome: number = 0.5;
    public pivotRecoil: number = 4;
    public playerPosY: number = 0;
    public dialogOffset: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public dialogRotation: number = 0;

    constructor(public game: Game) {
        super("player-camera", BABYLON.Vector3.Zero());
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
                let f = Nabu.Easing.smoothNSec(1 / dt, 0.5);
                if (this.game.playerBrain.inDialog) {
                    let dialogOffset = this.game.playerBrain.inDialog.dodo.position.subtract(this.player.position).scale(0.5);
                    dialogOffset.y -= this.pivotHeight * 0.5;
                    BABYLON.Vector3.LerpToRef(this.dialogOffset, dialogOffset, 1 - f, this.dialogOffset);
                    this.dialogRotation = this.dialogRotation * f + Math.PI * 0.5 * (1 - f);
                }
                else {
                    this.dialogOffset.scaleInPlace(f);
                    this.dialogRotation *= f;
                }
                let target = this.player.forward.scale(- this.pivotRecoil);
                Mummu.RotateInPlace(target, this.player.right, this.verticalAngle);
                Mummu.RotateInPlace(target, BABYLON.Axis.Y, this.dialogRotation);
                let targetLook = target.clone().scaleInPlace(-5);

                let fYSmooth = Nabu.Easing.smoothNSec(1 / dt, 0.1);
                this.playerPosY = this.playerPosY * fYSmooth + this.player.position.y * (1 - fYSmooth);
                target.y += this.pivotHeight;
                target.x += this.player.position.x;
                target.y += this.playerPosY;
                target.z += this.player.position.z;
                target.addInPlace(this.dialogOffset);

                targetLook.y += this.pivotHeight;
                targetLook.x += this.player.position.x;
                targetLook.y += this.player.position.y;
                targetLook.z += this.player.position.z;
                targetLook.addInPlace(this.dialogOffset);

                this.position.copyFrom(target);

                let dir = targetLook.subtract(this.position);
                this.rotationQuaternion = Mummu.QuaternionFromZYAxis(dir, BABYLON.Axis.Y);
            }
        }
    }
}