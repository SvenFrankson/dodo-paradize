enum TextAlign {
    Left,
    Center,
    Right
}

class TextGameObject extends GameObject {

    private static IsWhite(r: number, g: number, b: number): boolean {
        return r === 255 && g === 255 && b === 255;
    }

    public static LetterH: number = 6;
    public static LetterW: number = 6;
    public static Characters: Map<string, Uint8Array>
    public static async LoadCharacters(): Promise<void> {
        TextGameObject.Characters = new Map<string, Uint8Array>();
        return new Promise<void>(resolve => {
            let canvas = document.createElement("canvas");
            let spritesImg = document.createElement("img") as HTMLImageElement;
            spritesImg.src = "arcade_text.png";
            spritesImg.onload = () => {
                canvas.width = spritesImg.width;
                canvas.height = spritesImg.height;
                let context = canvas.getContext("2d");
                context.drawImage(spritesImg, 0, 0);
                let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                let digits = "0123456789";
                for (let i = 0; i < letters.length; i++) {
                    let letterPixels = new Uint8Array(TextGameObject.LetterW * TextGameObject.LetterH);
                    letterPixels.fill(0);
                    let pixels = context.getImageData(i * (TextGameObject.LetterW + 1), 0, 6, 6);
                    for (let jj = 0; jj < TextGameObject.LetterH; jj++) {
                        for (let ii = 0; ii < TextGameObject.LetterW; ii++) {
                            let n = 4 * (jj * TextGameObject.LetterW + ii);
                            let r = pixels.data[n];
                            let g = pixels.data[n + 1];
                            let b = pixels.data[n + 2];
                            if (TextGameObject.IsWhite(r, g, b)) {
                                letterPixels[ii + jj * TextGameObject.LetterW] = 1;
                            }
                        }
                    }
                    TextGameObject.Characters.set(letters[i], letterPixels);
                    
                }
                for (let i = 0; i < digits.length; i++) {
                    let digitPixels = new Uint8Array(TextGameObject.LetterW * TextGameObject.LetterH);
                    digitPixels.fill(0);
                    let pixels = context.getImageData(i * (TextGameObject.LetterW + 1), TextGameObject.LetterH + 1, 6, 6);
                    for (let jj = 0; jj < TextGameObject.LetterH; jj++) {
                        for (let ii = 0; ii < TextGameObject.LetterW; ii++) {
                            let n = 4 * (jj * TextGameObject.LetterW + ii);
                            let r = pixels.data[n];
                            let g = pixels.data[n + 1];
                            let b = pixels.data[n + 2];
                            if (TextGameObject.IsWhite(r, g, b)) {
                                digitPixels[ii + jj * TextGameObject.LetterW] = 1;
                            }
                        }
                    }
                    TextGameObject.Characters.set(digits[i], digitPixels);
                    
                }
                resolve();
            }
        });
    }

    public backgroundColor: number = -1;
    public textAlign = TextAlign.Left;

    constructor(public text: string, public color: number, engine: ArcadeEngine) {
        super("text", engine);
    }

    public draw(): void {
        let l = this.text.length * (TextGameObject.LetterW + 1) + 1;
        if (this.backgroundColor != -1) {
            let h = TextGameObject.LetterH + 1 + 1;
            let x = - 1;
            if (this.textAlign === TextAlign.Center) {
                x -= Math.round(l * 0.5);
            }
            else if (this.textAlign === TextAlign.Right) {
                x -= l;
            }
            this.engine.drawRect(x, -1, l, h, this.backgroundColor, this.position);
        }

        for (let n = 0; n < this.text.length; n++) {
            let pixels = TextGameObject.Characters.get(this.text[n]);
            if (pixels) {
                for (let j = 0; j < TextGameObject.LetterH; j++) {
                    for (let i = 0; i < TextGameObject.LetterW; i++) {
                        let p = pixels[i + j * TextGameObject.LetterW];
                        if (p > 0) {
                            let x = this.position.x + i + n * (TextGameObject.LetterW + 1);
                            if (this.textAlign === TextAlign.Center) {
                                x -= Math.round(l * 0.5);
                            }
                            else if (this.textAlign === TextAlign.Right) {
                                x -= l;
                            }
                            this.engine.drawPixel(x, this.position.y + j, this.color)
                        }
                    }
                }
            }
        }
    }
}