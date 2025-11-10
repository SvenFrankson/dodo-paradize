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

class Triangle extends GameObject {

    constructor(public v1: Vec2, public v2: Vec2, public v3: Vec2, engine: ArcadeEngine) {
        super("triangle", engine);
    }

    public draw(): void {
        this.engine.drawLine(this.v1, this.v2, 2);
        this.engine.drawLine(this.v2, this.v3, 2);
        this.engine.drawLine(this.v3, this.v1, 2);
    }
}