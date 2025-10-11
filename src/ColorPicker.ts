class ColorPicker extends HTMLElement implements Nabu.IPage {

    public target: any;
    public targetIndex: number = -1;

    public static get observedAttributes() {
        return [];
    }

    public titleElement: HTMLElement;
    private buttons: HTMLButtonElement[] = [];
    public metalMaterialButtons: HTMLDivElement;
    public exterior: HTMLDivElement;

    private _loaded: boolean = false;
    public get loaded(): boolean {
        return this._loaded;
    }
    private _shown: boolean = false;
    public get shown(): boolean {
        return this._shown;
    }

    private _onLoad: () => void;
    public get onLoad(): () => void {
        return this._onLoad;
    }
    public set onLoad(callback: () => void) {
        this._onLoad = callback;
        if (this._loaded) {
            this._onLoad();
        }
    }

    public async waitLoaded(): Promise<void> {
        return new Promise<void>(resolve => {
            let wait = () => {
                if (this._loaded) {
                    resolve();
                }
                else {
                    requestAnimationFrame(wait);
                }
            }
            wait();
        })
    }

    public connectedCallback(): void {
        this.style.display = "none";

        this.addEventListener("pointerdown", StopPointerProgatation);
        this.addEventListener("pointermove", StopPointerProgatation);
        this.addEventListener("pointerup", StopPointerProgatationAndMonkeys);

        let container: HTMLDivElement;
        container = document.createElement("div");
        container.classList.add("container");
        this.appendChild(container);

        this.titleElement = document.createElement("h2");
        this.titleElement.innerHTML = "Color";
        container.appendChild(this.titleElement);

        this.metalMaterialButtons = document.createElement("div");
        container.appendChild(this.metalMaterialButtons);

        this.exterior = document.createElement("div");
        this.exterior.classList.add("color-picker-exterior");
        this.exterior.style.display = "none";
        this.parentElement.appendChild(this.exterior);
        this.exterior.onclick = () => {
            this.hide();
        }

        this._loaded = true;
    }

    public initColorButtons(game: Game): void {
        this.buttons = [];
        for (let i = 0; i < DodoColors.length; i++) {
            let index = i;
            let dodoColor = DodoColors[i];
            let colorbutton = document.createElement("button");
            colorbutton.setAttribute("title", dodoColor.name);
            colorbutton.style.backgroundColor = dodoColor.color.toHexString();
            
            this.metalMaterialButtons.appendChild(colorbutton);
            
            this.buttons[index] = colorbutton;
            colorbutton.onclick = () => {
                this.setCurrentColorIndex(index);
                if (this.onColorIndexChanged) {
                    this.onColorIndexChanged(index);
                }
            }
        }
    }

    public setCurrentColorIndex(colorIndex: number): void {
        this.buttons.forEach(btn => {
            btn.classList.remove("selected");
        });
        if (this.buttons[colorIndex]) {
            this.buttons[colorIndex].classList.add("selected");
        }
    }

    public onColorIndexChanged = (colorIndex: number) => {};

    public attributeChangedCallback(name: string, oldValue: string, newValue: string) {}

    public onNextHide: () => void;

    public setAnchor(x: number, y: number): void {
        let w = window.innerWidth;
        let h = window.innerHeight;
        if (document.body.classList.contains("vertical")) {
            this.style.right = x.toFixed(0) + "px";
            this.style.bottom = y.toFixed(0) + "px";
            this.style.top = "";
        }
        else {
            console.log(w + " " + h + " " + x + " " + y);
            if (x > w * 0.5) {
                this.style.right = (w - x).toFixed(0) +"px";
                this.style.left = "";
            }
            else {
                this.style.right = "";
                this.style.left = x.toFixed(0) +"px";
            }

            if (y > h * 0.5) {
                this.style.bottom = (h - y).toFixed(0) +"px";
                this.style.top = "";
            }
            else {
                this.style.bottom = "";
                this.style.top = y.toFixed(0) +"px";
            }
        }
    }

    public async show(): Promise<void> {
        this._shown = true;
        this.style.display = "block";
        this.exterior.style.display = "block";
    }

    public async hide(): Promise<void> {
        this._shown = false;
        this.style.display = "none";
        this.exterior.style.display = "none";
        this.onColorIndexChanged = undefined;
    }
}

customElements.define("color-picker", ColorPicker);
