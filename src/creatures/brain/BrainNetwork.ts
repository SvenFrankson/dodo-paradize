class BrainNetwork extends SubBrain {

    public destination: BABYLON.Vector3;

    public update(dt: number): void {
        let network = this.game.networkManager;
        let pos = network.debugLastPos;
        BABYLON.Vector3.LerpToRef(this.dodo.position, pos, 0.1, this.dodo.position);
        let z = Mummu.Rotate(BABYLON.Axis.Z, BABYLON.Axis.Y, network.debugLastR);
        this.dodo.rotationQuaternion = Mummu.QuaternionFromZYAxis(z, BABYLON.Axis.Y);
    }

    public onReach = () => {};
    public onCantFindPath = () => {};
}