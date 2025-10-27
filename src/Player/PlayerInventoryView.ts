class PlayerInventoryView extends HTMLElement implements Nabu.IPage {

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

    public inventory: PlayerInventory;
    private _title: HTMLHeadingElement;
    private _containerFrame: HTMLDivElement;
    private _containers: HTMLDivElement[];
    private _categoryAllBtn: HTMLDivElement;
    private _categoryBricksBtn: HTMLDivElement;
    private _categoryPaintsBtn: HTMLDivElement;
    private _categoryBtns: HTMLDivElement[];
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

    public currentPointers: number[] = [0, 0, 0];
    public currentPointerUp(): void {
        if (this._lines[this._currentCategory].length > 0) {
            this.setPointer((this.currentPointers[this._currentCategory] - 1 + this._lines[this._currentCategory].length) % this._lines[this._currentCategory].length);
        }
    }
    public currentPointerDown(): void {
        if (this._lines[this._currentCategory].length > 0) {
            this.setPointer((this.currentPointers[this._currentCategory] + 1) % this._lines[this._currentCategory].length);
        }
    }
    public setPointer(n: number, cat?: InventoryCategory): void {
        if (!isFinite(cat)) {
            cat = this._currentCategory;
        }
        if (this._lines[cat][this.currentPointers[cat]]) {
            this._lines[cat][this.currentPointers[cat]].classList.remove("highlit");
        }
        this.currentPointers[cat] = n;
        if (this._lines[cat][this.currentPointers[cat]]) {
            this._lines[cat][this.currentPointers[cat]].classList.add("highlit");
        }
    }

    private _currentCategory: InventoryCategory = InventoryCategory.Brick;
    public setCurrentCategory(cat: InventoryCategory): void {
        this._currentCategory = cat;
        for (let i = 0; i < this._categoryBtns.length; i++) {
            this._categoryBtns[i].classList.remove("active");
            this._containers[i].style.display = "none";
        }
        this._categoryBtns[this._currentCategory].classList.add("active");
        this._containers[this._currentCategory].style.display = "block";
    }

    public getCurrentItem(): PlayerInventoryItem {
        if (this._lines[this._currentCategory]) {
            if (this._lines[this._currentCategory][this.currentPointers[this._currentCategory]]) {
                return this._lines[this._currentCategory][this.currentPointers[this._currentCategory]].item;
            }
        }
    }

    public get prevCategory(): number {
        return (this._currentCategory - 1 + InventoryCategory.End) % InventoryCategory.End;
    }

    public get nextCategory(): number {
        return (this._currentCategory + 1) % InventoryCategory.End;
    }

    public connectedCallback(): void {
        this.style.display = "none";
        this.style.opacity = "0";

        this._title = document.createElement("h1");
        this._title.classList.add("inventory-page-title");
        this._title.innerHTML = "INVENTORY";
        this.appendChild(this._title);

        let categoriesContainer: HTMLDivElement;
        categoriesContainer = document.createElement("div");
        this.appendChild(categoriesContainer);
        
        this._categoryBricksBtn = document.createElement("div");
        this._categoryBricksBtn.classList.add("category-btn");
        this._categoryBricksBtn.innerHTML = "BRICKS";
        categoriesContainer.appendChild(this._categoryBricksBtn);
        this._categoryBricksBtn.onclick = () => {
            this.setCurrentCategory(InventoryCategory.Brick);
        }
        
        this._categoryPaintsBtn = document.createElement("div");
        this._categoryPaintsBtn.classList.add("category-btn");
        this._categoryPaintsBtn.innerHTML = "PAINTS";
        categoriesContainer.appendChild(this._categoryPaintsBtn);
        this._categoryPaintsBtn.onclick = () => {
            this.setCurrentCategory(InventoryCategory.Paint);
        }

        this._categoryBtns = [
            this._categoryBricksBtn,
            this._categoryPaintsBtn
        ]

        this._containerFrame = document.createElement("div");
        this._containerFrame.classList.add("container-frame");
        this.appendChild(this._containerFrame);

        this._containers = [];
        for (let i = 0; i < InventoryCategory.End; i++) {
            this._containers[i] = document.createElement("div");
            this._containers[i].classList.add("container");
            this._containerFrame.appendChild(this._containers[i]);
        }

        let a = document.createElement("a");
        a.href = "#home";
        this.appendChild(a);

        this.setCurrentCategory(InventoryCategory.Brick);

        this.exterior = document.createElement("div");
        this.exterior.classList.add("inventory-exterior");
        this.exterior.style.display = "none";
        this.parentElement.appendChild(this.exterior);
        this.exterior.onclick = () => {
            this.hide();
        }
    }

    public attributeChangedCallback(name: string, oldValue: string, newValue: string) {}

    public onNextHide: () => void;

    public async show(duration: number = 0.2): Promise<void> {
        this.createPage();
        return new Promise<void>((resolve) => {
            if (!this._shown) {
                this._shown = true;
                this.exterior.style.display = "block";
                this.style.display = "block";
                (document.querySelector("#gameplay-move-ui") as HTMLDivElement).style.display = "none";
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
                    (document.querySelector("#gameplay-move-ui") as HTMLDivElement).style.display = "";
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

    public setInventory(inventory: PlayerInventory): void {
        this.inventory = inventory;
    }

    private _lines: PlayerInventoryLine[][];

    public async createPage(): Promise<void> {
        this._lines = [];

        for (let i = 0; i < this._containers.length; i++) {
            this._containers[i].innerHTML = "";
            this._lines[i] = [];
        }

        for (let i = 0; i < this.inventory.items.length; i++) {
            let inventoryItem = this.inventory.items[i];

            let line = document.createElement("div") as PlayerInventoryLine;
            line.setAttribute("is", "inventory-line");
            line.item = inventoryItem;
            line.classList.add("line");
            this._containers[inventoryItem.category].appendChild(line);
            this._lines[inventoryItem.category].push(line);

            let icon = document.createElement("img");
            icon.classList.add("inventory-icon");
            icon.setAttribute("src", await inventoryItem.getIcon());
            line.appendChild(icon);

            let label = document.createElement("div");
            label.classList.add("label");
            label.innerHTML = inventoryItem.name;
            line.appendChild(label);
    
            let countBlock = document.createElement("div");
            countBlock.classList.add("count-block");
            countBlock.innerHTML = inventoryItem.count.toFixed(0);
            line.appendChild(countBlock);
    
            let equipButton = document.createElement("button");
            equipButton.classList.add("equip-button");
            equipButton.innerHTML = "EQUIP";
            line.appendChild(equipButton);

            equipButton.onclick = async () => {
                let action = await inventoryItem.getPlayerAction(this.inventory.player);
                this.inventory.player.playerActionManager.linkAction(action, this.inventory.player.playerActionManager.currentActionIndex);
                if (this.inventory.player.playerActionManager.alwaysEquip) {
                    this.inventory.player.playerActionManager.equipAction();
                }
            }
        }

        this.setPointer(0, InventoryCategory.Brick);
        this.setPointer(0, InventoryCategory.Ingredient);
    }

    private _timer: number = 0;
    public update(dt: number): void {
        if (this._timer > 0) {
            this._timer -= dt;
        }
        let gamepads = navigator.getGamepads();
        let gamepad = gamepads[0];
        if (gamepad) {
            let axis1 = - Nabu.InputManager.DeadZoneAxis(gamepad.axes[1]);
            if (axis1 > 0.5) {
                if (this._timer <= 0) {
                    this.currentPointerUp();
                    this._timer = 0.5;
                }
            }
            else if (axis1 < - 0.5) {
                if (this._timer <= 0) {
                    this.currentPointerDown();
                    this._timer = 0.5;
                }
            }
            else {
                this._timer = 0;
            }
        }
    }
}

customElements.define("inventory-page", PlayerInventoryView);
