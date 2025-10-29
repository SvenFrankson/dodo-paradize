class NPCDialogResponse {

    constructor(
        public text: string,
        public lineIndex: number
    ) {

    }
}

class NPCDialogLine {

    public nextIndex: number;
    constructor(
        public index: number
    ) {
        this.nextIndex = index + 1;
    }
}

class NPCDialogTextLine extends NPCDialogLine {

    public responses: NPCDialogResponse[] = [];

    constructor(
        index: number,
        public text: string,
        ...responses: NPCDialogResponse[]
    ) {
        super(index);
        this.responses.push(...responses);
    }
}

class NPCDialogTextLineNextIndex extends NPCDialogTextLine {

    public responses: NPCDialogResponse[] = [];

    constructor(
        index: number,
        text: string,
        nextIndex: number
    ) {
        super(index, text);
        this.nextIndex = nextIndex;
    }
}

class NPCDialogCheckLine extends NPCDialogLine {

    constructor(
        index: number,
        public check: () => Promise<number>
    ) {
        super(index);
    }
}

class NPCDialog {

    public lineDelay: number = 1000;

    public get game(): Game {
        return this.dodo.game;
    }
    public container: HTMLDivElement;
    public linesContainer: HTMLDivElement;
    public dialogTimeout: number = 0;
    public onNextStop: () => void;

    public getLine(index: number): NPCDialogLine {
        let line = this.dialogLines.find(line => { return line.index === index; });
        if (line) {
            return line;
        }
        return this.dialogLines.find(line => { return line.index === 1000; });
    }

    public async writeLine(dialogLine: NPCDialogLine): Promise<void> {
        if (this.linesContainer) {
            if (dialogLine instanceof NPCDialogTextLine) {
                let lineElement = document.createElement("div");
                lineElement.classList.add("dialog-line");
                lineElement.innerHTML = "<span class='text'>— " + dialogLine.text + "</span>";
                this.linesContainer.appendChild(lineElement);
                this.linesContainer.scroll({ top: 1000, behavior: "smooth" });

                if (dialogLine.responses.length > 0) {
                    setTimeout(() => {
                        let responsesElements: HTMLDivElement[] = [];
                        for (let n = 0; n < dialogLine.responses.length; n++) {
                            let response = dialogLine.responses[n];
                            let responseElement = document.createElement("div");
                            responseElement.classList.add("dialog-response-line");
                            responseElement.innerHTML = "<span class='index'>" + (n + 1).toFixed(0) + "</span><span class='text'>" + response.text + "</span>";
                            this.linesContainer.appendChild(responseElement);
                            this.linesContainer.scroll({ top: 1000, behavior: "smooth" });

                            responseElement.onclick = () => {
                                responsesElements.forEach(e => {
                                    if (e === responseElement) {
                                        e.classList.add("selected");
                                    }
                                    else {
                                        e.classList.add("rejected");
                                    }
                                    e.onclick = undefined;
                                });
                                if (response.lineIndex >= 0) {
                                    this.writeLine(this.getLine(response.lineIndex));
                                }
                                else {
                                    this.stop();
                                }
                            };

                            responsesElements[n] = responseElement;
                        }
                    }, this.lineDelay);
                }
                else {
                    setTimeout(() => {
                        this.writeLine(this.getLine(dialogLine.nextIndex));
                    }, this.lineDelay);
                }
            }
            else if (dialogLine instanceof NPCDialogCheckLine) {
                let result = await dialogLine.check();
                this.writeLine(this.getLine(result));
            }
            else {
                this.stop();
            }
        }
    }

    constructor(
        public dodo: Dodo,
        public dialogLines: NPCDialogLine[] = []
    ) {

    }

    public start(): void {
        let dir = this.game.playerDodo.position.subtract(this.dodo.position).normalize();
        let center = this.dodo.position.add(dir.scale(1.25));
        center.y += 0.5;

        let hits = [];
        for (let a = 0; a < 32; a++) {
            let rayDir = this.game.playerDodo.forward.scale(- 1);
            Mummu.RotateInPlace(rayDir, this.game.playerDodo.right, Math.PI / 8);
            let alpha = a / 32 * 2 * Math.PI;
            Mummu.RotateInPlace(rayDir, BABYLON.Axis.Y, alpha);
            let ray = new BABYLON.Ray(center, rayDir, 4);
            let pick = this.game.scene.pickWithRay(ray, (mesh => { return mesh instanceof ConstructionMesh; }));
            if (pick && pick.hit) {
                hits[a] = 0;
            }
            else {
                hits[a] = 1;
            }
        }

        for (let loop = 0; loop < 32; loop++) {
            for (let n = 0; n < 32; n++) {
                let v = hits[n];
                if (v > 0) {
                    let prev = hits[(n - 1 + 32) % 32];
                    let next = hits[(n + 1) % 32];
                    if (prev > 0 && next > 0) {
                        hits[n] = Math.max(v, Math.min(prev + 1, next + 1));
                    }
                }
            }
        }

        for (let a = 0; a < 32; a++) {
            let alpha = a / 32 * 2 * Math.PI;
            if (hits[a] > 0) {
                hits[a] += 3 * Math.abs(Math.sin(alpha));
            }
        }
        
        let bestN = 8;
        let bestV = hits[8];
        for (let n = 0; n < 32; n++) {
            if (hits[n] > bestV) {
                bestN = n;
                bestV = hits[n];
            }
        }

        this.game.camera.bestDialogRotation = bestN / 32 * 2 * Math.PI;
        if (this.game.camera.bestDialogRotation > Math.PI) {
            this.game.camera.bestDialogRotation -= 2 * Math.PI;
        }

        this.game.playerBrain.inDialog = this;
        this.container = document.querySelector("#dialog-container");
        this.container.style.display = "block";
        this.linesContainer = document.querySelector("#dialog-lines-container");
        let title = document.querySelector("#dialog-container .dialog-title");
        title.innerHTML = this.dodo.name.toLocaleUpperCase();
        this.writeLine(this.dialogLines[0]);
        (document.querySelector("#gameplay-ui") as HTMLDivElement).style.display = "none";
    }

    public stop(): void {
        this.game.playerBrain.inDialog = undefined;
        if (this.container) {
            this.container.style.display = "none";
        }
        if (this.linesContainer) {
            this.linesContainer.innerHTML = "";
        }
        (document.querySelector("#gameplay-ui") as HTMLDivElement).style.display = "";
        if (this.onNextStop) {
            this.onNextStop();
            this.onNextStop = undefined;
        }
    }
}