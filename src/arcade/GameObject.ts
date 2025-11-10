class GameObject {

    public layer: number = 0;
    public position: Vec2 = Vec2.Zero();

    constructor(public name: string, public engine: ArcadeEngine) {
        this.engine.gameObjects.push(this);
    }

    public dispose(): void {
        let index = this.engine.gameObjects.indexOf(this);
        if (index != -1) {
            this.engine.gameObjects.splice(index, 1);
        }
    }

    public draw(): void {}

    public update(dt?: number): void {}
}

class Triangle extends GameObject {

    constructor(public v1: Vec2, public v2: Vec2, public v3: Vec2, public color: number, engine: ArcadeEngine) {
        super("triangle", engine);
    }

    public draw(): void {
        this.engine.drawLine(this.v1, this.v2, this.color);
        this.engine.drawLine(this.v2, this.v3, this.color);
        this.engine.drawLine(this.v3, this.v1, this.color);
    }
}

class ArcadeText extends GameObject {

    private static IsWhite(r: number, g: number, b: number): boolean {
        return r === 255 && g === 255 && b === 255;
    }

    public static LetterH: number = 6;
    public static LetterW: number = 6;
    public static Characters: Map<string, Uint8Array>
    public static async LoadCharacters(): Promise<void> {
        ArcadeText.Characters = new Map<string, Uint8Array>();
        return new Promise<void>(resolve => {
            let canvas = document.createElement("canvas");
            let spritesImg = document.createElement("img") as HTMLImageElement;
            spritesImg.src = "datas/textures/arcade_text.png";
            spritesImg.onload = () => {
                canvas.width = spritesImg.width;
                canvas.height = spritesImg.height;
                let context = canvas.getContext("2d");
                context.drawImage(spritesImg, 0, 0);
                let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                let digits = "0123456789";
                for (let i = 0; i < letters.length; i++) {
                    let letterPixels = new Uint8Array(ArcadeText.LetterW * ArcadeText.LetterH);
                    letterPixels.fill(0);
                    let pixels = context.getImageData(i * (ArcadeText.LetterW + 1), 0, 6, 6);
                    for (let jj = 0; jj < ArcadeText.LetterH; jj++) {
                        for (let ii = 0; ii < ArcadeText.LetterW; ii++) {
                            let n = 4 * (jj * ArcadeText.LetterW + ii);
                            let r = pixels.data[n];
                            let g = pixels.data[n + 1];
                            let b = pixels.data[n + 2];
                            if (ArcadeText.IsWhite(r, g, b)) {
                                letterPixels[ii + jj * ArcadeText.LetterW] = 1;
                            }
                        }
                    }
                    ArcadeText.Characters.set(letters[i], letterPixels);
                    
                }
                for (let i = 0; i < digits.length; i++) {
                    let digitPixels = new Uint8Array(ArcadeText.LetterW * ArcadeText.LetterH);
                    digitPixels.fill(0);
                    let pixels = context.getImageData(i * (ArcadeText.LetterW + 1), ArcadeText.LetterH + 1, 6, 6);
                    for (let jj = 0; jj < ArcadeText.LetterH; jj++) {
                        for (let ii = 0; ii < ArcadeText.LetterW; ii++) {
                            let n = 4 * (jj * ArcadeText.LetterW + ii);
                            let r = pixels.data[n];
                            let g = pixels.data[n + 1];
                            let b = pixels.data[n + 2];
                            if (ArcadeText.IsWhite(r, g, b)) {
                                digitPixels[ii + jj * ArcadeText.LetterW] = 1;
                            }
                        }
                    }
                    ArcadeText.Characters.set(digits[i], digitPixels);
                    
                }
                resolve();
            }
        });
    }

    public backgroundColor: number = -1;

    constructor(public text: string, public color: number, engine: ArcadeEngine) {
        super("text", engine);
    }

    public draw(): void {
        if (this.backgroundColor != -1) {
            let l = this.text.length * (ArcadeText.LetterW + 1) + 1;
            let h = ArcadeText.LetterH + 1 + 1;
            this.engine.drawRect(-1, -1, l, h, this.backgroundColor, this.position);
        }

        for (let n = 0; n < this.text.length; n++) {
            let pixels = ArcadeText.Characters.get(this.text[n]);
            if (pixels) {
                for (let j = 0; j < ArcadeText.LetterH; j++) {
                    for (let i = 0; i < ArcadeText.LetterW; i++) {
                        let p = pixels[i + j * ArcadeText.LetterW];
                        if (p > 0) {
                            this.engine.drawPixel(this.position.x + i + n * (ArcadeText.LetterW + 1), this.position.y + j, this.color)
                        }
                    }
                }
            }
        }
    }
}