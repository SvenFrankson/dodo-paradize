class ArcadeEngineInput {

    public A: boolean = false;
    public B: boolean = false;
    public Start: boolean = false;
    public Select: boolean = false;
    public Up: boolean = false;
    public Down: boolean = false;
    public Right: boolean = false;
    public Left: boolean = false;
    
    public AUp: boolean = false;
    public BUp: boolean = false;
    public StartUp: boolean = false;
    public SelectUp: boolean = false;
    public UpUp: boolean = false;
    public DownUp: boolean = false;
    public RightUp: boolean = false;
    public LeftUp: boolean = false;
}

interface IIntColor3 {
    r: number,
    g: number,
    b: number
}

enum FillStyle {
    Full,
    Lines,
    Stripes,
    Grid,
    Dots,
    Diagonals,
    LENGTH
}


class ArcadeEngine {
    
    public fillPatterns: CanvasPattern[] = [];

    public static Instance: ArcadeEngine;
    public pixels: Uint8Array;
    public w: number = 160;
    public h: number = 144;
    public gameObjects: GameObject[] = [];
    public input: ArcadeEngineInput;
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;

    public qix: Qix;

    constructor(public texture: BABYLON.DynamicTexture) {
        ArcadeEngine.Instance = this;

        this.input = new ArcadeEngineInput();

        this.resize();
    }

    public resize(): void {
        this.pixels = new Uint8Array(this.w * this.h);
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.w;
        this.canvas.height = this.h;
        this.context = this.canvas.getContext("2d");
    }

    public drawPixel(x: number, y: number, c: number, position?: Vec2): void {
        if (position) {
            x = Math.round(x + position.x);
            y = Math.round(y + position.y);
        }
        if (x >= 0 && x < this.w && y >= 0 && y < this.h) {
            this.context.fillStyle = ArcadeEngineColorsHex[c];
            this.context.fillRect(x, y, 1, 1);
        }
    }

    public drawLine(start: Vec2, end: Vec2, c: number, position?: Vec2): void {
        this.context.strokeStyle = ArcadeEngineColorsHex[c];
        this.context.beginPath();
        this.context.moveTo(start.x + position.x + 0.5, start.y + position.y + 0.5);
        this.context.lineTo(end.x + position.x + 0.5, end.y + position.y + 0.5);
        this.context.stroke();
    }

    public drawRect(x: number, y: number, w: number, h: number, c: number, position?: Vec2): void {
        this.context.fillStyle = ArcadeEngineColorsHex[c];
        this.context.fillRect(x + position.x, y + position.y, w, h);
    }

    public fillRect(x: number, y: number, w: number, h: number, c: number, fillStyle: FillStyle = FillStyle.Full, position?: Vec2): void {
        let pattern = this.fillPatterns[fillStyle * ArcadeEngineColorsHex.length + c];
        if (pattern) {
            this.context.fillStyle = pattern;
        }
        else {
            this.context.fillStyle = ArcadeEngineColorsHex[c];
        }
        this.context.fillRect(x + position.x, y + position.y, w, h);
    }

    public drawPolygon(polygon: Vec2[], c: number, position?: Vec2): void {
        this.context.strokeStyle = ArcadeEngineColorsHex[c];
        this.context.beginPath();
        let start = polygon[0];
        this.context.moveTo(start.x + position.x + 0.5, start.y + position.y + 0.5);
        for (let i = 1; i < polygon.length; i++) {
            let point = polygon[i];
            this.context.lineTo(point.x + position.x + 0.5, point.y + position.y + 0.5);
        }
        this.context.closePath();
        this.context.stroke();
    }

    public fillPolygon(polygon: Vec2[], c: number, fillStyle: FillStyle = FillStyle.Full, position?: Vec2): void {
        let pattern = this.fillPatterns[fillStyle * ArcadeEngineColorsHex.length + c];
        if (pattern) {
            this.context.fillStyle = pattern;
        }
        else {
            this.context.fillStyle = ArcadeEngineColorsHex[c];
        }
        this.context.beginPath();
        let start = polygon[0];
        this.context.moveTo(start.x + position.x + 0.5, start.y + position.y + 0.5);
        for (let i = 1; i < polygon.length; i++) {
            let point = polygon[i];
            this.context.lineTo(point.x + position.x + 0.5, point.y + position.y + 0.5);
        }
        this.context.closePath();
        this.context.fill();
    }

    public clear(): void {
        this.pixels.fill(0);
    }

