class DodoFoot extends BABYLON.Mesh {

    public claws: BABYLON.Mesh[];
    public groundPos: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public groundUp: BABYLON.Vector3 = BABYLON.Vector3.Up();

    constructor(name: string, public joey: Dodo) {
        super(name);
        this.scaling.copyFromFloats(1.3, 1.3, 1.3);
        this.claws = [
            Dodo.OutlinedMesh("clawR"),
            Dodo.OutlinedMesh("clawL"),
            Dodo.OutlinedMesh("clawB")
        ];
        this.claws[0].position.copyFromFloats(- 0.103, -0.025, 0.101);
        this.claws[0].rotation.y = - Math.PI / 8;
        this.claws[0].parent = this;
        this.claws[1].position.copyFromFloats(0.103, -0.025, 0.101);
        this.claws[1].rotation.y = Math.PI / 8;
        this.claws[1].parent = this;
        this.claws[2].position.copyFromFloats(0, -0.025, - 0.101);
        this.claws[2].rotation.y = Math.PI;
        this.claws[2].parent = this;
    }

    public async instantiate(): Promise<void> {
        let datas = await this.joey.game.vertexDataLoader.get("./datas/meshes/dodo.babylon");
        datas = datas.map(vertexData => {
            return Mummu.ColorizeVertexDataInPlace(Mummu.CloneVertexData(vertexData), this.joey.color, new BABYLON.Color3(0, 1, 0));
        });

        //datas[8].applyToMesh(this);
        this.material = this.joey.material;

        //datas[9].applyToMesh(this.claws[0]);
        //datas[9].applyToMesh(this.claws[1]);
        //datas[9].applyToMesh(this.claws[2]);
        this.claws[0].material = this.joey.material;
        this.claws[1].material = this.joey.material;
        this.claws[2].material = this.joey.material;
    }

    public update(dt: number): void {
        for (let i = 0; i < this.claws.length; i++) {
            let clawTip = new BABYLON.Vector3(0, 0, 0.26);
            BABYLON.Vector3.TransformCoordinatesToRef(clawTip, this.claws[i].getWorldMatrix(), clawTip);
            let dP = clawTip.subtract(this.groundPos);
            let dot = BABYLON.Vector3.Dot(dP, this.groundUp);
            if (dot > 0) {
                this.claws[i].rotation.x += 0.2 * Math.PI * dt;
            }
            else if (dP.length() < 1) {
                this.claws[i].rotation.x += 50 * dot * Math.PI * dt;
            }
            this.claws[i].rotation.x = Nabu.MinMax(this.claws[i].rotation.x, - Math.PI * 0.4, Math.PI * 0.5);
        }
    }
}