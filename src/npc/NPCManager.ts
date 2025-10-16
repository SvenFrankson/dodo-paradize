class NPCManager {

    public landServant: Dodo;

    constructor(public game: Game) {
        //232a0f200101
    }

    public initialize(): void {
        this.landServant = new Dodo("local-npc", "Boadicea Bipin", this.game, { style: "232a0f200101" });
        this.landServant.brain = new Brain(this.landServant, BrainMode.Idle);
        (this.landServant.brain.subBrains[BrainMode.Idle] as BrainIdle).positionZero = new BABYLON.Vector3(1.12, 0, -16);
        this.landServant.brain.initialize();
    }

    public async instantiate(): Promise<void> {
        await this.landServant.instantiate();
        this.landServant.unfold();
        this.landServant.setWorldPosition(new BABYLON.Vector3(1.12, 0, -16));
        this.game.npcDodos.push(this.landServant);

        this.landServant.brain.npcDialog = new NPCDialog(this.landServant, [
            new NPCDialogTextLine(0, "Good Morning Sir !"),
            new NPCDialogTextLine(1, "I am Boadicea Bipin, Head of the Departement of Urbanism and Land Survey."),
            new NPCDialogTextLine(2, "Do you wish to build on a terrain parcel ?",
                new NPCDialogResponse("Yes, I would like to build something.", 3),
                new NPCDialogResponse("No, thanks.", 100),
            ),
            new NPCDialogTextLine(3, "Do you know the building rules in Dodopolis ?",
                new NPCDialogResponse("Yes, but I would love to hear it again.", 4),
                new NPCDialogResponse("No, what are the rules ?", 4),
            ),
            new NPCDialogTextLine(4, "In Dodopolis, you can not own a parcel."),
            new NPCDialogTextLine(5, "But you may have the exclusive usage of one, for as long as you wish."),
            new NPCDialogTextLine(6, "You will be the only one able to build on your parcel."),
            new NPCDialogTextLine(7, "And if you stop using it for a while, another Dodo will use it."),
            new NPCDialogTextLine(8, "Do you want to be lended a parcel ?",
                new NPCDialogResponse("Yes", 9),
                new NPCDialogResponse("No", 100),
            ),
            new NPCDialogCheckLine(9, async () => {
                try {
                    const response = await fetch(SHARE_SERVICE_PATH + "get_available_constructions", {
                        method: "GET",
                        mode: "cors"
                    });
                    let responseText = await response.text();
                    if (responseText) {
                        let response = JSON.parse(responseText);
                        let availableConstruction = response.constructions;
                        if (availableConstruction[0]) {
                            let i = availableConstruction[0].i;
                            let j = availableConstruction[0].j;

                            let constructionData = await this.game.networkManager.claimConstruction(i, j);
                            if (!constructionData) {
                                return 40;
                            }
                            
                            if (constructionData.i != i || constructionData.j != j) {
                                return 30;
                            }
                            return 20;
                        }
                        else {
                            return 40;
                        }
                    }
                }
                catch(e) {
                    console.error(e);
                    ScreenLoger.Log("buildFromServer error");
                    ScreenLoger.Log(e);
                }
                return 40;
            }),
            new NPCDialogTextLine(20, "You can now use your parcel, have fun !"),
            new NPCDialogTextLine(30, "You already have a parcel assigned, don't be greedy."),
            new NPCDialogTextLine(40, "Something went wrong but I don't know what."),
            new NPCDialogTextLine(1000, "Have a nice day !",
                new NPCDialogResponse("Thanks, bye !", -1)
            )
        ]);
    }
}