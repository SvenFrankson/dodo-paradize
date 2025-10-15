class NPCManager {

    public landServant: Dodo;

    constructor(public game: Game) {
        //232a0f200101
    }

    public initialize(): void {
        this.landServant = new Dodo("Boadicea Bipin", this.game, { style: "232a0f200101" });
        this.landServant.brain = new Brain(this.landServant, BrainMode.Idle);
        this.landServant.brain.initialize();
    }

    public async instantiate(): Promise<void> {
        await this.landServant.instantiate();
        this.landServant.unfold();
        this.landServant.setWorldPosition(new BABYLON.Vector3(1.12, 0, -16));
        this.game.npcDodos.push(this.landServant);
    }
}