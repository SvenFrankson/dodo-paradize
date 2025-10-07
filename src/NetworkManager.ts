/// <reference path="../lib/peerjs.d.ts"/>

class NetworkManager {

    private peer: Peer;

    private debugConnected: boolean = false;
    public debugLastPos: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public debugLastR: number = 0;

    constructor(public game: Game) {
        console.log("Create NetworkManager");
    }

    public initialize(): void {
        console.log("Initialize NetworkManager");
        let id = 640;
        let otherId = 641;
        if (IsMobile === 1) {
            id = 641;
            otherId = 640;
        }
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
        let p = JSON.parse(data);
        this.debugLastPos.x = p.x;
        this.debugLastPos.y = p.y;
        this.debugLastPos.z = p.z;
        this.debugLastR = p.r;
    }
}