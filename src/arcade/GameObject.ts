class GameObject {

    public position: Vec2 = Vec2.Zero();

    constructor(public name: string, public engine: ArcadeEngine) {
        this.engine.gameObjects.push(this);
    }

    public dispose(): void {
        let index = this.engine.gameObjects.indexOf(this);
        if (index != -1) {
            this.engine.gameObjects.splice(index, 1);
        }
    }

    public draw(): void {}

    public update(dt?: number): void {}
}