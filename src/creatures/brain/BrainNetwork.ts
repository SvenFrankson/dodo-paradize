interface IBrainNetworkData {
    dodoId: string;
    x: number;
    y: number;
    z: number;
    r: number;
    timestamp?: number;
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
                let pos = new BABYLON.Vector3(data.x, data.y, data.z);
                BABYLON.Vector3.LerpToRef(this.dodo.position, pos, 0.1, this.dodo.position);
                let z = Mummu.Rotate(BABYLON.Axis.Z, BABYLON.Axis.Y, data.r);
                this.dodo.rotationQuaternion = Mummu.QuaternionFromZYAxis(z, BABYLON.Axis.Y);
            }
        }
    }

    public onReach = () => {};
    public onCantFindPath = () => {};
}