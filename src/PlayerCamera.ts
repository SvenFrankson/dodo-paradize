class PlayerCamera extends BABYLON.FreeCamera {

    public player: Dodo;
    private _verticalAngle: number = 0;
    public get verticalAngle(): number {
        return this._verticalAngle;
    }
    public set verticalAngle(v: number) {
        this._verticalAngle = Nabu.MinMax(v, - Math.PI / 2, Math.PI / 2);
    }
    public pivotHeight: number = 1;
    public pivotRecoil: number = 4;
    public playerPosY: number = 0;

    constructor(public game: Game) {
        super("player-camera", BABYLON.Vector3.Zero());
    }

    public onUpdate(dt: number): void {
        if (this.player) {
            let target = this.player.forward.scale(- this.pivotRecoil);
            Mummu.RotateInPlace(target, this.player.right, this.verticalAngle);
            let targetLook = target.clone().scaleInPlace(-5);

            let fYSmooth = Nabu.Easing.smoothNSec(1 / dt, 1);
            this.playerPosY = this.playerPosY * fYSmooth + this.player.position.y * (1 - fYSmooth);
            target.y += this.pivotHeight;
            target.x += this.player.position.x;
            target.y += this.playerPosY;
            target.z += this.player.position.z;

            targetLook.y += this.pivotHeight;
            targetLook.x += this.player.position.x;
            targetLook.y += this.player.position.y;
            targetLook.z += this.player.position.z;

            this.position.copyFrom(target);

            let dir = targetLook.subtract(this.position);
            this.rotationQuaternion = Mummu.QuaternionFromZYAxis(dir, BABYLON.Axis.Y);
        }
    }
}