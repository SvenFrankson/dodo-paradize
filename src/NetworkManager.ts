/// <reference path="../lib/peerjs.d.ts"/>

class NetworkManager {

    private peer: Peer;
    private token: string;

    public serverPlayersList: any[] = [];
    public receivedData: Map<string, IBrainNetworkData[]> = new Map<string, IBrainNetworkData[]>();

    constructor(public game: Game) {
        ScreenLoger.Log("Create NetworkManager");
    }

    public async initialize(): Promise<void> {
        ScreenLoger.Log("Initialize NetworkManager");

        this.peer = new Peer();
        this.peer.on("open", this.onPeerOpen.bind(this));
        this.peer.on("connection", this.onPeerConnection.bind(this))
    }

    public async onPeerOpen(id: string): Promise<void> {
        ScreenLoger.Log("Open peer connection, my ID is");
        ScreenLoger.Log(id);
        this.game.playerDodo.peerId = id;

        let connectPlayerData = {
            peerId: id,
            displayName: this.game.playerDodo.name,
            style: this.game.playerDodo.style,
            posX: 0,
            posY: 0,
            posZ: 0
        }

        let dataString = JSON.stringify(connectPlayerData);
        try {
            const response = await fetch(SHARE_SERVICE_PATH + "connect_player", {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: dataString,
            });
            let responseText = await response.text();
            let responseJSON = JSON.parse(responseText);
            this.token = responseJSON.token;
            this.game.playerDodo.gameId = responseJSON.gameId;
            console.log("playerDodo.gameId = " + this.game.playerDodo.gameId.toFixed(0));
            ScreenLoger.Log("playerDodo.gameId = " + this.game.playerDodo.gameId.toFixed(0));
        }
        catch(e) {
            console.error(e);
            ScreenLoger.Log("connect_player error");
            ScreenLoger.Log(e);
        }

        try {
            const responseExistingPlayers = await fetch(SHARE_SERVICE_PATH + "get_players", {
                method: "GET",
                mode: "cors"
            });
            let responseText = await responseExistingPlayers.text();
            console.log(responseText);
            let responseJSON = JSON.parse(responseText);
            console.log(responseJSON);

            this.serverPlayersList = responseJSON.players;
            for (let n = 0; n < responseJSON.players.length; n++) {
                let otherPlayer = responseJSON.players[n];
                if (otherPlayer.peerId != this.game.playerDodo.peerId) {
                    this.connectToPlayer(otherPlayer.peerId);
                }
            }
        }
        catch (e) {
            console.error(e);
            ScreenLoger.Log("get_players error");
            ScreenLoger.Log(e);
        }
    }

    public connectToPlayer(playerId: string): void {
        console.log("Connecting to player of ID'" + playerId + "'");
        let conn = this.peer.connect(playerId);
        conn.on("open", () => {
            this.onPeerConnection(conn);
        });
    }

    public async onPeerConnection(conn: Peer.DataConnection): Promise<void> {
        console.log("Incoming connection, other ID is '" + conn.peer + "'");
        let existingDodo = this.game.networkDodos.find(dodo => { return dodo.peerId === conn.peer; });
        if (!existingDodo) {
            let playerDesc = this.serverPlayersList.find(p => { return p.peerId === conn.peer; });
            let style = "000000";
            if (playerDesc) {
                style = playerDesc.style;
            }
            existingDodo = await this.createDodo("Unkown", conn.peer, style);
            this.game.networkDodos.push(existingDodo);
        }

        conn.on(
            'data',
            (data) => {
                this.onConnData(data, conn);
            }
        );

        conn.send(JSON.stringify({ style: this.game.playerDodo.style }));
        
        setInterval(() => {
            conn.send(JSON.stringify({
                dodoId: this.game.playerDodo.peerId,
                x: this.game.playerDodo.position.x,
                y: this.game.playerDodo.position.y,
                z: this.game.playerDodo.position.z,
                tx: this.game.playerDodo.targetLook.x,
                ty: this.game.playerDodo.targetLook.y,
                tz: this.game.playerDodo.targetLook.z,
                r: this.game.playerDodo.r
            }));
        }, 100);
    }

    public onConnData(dataString: any, conn: Peer.DataConnection): void {
        let data = JSON.parse(dataString);

        if (IsStyleNetworkData(data)) {
            let dodo = this.game.networkDodos.find(dodo => { return dodo.peerId === conn.peer; });
            if (dodo) {
                dodo.setStyle(data.style);
            }
        }
        else if (IsBrainNetworkData(data)) {
            let brainNetworkData = data as IBrainNetworkData;
            brainNetworkData.timestamp = performance.now();
        
            let dataArray = this.receivedData.get(brainNetworkData.dodoId);
            if (!dataArray) {
                dataArray = [];
                this.receivedData.set(brainNetworkData.dodoId, dataArray);
            }

            dataArray.push(brainNetworkData);
            dataArray.sort((d1, d2) => { return d2.timestamp - d1.timestamp; });
            while (dataArray.length > 10) {
                dataArray.pop();
            }
        }
    }

    public async createDodo(name: string, peerId: string, style: string): Promise<Dodo> {
        let dodo = new Dodo(name, this.game, {
            speed: 1.5 + Math.random(),
            stepDuration: 0.2 + 0.2 * Math.random(),
            style: style
        });
        dodo.peerId = peerId;
        await dodo.instantiate();
        dodo.unfold();
        dodo.setWorldPosition(new BABYLON.Vector3(-5 + 10 * Math.random(), 1, -5 + 10 * Math.random()));
        dodo.brain = new Brain(dodo, BrainMode.Network);
        dodo.brain.initialize();
        return dodo;
    }
}