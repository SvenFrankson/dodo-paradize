class Vec2 {

    public static Zero(): Vec2 {
        return new Vec2(0, 0);
    }

    constructor(public x: number, public y: number) {
        
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
}

class ArcadeEngine {
    
    public pixels: Uint8Array;
    public w: number = 160;
    public h: number = 144;
    public gameObjects: GameObject[] = [];

    constructor() {
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

        new QixMap(this);

        setInterval(() => { this.debugLoop(); }, 1000 / 24);
    }
    
    public debugLoop(): void {
        this.clear();
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