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
    
    public static Instance: ArcadeEngine;
    public pixels: Uint8Array;
    public w: number = 160;
    public h: number = 144;
    public gameObjects: GameObject[] = [];
    public input: ArcadeEngineInput;

    constructor() {
        ArcadeEngine.Instance = this;

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
    public async debugStart(): Promise<void> {
        await ArcadeText.LoadCharacters();
        
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
                if (c === 1) {
                    context.fillStyle = "#00FF00";
                }
                else if (c === 2) {
                    context.fillStyle = "#FF00FF";
                }
                else {
                    context.fillStyle = "#00FFFF";
                }
                context.fillRect(x, y, 1, 1);
            }
        }
    }
}