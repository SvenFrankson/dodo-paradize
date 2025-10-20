interface IAimable {

    name: string;
    highlight: () => void;
    unlit: () => void;
}

class PlayerActionDefault {

    public static IsAimable(mesh: BABYLON.AbstractMesh): boolean {
        if (mesh instanceof ConstructionMesh) {
            return true;
        }
        if (mesh instanceof DodoCollider) {
            return true;
        }
        return false;
    }

    public static Create(player: BrainPlayer): PlayerAction {
        let actionRange: number = 4;
        let actionRangeSquared: number = actionRange * actionRange;
        let defaultAction = new PlayerAction("default-action", player);
        defaultAction.backgroundColor = "#FF00FF";
        defaultAction.iconUrl = "";

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

        defaultAction.onUpdate = () => {
            if (player.playMode === PlayMode.Playing) {
                let x: number;
                let y: number;
                if (player.gamepadInControl || player.game.inputManager.isPointerLocked) {
                    x = player.game.canvas.clientWidth * 0.5;
                    y = player.game.canvas.clientHeight * 0.5;
                }
                else {
                    x = player.scene.pointerX;
                    y = player.scene.pointerY;
                }
                let hit = player.game.scene.pick(
                    x,
                    y,
                    (mesh) => {
                        return PlayerActionDefault.IsAimable(mesh) && mesh != player.dodo.dodoCollider;
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
                        else if (hit.pickedMesh instanceof DodoCollider) {
                            setAimedObject(hit.pickedMesh);
                            return;
                        }
                    }
                }
            }
            setAimedObject(undefined);
        }

        defaultAction.onPointerUp = async (duration, onScreenDistance) => {
            if (onScreenDistance > 4) {
                return;
            }
            if (duration > 0.3) {
                if (aimedObject instanceof Brick) {
                    player.game.brickMenuView.setBrick(aimedObject);
                    if (player.game.inputManager.isPointerLocked) {
                        document.exitPointerLock();
                        player.game.brickMenuView.onNextHide = () => {
                            player.game.canvas.requestPointerLock();
                        }
                    }
                    player.game.brickMenuView.show(0.1);
                }
            }
            else {
                if (player.playMode === PlayMode.Playing) {
                    if (aimedObject instanceof Brick) {
                        let construction = aimedObject.construction;
                        if (construction && construction.isPlayerAllowedToEdit()) {
                            let brickId = aimedObject.index;
                            let brickColorIndex = aimedObject.colorIndex;
                            let r = aimedObject.r;
                            aimedObject.dispose();
                            construction.updateMesh();
                            player.currentAction = await PlayerActionTemplate.CreateBrickAction(player, brickId, brickColorIndex, r, true);
                        }
                    }
                    else if (aimedObject instanceof DodoCollider) {
                        if (aimedObject.dodo.brain.npcDialog) {
                            let canvas = aimedObject.dodo.game.canvas;
                            document.exitPointerLock();
                            aimedObject.dodo.brain.npcDialog.onNextStop = () => {
                                canvas.requestPointerLock();
                            }
                            aimedObject.dodo.brain.npcDialog.start();
                        }
                    }
                }
            }
        }

        defaultAction.onRightPointerUp = (duration, onScreenDistance) => {
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
                    }
                }
            }
        }

        defaultAction.onUnequip = () => {
            ScreenLoger.Log("unequip default action");
            setAimedObject(undefined);
        }
        
        return defaultAction;
    }
}