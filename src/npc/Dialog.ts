class NPCDialogResponse {

    constructor(
        public text: string,
        public lineIndex: number
    ) {

    }
}

class NPCDialogLine {

    constructor(
        public index: number
    ) {
        
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

class NPCDialogCheckLine extends NPCDialogLine {

    constructor(
        index: number,
        public check: () => Promise<number>
    ) {
        super(index);
    }
}

class NPCDialog {

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

                if (dialogLine.responses.length > 0) {
                    setTimeout(() => {
                        let responsesElements: HTMLDivElement[] = [];
                        for (let n = 0; n < dialogLine.responses.length; n++) {
                            let response = dialogLine.responses[n];
                            let responseElement = document.createElement("div");
                            responseElement.classList.add("dialog-response-line");
                            responseElement.innerHTML = "<span class='index'>" + (n + 1).toFixed(0) + "</span><span class='text'>" + response.text + "</span>";
                            this.linesContainer.appendChild(responseElement);

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
                    }, 100);
                }
                else {
                    setTimeout(() => {
                        this.writeLine(this.getLine(dialogLine.index + 1));
                    }, 100);
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
        this.game.playerBrain.inDialog = this;
        this.container = document.querySelector("#dialog-container");
        this.container.style.display = "block";
        this.linesContainer = document.querySelector("#dialog-lines-container");
        let title = document.querySelector("#dialog-container .dialog-title");
        title.innerHTML = this.dodo.name.toLocaleUpperCase();
        this.writeLine(this.dialogLines[0]);
    }

    public stop(): void {
        this.game.playerBrain.inDialog = undefined;
        if (this.container) {
            this.container.style.display = "none";
        }
        if (this.linesContainer) {
            this.linesContainer.innerHTML = "";
        }
        if (this.onNextStop) {
            this.onNextStop();
            this.onNextStop = undefined;
        }
    }
}