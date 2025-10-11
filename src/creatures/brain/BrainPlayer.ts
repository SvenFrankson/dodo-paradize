/// <reference path="SubBrain.ts"/>

enum PlayMode {
    Menu,
    Inventory,
    Playing
}

class BrainPlayer extends SubBrain {

    public inventory: PlayerInventory;
    public playerActionManager: PlayerActionManager;
    private _currentAction: PlayerAction;
    public get currentAction(): PlayerAction {
        return this._currentAction;
    }
    public set currentAction(action: PlayerAction) {        
        if (this._currentAction && this._currentAction.onUnequip) {
            this._currentAction.onUnequip();
        }

        this._currentAction = action;
        if (this._currentAction && this._currentAction.onEquip) {
            this._currentAction.onEquip();
        }
    }
    public defaultAction: PlayerAction;

    public get playMode(): PlayMode {
        if (this.game.playerInventoryView.shown) {
            return PlayMode.Inventory;
        }
        if (this.game.brickMenuView.shown) {
            return PlayMode.Menu;
        }
        if (this.game.gameMode === GameMode.Playing) {
            return PlayMode.Playing;
        }
        return PlayMode.Menu;
    }

    private _targetQ: BABYLON.Quaternion = BABYLON.Quaternion.Identity();
    private _targetLook: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    public gamepadInControl: boolean = false;
    private _pointerDownX: number = - 100;
    private _pointerDownY: number = - 100;
    private _pointerDownTime: number;
    private _pointerDown: boolean = false;
    private _touchInputLeft: TouchJoystick;
    private _pointerSmoothness: number = 0.5;
    private _moveXAxisInput: number = 0;
    private _moveYAxisInput: number = 0;
    private _rotateXAxisInput: number = 0;
    private _rotateYAxisInput: number = 0;
    private _smoothedRotateXAxisInput: number = 0;
    private _smoothedRotateYAxisInput: number = 0;

    public get scene(): BABYLON.Scene {
        return this.game.scene;
    }

    constructor(brain: Brain) {
        super(brain);
        
        this.inventory = new PlayerInventory(this);
        this.defaultAction = PlayerActionDefault.Create(this);
        this.playerActionManager = new PlayerActionManager(this, this.game);
    }

