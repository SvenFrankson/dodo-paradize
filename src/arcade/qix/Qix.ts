class QixMap extends GameObject {

    public min: Vec2 = new Vec2(4, 4);
    public max: Vec2 = new Vec2(160 - 4, 144 - 4);
    public map: Vec2[] = [];

    constructor(engine: ArcadeEngine) {
        super("qix-map", engine);
        this.initialize();
    }

    public initialize(): void {
        this.map = [
            new Vec2(this.min.x, this.min.y),
            new Vec2(this.max.x, this.min.y),
            new Vec2(this.max.x, this.max.y),
            new Vec2(this.min.x, this.max.y)
        ];
    }

    public draw(): void {
        for (let i = 0; i < this.map.length; i++) {
            let start = this.map[i];
            let end = this.map[(i + 1) % this.map.length];

            this.engine.drawLine(start, end, 1, this.position);
        }
    }
}