var ACTIVE_DEBUG_PLAYER_ACTION = true;

var ADD_BRICK_ANIMATION_DURATION = 1000;

class PlayerActionTemplate {

    public static async CreateBrickAction(player: BrainPlayer, brickId: number | string, colorIndex?: number, r: number = 0, thenEditBrick?: boolean): Promise<PlayerAction> {
        let brickIndex = Brick.BrickIdToIndex(brickId);
        let brickAction = new PlayerAction(Brick.BrickIdToName(brickId), player);
        brickAction.backgroundColor = "#000000";
        let previewMesh: BABYLON.Mesh;
        //brickAction.iconUrl = "/datas/icons/bricks/" + Brick.BrickIdToName(brickId) + ".png";
        brickAction.iconUrl = await player.game.miniatureFactory.makeBrickIconString(brickId);

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
                        return mesh instanceof Chunck || mesh instanceof ConstructionMesh;
                    }
                )
                if (hit && hit.pickedPoint) {
                    let n =  hit.getNormal(true).scaleInPlace(BRICK_H * 0.5);
                    let pos = hit.pickedPoint.add(n);
                    pos.x = BRICK_S * Math.round(pos.x / BRICK_S);
                    pos.y = BRICK_H * Math.floor(pos.y / BRICK_H);
                    pos.z = BRICK_S * Math.round(pos.z / BRICK_S);
                    previewMesh.position.copyFrom(pos);
                    previewMesh.rotation.y = Math.PI * 0.5 * r;
                    previewMesh.isVisible = true;
                    return;
                }
            }
            
            if (previewMesh) {
                previewMesh.isVisible = false;
            }
        }

        brickAction.onPointerUp = () => {
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
                        return mesh instanceof Chunck || mesh instanceof ConstructionMesh;
                    }
                )
                if (hit && hit.pickedPoint) {
                    let n =  hit.getNormal(true).scaleInPlace(BRICK_H * 0.5);
                    let constructionIJ = Construction.worldPosToIJ(hit.pickedPoint);
                    let construction = player.game.terrainManager.getOrCreateConstruction(constructionIJ.i, constructionIJ.j);
                    if (construction && construction.isPlayerAllowedToEdit()) {
                        let brick = new Brick(brickIndex, isFinite(colorIndex) ? colorIndex : 0, construction);
                        let pos = hit.pickedPoint.add(n).subtractInPlace(construction.position);
                        brick.posI = Math.round(pos.x / BRICK_S);
                        brick.posJ = Math.round(pos.z / BRICK_S);
                        brick.posK = Math.floor(pos.y / BRICK_H);
                        brick.r = r;
                        
                        construction.updateMesh();
                        construction.saveToLocalStorage();
                        construction.saveToServer();
                    }
                }
            }
            if (thenEditBrick) {                
                player.currentAction = player.playerActionManager.linkedActions[1];
            }
        }

        let rotateBrick = () => {
            r = (r + 1) % 4;
        }

        brickAction.onEquip = () => {
            brickIndex = Brick.BrickIdToIndex(brickId);
            if (!previewMesh || previewMesh.isDisposed()) {
                previewMesh = new BABYLON.Mesh("brick-preview-mesh");
            }
            let previewMat = new BABYLON.StandardMaterial("brick-preview-material");
            previewMat.alpha = 0.5;
            previewMat.specularColor.copyFromFloats(1, 1, 1);
            previewMesh.material = previewMat;
            previewMesh.rotation.y = Math.PI * 0.5;
            BrickTemplateManager.Instance.getTemplate(brickIndex).then(template => {
                template.vertexData.applyToMesh(previewMesh);
            });

            player.game.inputManager.addMappedKeyDownListener(KeyInput.ROTATE_SELECTED, rotateBrick);
        }

        brickAction.onUnequip = () => {
            if (previewMesh) {
                previewMesh.dispose();
            }
            
            player.game.inputManager.removeMappedKeyDownListener(KeyInput.ROTATE_SELECTED, rotateBrick);
        }

        brickAction.onWheel = (e: WheelEvent) => {
            if (e.deltaY > 0) {
                brickIndex = (brickIndex + BRICK_LIST.length - 1) % BRICK_LIST.length;
                BrickTemplateManager.Instance.getTemplate(brickIndex).then(template => {
                    if (previewMesh && !previewMesh.isDisposed()) {
                        template.vertexData.applyToMesh(previewMesh);
                    }
                });
            }
            else if (e.deltaY < 0) {
                brickIndex = (brickIndex + 1) % BRICK_LIST.length;
                BrickTemplateManager.Instance.getTemplate(brickIndex).then(template => {
                    if (previewMesh && !previewMesh.isDisposed()) {
                        template.vertexData.applyToMesh(previewMesh);
                    }
                });
            }
        }
        
        return brickAction;
    }

    public static CreatePaintAction(player: BrainPlayer, paintIndex: number): PlayerAction {
        let paintAction = new PlayerAction("paint_" + DodoColors[paintIndex].name, player);
        paintAction.backgroundColor = DodoColors[paintIndex].hex;
        paintAction.iconUrl = "/datas/icons/paintbrush.svg";

        let brush: BABYLON.Mesh;
        let tip: BABYLON.Mesh;

        paintAction.onUpdate = () => {
            
        }

        paintAction.onPointerDown = () => {
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
                        return mesh instanceof ConstructionMesh;
                    }
                )
                if (hit && hit.pickedPoint) {
                    if (hit.pickedMesh instanceof ConstructionMesh) {
                        let construction = hit.pickedMesh.construction;
                        let aimedBrick = construction.getBrickForFaceId(hit.faceId);
                        aimedBrick.colorIndex = paintIndex;
                        //player.lastUsedPaintIndex = paintIndex;
                        construction.updateMesh();
                        
                        construction.saveToLocalStorage();
                        construction.saveToServer();
                    }
                }
            }
        }

        paintAction.onEquip = async () => {
            brush = new BABYLON.Mesh("brush");
            brush.parent = player.dodo;
            brush.position.z = 0.8;
            brush.position.x = 0.1;
            brush.position.y = - 0.2;
            tip = new BABYLON.Mesh("tip");
            tip.parent = brush;
            let tipMaterial = new BABYLON.StandardMaterial("tip-material");
            tipMaterial.diffuseColor = BABYLON.Color3.FromHexString(DodoColors[paintIndex].hex);
            tip.material = tipMaterial;
            //let vDatas = await player.game.vertexDataLoader.get("./datas/meshes/paintbrush.babylon");
            if (brush && !brush.isDisposed()) {
                //vDatas[0].applyToMesh(brush);
                //vDatas[1].applyToMesh(tip);
            }
        }

        paintAction.onUnequip = () => {
            if (brush) {
                brush.dispose();
            }
        }

        paintAction.onWheel = (e: WheelEvent) => {
            if (e.deltaY > 0) {
                paintIndex = (paintIndex + DodoColors.length - 1) % DodoColors.length;
                if (tip && !tip.isDisposed() && tip.material instanceof BABYLON.StandardMaterial) {
                    tip.material.diffuseColor = BABYLON.Color3.FromHexString(DodoColors[paintIndex].hex);
                }
            }
            else if (e.deltaY < 0) {
                paintIndex = (paintIndex + 1) % DodoColors.length;
                if (tip && !tip.isDisposed() && tip.material instanceof BABYLON.StandardMaterial) {
                    tip.material.diffuseColor = BABYLON.Color3.FromHexString(DodoColors[paintIndex].hex);
                }
            }
        }
        
        return paintAction;
    }
}