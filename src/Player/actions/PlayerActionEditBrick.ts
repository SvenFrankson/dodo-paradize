class PlayerActionEditBrick {

    public static Create(player: BrainPlayer): PlayerAction {
        let deleteDraggedBrickBtn = document.querySelector("#delete-dragged-brick") as HTMLDivElement;
        let rotateSelectedBrickBtn = document.querySelector("#rotate-selected-brick") as HTMLDivElement;
        
        let inputManager = player.game.inputManager;
        let actionRange: number = 6;
        let actionRangeSquared: number = actionRange * actionRange;
        let editBrickAction = new PlayerAction("edit-brick-action", player);
        editBrickAction.backgroundColor = "#00000080";
        editBrickAction.iconUrl = "datas/icons/move_icon.png";

        let fluke = 0;

        let aimedObject: IAimable;
        let setAimedObject = (b: IAimable) => {
            if (b != aimedObject) {
                if (aimedObject) {
                    aimedObject.unlit();
                }
                aimedObject = b;
                if (aimedObject) {
                    aimedObject.highlight();
                }
            }
        }

        let aimAtPointer = (x?: number, y?: number) => {
            if (isNaN(x) || isNaN(y)) {
                if (player.gamepadInControl || inputManager.isPointerLocked) {
                    x = player.game.canvas.width * 0.5;
                    y = player.game.canvas.height * 0.5;
                }
                else {
                    x = player.scene.pointerX * PerformanceWatcher.DEVICE_PIXEL_RATIO;
                    y = player.scene.pointerY * PerformanceWatcher.DEVICE_PIXEL_RATIO;
                }
            }
            let hit = player.game.scene.pick(
                x,
                y,
                (mesh) => {
                    return mesh instanceof ConstructionMesh || mesh instanceof TextBrickMesh || mesh instanceof PictureBrickMesh;
                }
            )

            if (hit.hit && hit.pickedPoint) {
                if (BABYLON.Vector3.DistanceSquared(player.dodo.position, hit.pickedPoint) < actionRangeSquared) {
                    if (hit.pickedMesh instanceof ConstructionMesh) {
                        let construction = hit.pickedMesh.construction;
                        if (construction) {
                            let brick = construction.getBrickForFaceId(hit.faceId);
                            if (brick) {
                                setAimedObject(brick);
                            }
                            return;
                        }
                    }
                    else if (hit.pickedMesh instanceof TextBrickMesh || hit.pickedMesh instanceof PictureBrickMesh) {
                        let brick = hit.pickedMesh.brick;
                        if (brick) {
                            setAimedObject(brick);
                        }
                        return;
                    }
                }
            }
            setAimedObject(undefined);
        }

        editBrickAction.onUpdate = () => {
            if (IsTouchScreen) {
                return;
            }
            if (player.playMode === PlayMode.Playing) {
                return aimAtPointer();
            }
            setAimedObject(undefined);
        }

        editBrickAction.onPointerDown = async (ev?: PointerEvent) => {
            if (IsTouchScreen) {
                rotateSelectedBrickBtn.style.display = "none";
                if (aimedObject === undefined) {
                    
                }
                else {
                    let prevAim = aimedObject;
                    if (ev) {
                        aimAtPointer(ev.clientX * PerformanceWatcher.DEVICE_PIXEL_RATIO, ev.clientY * PerformanceWatcher.DEVICE_PIXEL_RATIO);
                    }
                    else {
                        aimAtPointer();
                    }
                    if (aimedObject === prevAim) {
                        if (IsTouchScreen && aimedObject) {
                            deleteDraggedBrickBtn.style.display = "block";
                        }
                        await editBrickAction.onPointerUp();
                        player.game.playerBrainPlayer.lockControl = true;
                    }
                    else {
                        setAimedObject(undefined);
                    }
                }
            }
        }

        editBrickAction.onPointerUp = async (duration, onScreenDistance) => {
            player.game.playerBrainPlayer.lockControl = false;
            if (onScreenDistance > 4) {
                return;
            }
            if (player.playMode === PlayMode.Playing) {
                if (IsTouchScreen) {
                    let prevAim = aimedObject;
                    aimAtPointer();
                    if (prevAim != aimedObject) {
                        if (IsTouchScreen && aimedObject) {
                            rotateSelectedBrickBtn.style.display = "block";
                        }
                        return;
                    }
                }
                if (aimedObject instanceof Brick) {
                    let construction = aimedObject.construction;
                    if (construction && construction.isPlayerAllowedToEdit()) {
                        let brickId = aimedObject.index;
                        let brickColorIndex = aimedObject.colorIndex;
                        let r = aimedObject.r;
                        aimedObject.dispose();
                        construction.updateMesh();
                        player.currentAction = await PlayerActionTemplate.CreateBrickAction(player, brickId, brickColorIndex, r, true);
                        fluke = 0;
                        return;
                    }
                }
            }
            fluke++;
            if (fluke > 3) {
                fluke = 0;
                player.playerActionManager.unEquipAction();
            }
        }

        editBrickAction.onRightPointerUp = (duration, onScreenDistance) => {
            if (onScreenDistance > 4) {
                return;
            }
            if (player.playMode === PlayMode.Playing) {
                if (aimedObject instanceof Brick) {
                    let construction = aimedObject.construction;
                    if (construction && construction.isPlayerAllowedToEdit()) {
                        aimedObject.dispose();
                        construction.updateMesh();
                        construction.saveToLocalStorage();
                        construction.saveToServer();
                        fluke = 0;
                        return;
                    }
                }
            }
            fluke++;
            if (fluke > 3) {
                fluke = 0;
                player.playerActionManager.unEquipAction();
            }
        }

        editBrickAction.onEquip = () => {
            rotateSelectedBrickBtn.onclick = (ev: PointerEvent) => {
                if (aimedObject instanceof Brick) {
                    let construction = aimedObject.construction;
                    if (construction && construction.isPlayerAllowedToEdit()) {
                        aimedObject.r = (aimedObject.r + 1) % 4;
                        construction.updateMesh();
                        return;
                    }
                }
                ev.preventDefault();
            }
        }

        editBrickAction.onUnequip = () => {
            setAimedObject(undefined);
        }
        
        return editBrickAction;
    }
}