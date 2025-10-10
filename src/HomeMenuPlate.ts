class HomeMenuCustomizeLine {

    public maxValue: number = 16;
    private _value: number = 0;
    public get value(): number {
        return this._value;
    }
    public setValue(v: number, skipOnValueChangedCallback?: boolean) {
        this._value = (v + this.maxValue) % this.maxValue;
        this.valueElement.innerHTML = this.toString(this.value);
        if (!skipOnValueChangedCallback) {
            this.onValueChanged(this.value);
        }
    }
    public prev: HTMLButtonElement;
    public next: HTMLButtonElement;
    public valueElement: HTMLSpanElement;

    constructor(public line: HTMLDivElement) {
        this.prev = this.line.querySelector(".prev");
        this.prev.onclick = this.onPrev;
        this.next = this.line.querySelector(".next");
        this.next.onclick = this.onNext;
        this.valueElement = this.line.querySelector(".value");
    }

    public onPrev = () => {
        this.setValue(this.value - 1);
    };
    public onNext = () => {
        this.setValue(this.value + 1);
    };
    public toString = (v: number) => {
        return v.toFixed(0);
    }
    public onValueChanged = (v: number) => {

    }
}

class HomeMenuCustomizeColorLine {

    public maxValue: number = 16;
    private _value: number = 0;
    public get value(): number {
        return this._value;
    }
    public setValue(v: number, skipOnValueChangedCallback?: boolean) {
        this._value = (v + this.maxValue) % this.maxValue;
        this.valueElement.innerHTML = this.toString(this.value);
        this.valueElement.style.backgroundColor = DodoColors[this.value].color.toHexString();
        this.valueElement.style.color = DodoColors[this.value].textColor;
        if (!skipOnValueChangedCallback) {
            this.onValueChanged(this.value);
        }
    }
    public prev: HTMLButtonElement;
    public next: HTMLButtonElement;
    public valueElement: HTMLSpanElement;

    constructor(public index: number, public line: HTMLDivElement, public homeMenuPlate: HomeMenuPlate) {
        this.prev = this.line.querySelector(".prev");
        this.prev.onclick = this.onPrev;
        this.next = this.line.querySelector(".next");
        this.next.onclick = this.onNext;
        this.valueElement = this.line.querySelector(".value");
        this.valueElement.onclick = (ev: MouseEvent) => {
            if (
                this.homeMenuPlate.game.colorPicker.shown &&
                this.homeMenuPlate.game.colorPicker.targetIndex === this.index
            ) {
                this.homeMenuPlate.game.colorPicker.hide();
            }
            else {
                //let bbox = this.line.getBoundingClientRect();
                //this.homeMenuPlate.game.colorPicker.setAnchor(bbox.right + 10, ev.clientY);
                this.homeMenuPlate.game.colorPicker.setCurrentColorIndex(this.value);

                this.homeMenuPlate.game.colorPicker.onColorIndexChanged = async (colorIndex: number) => {
                    this.setValue(colorIndex);
                }
                
                this.homeMenuPlate.game.colorPicker.show();
                this.homeMenuPlate.game.colorPicker.titleElement.innerHTML = this.line.querySelector(".label").innerHTML;
                this.homeMenuPlate.game.colorPicker.targetIndex = this.index;
            }
        }
    }

    public onPrev = () => {
        this.setValue(this.value - 1);
    };
    public onNext = () => {
        this.setValue(this.value + 1);
    };
    public toString = (v: number) => {
        return v.toFixed(0);
    }
    public onValueChanged = (v: number) => {

    }
}

class HomeMenuPlate extends BABYLON.Mesh {

    public customizeHeadLine: HomeMenuCustomizeColorLine;
    public customizeEyesLine: HomeMenuCustomizeColorLine;
    public customizeBeakLine: HomeMenuCustomizeColorLine;
    public customizeBodyLine: HomeMenuCustomizeColorLine;

