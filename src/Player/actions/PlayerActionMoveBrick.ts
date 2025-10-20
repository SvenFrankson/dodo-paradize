class PlayerActionMoveBrick {

    public static Create(player: BrainPlayer, brick: Brick): PlayerAction {
        ScreenLoger.Log("PlayerActionMoveBrick.Create")
        let brickAction = new PlayerAction("move-brick-action", player);
        brickAction.backgroundColor = "#FF00FF";
        brickAction.iconUrl = "";

        let initPos = brick.position.clone();

        brickAction.onUpdate = () => {
            let terrain = player.game.terrain;
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
                        return (mesh instanceof ConstructionMesh) || mesh instanceof Chunck;
                    }
                )
                if (hit && hit.pickedPoint) {
                    let n =  hit.getNormal(true).scaleInPlace(BRICK_H * 0.5);
                    let pos = hit.pickedPoint.add(n).subtract(brick.construction.position);
                    brick.posI = Math.round(pos.x / BRICK_S);
                    brick.posK = Math.floor(pos.y / BRICK_H);
                    brick.posJ = Math.round(pos.z / BRICK_S);
                    
                    brick.clampToConstruction();
                    brick.construction.updateMesh();
                }
            }
        }

        brickAction.onPointerUp = (duration: number) => {
            console.log("onPointerUp");
            let terrain = player.game.terrain;
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
                        return (mesh instanceof ConstructionMesh) || mesh instanceof Chunck;
                    }
                )
                if (hit && hit.pickedPoint) {
                    /*
                    let n =  hit.getNormal(true).scaleInPlace(BRICK_H * 0.5);
                    if (hit.pickedMesh instanceof ConstructionMesh) {
                        if (duration > 0.3) {
                            let root = hit.pickedMesh.brick.root;
                            let aimedBrick = root.getBrickForFaceId(hit.faceId);
                            brick.setParent(aimedBrick);
                            brick.clampToConstruction();
                            brick.updateMesh();
                        }
                        else {
                            let pos = hit.pickedPoint.add(n).subtractInPlace(brick.construction.position);
                            brick.posI = Math.round(pos.x / BRICK_S);
                            brick.posJ = Math.round(pos.z / BRICK_S);
                            brick.posK = Math.floor(pos.y / BRICK_H);
                            brick.setParent(undefined);
                            brick.clampToConstruction();
                            brick.updateMesh();
                            brick.updateRootPosition();

                            brick.construction.saveToLocalStorage();
                            brick.construction.saveToServer();
                        }
                    }
                    else {
                        let pos = hit.pickedPoint.add(n).subtractInPlace(brick.construction.position);
                        brick.posI = Math.round(pos.x / BRICK_S);
                        brick.posJ = Math.round(pos.z / BRICK_S);
                        brick.posK = Math.floor(pos.y / BRICK_H);
                        brick.setParent(undefined);
                        brick.clampToConstruction();
                        brick.updateMesh();
                        brick.updateRootPosition();

                        brick.construction.saveToLocalStorage();
                        brick.construction.saveToServer();
                    }
                    */
                }
            }
            player.currentAction = undefined;
        }

        let rotateBrick = () => {
            if (brick) {
                brick.r = (brick.r + 1) % 4;
            }
        }

        let deleteBrick = () => {
            if (brick) {
                brick.dispose();
                player.currentAction = undefined;
            }
        }

        brickAction.onEquip = () => {
            player.game.inputManager.addMappedKeyDownListener(KeyInput.ROTATE_SELECTED, rotateBrick)
            player.game.inputManager.addMappedKeyDownListener(KeyInput.DELETE_SELECTED, deleteBrick)
        }

        brickAction.onUnequip = () => {
            player.game.inputManager.removeMappedKeyDownListener(KeyInput.ROTATE_SELECTED, rotateBrick)
            player.game.inputManager.removeMappedKeyDownListener(KeyInput.DELETE_SELECTED, deleteBrick)
        }

        brickAction.onWheel = (e: WheelEvent) => {
            /*
            if (brick.isRoot && brick.getChildTransformNodes().length === 0) {
                if (e.deltaY > 0) {
                    brick.index = (brick.index + BRICK_LIST.length - 1) % BRICK_LIST.length;
                    brick.updateMesh();
                }
                else if (e.deltaY < 0) {
                    brick.index = (brick.index + 1) % BRICK_LIST.length;
                    brick.updateMesh();
                }
            }
            */
        }
        
        return brickAction;
    }
}