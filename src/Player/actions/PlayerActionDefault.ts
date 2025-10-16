interface IAimable {

    highlight: () => void;
    unlit: () => void;
}

class PlayerActionDefault {

    public static IsAimable(mesh: BABYLON.AbstractMesh): boolean {
        if (mesh instanceof BrickMesh) {
            return true;
        }
        if (mesh instanceof DodoCollider) {
            return true;
        }
        return false;
    }

    public static Create(player: BrainPlayer): PlayerAction {
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
                    else if (hit.pickedMesh instanceof DodoCollider) {
                        setAimedObject(hit.pickedMesh);
                        return;
                    }
                }
            }
            setAimedObject(undefined);
        }

        defaultAction.onPointerUp = (duration, distance) => {
            ScreenLoger.Log("alpha");
            if (distance > 4) {
                ScreenLoger.Log("bravo");
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
                ScreenLoger.Log("charly");
                if (player.playMode === PlayMode.Playing) {
                    ScreenLoger.Log("delta");
                    if ((aimedObject instanceof Brick) && !aimedObject.root.anchored) {
                        player.currentAction = PlayerActionMoveBrick.Create(player, aimedObject.root);
                    }
                    if (aimedObject instanceof DodoCollider) {
                        ScreenLoger.Log("echo");
                        if (aimedObject.dodo.brain.npcDialog) {
                            ScreenLoger.Log("foxtrot");
                            aimedObject.dodo.brain.npcDialog.start();
                        }
                    }
                }
            }
        }

        defaultAction.onRightPointerUp = (duration, distance) => {
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

        defaultAction.onUnequip = () => {
            setAimedObject(undefined);
        }
        
        return defaultAction;
    }
}