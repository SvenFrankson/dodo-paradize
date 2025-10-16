/// <reference path="SubBrain.ts"/>

class BrainIdle extends SubBrain {

    public positionZero: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public positionRadius: number = 2;

    private _targetPos: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _targetR: number = 0;
    private _targetLook: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _speed: number = 1;

    private _currentCooldown: number = 0;
    private _currentSkip: number = 0;

    public initialize(): void {
        this._targetPos.copyFrom(this.positionZero);
    }

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
                    if (Math.random() < 0.5) {
                        this._targetPos.copyFromFloats(0, 0, Math.random() * this.positionRadius);
                        Mummu.RotateInPlace(this._targetPos, BABYLON.Axis.Y, Math.random() * 2 * Math.PI);
                        this._targetPos.addInPlace(this.positionZero);
                    }

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

        if (BABYLON.Vector3.Distance(this.dodo.position, this._targetPos) > ONE_cm_SQUARED) {
            let f = Nabu.Easing.smoothNSec(1 / dt, 0.1);
            let targetAnimatedSpeed = this._targetPos.subtract(this.dodo.position);
            if (targetAnimatedSpeed.lengthSquared() > 1) {
                targetAnimatedSpeed.normalize();
            }
            BABYLON.Vector3.LerpToRef(this.dodo.animatedSpeed, targetAnimatedSpeed, 1 - f, this.dodo.animatedSpeed);
            Mummu.StepToRef(this.dodo.position, this._targetPos, 1 * dt, this.dodo.position);  
        }
        else {
            this.dodo.animatedSpeed.copyFromFloats(0, 0, 0);
        }
    }
}