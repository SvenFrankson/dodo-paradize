class BrainTravel extends SubBrain {

    public destination: BABYLON.Vector3;

    public update(dt: number): void {
        if (this.destination && this.dodo.lifeState === LifeState.Ok) {
            let dir = this.destination.subtract(this.dodo.position).normalize();
            //let bh = 1.2 - 0.6 * Math.abs(dir.y);
            //this.dodo.bodyHeight = this.dodo.bodyHeight * 0.99 + bh * 0.01;

            let rY = Mummu.AngleFromToAround(this.dodo.forward, dir, BABYLON.Axis.Y);
            let dRY = Nabu.MinMax(rY, - Math.PI / (4 * this.dodo.stepDuration) * dt, Math.PI / (4 * this.dodo.stepDuration) * dt);
            this.dodo.rotate(BABYLON.Axis.Y, dRY);

            let r = BABYLON.Vector3.Cross(BABYLON.Axis.Y, dir);
            let targetUp = BABYLON.Vector3.Cross(dir, r);
            targetUp.normalize();
            let newQ = Mummu.QuaternionFromYZAxis(targetUp, this.dodo.forward);
            BABYLON.Quaternion.SlerpToRef(this.dodo.rotationQuaternion, newQ, 0.01, this.dodo.rotationQuaternion);

            let speedFactor = 1;
            if (Math.abs(rY) > Math.PI / 4) {
                speedFactor = 1 - Math.abs(rY - Math.sign(rY) * Math.PI / 4) / (3 * Math.PI / 4);
            }
            speedFactor = speedFactor * speedFactor;
            let speed = speedFactor * this.dodo.speed;

            this.dodo.position.addInPlace(dir.scale(speed * dt));
            let fSpeed = Nabu.Easing.smoothNSec(1 / dt, 0.5);
            BABYLON.Vector3.LerpToRef(this.dodo.animatedSpeed, dir.scale(speed), 1 - fSpeed, this.dodo.animatedSpeed);

            BABYLON.Vector3.SlerpToRef(this.dodo.targetLook, this.destination.add(new BABYLON.Vector3(0, 1, 0)), 0.005, this.dodo.targetLook);
            //Mummu.DrawDebugPoint(this.dodo.targetLook, 5, BABYLON.Color3.Red());

            let distToNext = BABYLON.Vector3.Distance(this.dodo.position, this.destination);
            if (distToNext < 2) {
                if (this.onReach) {
                    this.onReach();
                    return;
                }
            }
        }
        else {
            let fSpeed = Nabu.Easing.smoothNSec(1 / dt, 0.1);
            this.dodo.animatedSpeed.scaleInPlace(fSpeed);
        }
    }

    public onReach = () => {};
    public onCantFindPath = () => {};
}