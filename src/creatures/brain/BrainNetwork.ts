interface IBrainNetworkData {
    dodoId: string;
    x: number;
    y: number;
    z: number;
    r: number;
    timestamp?: number;
}

function IsBrainNetworkData(v: any): boolean {
    if (v.dodoId) {
        if (isFinite(v.x)) {
            if (isFinite(v.y)) {
                if (isFinite(v.z)) {
                    if (isFinite(v.r)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

class BrainNetwork extends SubBrain {

    public destination: BABYLON.Vector3;

    public update(dt: number): void {
        let network = this.game.networkManager;
        let dataArray = network.receivedData.get(this.dodo.peerId);
        if (dataArray) {
            let data = dataArray[0];
            if (data) {
                console.log(data);
                let fSpeed = Nabu.Easing.smoothNSec(1 / dt, 0.1);
                let pos = new BABYLON.Vector3(data.x, data.y, data.z);
                BABYLON.Vector3.LerpToRef(this.dodo.position, pos, 1 - fSpeed, this.dodo.position);
                let z = Mummu.Rotate(BABYLON.Axis.Z, BABYLON.Axis.Y, data.r);
                let q = Mummu.QuaternionFromZYAxis(z, BABYLON.Axis.Y);
                BABYLON.Quaternion.SlerpToRef(this.dodo.rotationQuaternion, q, 1 - fSpeed, this.dodo.rotationQuaternion);
            }
        }
    }

    public onReach = () => {};
    public onCantFindPath = () => {};
}