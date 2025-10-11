interface IJ {
    i: number;
    j: number;
}

class TerrainManager {

    public get game(): Game {
        return this.terrain.game;
    }

    public range: number = 2;
    public createTasks: IJ[] = [];
    public disposeTasks: IJ[] = [];

    constructor(public terrain: Terrain) {

    }

    public addCreateTask(i: number, j: number): void {
        let disposeTaskIndex = this.disposeTasks.findIndex(t => { return t.i === i && t.j === j });
        if (disposeTaskIndex >= 0) {
            this.disposeTasks.splice(disposeTaskIndex, 1);
        }

        if (!this.terrain.chuncks.array.find(chunck => { return chunck.i === i && chunck.j === j })) {
            if (!this.createTasks.find(t => { return t.i === i && t.j === j })) {
                this.createTasks.push({ i: i, j: j });
            }
        }
    }

    public addDisposeTask(i: number, j: number): void {
        let createTaskIndex = this.createTasks.findIndex(t => { return t.i === i && t.j === j });
        if (createTaskIndex >= 0) {
            this.createTasks.splice(createTaskIndex, 1);
        }

        if (this.terrain.chuncks.array.find(chunck => { return chunck.i === i && chunck.j === j })) {
            if (!this.disposeTasks.find(t => { return t.i === i && t.j === j })) {
                this.disposeTasks.push({ i: i, j: j });
            }
        }
    }

    private _lastRefreshPosition: BABYLON.Vector3 = new BABYLON.Vector3(Infinity, 0, Infinity);
    public refreshTaskList(): void {
        let position = this.game.camera.globalPosition.clone();
        position.y = 0;
        let iCenter = Math.floor(position.x / this.terrain.chunckSize_m);
        let jCenter = Math.floor(position.z / this.terrain.chunckSize_m);

        for (let i = iCenter - 4; i <= iCenter + 4; i++) {
            for (let j = jCenter - 4; j <= jCenter + 4; j++) {
                let cx = (i + 0.5) * this.terrain.chunckSize_m;
                let cz = (j + 0.5) * this.terrain.chunckSize_m;
                let d = BABYLON.Vector3.Distance(new BABYLON.Vector3(cx, 0, cz), position);
                if (d < this.range * this.terrain.chunckSize_m) {
                    this.addCreateTask(i, j);
                }
            }
        }

        this.terrain.chuncks.forEach(chunck => {
            let cx = (chunck.i + 0.5) * this.terrain.chunckSize_m;
            let cz = (chunck.j + 0.5) * this.terrain.chunckSize_m;
            let d = BABYLON.Vector3.Distance(new BABYLON.Vector3(cx, 0, cz), position);
            if (d > (this.range + 1) * this.terrain.chunckSize_m) {
                this.addDisposeTask(chunck.i, chunck.j);
            }
        })

        this._lastRefreshPosition = position;
    }

    private _lock: boolean = false;
    public async update(): Promise<void> {
        if (this._lock) {
            return;
        }
        this._lock = true;

        let position = this.game.camera.globalPosition;
        if (Math.abs(position.x - this._lastRefreshPosition.x) > this.terrain.chunckSize_m * 0.25 || Math.abs(position.z - this._lastRefreshPosition.z) > this.terrain.chunckSize_m * 0.25) {
            this.refreshTaskList();
        }

        if (this.createTasks.length > 0) {
            let task = this.createTasks.pop();
            let chunck = this.terrain.chuncks.array.find(chunck => { return chunck.i === task.i && chunck.j === task.j });
            if (!chunck) {
                chunck = await this.terrain.generateChunck(task.i, task.j);
                this.terrain.chuncks.push(chunck);
            }
        }
        else if (this.disposeTasks.length > 0) {
            let task = this.disposeTasks.pop();
            let chunck = this.terrain.chuncks.array.find(chunck => { return chunck.i === task.i && chunck.j === task.j });
            if (chunck) {
                this.terrain.chuncks.remove(chunck);
                chunck.dispose();
            }
        }

        this._lock = false;
    }
}