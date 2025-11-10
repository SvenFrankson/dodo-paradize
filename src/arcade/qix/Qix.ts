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

    public split(path: Vec2[]): Vec2[] {
        console.log(path);
        let part1 = [...path];
        let part2 = [...path].reverse();

        let start = path[0];
        let end = path[path.length - 1];

        for (let i = 0; i < this.points.length; i++) {
            let s1 = this.points[i];
            let s2 = this.points[(i + 1) % this.points.length];

            if (start.isOnRectSegment(s1, s2) && end.isOnRectSegment(s1, s2)) {
                let tmp = start.add(end).scaleInPlace(0.5).roundInPlace();
                if (i === this.points.length - 1) {
                    this.points.push(tmp);
                }
                else {
                    this.points.splice(i + 1, 0, tmp);
                }
            }
        }

        for (let i = 0; i < this.points.length; i++) {
            let s1 = this.points[i];
            let s2 = this.points[(i + 1) % this.points.length];

            if (end.isOnRectSegment(s1, s2)) {
                for (let j = 0; j < this.points.length; j++) {
                    let n = (i + j) % this.points.length;
                    let pt1 = this.points[n];
                    let pt2 = this.points[(n + 1) % this.points.length];

                    if (start.isOnRectSegment(pt1, pt2)) {
                        break;
                    }
                    else {
                        if (!part1[part1.length - 1].equals(pt2)) {
                            part1.push(pt2);
                        }
                    }
                }
                break;
            }
        }

        for (let i = 0; i < this.points.length; i++) {
            let s1 = this.points[i];
            let s2 = this.points[(i + 1) % this.points.length];

            if (start.isOnRectSegment(s1, s2)) {
                for (let j = 0; j < this.points.length; j++) {
                    let n = (i + j) % this.points.length;
                    let pt1 = this.points[n];
                    let pt2 = this.points[(n + 1) % this.points.length];

                    if (end.isOnRectSegment(pt1, pt2)) {
                        break;
                    }
                    else {
                        if (!part2[part2.length - 1].equals(pt2)) {
                            part2.push(pt2);
                        }
                    }
                }
                break;
            }
        }

        //let debugA = Polygon.GetSurface(this.points);
        let a1 = Polygon.GetSurface(part1);
        let a2 = Polygon.GetSurface(part2);

        //console.log("Map Area " + debugA);
        console.log("A1 Area " + a1);
        console.log("A2 Area " + a2);

        if (a1 >= a2) {
            this.points = part1;
            return part2;
        }
        else {
            this.points = part2;
            return part1;
        }
    }
}

class QixPlayer extends GameObject {

    public movingOnMap: number = 0;
    public tracing: boolean = false;
    public tracingDir: Vec2 = Vec2.Zero();
    public tracePath: Vec2[] = [];

    public lastSplit: Vec2[];

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
        else if (this.tracing) {
            if (this.engine.input.Up && !this.tracingDir.equals(Vec2.AxisUp) && !this.tracingDir.equals(Vec2.AxisDown)) {
                this.tracingDir.copyFrom(Vec2.AxisUp);
                this.tracePath.push(this.position.clone());
            }
            else if (this.engine.input.Down && !this.tracingDir.equals(Vec2.AxisDown) && !this.tracingDir.equals(Vec2.AxisUp)) {
                this.tracingDir.copyFrom(Vec2.AxisDown);
                this.tracePath.push(this.position.clone());
            }
            else if (this.engine.input.Right && !this.tracingDir.equals(Vec2.AxisRight) && !this.tracingDir.equals(Vec2.AxisLeft)) {
                this.tracingDir.copyFrom(Vec2.AxisRight);
                this.tracePath.push(this.position.clone());
            }
            else if (this.engine.input.Left && !this.tracingDir.equals(Vec2.AxisLeft) && !this.tracingDir.equals(Vec2.AxisRight)) {
                this.tracingDir.copyFrom(Vec2.AxisLeft);
                this.tracePath.push(this.position.clone());
            }
            this.position.addInPlace(this.tracingDir);
            if (this.indexOnMap() != -1) {
                this.tracePath.push(this.position.clone());
                this.lastSplit = this.map.split(this.tracePath);
                this.tracing = false;
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

            let dirInv = this.getDirInv(index);
            if (dirInv.equals(Vec2.AxisUp) && this.engine.input.Up) {
                this.movingOnMap = - 1;
            }
            else if (dirInv.equals(Vec2.AxisDown) && this.engine.input.Down) {
                this.movingOnMap = - 1;
            }
            else if (dirInv.equals(Vec2.AxisRight) && this.engine.input.Right) {
                this.movingOnMap = - 1;
            }
            else if (dirInv.equals(Vec2.AxisLeft) && this.engine.input.Left) {
                this.movingOnMap = - 1;
            }

            let inputDir = Vec2.Zero();
            if (this.engine.input.Up) {
                let angle = dir.angleTo(Vec2.AxisUp);
                if (angle > 0) {
                    let angleInv = Vec2.AxisUp.angleTo(dirInv);
                    if (angleInv > 0) {
                        this.tracing = true;
                        this.tracingDir = Vec2.AxisUp.clone();
                        this.tracePath = [this.position.clone()];
                    }
                }
            }
            if (this.engine.input.Down) {
                let angle = dir.angleTo(Vec2.AxisDown);
                if (angle > 0) {
                    let angleInv = Vec2.AxisDown.angleTo(dirInv);
                    if (angleInv > 0) {
                        this.tracing = true;
                        this.tracingDir = Vec2.AxisDown.clone();
                        this.tracePath = [this.position.clone()];
                    }
                }
            }
            if (this.engine.input.Right) {
                let angle = dir.angleTo(Vec2.AxisRight);
                if (angle > 0) {
                    let angleInv = Vec2.AxisRight.angleTo(dirInv);
                    if (angleInv > 0) {
                        this.tracing = true;
                        this.tracingDir = Vec2.AxisRight.clone();
                        this.tracePath = [this.position.clone()];
                    }
                }
            }
            if (this.engine.input.Left) {
                let angle = dir.angleTo(Vec2.AxisLeft);
                if (angle > 0) {
                    let angleInv = Vec2.AxisLeft.angleTo(dirInv);
                    if (angleInv > 0) {
                        this.tracing = true;
                        this.tracingDir = Vec2.AxisLeft.clone();
                        this.tracePath = [this.position.clone()];
                    }
                }
            }
        }
    }

    public draw(): void {
        //if (this.lastSplit) {
        //    for (let i = 0; i < this.lastSplit.length; i++) {
        //        let start = this.lastSplit[i];
        //        let end = this.lastSplit[(i + 1) % this.lastSplit.length];
        //        this.engine.drawLine(start, end, 3);
        //    }
        //}

        if (this.tracing) {
            for (let i = 0; i < this.tracePath.length; i++) {
                let start = this.tracePath[i];
                let end: Vec2;
                if (this.tracing && i === this.tracePath.length - 1) {
                    end = this.position;
                }
                else if (i < this.tracePath.length - 1) {
                    end = this.tracePath[i + 1];
                }

                if (end) {
                    this.engine.drawLine(start, end, 2);
                }
            }
        }

        this.engine.drawRect(-2, -2, 5, 5, 1, this.position);
    }
}