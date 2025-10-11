interface IAimable {

    highlight: () => void;
    unlight: () => void;
}

class PlayerActionDefault {

    public static IsAimable(mesh: BABYLON.AbstractMesh): boolean {
        if (mesh instanceof BrickMesh) {
            return true;
        }
        return false;
    }

    public static Create(player: BrainPlayer): PlayerAction {
        let brickAction = new PlayerAction("default-action", player);
        brickAction.backgroundColor = "#FF00FF";
        brickAction.iconUrl = "";

        let aimedObject: IAimable;
        let setAimedObject = (b: IAimable) => {
            if (b != aimedObject) {
                if (aimedObject) {
                    aimedObject.unlight();
                }
                aimedObject = b;
                if (aimedObject) {
                    aimedObject.highlight();
                }
            }
        }

        brickAction.onUpdate = () => {
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
                        return PlayerActionDefault.IsAimable(mesh);
                    }
                )

                if (hit.hit && hit.pickedPoint) {
                    if (hit.pickedMesh instanceof BrickMesh) {
                        let brickRoot = hit.pickedMesh.brick.root;
                        if (brickRoot) {
                            let brick = brickRoot.getBrickForFaceId(hit.faceId);
                            if (brick) {
                                setAimedObject(brick);
                            }
                            return;
                        }
                    }
                }
            }
            setAimedObject(undefined);
        }

        brickAction.onPointerUp = (duration, distance) => {
            if (distance > 4) {
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
                    if ((aimedObject instanceof Brick) && !aimedObject.root.anchored) {
                        player.currentAction = PlayerActionMoveBrick.Create(player, aimedObject.root);
                    }
                }
            }
        }

        brickAction.onRightPointerUp = (duration, distance) => {
            if (distance > 4) {
                return;
            }
            if (aimedObject instanceof Brick) {
                let prevParent = aimedObject.parent;
                if (prevParent instanceof Brick) {
                    aimedObject.setParent(undefined);
                    aimedObject.updateMesh();
                    prevParent.updateMesh();
                }
            }
        }

        brickAction.onUnequip = () => {
            setAimedObject(undefined);
        }
        
        return brickAction;
    }
}