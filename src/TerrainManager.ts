interface IJ {
    i: number;
    j: number;
}

class TerrainManager {

    public get game(): Game {
        return this.terrain.game;
    }

    public range: number = 2;
    public createChunckTasks: IJ[] = [];
    public disposeChunckTasks: IJ[] = [];

    public createConstructionTasks: IJ[] = [];
    public disposeConstructionTasks: IJ[] = [];

    public constructions: Construction[] = [];
    
    public getConstruction(i: number, j: number): Construction {
        return this.constructions.find(c => { return c.i === i && c.j === j; });
    }
    public getOrCreateConstruction(i: number, j: number): Construction {
        let construction = this.getConstruction(i, j);
        if (!construction) {
            construction = new Construction(i, j, this.terrain);
            this.constructions.push(construction);
        }
        return construction;
    }

    constructor(public terrain: Terrain) {

    }

    public addCreateChunckTask(i: number, j: number): void {
        let disposeTaskIndex = this.disposeChunckTasks.findIndex(t => { return t.i === i && t.j === j });
        if (disposeTaskIndex >= 0) {
            this.disposeChunckTasks.splice(disposeTaskIndex, 1);
        }

        if (!this.terrain.chuncks.array.find(chunck => { return chunck.i === i && chunck.j === j })) {
            if (!this.createChunckTasks.find(t => { return t.i === i && t.j === j })) {
                this.createChunckTasks.push({ i: i, j: j });
            }
        }
    }

    public addDisposeChunckTask(i: number, j: number): void {
        let createTaskIndex = this.createChunckTasks.findIndex(t => { return t.i === i && t.j === j });
        if (createTaskIndex >= 0) {
            this.createChunckTasks.splice(createTaskIndex, 1);
        }

        if (this.terrain.chuncks.array.find(chunck => { return chunck.i === i && chunck.j === j })) {
            if (!this.disposeChunckTasks.find(t => { return t.i === i && t.j === j })) {
                this.disposeChunckTasks.push({ i: i, j: j });
            }
        }
    }

    private _lastRefreshChunckPosition: BABYLON.Vector3 = new BABYLON.Vector3(Infinity, 0, Infinity);
    public refreshChunckTaskList(): void {
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
                    this.addCreateChunckTask(i, j);
                }
            }
        }

        this.terrain.chuncks.forEach(chunck => {
            let cx = (chunck.i + 0.5) * this.terrain.chunckSize_m;
            let cz = (chunck.j + 0.5) * this.terrain.chunckSize_m;
            let d = BABYLON.Vector3.Distance(new BABYLON.Vector3(cx, 0, cz), position);
            if (d > (this.range + 1) * this.terrain.chunckSize_m) {
                this.addDisposeChunckTask(chunck.i, chunck.j);
            }
        })

        this._lastRefreshChunckPosition = position;
    }

    public addCreateConstructionTask(i: number, j: number): void {
        let disposeTaskIndex = this.disposeConstructionTasks.findIndex(t => { return t.i === i && t.j === j });
        if (disposeTaskIndex >= 0) {
            this.disposeConstructionTasks.splice(disposeTaskIndex, 1);
        }

        if (!this.constructions.find(construction => { return construction.i === i && construction.j === j })) {
            if (!this.createConstructionTasks.find(t => { return t.i === i && t.j === j })) {
                this.createConstructionTasks.push({ i: i, j: j });
            }
        }
    }

    public addDisposeConstructionTask(i: number, j: number): void {
        let createTaskIndex = this.createConstructionTasks.findIndex(t => { return t.i === i && t.j === j });
        if (createTaskIndex >= 0) {
            this.createConstructionTasks.splice(createTaskIndex, 1);
        }

        if (this.constructions.find(construction => { return construction.i === i && construction.j === j })) {
            if (!this.disposeConstructionTasks.find(t => { return t.i === i && t.j === j })) {
                this.disposeConstructionTasks.push({ i: i, j: j });
            }
        }
    }

    private _lastRefreshConstructionPosition: BABYLON.Vector3 = new BABYLON.Vector3(Infinity, 0, Infinity);
    public refreshConstructionTaskList(): void {
        let position = this.game.camera.globalPosition.clone();
        position.y = 0;
        let iCenter = Math.floor(position.x / Construction.SIZE_m);
        let jCenter = Math.floor(position.z / Construction.SIZE_m);

        for (let i = iCenter - 4; i <= iCenter + 4; i++) {
            for (let j = jCenter - 4; j <= jCenter + 4; j++) {
                let cx = (i + 0.5) * Construction.SIZE_m;
                let cz = (j + 0.5) * Construction.SIZE_m;
                let d = BABYLON.Vector3.Distance(new BABYLON.Vector3(cx, 0, cz), position);
                if (d < this.range * Construction.SIZE_m) {
                    this.addCreateConstructionTask(i, j);
                }
            }
        }

        this.constructions.forEach(construction => {
            let cx = (construction.i + 0.5) * Construction.SIZE_m;
            let cz = (construction.j + 0.5) * Construction.SIZE_m;
            let d = BABYLON.Vector3.Distance(new BABYLON.Vector3(cx, 0, cz), position);
            if (d > (this.range + 1) * Construction.SIZE_m) {
                this.addDisposeConstructionTask(construction.i, construction.j);
            }
        })

        this._lastRefreshConstructionPosition = position;
    }

    private _lock: boolean = false;
    public async update(): Promise<void> {
        if (this._lock) {
            return;
        }
        this._lock = true;

        let position = this.game.camera.globalPosition;
        if (Math.abs(position.x - this._lastRefreshChunckPosition.x) > this.terrain.chunckSize_m * 0.25 || Math.abs(position.z - this._lastRefreshChunckPosition.z) > this.terrain.chunckSize_m * 0.25) {
            this.refreshChunckTaskList();
        }
        if (Math.abs(position.x - this._lastRefreshConstructionPosition.x) > this.terrain.chunckSize_m * 0.25 || Math.abs(position.z - this._lastRefreshConstructionPosition.z) > this.terrain.chunckSize_m * 0.25) {
            this.refreshConstructionTaskList();
        }

        if (this.createChunckTasks.length > 0) {
            let task = this.createChunckTasks.pop();
            let chunck = this.terrain.chuncks.array.find(chunck => { return chunck.i === task.i && chunck.j === task.j });
            if (!chunck) {
                chunck = await this.terrain.generateChunck(task.i, task.j);
                this.terrain.chuncks.push(chunck);
            }
        }
        else if (this.disposeChunckTasks.length > 0) {
            let task = this.disposeChunckTasks.pop();
            let chunck = this.terrain.chuncks.array.find(chunck => { return chunck.i === task.i && chunck.j === task.j });
            if (chunck) {
                this.terrain.chuncks.remove(chunck);
                chunck.dispose();
            }
        }

        if (this.createConstructionTasks.length > 0) {
            let task = this.createConstructionTasks.pop();
            let construction = this.constructions.find(construction => { return construction.i === task.i && construction.j === task.j });
            if (!construction) {
                construction = this.getOrCreateConstruction(task.i, task.j);
                //construction.buildFromLocalStorage();
                construction.buildFromServer();
                this.constructions.push(construction);
            }
        }
        else if (this.disposeConstructionTasks.length > 0) {
            let task = this.disposeConstructionTasks.pop();
            let constructionIndex = this.constructions.findIndex(construction => { return construction.i === task.i && construction.j === task.j });
            if (constructionIndex != -1) {
                let construction = this.constructions[constructionIndex];
                this.constructions.splice(constructionIndex, 1);
                construction.dispose();
            }
        }

        this._lock = false;
    }
}