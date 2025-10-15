/// <reference path="SubBrain.ts"/>

class BrainIdle extends SubBrain {

    private _targetR: number = 0;
    private _targetLook: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _speed: number = 1;

    private _currentCooldown: number = 0;
    private _currentSkip: number = 0;

    public update(dt: number): void {
        this._currentCooldown -= dt;
        if (this._currentCooldown <= 0) {
            let dirToPlayer = this.game.playerDodo.position.subtract(this.dodo.position);
            let distToPlayer = dirToPlayer.length();
            if (distToPlayer < 5) {
                this._targetLook = this.game.playerDodo.head.position;
                if (Mummu.Angle(this.dodo.forward, dirToPlayer) > Math.PI / 3) {
                    this._targetR = Mummu.AngleFromToAround(BABYLON.Axis.Z, dirToPlayer, BABYLON.Axis.Y);
                }
                this._speed = 1;
                this._currentSkip = 0;
            }
            else {
                this._currentSkip--;
                if (this._currentSkip <= 0) {
                    let dirToLook = new BABYLON.Vector3(0, - 3 + 6 * Math.random(), 10);
                    Mummu.RotateInPlace(dirToLook, BABYLON.Axis.Y, this.dodo.r + 0.6 * Math.PI * (Math.random() - 0.5));
                    this._targetLook = dirToLook.add(this.dodo.position);
                    if (Mummu.Angle(this.dodo.forward, dirToLook) > Math.PI / 16) {
                        this._targetR = Mummu.AngleFromToAround(BABYLON.Axis.Z, dirToLook, BABYLON.Axis.Y);
                    }
                    this._speed = 3;
                    this._currentSkip = 8;
                }
                
            }
            this._currentCooldown = 0.5 * 0.9 + 0.2 * Math.random();
        }
        
        let f = Nabu.Easing.smoothNSec(1 / dt, 0.3 * this._speed);
        BABYLON.Vector3.LerpToRef(this.dodo.targetLook, this._targetLook, 1 - f, this.dodo.targetLook);
        f = Nabu.Easing.smoothNSec(1 / dt, 1 * this._speed);
        this.dodo.r = Nabu.LerpAngle(this.dodo.r, this._targetR, 1 - f);
    }
}