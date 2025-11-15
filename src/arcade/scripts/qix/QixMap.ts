/// <reference path="../ArcadeEngineColor.ts" />

class QixSplit extends GameObject {

    public path: Vec2[];
    public blinking: boolean = false;
    public blinkingCD: number = 0;
    
    public strokeColor: ArcadeEngineColor;
    public fillColor: ArcadeEngineColor;

    constructor(public map: QixMap) {
        super("qix-split", map.engine);
        this.layer = 1;
    }

    public update(dt?: number): void {
        if (this.blinking) {
            this.blinkingCD--;
            if (this.blinkingCD <= 0) {
                if (this.strokeColor === ArcadeEngineColor.Gray) {
                    this.strokeColor = this.map.strokeColor;
                }
                else {
                    this.strokeColor = ArcadeEngineColor.Gray;
                }
                if (this.fillColor === ArcadeEngineColor.Anthracite) {
                    this.fillColor = this.map.fillColor;
                }
                else {
                    this.fillColor = ArcadeEngineColor.Anthracite;
                }
                this.blinkingCD = 5;
            }
        }
        else {
            this.strokeColor = ArcadeEngineColor.Gray;
            this.fillColor = ArcadeEngineColor.Anthracite;
        }
    }

    public draw(): void {
        if (this.path) {
            this.engine.fillPolygon(this.path, this.fillColor, FillStyle.Dots, this.map.position);
            this.engine.drawPolygon(this.path, this.strokeColor, this.map.position);
        }
    }
}

class QixMap extends GameObject {

    public static MapColorPairs = [
        [ArcadeEngineColor.Red, ArcadeEngineColor.Purple],
        [ArcadeEngineColor.Cyan, ArcadeEngineColor.Turquoise],
        [ArcadeEngineColor.Yellow, ArcadeEngineColor.Purple],
        [ArcadeEngineColor.Blue, ArcadeEngineColor.Marine],
        [ArcadeEngineColor.White, ArcadeEngineColor.Gray],
    ]

    public initialSurface: number = 1000;

    public min: Vec2 = new Vec2(0, 0);
    public max: Vec2 = new Vec2(159 - 6, 143 - 6 - 8);
    public points: Vec2[] = [];
    public splits: QixSplit[] = [];

    public strokeColor: ArcadeEngineColor;
    public fillColor: ArcadeEngineColor;
    public fillStyle: FillStyle;

    public splitSound: HTMLAudioElement;

    constructor(public qix: Qix) {
        super("qix-map", qix.engine);
        this.initialize();
        this.layer = 2;
        this.position.x = 3;
        this.position.y = 3 + 8;

        this.splitSound = document.createElement("audio");
        this.splitSound.src = "sounds/doorClose_002.ogg";
    }

    public initialize(): void {
        this.points = [
            new Vec2(this.min.x, this.min.y),
            new Vec2(this.max.x, this.min.y),
            new Vec2(this.max.x, this.max.y),
            new Vec2(this.min.x, this.max.y)
        ];

        while (this.splits.length > 0) {
            this.splits.pop().dispose();
        }

        this.strokeColor = QixMap.MapColorPairs[this.qix.level % QixMap.MapColorPairs.length][0];
        this.fillColor = QixMap.MapColorPairs[this.qix.level % QixMap.MapColorPairs.length][1];

        this.fillStyle = FillStyle.Dots

        this.initialSurface = Polygon.GetSurface(this.points);
        //this.qix.scoreDisplay.text = "SCORE " + this.getScore().toFixed(0).padStart(3, "0");
        this.qix.areaDisplay.text = "AREA " + this.initialSurface.toFixed(0).padStart(5, "0");
    }

    public draw(): void {
        this.engine.fillPolygon(this.points, this.fillColor, this.fillStyle, this.position);
        this.engine.drawPolygon(this.points, this.strokeColor, this.position);
    }

    public split(path: Vec2[]): Vec2[] {
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

        let a1 = Polygon.GetSurface(part1);
        let a2 = Polygon.GetSurface(part2);

        this.splitSound.play();

        if (a1 >= a2) {
            this.points = part1;
            let split = new QixSplit(this);
            split.path = part2;
            split.blinking = true;
            setTimeout(() => {
                split.blinking = false;
            }, 1000);
            this.splits.push(split);
            for (let i = 0; i < this.qix.creeps.length; i++) {
                if (Polygon.PointInPolygon(this.qix.creeps[i].position, part2)) {
                    this.qix.creeps[i].dispose();
                }
            }
            //this.qix.scoreDisplay.text = "SCORE " + this.getScore(a1).toFixed(0).padStart(3, "0");
            this.qix.areaDisplay.text = "AREA " + a1.toFixed(0).padStart(5, "0");
            this.qix.incScore(Math.floor(a2 / 100));

            if (this.getScore(a1) >= 100) {
                this.qix.win();
            }
            return part2;
        }
        else {
            this.points = part2;
            let split = new QixSplit(this);
            split.path = part1;
            split.blinking = true;
            setTimeout(() => {
                split.blinking = false;
            }, 1000);
            this.splits.push(split);
            for (let i = 0; i < this.qix.creeps.length; i++) {
                if (Polygon.PointInPolygon(this.qix.creeps[i].position, part1)) {
                    this.qix.creeps[i].dispose();
                }
            }
            //this.qix.scoreDisplay.text = "SCORE " + this.getScore(a2).toFixed(0).padStart(3, "0");
            this.qix.areaDisplay.text = "AREA " + a2.toFixed(0).padStart(5, "0");
            this.qix.incScore(Math.floor(a1 / 100));

            if (this.getScore(a2) >= 100) {
                this.qix.win();
            }
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
