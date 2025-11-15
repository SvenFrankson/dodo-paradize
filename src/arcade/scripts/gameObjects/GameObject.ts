class GameObject {

    public layer: number = 0;
    public isVisible: boolean = true;
    public position: Vec2 = Vec2.Zero();

    private _roundedPosition: Vec2 = Vec2.Zero();
    public get roundedPosition(): Vec2 {
        this._roundedPosition.copyFrom(this.position).roundInPlace();
        return this._roundedPosition;
    }

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

class TriangleGameObject extends GameObject {

    constructor(public v1: Vec2, public v2: Vec2, public v3: Vec2, public color: number, engine: ArcadeEngine) {
        super("triangle", engine);
    }

    public draw(): void {
        this.engine.drawLine(this.v1, this.v2, this.color);
        this.engine.drawLine(this.v2, this.v3, this.color);
        this.engine.drawLine(this.v3, this.v1, this.color);
    }
}

class RectGameObject extends GameObject {

    constructor(name: string, engine: ArcadeEngine, public w: number, public h: number, public color: number = ArcadeEngineColor.Marine, public fillStyle: FillStyle = FillStyle.Full) {
        super(name, engine);
    }

    public draw(): void {
        this.engine.fillRect(0, 0, this.w, this.h, this.color, this.fillStyle, this.position);
    }
}
