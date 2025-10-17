interface ISavedPlayerData {
    name: string;
    claimedConstructionI: number;
    claimedConstructionJ: number;
    token: string;
    style: string;
}

interface ISavedPlayerPositionData {
    posX: number;
    posY: number;
    posZ: number;
    rot: number;
}

function SavePlayerToLocalStorage(game: Game): void {
    if (!game.gameLoaded) {
        return;
    }
    let data: ISavedPlayerData = {
        name: "NoName",
        claimedConstructionI: null,
        claimedConstructionJ: null,
        token: "",
        style: ""
    };
    data.name = game.playerDodo.name;
    data.claimedConstructionI = game.networkManager.claimedConstructionI;
    data.claimedConstructionJ = game.networkManager.claimedConstructionJ;
    data.token = game.networkManager.token;
    data.style = game.playerDodo.style;

    if (HasLocalStorage) {
        window.localStorage.setItem("player-save", JSON.stringify(data));
    }
}

function LoadPlayerFromLocalStorage(game: Game): void {
    if (HasLocalStorage) {
        let dataString = window.localStorage.getItem("player-save");
        if (dataString) {
            let data: ISavedPlayerData = JSON.parse(dataString);
            if (data) {
                if (data.name) {
                    game.playerDodo.name = data.name;
                }
                if (data.claimedConstructionI != null) {
                    game.networkManager.claimedConstructionI = data.claimedConstructionI;
                }
                if (data.claimedConstructionJ != null) {
                    game.networkManager.claimedConstructionJ = data.claimedConstructionJ;
                }
                if (data.token) {
                    game.networkManager.token = data.token;
                }
                if (data.style) {
                    game.playerDodo.setStyle(data.style);
                }
            }
        }
    }
}

function SavePlayerPositionToLocalStorage(game: Game): void {
    if (!game.gameLoaded) {
        return;
    }
    if (game.gameMode === GameMode.Playing) {
        let data: ISavedPlayerPositionData = {
            posX: undefined,
            posY: undefined,
            posZ: undefined,
            rot: undefined
        };

        data.posX = game.playerDodo.position.x;
        data.posY = game.playerDodo.position.y;
        data.posZ = game.playerDodo.position.z;
        data.rot = game.playerDodo.r;

        if (isFinite(data.posX * data.posY * data.posZ) && isFinite(data.rot)) {
            if (HasLocalStorage) {
                window.localStorage.setItem("player-save-position", JSON.stringify(data));
            }
        }
    }

}

function LoadPlayerPositionFromLocalStorage(game: Game): boolean {
    if (HasLocalStorage) {
        let dataString = window.localStorage.getItem("player-save-position");
        if (dataString) {
            let data: ISavedPlayerPositionData = JSON.parse(dataString);
            if (data) {
                if (isFinite(data.posX * data.posY * data.posZ) && isFinite(data.rot)) {
                    game.playerDodo.setWorldPosition(new BABYLON.Vector3(data.posX, data.posY, data.posZ));
                    game.playerDodo.r = data.rot;
                    return true;
                }
            }
        }
    }
    return false;
}