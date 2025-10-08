/// <reference path="../lib/peerjs.d.ts"/>

class NetworkManager {

    private peer: Peer;

    private debugConnected: boolean = false;

    public receivedData: Map<string, IBrainNetworkData[]> = new Map<string, IBrainNetworkData[]>();

    constructor(public game: Game) {
        console.log("Create NetworkManager");
    }

    public async initialize(): Promise<void> {
        let id = 640;
        let otherId = 641;
        if (IsMobile === 1) {
            id = 641;
            otherId = 640;
        }

        let connectPlayerData = {
            peerId: id.toFixed(0),
            displayName: this.game.playerDodo.name,
            posX: 0,
            posY: 0,
            posZ: 0
        }
        let dataString = JSON.stringify(connectPlayerData);
        const response = await fetch(SHARE_SERVICE_PATH + "connect_player", {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: dataString,
        });
        let responseText = await response.text();
        console.log(responseText);

        console.log("Initialize NetworkManager");

        this.peer = new Peer(id.toFixed(0));
        this.peer.on("open", this.onPeerOpen.bind(this));
        this.peer.on("connection", this.onPeerConnection.bind(this))

        let debugTryToConnect = () => {
            if (this.debugConnected) {
                return;
            }
            console.log("debugTryToConnect");
            this.connectToPlayer(otherId.toFixed(0));
            setTimeout(debugTryToConnect, 3000);
        }
        debugTryToConnect();
    }

    public onPeerOpen(id: string): void {
        console.log("Open peer connection, my ID is");
        console.log(id);
    }

    public connectToPlayer(playerId: string): void {
        console.log("Connecting to player of ID'" + playerId + "'");
        let conn = this.peer.connect(playerId);
        conn.on("open", () => {
            this.onPeerConnection(conn);
        });
    }

    public onPeerConnection(conn: Peer.DataConnection): void {
        console.log("Incoming connection, other ID is '" + conn.peer + "'");
        this.debugConnected = true;
        setInterval(() => {
            conn.send(JSON.stringify({
                dodoId: this.game.playerDodo.dodoId,
                x: this.game.playerDodo.position.x,
                y: this.game.playerDodo.position.y,
                z: this.game.playerDodo.position.z,
                r: Mummu.AngleFromToAround(BABYLON.Axis.Z, this.game.playerDodo.forward, BABYLON.Axis.Y)
            }));
        }, 100);
        conn.on(
            'data',
            (data) => {
                this.onConnData(data, conn);
            }
        );
    }

    public onConnData(data: any, conn: Peer.DataConnection): void {
        console.log("Data received from other ID '" + conn.peer + "'");
        console.log(data);
        let p = JSON.parse(data) as IBrainNetworkData;

        let brainNetworkData: IBrainNetworkData = {
            dodoId: p.dodoId,
            x: p.x,
            y: p.y,
            z: p.z,
            r: p.r,
            timestamp: performance.now()
        }
        
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