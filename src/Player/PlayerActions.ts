interface IAimable {

    name: string;
    highlight: () => void;
    unlit: () => void;
}

class PlayerAction {

    public static IsAimable(mesh: BABYLON.AbstractMesh): boolean {
        if (mesh instanceof ConstructionMesh) {
            return true;
        }
        if (mesh instanceof DodoInteractCollider) {
            return true;
        }
        return false;
    }

    private _iconUrl: string;
    public get iconUrl(): string {
        return this._iconUrl;
    }
    public set iconUrl(url: string) {
        this._iconUrl = url;
        if (this._onIconUrlChanged) {
            this._onIconUrlChanged();
        }
    }
    public _onIconUrlChanged: () => void;
    public backgroundColor: string = "#ffffff";
    public r: number = 0;
    public item: PlayerInventoryItem;

    public onUpdate: () => void;
    public onPointerDown: () => void;
    public onRightPointerDown: () => void;
    public onPointerUp: (duration?: number, onScreenDistance?: number) => void;
    public onRightPointerUp: (duration?: number, onScreenDistance?: number) => void;
    public onWheel: (e: WheelEvent) => void;
    public onKeyDown: (e: KeyboardEvent) => void;
    public onKeyUp: (e: KeyboardEvent) => void;
    public onEquip: () => void;
    public onUnequip: () => void;

    constructor(    
        public name: string,
        public player: BrainPlayer
    ) {

    }
}