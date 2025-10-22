class PlayerActionEditBrick {

    public static Create(player: BrainPlayer): PlayerAction {
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

        editBrickAction.onUpdate = () => {
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
                        return mesh instanceof ConstructionMesh || mesh instanceof TextBrickMesh;
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
                        else if (hit.pickedMesh instanceof TextBrickMesh) {
                            let brick = hit.pickedMesh.brick;
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

        editBrickAction.onPointerUp = async (duration, onScreenDistance) => {
            if (onScreenDistance > 4) {
                return;
            }
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

        editBrickAction.onUnequip = () => {
            setAimedObject(undefined);
        }
        
        return editBrickAction;
    }
}