    public initialize(): void {
        this.playerActionManager.initialize();

        this.game.inputManager.addMappedKeyDownListener(KeyInput.PLAYER_ACTION, () => {
            if (this.playMode === PlayMode.Playing) {
                if (this.currentAction) {
                    this.currentAction.onPointerDown();
                }
                else if (this.defaultAction.onPointerDown) {
                    this.defaultAction.onPointerDown();
                }
            }
        })
        
        for (let slotIndex = 0; slotIndex < 10; slotIndex++) {
            this.game.inputManager.addMappedKeyDownListener(KeyInput.ACTION_SLOT_0 + slotIndex, () => {
                if (this.playerActionManager) {
                    if (slotIndex === this.playerActionManager.currentActionIndex) {
                        this.playerActionManager.toggleEquipAction();
                    }
                    else {
                        this.playerActionManager.setActionIndex(slotIndex);
                        this.playerActionManager.equipAction();
                    }
                }
            })
        }

        this.game.inputManager.addMappedKeyDownListener(KeyInput.PLAYER_ACTION_EQUIP, () => {
            if (this.playMode === PlayMode.Playing) {
                if (this.playerActionManager) {
                    this.playerActionManager.toggleEquipAction();
                }
            }
        })

        this.game.inputManager.addMappedKeyDownListener(KeyInput.PLAYER_ACTION_DEC, () => {
            if (this.playerActionManager) {
                this.playerActionManager.setActionIndex(this.playerActionManager.prevActionIndex());
            }
        })

        this.game.inputManager.addMappedKeyDownListener(KeyInput.PLAYER_ACTION_INC, () => {
            if (this.playerActionManager) {
                this.playerActionManager.setActionIndex(this.playerActionManager.nextActionIndex());
            }
        })

        this.game.inputManager.addMappedKeyDownListener(KeyInput.INVENTORY, () => {
            if (this.game.playerInventoryView.shown) {
                this.game.playerInventoryView.hide(0.2);
            }
            else {
                if (this.game.inputManager.isPointerLocked) {
                    document.exitPointerLock();
                    this.game.playerInventoryView.onNextHide = () => {
                        this.game.canvas.requestPointerLock();
                    }
                }
                this.game.playerInventoryView.show(0.2);
            }
        })

        this.game.inputManager.addMappedKeyDownListener(KeyInput.INVENTORY_PREV_CAT, () => {
            if (this.playMode === PlayMode.Inventory) {
                this.game.playerInventoryView.setCurrentCategory(this.game.playerInventoryView.prevCategory);
            }
        })

        this.game.inputManager.addMappedKeyDownListener(KeyInput.INVENTORY_NEXT_CAT, () => {
            if (this.playMode === PlayMode.Inventory) {
                this.game.playerInventoryView.setCurrentCategory(this.game.playerInventoryView.nextCategory);
            }
        })

        this.game.inputManager.addMappedKeyDownListener(KeyInput.INVENTORY_EQUIP_ITEM, () => {
            if (this.playMode === PlayMode.Inventory) {
                let item = this.game.playerInventoryView.getCurrentItem();
                if (item) {
                    let action = item.getPlayerAction(this);
                    this.playerActionManager.linkAction(action, this.playerActionManager.currentActionIndex);
                    if (this.playerActionManager.alwaysEquip) {
                        this.playerActionManager.equipAction();
                    }
                }
            }
        })

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
        this.game.canvas.addEventListener("pointerdown", this._onPointerDown)
        this.game.canvas.addEventListener("pointerup", this._pointerUp)
        this.game.canvas.addEventListener("pointermove", this._pointerMove)
        window.addEventListener("wheel", this._wheel);
        
        this._touchInputLeft = document.querySelector("#touch-input-move");
        this._touchInputLeft.onJoystickChange = (x: number, y: number) => {
            this._moveXAxisInput = x;
            this._moveYAxisInput = y;
        }
    }

    private _onPointerDown = (event: PointerEvent) => {
        this._pointerDownTime = performance.now();
        this._pointerDownX = event.clientX;
        this._pointerDownY = event.clientY;
        this._pointerDown = true;
        if (this.playMode === PlayMode.Playing) {
            if (this.currentAction) {
                if (event.button === 0) {
                    if (this.currentAction.onPointerDown) {
                        this.currentAction.onPointerDown();
                    }
                }
                else if (event.button === 2) {
                    if (this.currentAction.onRightPointerDown) {
                        this.currentAction.onRightPointerDown();
                    }
                }
            }
            else {
                if (event.button === 0) {
                    if (this.defaultAction.onPointerDown) {
                        this.defaultAction.onPointerDown();
                    }
                }
                else if (event.button === 2) {
                    if (this.defaultAction.onRightPointerDown) {
                        this.defaultAction.onRightPointerDown();
                    }
                }
            }
        }
    }

    private _pointerMove = (event: PointerEvent) => {
        if (this._pointerDown || this.game.inputManager.isPointerLocked) {
            this.gamepadInControl = false;
            this._rotateXAxisInput += event.movementY / 200;
            this._rotateYAxisInput += event.movementX / 200;
        }
    }

    private _pointerUp = (event: PointerEvent) => {
        this._pointerDown = false;
        let dX = this._pointerDownX - event.clientX;
        let dY = this._pointerDownY - event.clientY;
        let distance = Math.sqrt(dX * dX + dY * dY);
        let duration = (performance.now() - this._pointerDownTime) / 1000;
        if (this.playMode === PlayMode.Playing) {
            if (this.currentAction) {
                if (event.button === 0) {
                    if (this.currentAction.onPointerUp) {
                        this.currentAction.onPointerUp(duration, distance);
                    }
                }
                else if (event.button === 2) {
                    if (this.currentAction.onRightPointerUp) {
                        this.currentAction.onRightPointerUp(duration, distance);
                    }
                }
            }
            else {
                if (event.button === 0) {
                    if (this.defaultAction.onPointerUp) {
                        this.defaultAction.onPointerUp(duration, distance);
                    }
                }
                else if (event.button === 2) {
                    if (this.defaultAction.onRightPointerUp) {
                        this.defaultAction.onRightPointerUp(duration, distance);
                    }
                }
            }
        }
    }

