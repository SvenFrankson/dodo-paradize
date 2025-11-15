class PictureGameObject extends GameObject {

    public canvas: HTMLCanvasElement;
    private _loaded: boolean = false;

    public blinking: boolean = false;
    public blinkingCD: number = 0;
    public blinkingTime: number = 5;

    constructor(public src: string, engine: ArcadeEngine, public color: number = -1) {
        super("text", engine);
        this.load();
    }

    public async load(): Promise<void> {
        return new Promise<void>(resolve => {
            let repaintColor: IIntColor3;
            if (this.color != -1) {
                repaintColor = ArcadeEngineColorsInt[this.color];
            }
            this.canvas = document.createElement("canvas");
            let img = document.createElement("img") as HTMLImageElement;
            img.src = this.src;
            img.onload = () => {
                this.canvas.width = img.width;
                this.canvas.height = img.height;
                let context = this.canvas.getContext("2d");
                context.drawImage(img, 0, 0);

                let closestColorsMap: IIntColor3[] = [];
                let data = context.getImageData(0, 0, img.width, img.height);
                for (let i = 0; i < data.data.length / 4; i++) {
                    if (repaintColor) {
                        let a = data.data[4 * i + 3];
                        if (a > 0) {
                            data.data[4 * i] = repaintColor.r;
                            data.data[4 * i + 1] = repaintColor.g;
                            data.data[4 * i + 2] = repaintColor.b;
                        }
                    }
                    else {
                        let r = data.data[4 * i];
                        let g = data.data[4 * i + 1];
                        let b = data.data[4 * i + 2];
                        let v = r + g * 256 + b * 256 * 256;
                        if (!closestColorsMap[v]) {
                            closestColorsMap[v] = ArcadeEngineColorsInt[GetClosestColorIndex(r, g, b)];
                        }
                        let color = closestColorsMap[v];
                        data.data[4 * i] = color.r;
                        data.data[4 * i + 1] = color.g;
                        data.data[4 * i + 2] = color.b;
                    }
                }
                context.putImageData(data, 0, 0);

                this._loaded = true;
                resolve();
            }
        });
    }

    public update(): void {
        if (this.blinking) {
            this.blinkingCD--;
            if (this.blinkingCD <= 0) {
                this.isVisible = !this.isVisible;
                this.blinkingCD = this.blinkingTime;
            }
        }
    }

    public draw(): void {
        if (this._loaded) {
            this.engine.context.drawImage(this.canvas, this.position.x, this.position.y);
        }
    }
}