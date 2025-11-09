class QixMap extends GameObject {

    public min: Vec2 = new Vec2(4, 4);
    public max: Vec2 = new Vec2(160 - 4, 144 - 4);
    public points: Vec2[] = [];

    constructor(engine: ArcadeEngine) {
        super("qix-map", engine);
        this.initialize();
    }

    public initialize(): void {
        this.points = [
            new Vec2(this.min.x, this.min.y),
            new Vec2(this.max.x, this.min.y),
            new Vec2(this.max.x, this.max.y),
            new Vec2(this.min.x, this.max.y)
        ];
    }

    public draw(): void {
        for (let i = 0; i < this.points.length; i++) {
            let start = this.points[i];
            let end = this.points[(i + 1) % this.points.length];

            this.engine.drawLine(start, end, 1, this.position);
        }
    }
}

class QixPlayer extends GameObject {

    public movingOnMap: number = 0;

    constructor(public map: QixMap, engine: ArcadeEngine) {
        super("qix-player", engine);
    }

    public indexOnMap(): number {
        for (let i = 0; i < this.map.points.length; i++) {
            let s1 = this.map.points[i];
            let s2 = this.map.points[(i + 1) % this.map.points.length];
            if (this.position.equals(s2)) {
                return (i + 1) % this.map.points.length;
            }
            if (this.position.isOnRectSegment(s1, s2)) {
                return i;
            }
        }
        return -1;
    }

    public getDir(index: number): Vec2 {
        while (index < 0) {
            index += this.map.points.length;
        }
        while (index >= this.map.points.length) {
            index -= this.map.points.length;
        }

        let s1 = this.map.points[index];
        let s2 = this.map.points[(index + 1) % this.map.points.length];

        return s2.subtract(s1).normalizeInPlace();
    }

    public getDirInv(index: number): Vec2 {
        while (index < 0) {
            index += this.map.points.length;
        }
        while (index >= this.map.points.length) {
            index -= this.map.points.length;
        }
        
        let s1 = this.map.points[index];
        if (this.position.equals(s1)) {
            return this.getDir(index - 1).scaleInPlace(-1);
        }
        return this.getDir(index).scaleInPlace(-1);
    }

    public update(dt?: number): void {
        if (this.movingOnMap != 0) {
            if (this.engine.input.Up || this.engine.input.Down || this.engine.input.Right || this.engine.input.Left) {
                let index = this.indexOnMap();
                if (index === -1) {
                    this.position.copyFrom(this.map.points[0]);
                    return;
                }

                if (this.movingOnMap === 1) {
                    let dir = this.getDir(index);
                    this.position.addInPlace(dir);
                }
                else if (this.movingOnMap = -1) {
                    let dir = this.getDirInv(index);
                    this.position.addInPlace(dir);
                }
            }
            else {
                this.movingOnMap = 0;
            }
        }
        else {
            let index = this.indexOnMap();
            if (index === -1) {
                this.position.copyFrom(this.map.points[0]);
                return;
            }
            let dir = this.getDir(index);
            if (dir.equals(Vec2.AxisUp) && this.engine.input.Up) {
                this.movingOnMap = 1;
            }
            else if (dir.equals(Vec2.AxisDown) && this.engine.input.Down) {
                this.movingOnMap = 1;
            }
            else if (dir.equals(Vec2.AxisRight) && this.engine.input.Right) {
                this.movingOnMap = 1;
            }
            else if (dir.equals(Vec2.AxisLeft) && this.engine.input.Left) {
                this.movingOnMap = 1;
            }
            else if (dir.equals(Vec2.AxisUp) && this.engine.input.Down) {
                this.movingOnMap = - 1;
            }
            else if (dir.equals(Vec2.AxisDown) && this.engine.input.Up) {
                this.movingOnMap = - 1;
            }
            else if (dir.equals(Vec2.AxisRight) && this.engine.input.Left) {
                this.movingOnMap = - 1;
            }
            else if (dir.equals(Vec2.AxisLeft) && this.engine.input.Right) {
                this.movingOnMap = - 1;
            }
        }
    }

    public draw(): void {
        this.engine.drawRect(-2, -2, 5, 5, 1, this.position);
    }
}