/// <reference path="SubBrain.ts"/>

class BrainPlayer extends SubBrain {

    private _targetQ: BABYLON.Quaternion = BABYLON.Quaternion.Identity();
    private _targetLook: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    private _pointerDown: boolean = false;
    private _moveXAxisInput: number = 0;
    private _moveYAxisInput: number = 0;
    private _rotateXAxisInput: number = 0;
    private _rotateYAxisInput: number = 0;

    public initialize(): void {
        this.game.canvas.addEventListener("keydown", (ev: KeyboardEvent) => {
            if (ev.code === "KeyW") {
                this._moveYAxisInput = 1;
            }
            else if (ev.code === "KeyS") {
                this._moveYAxisInput = -1;
            }
            if (ev.code === "KeyA") {
                this._moveXAxisInput = -1;
            }
            else if (ev.code === "KeyD") {
                this._moveXAxisInput = 1;
            }
        })
        this.game.canvas.addEventListener("keyup", (ev: KeyboardEvent) => {
            if (ev.code === "KeyW") {
                this._moveYAxisInput = 0;
            }
            else if (ev.code === "KeyS") {
                this._moveYAxisInput = 0;
            }
            if (ev.code === "KeyA") {
                this._moveXAxisInput = 0;
            }
            else if (ev.code === "KeyD") {
                this._moveXAxisInput = 0;
            }
        })
        this.game.canvas.addEventListener("pointerdown", (ev: PointerEvent) => {
            this._pointerDown = true;
        })
        this.game.canvas.addEventListener("pointerup", (ev: PointerEvent) => {
            this._pointerDown = false;
            this._rotateXAxisInput = 0;
            this._rotateYAxisInput = 0;
        })
        this.game.canvas.addEventListener("pointermove", (ev: PointerEvent) => {
            if (this._pointerDown) {
                this._rotateXAxisInput = ev.movementY / 100;
                this._rotateYAxisInput = ev.movementX / 100;
            }
        })
    }

    public update(dt: number): void {
        let dir = this.dodo.forward.scale(this._moveYAxisInput).add(this.dodo.right.scale(this._moveXAxisInput));
        if (dir.lengthSquared() > 0) {
            this.dodo.position.addInPlace(dir.scale(this.dodo.speed * dt));
        }
        this.game.camera.verticalAngle += this._rotateXAxisInput;
        this.dodo.rotate(BABYLON.Axis.Y, this._rotateYAxisInput);
    }
}