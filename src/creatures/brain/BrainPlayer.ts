/// <reference path="SubBrain.ts"/>

class BrainPlayer extends SubBrain {

    private _targetQ: BABYLON.Quaternion = BABYLON.Quaternion.Identity();
    private _targetLook: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    private _pointerDown: boolean = false;
    private _leftTouchInputDown: boolean = false;
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
        
        let touchMoveInput = document.querySelector("#touch-input-move") as HTMLDivElement;
        let touchMoveInputUp = touchMoveInput.querySelector(".touch-joystick-up");
        let touchMoveInputRight = touchMoveInput.querySelector(".touch-joystick-right");
        let touchMoveInputBottom = touchMoveInput.querySelector(".touch-joystick-bottom");
        let touchMoveInputLeft = touchMoveInput.querySelector(".touch-joystick-left");

        let setXYColor = (x, y) => {
            let up = 0.2;
            if (y > 0) {
                up = 0.2 + 0.8 * y; 
            }
            touchMoveInputUp.setAttribute("opacity", up.toFixed(2));

            let right = 0.2;
            if (x > 0) {
                right = 0.2 + 0.8 * x; 
            }
            touchMoveInputRight.setAttribute("opacity", right.toFixed(2));
            
            let bottom = 0.2;
            if (y < 0) {
                bottom = 0.2 + 0.8 * Math.abs(y); 
            }
            touchMoveInputBottom.setAttribute("opacity", bottom.toFixed(2));
            
            let left = 0.2;
            if (x < 0) {
                left = 0.2 + 0.8 * Math.abs(x); 
            }
            touchMoveInputLeft.setAttribute("opacity", left.toFixed(2));
        }

        touchMoveInput.addEventListener("pointerdown", (ev: PointerEvent) => {
            this._leftTouchInputDown = true;
            let rect = touchMoveInput.getBoundingClientRect();
            let x = ev.clientX - rect.left;
            let y = ev.clientY - rect.top;
            let s = rect.width;
            this._moveXAxisInput = (x / s - 0.5) * 2;
            this._moveYAxisInput = - ((y / s - 0.5) * 2);
            setXYColor(this._moveXAxisInput, this._moveYAxisInput);
            console.log(rect);
            ev.preventDefault();
        });
        touchMoveInput.addEventListener("pointerup", (ev: PointerEvent) => {
            this._leftTouchInputDown = false;
            this._moveXAxisInput = 0;
            this._moveYAxisInput = 0;
            setXYColor(this._moveXAxisInput, this._moveYAxisInput);
            ev.preventDefault();
        });
        touchMoveInput.addEventListener("pointermove", (ev: PointerEvent) => {
            if (this._leftTouchInputDown) {
                let rect = touchMoveInput.getBoundingClientRect();
                let x = ev.clientX - rect.left;
                let y = ev.clientY - rect.top;
                let s = rect.width;
                this._moveXAxisInput = (x / s - 0.5) * 2;
                this._moveYAxisInput = - ((y / s - 0.5) * 2);
                setXYColor(this._moveXAxisInput, this._moveYAxisInput);
            }
        });
    }

    public update(dt: number): void {
        if (Math.random() < 0.05) {
            this._targetLook.copyFrom(this.dodo.position);
            this._targetLook.addInPlace(this.dodo.forward.scale(20));
            this._targetLook.x += Math.random() * 10 - 5;
            this._targetLook.y += Math.random() * 10 - 5;
            this._targetLook.z += Math.random() * 10 - 5;
        }
        BABYLON.Vector3.SlerpToRef(this.dodo.targetLook, this._targetLook, 0.1, this.dodo.targetLook);

        let moveInput = new BABYLON.Vector2(this._moveXAxisInput, this._moveYAxisInput).normalize();
        moveInput.x *= 0.5;
        let dir = this.dodo.right.scale(moveInput.x).add(this.dodo.forward.scale(moveInput.y));
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
    }
}