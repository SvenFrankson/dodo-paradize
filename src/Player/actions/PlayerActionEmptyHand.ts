class PlayerActionEmptyHand {

    public static Create(player: BrainPlayer): PlayerAction {
        let actionRange: number = 6;
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
                    x = player.game.canvas.width * 0.5;
                    y = player.game.canvas.height * 0.5;
                }
                else {
                    x = player.scene.pointerX * PerformanceWatcher.DEVICE_PIXEL_RATIO;
                    y = player.scene.pointerY * PerformanceWatcher.DEVICE_PIXEL_RATIO;
                }
                let hit = player.game.scene.pick(
                    x,
                    y,
                    (mesh) => {
                        return (mesh instanceof DodoInteractCollider && mesh != player.dodo.dodoInteractCollider) ||
                            (mesh instanceof SpecialBrickMesh && mesh.specialBrick instanceof StationBrick);
                    }
                )

                if (hit.hit && hit.pickedPoint) {
                    if (BABYLON.Vector3.DistanceSquared(player.dodo.position, hit.pickedPoint) < actionRangeSquared) {
                        if (hit.pickedMesh instanceof DodoInteractCollider) {
                            setAimedObject(hit.pickedMesh);
                            return;
                        }
                        if (hit.pickedMesh instanceof SpecialBrickMesh) {
                            if (hit.pickedMesh.specialBrick instanceof StationBrick) {
                                setAimedObject(hit.pickedMesh.specialBrick);
                                return;
                            }
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
            if (player.playMode === PlayMode.Playing) {
                if (aimedObject instanceof DodoInteractCollider) {
                    if (aimedObject.dodo.brain.npcDialog) {
                        player.game.inputManager.safeExitPointerLock();
                        player.game.inputManager.temporaryNoPointerLock = true;
                        aimedObject.dodo.brain.npcDialog.onNextStop = () => {
                            player.game.inputManager.temporaryNoPointerLock = false;
                            player.game.inputManager.safeRequestPointerLock();
                        }
                        aimedObject.dodo.brain.npcDialog.start();
                    }
                }
                else if (aimedObject instanceof StationBrick) {
                    aimedObject.start();
                }
            }
        }

        defaultAction.onRightPointerUp = (duration, onScreenDistance) => {
            
        }

        defaultAction.onUnequip = () => {
            setAimedObject(undefined);
        }
        
        return defaultAction;
    }
}