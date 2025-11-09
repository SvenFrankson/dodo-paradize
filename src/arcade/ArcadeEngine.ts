class Vec2 {

    public static Zero(): Vec2 {
        return new Vec2(0, 0);
    }

    private static _AxisUp: Vec2 = new Vec2(0, - 1);
    public static get AxisUp(): Vec2 {
        return this._AxisUp;
    }

    private static _AxisDown: Vec2 = new Vec2(0, 1);
    public static get AxisDown(): Vec2 {
        return this._AxisDown;
    }

    private static _AxisRight: Vec2 = new Vec2(1, 0);
    public static get AxisRight(): Vec2 {
        return this._AxisRight;
    }

    private static _AxisLeft: Vec2 = new Vec2(- 1, 0);
    public static get AxisLeft(): Vec2 {
        return this._AxisLeft;
    }

    constructor(public x: number, public y: number) {
        
    }

    public copyFrom(other: Vec2): Vec2 {
        this.x = other.x;
        this.y = other.y;
        return this;
    }

    public clone(): Vec2 {
        return new Vec2(this.x, this.y);
    }

    public sqrLength(): number {
        return this.x * this.x + this.y * this.y;
    }

    public length(): number {
        return Math.sqrt(this.sqrLength());
    }

    public normalizeInPlace(): Vec2 {
        let l = this.length();
        this.x = this.x / l;
        this.y = this.y / l;
        return this;
    }

    public normalize(): Vec2 {
        return this.clone().normalizeInPlace();
    }

    public scaleInPlace(s: number): Vec2 {
        this.x = this.x * s;
        this.y = this.y * s;
        return this;
    }

    public scale(s: number): Vec2 {
        return this.clone().scaleInPlace(s);
    }

    public addInPlace(other: Vec2): Vec2 {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    public add(other: Vec2): Vec2 {
        return this.clone().addInPlace(other);
    }

    public subtractInPlace(other: Vec2): Vec2 {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    public subtract(other: Vec2): Vec2 {
        return this.clone().subtractInPlace(other);
    }

    public lerpInPlace(other: Vec2, f: number): Vec2 {
        this.x = this.x * (1 - f) + other.x * f;
        this.y = this.y * (1 - f) + other.y * f;
        return this;
    }

    public lerp(other: Vec2, f: number): Vec2 {
        return this.clone().lerpInPlace(other, f);
    }

    public roundInPlace(): Vec2 {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }

    public round(): Vec2 {
        return this.clone().roundInPlace();
    }

    public floorInPlace(): Vec2 {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
    }

    public floor(): Vec2 {
        return this.clone().floorInPlace();
    }

    public ceilInPlace(): Vec2 {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        return this;
    }

    public ceil(): Vec2 {
        return this.clone().ceilInPlace();
    }

    public isOnRectSegment(s1: Vec2, s2: Vec2): boolean {
        if (this.x === s1.x && this.x === s2.x) {
            let minY = Math.min(s1.y, s2.y);
            let maxY = Math.max(s1.y, s2.y);
            return this.y >= minY && this.y <= maxY;
        }
        if (this.y === s1.y && this.y === s2.y) {
            let minX = Math.min(s1.x, s2.x);
            let maxX = Math.max(s1.x, s2.x);
            return this.x >= minX && this.x <= maxX;
        }
        return false;
    }

    public equals(other: Vec2): boolean {
        return this.x === other.x && this.y === other.y;
    }
}

class ArcadeEngineInput {

    public A: boolean = false;
    public B: boolean = false;
    public Start: boolean = false;
    public Select: boolean = false;
    public Up: boolean = false;
    public Down: boolean = false;
    public Right: boolean = false;
    public Left: boolean = false;
}

class ArcadeEngine {
    
    public pixels: Uint8Array;
    public w: number = 160;
    public h: number = 144;
    public gameObjects: GameObject[] = [];
    public input: ArcadeEngineInput;

    constructor() {
        this.input = new ArcadeEngineInput();

        this.resize();
    }

    public resize(): void {
        this.pixels = new Uint8Array(this.w * this.h);
    }

    public drawPixel(x: number, y: number, c: number, position?: Vec2): void {
        if (position) {
            x = Math.round(x + position.x);
            y = Math.round(y + position.y);
        }
        if (x >= 0 && x < this.w && y >= 0 && y < this.h) {
            this.pixels[x + y * this.w] = c;
        }
    }

    public drawRect(x: number, y: number, w: number, h: number, c: number, position?: Vec2): void {
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                this.drawPixel(x + i, y + j, c, position);
            }
        }
    }

    public drawLine(start: Vec2, end: Vec2, c: number, position?: Vec2): void {
        let diff = end.subtract(start);
        let count = Math.max(Math.abs(diff.x), Math.abs(diff.y));

        for (let i = 0; i <= count; i++) {
            let f = i / count;
            let p = start.lerp(end, f).roundInPlace();
            this.drawPixel(p.x, p.y, c, position);
        }
    }

    public clear(): void {
        this.pixels.fill(0);
    }

    private _debugCanvas: HTMLCanvasElement;
    public debugStart(): void {
        this._debugCanvas = document.createElement("canvas");
        this._debugCanvas.width = this.w;
        this._debugCanvas.height = this.h;
        this._debugCanvas.style.width = (5 * this.w).toFixed(0) + "px";
        this._debugCanvas.style.height = (5 * this.h).toFixed(0) + "px";
        this._debugCanvas.style.position = "fixed";
        this._debugCanvas.style.top = "10px";
        this._debugCanvas.style.left = "10px";
        this._debugCanvas.style.zIndex = "100000";

        document.body.appendChild(this._debugCanvas);

        window.addEventListener("keydown", (ev: KeyboardEvent) => {
            if (ev.code === "KeyW") {
                this.input.Up = true;
            }
            if (ev.code === "KeyA") {
                this.input.Left = true;
            }
            if (ev.code === "KeyS") {
                this.input.Down = true;
            }
            if (ev.code === "KeyD") {
                this.input.Right = true;
            }
        });

        window.addEventListener("keyup", (ev: KeyboardEvent) => {
            if (ev.code === "KeyW") {
                this.input.Up = false;
            }
            if (ev.code === "KeyA") {
                this.input.Left = false;
            }
            if (ev.code === "KeyS") {
                this.input.Down = false;
            }
            if (ev.code === "KeyD") {
                this.input.Right = false;
            }
        });

        let map = new QixMap(this);
        let player = new QixPlayer(map, this);
        player.position.x = 30;
        player.position.y = 4;

        let loop = () => {
            this.debugLoop();
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(loop);
                })
            })
        }
        requestAnimationFrame(loop);
    }
    
    private _lastT: number = undefined;
    public debugLoop(): void {
        this.clear();
        let t = performance.now() / 1000;
        let dt = 1 / 24;
        if (isFinite(this._lastT)) {
            dt = t - this._lastT;
        }
        dt = Math.min(dt, 1);
        this._lastT = t;

        for (let i = 0; i < this.gameObjects.length; i++) {
            this.gameObjects[i].update(dt);
        }
        for (let i = 0; i < this.gameObjects.length; i++) {
            this.gameObjects[i].draw();
        }

        let context = this._debugCanvas.getContext("2d");
        context.fillStyle = "black";
        context.fillRect(0, 0, this.w, this.h);

        for (let i = 0; i < this.pixels.length; i++) {
            let c = this.pixels[i];
            if (c > 0) {
                let x = i % this.w;
                let y = Math.floor(i / this.w);
                context.fillStyle = "#00FF00";
                context.fillRect(x, y, 1, 1);
            }
        }
    }
}