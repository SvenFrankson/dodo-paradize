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
        if (IsVertical) {
            this.valueElement.innerHTML = "";
        }
        else {
            this.valueElement.innerHTML = this.toString(this.value);
        }
        this.valueElement.style.backgroundColor = DodoColors[this.value].hex;
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
                    this.homeMenuPlate.game.colorPicker.titleElement.innerHTML = this.line.querySelector(".label").innerHTML + " - " + this.toString(this.value);
                }
                
                this.homeMenuPlate.game.colorPicker.show();
                this.homeMenuPlate.game.colorPicker.titleElement.innerHTML = this.line.querySelector(".label").innerHTML + " - " + this.toString(this.value);
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
    public customizeHatLine: HomeMenuCustomizeLine;
    public customizeHatColorLine: HomeMenuCustomizeColorLine;

    public get playerDodo(): Dodo {
        return this.game.playerDodo;
    }

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

        this.customizeHatLine = new HomeMenuCustomizeLine(document.querySelector("#dodo-customize-hat"));
        this.customizeHatLine.maxValue = 3;
        var customizeHatLineLabels = ["None", "Top Hat", "Cap"];
        this.customizeHatLine.toString = (v: number) => {
            return customizeHatLineLabels[v];
        }

        this.customizeHatColorLine = new HomeMenuCustomizeColorLine(3, document.querySelector("#dodo-customize-hat-color"), this);
        this.customizeHatColorLine.maxValue = DodoColors.length;
        this.customizeHatColorLine.toString = (v: number) => {
            return DodoColors[v].name;
        }
    }

    public initialize(): void {
        this.customizeHeadLine.setValue(this.playerDodo.getStyleValue(StyleValueTypes.Color1));
        this.customizeEyesLine.setValue(this.playerDodo.getStyleValue(StyleValueTypes.EyeColor));
        this.customizeBeakLine.setValue(this.playerDodo.getStyleValue(StyleValueTypes.Color2));
        this.customizeBodyLine.setValue(this.playerDodo.getStyleValue(StyleValueTypes.Color0));
        this.customizeHatLine.setValue(this.playerDodo.getStyleValue(StyleValueTypes.HatIndex));
        this.customizeHatColorLine.setValue(this.playerDodo.getStyleValue(StyleValueTypes.HatColor));

        this.customizeHeadLine.onValueChanged = (v) => {
            this.playerDodo.setStyleValue(v, StyleValueTypes.Color1);
        }

        this.customizeEyesLine.onValueChanged = (v) => {
            this.playerDodo.setStyleValue(v, StyleValueTypes.EyeColor);
        }

        this.customizeBeakLine.onValueChanged = (v) => {
            this.playerDodo.setStyleValue(v, StyleValueTypes.Color2);
        }
        
        this.customizeBodyLine.onValueChanged = (v) => {
            this.playerDodo.setStyleValue(v, StyleValueTypes.Color0);
        }
        
        this.customizeHatLine.onValueChanged = (v) => {
            this.playerDodo.setStyleValue(v, StyleValueTypes.HatIndex);
        }
        
        this.customizeHatColorLine.onValueChanged = (v) => {
            this.playerDodo.setStyleValue(v, StyleValueTypes.HatColor);
        }
    }
}