    constructor(public game: Game) {
        super("home-menu-plate");
        BABYLON.CreateCylinderVertexData({ height: 0.1, diameter: 1 }).applyToMesh(this);
        this.position.copyFromFloats(0, -1000, 0);

        let skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 100 }, this.game.scene);
        skybox.parent = this;
        let skyboxMaterial: BABYLON.StandardMaterial = new BABYLON.StandardMaterial("skyBox", this.game.scene);
        skyboxMaterial.backFaceCulling = false;
        let skyTexture = new BABYLON.CubeTexture(
            "./datas/skyboxes/cloud",
            this.game.scene,
            ["-px.jpg", "-py.jpg", "-pz.jpg", "-nx.jpg", "-ny.jpg", "-nz.jpg"]);
        skyboxMaterial.reflectionTexture = skyTexture;
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.emissiveColor = BABYLON.Color3.FromHexString("#5c8b93").scaleInPlace(0.7);
        skybox.material = skyboxMaterial;

        this.customizeHeadLine = new HomeMenuCustomizeColorLine(0, document.querySelector("#dodo-customize-head"), this);
        this.customizeHeadLine.maxValue = DodoColors.length;
        this.customizeHeadLine.toString = (v: number) => {
            return DodoColors[v].name;
        }
        this.customizeEyesLine = new HomeMenuCustomizeColorLine(1, document.querySelector("#dodo-customize-eyes"), this);
        this.customizeEyesLine.maxValue = DodoColors.length;
        this.customizeEyesLine.toString = (v: number) => {
            return DodoColors[v].name;
        }
        this.customizeBeakLine = new HomeMenuCustomizeColorLine(2, document.querySelector("#dodo-customize-beak"), this);
        this.customizeBeakLine.maxValue = DodoColors.length;
        this.customizeBeakLine.toString = (v: number) => {
            return DodoColors[v].name;
        }
        this.customizeBodyLine = new HomeMenuCustomizeColorLine(3, document.querySelector("#dodo-customize-body"), this);
        this.customizeBodyLine.maxValue = DodoColors.length;
        this.customizeBodyLine.toString = (v: number) => {
            return DodoColors[v].name;
        }
    }

    public initialize(): void {
        let style = this.game.playerDodo.style;
        this.customizeHeadLine.setValue(parseInt(style.substring(2, 4), 16));
        this.customizeEyesLine.setValue(parseInt(style.substring(6, 8), 16));
        this.customizeBeakLine.setValue(parseInt(style.substring(4, 6), 16));
        this.customizeBodyLine.setValue(parseInt(style.substring(0, 2), 16));

        this.customizeHeadLine.onValueChanged = (v) => {
            let style = this.game.playerDodo.style;
            let newStyle = style.substring(0, 2) + v.toString(16).padStart(2, "0") + style.substring(4, 8);
            console.log(style + " " + newStyle);
            this.game.playerDodo.setStyle(newStyle);
        }

        this.customizeEyesLine.onValueChanged = (v) => {
            let style = this.game.playerDodo.style;
            let newStyle = style.substring(0, 6) + v.toString(16).padStart(2, "0");
            console.log(style + " " + newStyle);
            this.game.playerDodo.setStyle(newStyle);
        }

        this.customizeBeakLine.onValueChanged = (v) => {
            let style = this.game.playerDodo.style;
            let newStyle = style.substring(0, 4) + v.toString(16).padStart(2, "0")  + style.substring(6, 8);
            console.log(style + " " + newStyle);
            this.game.playerDodo.setStyle(newStyle);
        }
        
        this.customizeBodyLine.onValueChanged = (v) => {
            let style = this.game.playerDodo.style;
            let newStyle = v.toString(16).padStart(2, "0") + style.substring(2, 8);
            console.log(style + " " + newStyle);
            this.game.playerDodo.setStyle(newStyle);
        }
    }
}