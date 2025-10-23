class TravelView extends HTMLElement implements Nabu.IPage {

    public static get observedAttributes() {
        return [];
    }

    private _loaded: boolean = false;
    public get loaded(): boolean {
        return this._loaded;
    }
    public waitLoaded(): Promise<void> {
        return new Promise<void>(resolve => {
            let step = () => {
                if (this.loaded) {
                    resolve();
                }
                else {
                    requestAnimationFrame(step);
                }
            }
            step();
        });
    }
    private _shown: boolean = false;
    public get shown(): boolean {
        return this._shown;
    }

    private _goToDodopolisBtn: HTMLButtonElement;
    private _goToPlaygroundBtn: HTMLButtonElement;
    private _goToParcelBtn: HTMLButtonElement;
    private _goToParcelInfo: HTMLDivElement;
    public exterior: HTMLDivElement;

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

    public connectedCallback(): void {
        this.style.display = "none";
        this.style.opacity = "0";

        this._goToDodopolisBtn = document.querySelector("#travel-dodopolis") as HTMLButtonElement;
        this._goToPlaygroundBtn = document.querySelector("#travel-playground") as HTMLButtonElement;
        this._goToParcelBtn = document.querySelector("#travel-claimed-parcel") as HTMLButtonElement;
        this._goToParcelInfo = document.querySelector("#travel-claimed-parcel-info") as HTMLDivElement;

        this._goToDodopolisBtn.onclick = () => {
            this.hide();
            Game.Instance.playerDodo.setWorldPosition(new BABYLON.Vector3(8.23, 0.937, 14.25));
            Game.Instance.playerDodo.r = - Math.PI * 0.5;
        }
        this._goToPlaygroundBtn.onclick = () => {
            this.hide();
            Game.Instance.playerDodo.setWorldPosition(new BABYLON.Vector3(1.89, 0.80, 0.17));
            Game.Instance.playerDodo.r =  Math.PI * 0.75;
        }
        this._goToParcelBtn.onclick = () => {
            this.hide();
            if (Game.Instance.networkManager.claimedConstructionI != null && Game.Instance.networkManager.claimedConstructionJ != null) {
                let p = new BABYLON.Vector3(Game.Instance.networkManager.claimedConstructionI * Construction.SIZE_m, 5, Game.Instance.networkManager.claimedConstructionJ * Construction.SIZE_m);
                let y = Game.Instance.terrain.worldPosToTerrainAltitude(p);
                if (y != null) {
                    p.y = y;
                }
                Game.Instance.playerDodo.setWorldPosition(p);
                Game.Instance.playerDodo.r = Math.PI * 0.25;
            }
        }

        this.exterior = document.createElement("div");
        this.exterior.classList.add("travel-exterior");
        this.exterior.style.display = "none";
        this.parentElement.appendChild(this.exterior);
        this.exterior.onclick = () => {
            this.hide();
        }
    }

    public attributeChangedCallback(name: string, oldValue: string, newValue: string) {}

    public onNextHide: () => void;

    public update(): void {
        if (Game.Instance.networkManager.claimedConstructionI != null && Game.Instance.networkManager.claimedConstructionJ != null) {
            this._goToParcelInfo.style.display = "none";
        }
        else {
            this._goToParcelInfo.style.display = "";
        }
    }

    public async show(duration: number = 0.2): Promise<void> {
        return new Promise<void>((resolve) => {
            if (!this._shown) {
                this._shown = true;
                this.update();
                this.exterior.style.display = "block";
                this.style.display = "block";
                let opacity0 = parseFloat(this.style.opacity);
                let opacity1 = 1;
                let t0 = performance.now();
                let step = () => {
                    let t = performance.now();
                    let dt = (t - t0) / 1000;
                    if (dt >= duration) {
                        this.style.opacity = "1";
                        resolve();
                    } else {
                        let f = dt / duration;
                        this.style.opacity = ((1 - f) * opacity0 + f * opacity1).toFixed(2);
                        requestAnimationFrame(step);
                    }
                };
                step();
            }
        });
    }

    public async hide(duration: number = 0.2): Promise<void> {
        if (duration === 0) {
            this._shown = false;
            this.exterior.style.display = "none";
            this.style.display = "none";
            this.style.opacity = "0";
        } else {
            return new Promise<void>((resolve) => {
                if (this._shown) {
                    this._shown = false;
                    this.exterior.style.display = "none";
                    this.style.display = "block";
                    let opacity0 = parseFloat(this.style.opacity);
                    let opacity1 = 0;
                    let t0 = performance.now();
                    let step = () => {
                        let t = performance.now();
                        let dt = (t - t0) / 1000;
                        if (dt >= duration) {
                            this.style.display = "none";
                            this.style.opacity = "0";
                            if (this.onNextHide) {
                                this.onNextHide();
                                this.onNextHide = undefined;
                            }
                            resolve();
                        } else {
                            let f = dt / duration;
                            this.style.opacity = ((1 - f) * opacity0 + f * opacity1).toFixed(2);
                            requestAnimationFrame(step);
                        }
                    };
                    step();
                }
            });
        }
    }
}

customElements.define("travel-page", TravelView);
