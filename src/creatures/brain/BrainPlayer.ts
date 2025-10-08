/// <reference path="SubBrain.ts"/>

class BrainPlayer extends SubBrain {

    private _targetQ: BABYLON.Quaternion = BABYLON.Quaternion.Identity();
    private _targetLook: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    private _pointerDown: boolean = false;
    private _touchInputLeft: TouchJoystick;
    private _pointerSmoothness: number = 0.5;
    private _moveXAxisInput: number = 0;
    private _moveYAxisInput: number = 0;
    private _rotateXAxisInput: number = 0;
    private _rotateYAxisInput: number = 0;
    private _smoothedRotateXAxisInput: number = 0;
    private _smoothedRotateYAxisInput: number = 0;

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
        })
        this.game.canvas.addEventListener("pointermove", (ev: PointerEvent) => {
            if (this._pointerDown) {
                this._rotateXAxisInput += ev.movementY / 200;
                this._rotateYAxisInput += ev.movementX / 200;
            }
        })
        
        this._touchInputLeft = document.querySelector("#touch-input-move");
        this._touchInputLeft.onJoystickChange = (x: number, y: number) => {
            this._moveXAxisInput = x;
            this._moveYAxisInput = y;
        }
    }

    public update(dt: number): void {
        

        let moveInput = new BABYLON.Vector2(this._moveXAxisInput, this._moveYAxisInput);
        let inputForce = moveInput.length();
        if (inputForce > 1) {
            moveInput.normalize();
        }
        let dir = this.dodo.right.scale(moveInput.x * 0.5).add(this.dodo.forward.scale(moveInput.y));
        if (dir.lengthSquared() > 0) {
            this.dodo.position.addInPlace(dir.scale(this.dodo.speed * dt));
            let fSpeed = Nabu.Easing.smoothNSec(1 / dt, 0.5);
            BABYLON.Vector3.LerpToRef(this.dodo.animatedSpeed, dir.scale(this.dodo.speed), 1 - fSpeed, this.dodo.animatedSpeed);
        }
        else {
            let fSpeed = Nabu.Easing.smoothNSec(1 / dt, 0.1);
            this.dodo.animatedSpeed.scaleInPlace(fSpeed);
        }

        this._smoothedRotateXAxisInput = this._smoothedRotateXAxisInput * this._pointerSmoothness + this._rotateXAxisInput * (1 - this._pointerSmoothness);
        this._smoothedRotateYAxisInput = this._smoothedRotateYAxisInput * this._pointerSmoothness + this._rotateYAxisInput * (1 - this._pointerSmoothness);
        this._rotateXAxisInput = 0;
        this._rotateYAxisInput = 0;

        this.game.camera.verticalAngle += this._smoothedRotateXAxisInput;
        this.dodo.rotate(BABYLON.Axis.Y, this._smoothedRotateYAxisInput);

        let aimRay = this.game.camera.getForwardRay(50);
        let pick = this.game.scene.pickWithRay(aimRay, (mesh) => {
            return mesh instanceof DodoCollider;
        });

        let f = 1;
        if (pick.hit && pick.pickedMesh instanceof DodoCollider) {
            this._targetLook.copyFrom(pick.pickedMesh.dodo.head.absolutePosition);
            f = Nabu.Easing.smoothNSec(1 / dt, 0.3);
        }
        else {
            this._targetLook.copyFrom(aimRay.direction).scaleInPlace(50).addInPlace(aimRay.origin);
            f = Nabu.Easing.smoothNSec(1 / dt, 0.1);
        }
        BABYLON.Vector3.LerpToRef(this.dodo.targetLook, this._targetLook, 1 - f, this.dodo.targetLook);
    }
}