    private _debugCanvas: HTMLCanvasElement;
    public async start(): Promise<void> {
        for (let c = 0; c < ArcadeEngineColorsHex.length; c++) {
            let dotsPatternCanvas = document.createElement("canvas");
            dotsPatternCanvas.width = 3;
            dotsPatternCanvas.height = 3;
            let dotsPatternContext = dotsPatternCanvas.getContext("2d");
            dotsPatternContext.fillStyle = ArcadeEngineColorsHex[c];
            dotsPatternContext.fillRect(0, 0, 1, 1);

            this.fillPatterns[FillStyle.Dots * ArcadeEngineColorsHex.length + c] = this.context.createPattern(dotsPatternCanvas, "repeat");

            let gridPatternCanvas = document.createElement("canvas");
            gridPatternCanvas.width = 2;
            gridPatternCanvas.height = 2;
            let gridPatternContext = gridPatternCanvas.getContext("2d");
            gridPatternContext.fillStyle = ArcadeEngineColorsHex[c];
            gridPatternContext.fillRect(0, 0, 1, 1);
            gridPatternContext.fillRect(0, 1, 1, 1);
            gridPatternContext.fillRect(1, 0, 1, 1);

            this.fillPatterns[FillStyle.Grid * ArcadeEngineColorsHex.length + c] = this.context.createPattern(gridPatternCanvas, "repeat");
            
            let linesPatternCanvas = document.createElement("canvas");
            linesPatternCanvas.width = 2;
            linesPatternCanvas.height = 2;
            let linesPatternContext = linesPatternCanvas.getContext("2d");
            linesPatternContext.fillStyle = ArcadeEngineColorsHex[c];
            linesPatternContext.fillRect(0, 0, 2, 1);

            this.fillPatterns[FillStyle.Lines * ArcadeEngineColorsHex.length + c] = this.context.createPattern(linesPatternCanvas, "repeat");
            
            let stripesPatternCanvas = document.createElement("canvas");
            stripesPatternCanvas.width = 2;
            stripesPatternCanvas.height = 2;
            let stripesPatternContext = stripesPatternCanvas.getContext("2d");
            stripesPatternContext.fillStyle = ArcadeEngineColorsHex[c];
            stripesPatternContext.fillRect(0, 0, 1, 2);

            this.fillPatterns[FillStyle.Stripes * ArcadeEngineColorsHex.length + c] = this.context.createPattern(stripesPatternCanvas, "repeat");
            
            let diagonalPatternCanvas = document.createElement("canvas");
            diagonalPatternCanvas.width = 3;
            diagonalPatternCanvas.height = 3;
            let diagonalPatternContext = diagonalPatternCanvas.getContext("2d");
            diagonalPatternContext.fillStyle = ArcadeEngineColorsHex[c];
            diagonalPatternContext.fillRect(0, 0, 1, 1);
            diagonalPatternContext.fillRect(1, 1, 1, 1);
            diagonalPatternContext.fillRect(2, 2, 1, 1);

            this.fillPatterns[FillStyle.Diagonals * ArcadeEngineColorsHex.length + c] = this.context.createPattern(diagonalPatternCanvas, "repeat");
        }

        await TextGameObject.LoadCharacters();

        if (!this.qix) {
            this.qix = new Qix(this);
        }
        this.qix.initialize();
        this._stopped = false;
        this._updateStep();
    }

    public stop(): void {
        if (this.qix) {
            this.qix.setState(QixState.Home);
            requestAnimationFrame(() => {
                this._stopped = true;
            })
        }
    }
    
    private _stopped: boolean = true;
    private _lastT: number = undefined;
    private _updateStep = () => {
        this.clear();
        let t = performance.now() / 1000;
        let dt = 1 / 24;
        if (isFinite(this._lastT)) {
            dt = t - this._lastT;
        }
        dt = Math.min(dt, 1);
        this._lastT = t;

        this.context.fillStyle = ArcadeEngineColorsHex[ArcadeEngineColor.Black];
        this.context.fillRect(0, 0, this.w, this.h);

        for (let i = 0; i < this.gameObjects.length; i++) {
            this.gameObjects[i].update(dt);
        }
        this.gameObjects.sort((g1, g2) => { return g1.layer - g2.layer; });
        for (let i = 0; i < this.gameObjects.length; i++) {
            if (this.gameObjects[i].isVisible) {
                this.gameObjects[i].draw();
            }
        }

        let pixels = this.context.getImageData(0, 0, this.w, this.h);
        if (!this.texture) {
            return;
        }
        let babylonJSContext = this.texture.getContext();
        if (!babylonJSContext) {
            return;
        }
        babylonJSContext.putImageData(pixels, 0, 0);
        this.texture.update();

        this.input.AUp = false;
        this.input.BUp = false;
        this.input.StartUp = false;
        this.input.SelectUp = false;
        this.input.UpUp = false;
        this.input.DownUp = false;
        this.input.RightUp = false;
        this.input.LeftUp = false;

        if (this._stopped) {
            return;
        }
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                requestAnimationFrame(this._updateStep);
            })
        })
    }
}