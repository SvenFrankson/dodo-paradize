/// <reference path="SubBrain.ts"/>

class BrainIdle extends SubBrain {

    private _targetQ: BABYLON.Quaternion = BABYLON.Quaternion.Identity();
    private _targetLook: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _targetBodyHeight: number = 0.95;

    public update(dt: number): void {
        if (Math.random() < 0.001) {
            let targetDir = this.joey.forward.clone();
            Mummu.RotateInPlace(targetDir, this.joey.up, (2 * Math.random() - 1) * Math.PI / 3);
            targetDir.normalize();
            Mummu.QuaternionFromZYAxisToRef(targetDir, this.joey.up, this._targetQ);

            this._targetBodyHeight = 0.8 + 0.4 * Math.random();
        }

        if (Math.random() < 0.003) {
            this._targetLook.copyFrom(this.joey.position);
            this._targetLook.addInPlace(this.joey.forward.scale(10));
            this._targetLook.x += Math.random() * 10 - 5;
            this._targetLook.y += Math.random() * 10 - 5;
            this._targetLook.z += Math.random() * 10 - 5;
        }
        
        this.joey.currentSpeed *= 0.99;
        BABYLON.Quaternion.SlerpToRef(this.joey.rotationQuaternion, this._targetQ, 0.01, this.joey.rotationQuaternion);
        this.joey.bodyHeight = this.joey.bodyHeight * 0.99 + this._targetBodyHeight * 0.01;
        BABYLON.Vector3.SlerpToRef(this.joey.targetLook, this._targetLook, 0.03, this.joey.targetLook);
    }
}