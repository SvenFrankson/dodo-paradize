class QixMap extends GameObject {

    public scoreDisplay: ArcadeText;
    public initialSurface: number = 1000;

    public min: Vec2 = new Vec2(0, 0);
    public max: Vec2 = new Vec2(159 - 6, 143 - 6 - 8);
    public points: Vec2[] = [];

    constructor(engine: ArcadeEngine) {
        super("qix-map", engine);
        this.initialize();
        this.layer = 2;
        this.position.x = 3;
        this.position.y = 3 + 8;
    }

    public initialize(): void {
        this.scoreDisplay = new ArcadeText("SCORE ", ArcadeEngineColor.Black, this.engine);
        this.scoreDisplay.position.x = 1;
        this.scoreDisplay.position.y = 1;
        this.scoreDisplay.backgroundColor = ArcadeEngineColor.White;
        
        this.points = [
            new Vec2(this.min.x, this.min.y),
            new Vec2(this.max.x, this.min.y),
            new Vec2(this.max.x, this.max.y),
            new Vec2(this.min.x, this.max.y)
        ];

        this.initialSurface = Polygon.GetSurface(this.points);
        this.scoreDisplay.text = "SCORE " + this.getScore().toFixed(0).padStart(3, "0");
    }

    public draw(): void {
        this.engine.fillPolygon(this.points, ArcadeEngineColor.DeepBlue, FillStyle.Stripes, this.position);
        this.engine.drawPolygon(this.points, ArcadeEngineColor.Blue, this.position);
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

        /*
        //console.log("Map Area " + debugA);
        let text1 = new ArcadeText(a1.toFixed(0), ArcadeEngineColor.Black, this.engine);
        text1.layer = 5;
        text1.backgroundColor = ArcadeEngineColor.White;
        text1.position = Polygon.BBoxCenter(part1).roundInPlace();
        setInterval(() => {
            text1.dispose()
        }, 3000);

        let text2 = new ArcadeText(a2.toFixed(0), ArcadeEngineColor.Black, this.engine);
        text2.layer = 5;
        text2.backgroundColor = ArcadeEngineColor.White;
        text2.position = Polygon.BBoxCenter(part2).roundInPlace();
        setInterval(() => {
            text2.dispose()
        }, 3000);
        */

        console.log("A1 Area " + a1);
        console.log("A2 Area " + a2);

        if (a1 >= a2) {
            this.points = part1;
            this.scoreDisplay.text = "SCORE " + this.getScore(a1).toFixed(0).padStart(3, "0");
            return part2;
        }
        else {
            this.points = part2;
            this.scoreDisplay.text = "SCORE " + this.getScore(a2).toFixed(0).padStart(3, "0");
            return part1;
        }
    }

    public getScore(surface?: number): number {
        if (isNaN(surface)) {
            surface = Polygon.GetSurface(this.points);
        }
        let winSurface = this.initialSurface * 0.1;
        let f = (surface - winSurface) / (this.initialSurface - winSurface);
        f = Math.min(Math.max(f, 0), 1);
        return Math.floor(100 * (1 - f));
    }
}

class QixLastSplit extends GameObject {

    public path: Vec2[];

    constructor(public player: QixPlayer) {
        super("qix-split", player.engine);
        this.layer = 1;
    }

    public draw(): void {
        if (this.path) {
            this.engine.fillPolygon(this.path, ArcadeEngineColor.Pourpre, FillStyle.Grid, this.player.map.position);
            this.engine.drawPolygon(this.path, ArcadeEngineColor.Red, this.player.map.position);
        }
    }
}

class QixPlayer extends GameObject {

    public movingOnMap: number = 0;
    public tracing: boolean = false;
    public tracingDir: Vec2 = Vec2.Zero();
    public tracePath: Vec2[] = [];

    public lastSplit: QixLastSplit;

    constructor(public map: QixMap, engine: ArcadeEngine) {
        super("qix-player", engine);
        this.layer = 4;
        this.lastSplit = new QixLastSplit(this);
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
                this.lastSplit.path = this.map.split(this.tracePath);
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
                    this.engine.drawLine(start, end, ArcadeEngineColor.Lime, this.map.position);
                }
            }
        }

        this.engine.drawRect(-2, -2, 5, 5, ArcadeEngineColor.Green, this.position.add(this.map.position));
    }
}