    private _wheel = (event: WheelEvent) => {
        if (this.currentAction) {
            if (this.currentAction.onWheel) {
                this.currentAction.onWheel(event);
            }
        }
        else {
            if (this.defaultAction.onWheel) {
                this.defaultAction.onWheel(event);
            }
        }
    }

    public update(dt: number): void {
        
        if (this.game.gameMode === GameMode.Playing) {
            let moveInput = new BABYLON.Vector2(this._moveXAxisInput, this._moveYAxisInput);
            let inputForce = moveInput.length();
            if (inputForce > 1) {
                moveInput.normalize();
            }
            let dir = this.dodo.right.scale(moveInput.x * 0.5).add(this.dodo.forward.scale(moveInput.y * (moveInput.y > 0 ? 1 : 0.5)));
            if (dir.lengthSquared() > 0) {
                this.dodo.position.addInPlace(dir.scale(this.dodo.speed * dt));
                let fSpeed = Nabu.Easing.smoothNSec(1 / dt, 0.1);
                BABYLON.Vector3.LerpToRef(this.dodo.animatedSpeed, dir.scale(this.dodo.speed), 1 - fSpeed, this.dodo.animatedSpeed);
            }
            else {
                let fSpeed = Nabu.Easing.smoothNSec(1 / dt, 0.1);
                this.dodo.animatedSpeed.scaleInPlace(fSpeed);
            }

            if (this.currentAction) {
                this.currentAction.onUpdate();
            }
        }

        this._smoothedRotateXAxisInput = this._smoothedRotateXAxisInput * this._pointerSmoothness + this._rotateXAxisInput * (1 - this._pointerSmoothness);
        this._smoothedRotateYAxisInput = this._smoothedRotateYAxisInput * this._pointerSmoothness + this._rotateYAxisInput * (1 - this._pointerSmoothness);
        this._rotateXAxisInput = 0;
        this._rotateYAxisInput = 0;

        this.game.camera.verticalAngle += this._smoothedRotateXAxisInput;
        this.dodo.rotate(BABYLON.Axis.Y, this._smoothedRotateYAxisInput);

        let f = 1;
        if (this.game.gameMode === GameMode.Home) {
            let dir = this.game.camera.globalPosition.subtract(this.dodo.position);
            let angle = Mummu.AngleFromToAround(this.dodo.forward, dir, BABYLON.Axis.Y);
            f = Nabu.Easing.smoothNSec(1 / dt, 1);
            if (Math.abs(angle) < Math.PI / 4) {
                this._targetLook.copyFrom(this.game.camera.globalPosition);
            }
            else {
                let twistAngle = Mummu.Angle(this.dodo.forward, this.dodo.head.forward);
                if (Math.random() < 0.005 || twistAngle > Math.PI / 6) {
                    this._targetLook.copyFrom(this.dodo.position);
                    this._targetLook.addInPlace(this.dodo.forward.scale(4));
                    this._targetLook.x += Math.random() * 2 - 1;
                    this._targetLook.y += Math.random() * 2 - 1;
                    this._targetLook.z += Math.random() * 2 - 1;
                }
            }
        }
        else if (this.game.gameMode === GameMode.Playing) {
            let aimRay = this.game.camera.getForwardRay(50);
            let pick = this.game.scene.pickWithRay(aimRay, (mesh) => {
                return mesh instanceof DodoCollider && mesh.dodo != this.dodo;
            });
            if (pick.hit && pick.pickedMesh instanceof DodoCollider) {
                this._targetLook.copyFrom(pick.pickedMesh.dodo.head.absolutePosition);
                f = Nabu.Easing.smoothNSec(1 / dt, 0.3);
            }
            else {
                this._targetLook.copyFrom(aimRay.direction).scaleInPlace(50).addInPlace(aimRay.origin);
                f = Nabu.Easing.smoothNSec(1 / dt, 0.1);
            }
        }
        BABYLON.Vector3.LerpToRef(this.dodo.targetLook, this._targetLook, 1 - f, this.dodo.targetLook);
    }
}