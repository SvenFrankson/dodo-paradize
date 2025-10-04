class SubBrain {

    public get dodo(): Dodo {
        return this.brain.joey;
    }

    public get terrain(): Terrain {
        return this.brain.terrain;
    }

    constructor(public brain: Brain) {

    }

    public update(dt: number): void {

    }
}