enum BrainMode {
    Idle,
    Travel,
    Player,
    Network
}

class Brain {

    public mode: BrainMode = BrainMode.Idle;
    public subBrains: SubBrain[] = [];
    public npcDialog: NPCDialog;
    public inDialog: NPCDialog;
    public inStation: StationBrick;
    public inStationTimer: number = 0;

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
            else if (mode === BrainMode.Network) {
                this.subBrains[BrainMode.Network] = new BrainNetwork(this);
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
        if (this.inStation) {
            this.inStationTimer += dt;
        }
        else {
            this.inStationTimer = 0;
        }

        let subBrain = this.subBrains[this.mode];
        if (subBrain) {
            subBrain.update(dt);
        }
    }
}