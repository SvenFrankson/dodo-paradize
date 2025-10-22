class MiniatureFactory {

    public engine: BABYLON.Engine;
    public scene: BABYLON.Scene;
    public light: BABYLON.HemisphericLight;
    public camera: BABYLON.ArcRotateCamera;

    private _cachedData: Map<string, string> = new Map<string, string>();

    constructor(public game: Game) {

    }

    public initialize(): void {
        let canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        this.engine = new BABYLON.Engine(canvas);
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor.copyFromFloats(0, 0, 0, 1);
        this.light = new BABYLON.HemisphericLight("miniature-light", new BABYLON.Vector3(- 2, 3, - 1).normalize(), this.scene);
        this.camera = new BABYLON.ArcRotateCamera("miniature-camera", - Math.PI / 6, Math.PI / 3, 100, BABYLON.Vector3.Zero());
        this.camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        this.camera.orthoTop = 1;
        this.camera.orthoRight = 1;
        this.camera.orthoBottom = - 1;
        this.camera.orthoLeft = - 1;

        //this.debugDownloadScreenshot();
    }

    public async makeBrickIconString(brickId: number | string): Promise<string> {
        let index = Brick.BrickIdToIndex(brickId);

        let key = "brick_" + index.toFixed(0);
        if (this._cachedData.get(key)) {
            return this._cachedData.get(key);
        }

        let canvas = await this.makeBrickIcon(brickId);
        
        let dataUrl = canvas.toDataURL();
        this._cachedData.set(key, dataUrl);
        return dataUrl;
    }

    public async makePaintIconString(colorId: number | string): Promise<string> {
        let index = DodoColorIdToIndex(colorId);

        let key = "paint_" + index.toFixed(0);
        if (this._cachedData.get(key)) {
            return this._cachedData.get(key);
        }

        let canvas = document.createElement("canvas");
        canvas.width = 2;
        canvas.height = 2;
        let context = canvas.getContext("2d");
        context.fillStyle = DodoColors[index].hex;
        context.fillRect(0, 0, 2, 2);

        let dataUrl = canvas.toDataURL();
        this._cachedData.set(key, dataUrl);
        return dataUrl;
    }

    public async makeBrickIcon(brickId: number | string): Promise<HTMLCanvasElement> {
        let brickIndex = Brick.BrickIdToIndex(brickId);
        let brick = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, this.scene);
        let template = await BrickTemplateManager.Instance.getTemplate(brickIndex);
        template.vertexData.applyToMesh(brick);
        
        this.engine.runRenderLoop(() => {
            this.scene.render();
        })

        return new Promise<HTMLCanvasElement>(resolve => {
            requestAnimationFrame(() => {
                let center = brick.getBoundingInfo();
                this.camera.target.copyFrom(center.boundingBox.minimumWorld).addInPlace(center.boundingBox.maximumWorld).scaleInPlace(0.5);
                let size = center.boundingBox.maximumWorld.subtract(center.boundingBox.minimumWorld).length();

                this.camera.orthoTop = size * 0.5 + BRICK_S * 0.5;
                this.camera.orthoRight = size * 0.5 + BRICK_S * 0.5;
                this.camera.orthoBottom = - size * 0.5 - BRICK_S * 0.5;
                this.camera.orthoLeft = - size * 0.5 - BRICK_S * 0.5;

                BABYLON.ScreenshotTools.CreateScreenshot(
                    this.engine,
                    this.camera,
                    256,
                    (data) => {
                        let img = document.createElement("img") as HTMLImageElement;
                        img.src = data;
                        img.onload = () => {
                            let canvas = document.createElement("canvas");
                            canvas.width = 256;
                            canvas.height = 256;
                            let context = canvas.getContext("2d");
                            context.drawImage(img, 0, 0);

                            brick.dispose();
                            this.engine.stopRenderLoop();

                            resolve(canvas);

                            /*
                            var tmpLink = document.createElement( 'a' );
                            tmpLink.download = "test.png";
                            tmpLink.href = canvas.toDataURL();  
                            
                            document.body.appendChild( tmpLink );
                            tmpLink.click(); 
                            document.body.removeChild( tmpLink );
                            */
                        }
                    }
                );
            });
        });
    }

    public debugDownloadScreenshot(): void {
        
        console.log("hop hip");

        let box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, this.scene);
        
        this.engine.runRenderLoop(() => {
            this.scene.render();
        })

        requestAnimationFrame(() => {
            BABYLON.ScreenshotTools.CreateScreenshot(
                this.engine,
                this.camera,
                256,
                (data) => {
                    console.log("hello");
                    let img = document.createElement("img") as HTMLImageElement;
                    img.src = data;
                    img.onload = () => {
                        console.log("hoy hoy");
                        let canvas = document.createElement("canvas");
                        canvas.width = 256;
                        canvas.height = 256;
                        let context = canvas.getContext("2d");
                        context.drawImage(img, 0, 0);

                        var tmpLink = document.createElement( 'a' );
                        tmpLink.download = "test.png";
                        tmpLink.href = canvas.toDataURL();  
                        
                        document.body.appendChild( tmpLink );
                        tmpLink.click(); 
                        document.body.removeChild( tmpLink );

                        box.dispose();
                        this.engine.stopRenderLoop();
                    }
                }
            );
        });
    }
}