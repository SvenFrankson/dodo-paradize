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
                        return mesh instanceof DodoInteractCollider && mesh != player.dodo.dodoInteractCollider;
                    }
                )

                if (hit.hit && hit.pickedPoint) {
                    if (BABYLON.Vector3.DistanceSquared(player.dodo.position, hit.pickedPoint) < actionRangeSquared) {
                        if (hit.pickedMesh instanceof DodoInteractCollider) {
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
            if (player.playMode === PlayMode.Playing) {
                if (aimedObject instanceof DodoInteractCollider) {
                    if (aimedObject.dodo.brain.npcDialog) {
                        let canvas = aimedObject.dodo.game.canvas;
                        document.exitPointerLock();
                        player.game.inputManager.temporaryNoPointerLock = true;
                        aimedObject.dodo.brain.npcDialog.onNextStop = () => {
                            player.game.inputManager.temporaryNoPointerLock = false;
                            canvas.requestPointerLock();
                        }
                        aimedObject.dodo.brain.npcDialog.start();
                    }
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