class SubBrain {

    public get dodo(): Dodo {
        return this.brain.dodo;
    }
    
    public get game(): Game {
        return this.dodo.game;
    }

    public get terrain(): Terrain {
        return this.game.terrain;
    }

    constructor(public brain: Brain) {

    }

    public initialize(): void {

    }

    public update(dt: number): void {

    }
}