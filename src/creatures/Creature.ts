enum LifeState {
    Folded,
    Ok,
    Dying,
    Disposed
}

class Creature extends BABYLON.Mesh {
    public hitCollider: BABYLON.Mesh;

    private _lifeState: LifeState = LifeState.Folded;
    public get lifeState(): LifeState {
        if (this.isDisposed()) {
            return LifeState.Disposed;
        }
        return this._lifeState;
    }
    public set lifeState(s: LifeState) {
        this._lifeState = s;
    }
    public hitpoint: number = 1;
    public get isAlive(): boolean {
        return this.hitpoint > 0;
    }
    public stamina: number = 10;
    public speed: number = 2;
    public animatedSpeed: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public bounty: number = 10;
    

    constructor(name: string, public game: Game) {
        super(name);
    }
    
    public barycenterWorldPositionToRef(ref: BABYLON.Vector3): void {
        BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(0, 0.5, 0), this.getWorldMatrix(), ref);
    }

    public setWorldPosition(p: BABYLON.Vector3): void {
        this.position.copyFrom(p);
    }

    public wound(amount: number): void {
        if (this.isAlive) {
            this.hitpoint -= amount;
            if (this.hitpoint <= 0) {
                this.kill();
            }
        }
    }

    public async instantiate(): Promise<void> {}

    public update(dt: number): void {}

    public async fold(): Promise<void> {}
    public async unfold(): Promise<void> {}
    public async kill(): Promise<void> {
        this.dispose();
    }
}