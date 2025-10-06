enum BrainMode {
    Idle,
    Travel,
    Player
}

class Brain {

    public mode: BrainMode = BrainMode.Idle;
    public subBrains: SubBrain[] = [];

    public get game(): Game {
        return this.dodo.game;
    }

    public get terrain(): Terrain {
        return this.game.terrain;
    }

    constructor(public dodo: Dodo, ...subBrains: BrainMode[]) {
        for (let n = 0; n < subBrains.length; n++) {
            let mode = subBrains[n];
            if (mode === BrainMode.Idle) {
                this.subBrains[BrainMode.Idle] = new BrainIdle(this);
            }
            else if (mode === BrainMode.Travel) {
                this.subBrains[BrainMode.Travel] = new BrainTravel(this);
            }
            else if (mode === BrainMode.Player) {
                this.subBrains[BrainMode.Player] = new BrainPlayer(this);
            }
        }

        this.mode = subBrains[0];
    }

    public initialize(): void {
        this.subBrains.forEach(subBrain => {
            subBrain.initialize();
        });
    }

    public update(dt: number): void {
        console.log("mode " + this.mode);
        if (this.mode === BrainMode.Idle) {
            if (Math.random() < 0.005) {
                let destination = BABYLON.Vector3.Zero();
                destination.y += 100;
                destination.x += -100 + 200 * Math.random();
                destination.z += -100 + 200 * Math.random();
                let ray = new BABYLON.Ray(destination, new BABYLON.Vector3(0, -1, 0));
                let pick = this.dodo.game.scene.pickWithRay(ray, (mesh => {
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