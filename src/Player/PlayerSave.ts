interface ISavedPlayerData {
    name: string;
    claimedConstructionI: number;
    claimedConstructionJ: number;
    token: string;
    style: string;
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
    console.log("a");
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