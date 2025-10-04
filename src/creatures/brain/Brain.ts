enum BrainMode {
    Idle,
    Travel
}

class Brain {

    public mode: BrainMode = BrainMode.Idle;
    public subBrains: SubBrain[] = [];

    public get terrain(): Terrain {
        return this.joey.game.terrain;
    }

    constructor(public joey: Dodo) {
        this.subBrains[BrainMode.Idle] = new BrainIdle(this);
        this.subBrains[BrainMode.Travel] = new BrainTravel(this);
    }

    public update(dt: number): void {
        if (this.mode === BrainMode.Idle) {
            if (Math.random() < 0.005) {
                let destination = this.joey.body.position.clone();
                destination.y += 100;
                destination.x += -50 + 100 * Math.random();
                destination.z += -50 + 100 * Math.random();
                let ray = new BABYLON.Ray(destination, new BABYLON.Vector3(0, -1, 0));
                let pick = this.joey.game.scene.pickWithRay(ray, (mesh => {
                    return mesh.name.startsWith("chunck");
                }));
                if (pick.hit) {
                    destination = pick.pickedPoint;
                    (this.subBrains[BrainMode.Travel] as BrainTravel).destination = destination;

                    (this.subBrains[BrainMode.Travel] as BrainTravel).onReach = () => {
                        this.mode = BrainMode.Idle;
                    }
                    (this.subBrains[BrainMode.Travel] as BrainTravel).onCantFindPath = () => {
                        this.mode = BrainMode.Idle;
                    }
                    this.mode = BrainMode.Travel;
                }
            }
        }

        let subBrain = this.subBrains[this.mode];
        if (subBrain) {
            subBrain.update(dt);
        }
    }
}