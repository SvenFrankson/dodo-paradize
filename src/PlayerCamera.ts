class PlayerCamera extends BABYLON.FreeCamera {

    public player: Dodo;
    private _verticalAngle: number = 0;
    public get verticalAngle(): number {
        return this._verticalAngle;
    }
    public set verticalAngle(v: number) {
        this._verticalAngle = Nabu.MinMax(v, - Math.PI / 2, Math.PI / 2);
    }
    public pivotHeight: number = 2;
    public pivotRecoil: number = 4;

    constructor(public game: Game) {
        super("player-camera", BABYLON.Vector3.Zero());
    }

    public onUpdate(dt: number): void {
        if (this.player) {
            let target = this.player.forward.scale(- this.pivotRecoil);
            Mummu.RotateInPlace(target, this.player.right, this.verticalAngle);
            target.y += this.pivotHeight;
            target.addInPlace(this.player.position);

            this.position.scaleInPlace(0.99).addInPlace(target.scale(0.01));
            this.rotation.x = this.verticalAngle;
            this.rotation.y = - Mummu.AngleFromToAround(this.player.forward, BABYLON.Axis.Z, BABYLON.Axis.Y);
        }
    }
}