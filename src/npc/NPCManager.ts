class NPCManager {

    public landServant: Dodo;
    public brickMerchant: Dodo;
    public paintMerchant: Dodo;
    public welcomeDodo: Dodo;
    public notKingDodo: Dodo;
    public playgroundHost: Dodo;

    constructor(public game: Game) {
        //232a0f200101
    }

    public initialize(): void {
        this.landServant = new Dodo("local-npc", "BOADICEA BIPIN", this.game, { style: "232a0f200101", role: "Urbanist" });
        this.landServant.brain = new Brain(this.landServant, BrainMode.Idle);
        (this.landServant.brain.subBrains[BrainMode.Idle] as BrainIdle).positionZero = new BABYLON.Vector3(1.25, 0, 25.56);
        this.landServant.brain.initialize();
        
        this.brickMerchant = new Dodo("brick-merchant", "AGOSTINHO TIMON", this.game, { style: "232507230115", role: "Brick Merchant" });
        this.brickMerchant.brain = new Brain(this.brickMerchant, BrainMode.Idle);
        (this.brickMerchant.brain.subBrains[BrainMode.Idle] as BrainIdle).positionZero = new BABYLON.Vector3(7.21, 0.53, 3.78);
        (this.brickMerchant.brain.subBrains[BrainMode.Idle] as BrainIdle).positionRadius = 0.3;
        this.brickMerchant.brain.initialize();
        
        this.paintMerchant = new Dodo("paint-merchant", "LENARD ANGELO", this.game, { style: "15090517031e", role: "Paint Merchant" });
        this.paintMerchant.brain = new Brain(this.paintMerchant, BrainMode.Idle);
        (this.paintMerchant.brain.subBrains[BrainMode.Idle] as BrainIdle).positionZero = new BABYLON.Vector3(-4.24, 0.94, 2.67);
        (this.paintMerchant.brain.subBrains[BrainMode.Idle] as BrainIdle).positionRadius = 0.3;
        this.paintMerchant.brain.initialize();
        
        this.welcomeDodo = new Dodo("welcome-dodo", "SVEN", this.game, { style: "1511280e0309", role: "New Player Orientation" });
        this.welcomeDodo.brain = new Brain(this.welcomeDodo, BrainMode.Idle);
        (this.welcomeDodo.brain.subBrains[BrainMode.Idle] as BrainIdle).positionZero = new BABYLON.Vector3(1.85, 0, 14.31);
        this.welcomeDodo.brain.initialize();

        this.notKingDodo = new Dodo("not-king-dodo", "CARLOS LUIS", this.game, { style: "232a20270409", role: "Not The King" });
        this.notKingDodo.brain = new Brain(this.notKingDodo, BrainMode.Idle);
        (this.notKingDodo.brain.subBrains[BrainMode.Idle] as BrainIdle).positionZero = new BABYLON.Vector3(-6.88, 2.14, 14.50);
        (this.notKingDodo.brain.subBrains[BrainMode.Idle] as BrainIdle).positionRadius = 0.3;
        this.notKingDodo.brain.initialize();

        this.playgroundHost = new Dodo("playground-dodo", "FLIP", this.game, { style: "2104231c020b", role: "Playground Host" });
        this.playgroundHost.brain = new Brain(this.playgroundHost, BrainMode.Idle);
        (this.playgroundHost.brain.subBrains[BrainMode.Idle] as BrainIdle).positionZero = new BABYLON.Vector3(1.62, 0.80, -4.80);
        (this.playgroundHost.brain.subBrains[BrainMode.Idle] as BrainIdle).positionRadius = 0.3;
        this.playgroundHost.brain.initialize();
    }

    public async instantiate(): Promise<void> {
        await this.landServant.instantiate();
        this.landServant.unfold();
        this.landServant.setWorldPosition(new BABYLON.Vector3(1.25, 0, 25.56));
        this.game.npcDodos.push(this.landServant);

        this.landServant.brain.npcDialog = new NPCDialog(this.landServant, [
            new NPCDialogTextLine(0, "Hi !"),
            new NPCDialogTextLine(1, "I am BOADICEA BIPIN, Head of the Departement of Urbanism and Land Survey."),
            new NPCDialogTextLine(2, "Do you wish to build on a terrain parcel ?",
                new NPCDialogResponse("Yes, I would like to build something.", 3),
                new NPCDialogResponse("No, thanks.", 100),
            ),
            new NPCDialogTextLine(3, "Do you know the building rules in Dodopolis ?",
                new NPCDialogResponse("Yes, but I would love to hear it again.", 4),
                new NPCDialogResponse("No, what are the rules ?", 4),
            ),
            new NPCDialogTextLine(4, "Don't let my top hat fool you, I will not sell you Land."),
            new NPCDialogTextLine(5, "In Dodopolis, the Land belongs to every Dodo."),
            new NPCDialogTextLine(6, "You may only borrow it, for as long as you wish."),
            new NPCDialogTextLine(7, "And once you no longer use the Land, another Dodo will enjoy it."),
            new NPCDialogTextLine(8, "'From each according to his ability, to each according to his needs'."),
            new NPCDialogTextLine(9, "Do you want to use a parcel ?",
                new NPCDialogResponse("Yes", 10),
                new NPCDialogResponse("No", 100),
            ),
            new NPCDialogCheckLine(10, async () => {
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
        
        let brickMerchantCount: number = 0;
        await this.brickMerchant.instantiate();
        this.brickMerchant.unfold();
        this.brickMerchant.setWorldPosition((this.brickMerchant.brain.subBrains[BrainMode.Idle] as BrainIdle).positionZero);
        this.game.npcDodos.push(this.brickMerchant);
        this.brickMerchant.brain.npcDialog = new NPCDialog(this.brickMerchant, [
            new NPCDialogTextLine(0, "Good Morning !"),
            new NPCDialogTextLine(1, "My name is " + this.brickMerchant.name + ". I make sure every Dodo gets a fair share of construction material."),
            new NPCDialogTextLine(2, "Blocks, Tiles, Windows, Curbs... You name it, I have it !"),
            new NPCDialogCheckLine(3, async () => {
                if (brickMerchantCount > 2) {
                    return 100;
                }
                return 20;
            }),
            new NPCDialogTextLine(20, "Do you need Bricks ?",
                new NPCDialogResponse("Yes, can I have some Bricks please ?", 50),
                new NPCDialogResponse("No, I already have what I need.", 1000),
            ),
            new NPCDialogCheckLine(50, async () => {
                if (brickMerchantCount < 2) {
                    brickMerchantCount++;
                    for (let n = 0; n < 5; n++) {
                        let brickIndex = Math.floor(BRICK_LIST.length * Math.random());
                        this.game.playerBrainPlayer.inventory.addItem(new PlayerInventoryItem(BRICK_LIST[brickIndex].name, InventoryCategory.Brick, this.game));
                    }
                }
                else {
                    brickMerchantCount++;
                    for (let brickIndex = 0; brickIndex < BRICK_LIST.length; brickIndex++) {
                        this.game.playerBrainPlayer.inventory.addItem(new PlayerInventoryItem(BRICK_LIST[brickIndex].name, InventoryCategory.Brick, this.game));
                    }
                }
                return 90;
            }),
            new NPCDialogTextLineNextIndex(90, "There, take it and go build things ! Come back if you need more.", 1000),
            new NPCDialogTextLineNextIndex(100, "Great ! You already have all the Bricks you need.", 1000),
            new NPCDialogTextLine(1000, "Have a nice day !",
                new NPCDialogResponse("Thanks, bye !", -1)
            )
        ]);
        
        let paintMerchantCount: number = 0;
        await this.paintMerchant.instantiate();
        this.paintMerchant.unfold();
        this.paintMerchant.setWorldPosition((this.paintMerchant.brain.subBrains[BrainMode.Idle] as BrainIdle).positionZero);
        this.game.npcDodos.push(this.paintMerchant);
        this.paintMerchant.brain.npcDialog = new NPCDialog(this.paintMerchant, [
            new NPCDialogTextLine(0, "Hello !"),
            new NPCDialogTextLine(1, "Do you something feel like this world could use some colors ?"),
            new NPCDialogTextLine(2, "If so, you found right place ! I am " + this.paintMerchant.name + ", pigment-maker."),
            new NPCDialogCheckLine(3, async () => {
                if (paintMerchantCount > 2) {
                    return 100;
                }
                return 20;
            }),
            new NPCDialogTextLine(20, "Do you want to try some of my paint ?",
                new NPCDialogResponse("Yes, can I have some paint please ?", 50),
                new NPCDialogResponse("No, I already have what I need.", 1000),
            ),
            new NPCDialogCheckLine(50, async () => {
                if (paintMerchantCount < 2) {
                    paintMerchantCount++;
                    for (let n = 0; n < 5; n++) {
                        let colorIndex = Math.floor(DodoColors.length * Math.random());
                        this.game.playerBrainPlayer.inventory.addItem(new PlayerInventoryItem(DodoColors[colorIndex].name, InventoryCategory.Paint, this.game));
                    }
                }
                else {
                    paintMerchantCount++;
                    for (let colorIndex = 0; colorIndex < DodoColors.length; colorIndex++) {
                        this.game.playerBrainPlayer.inventory.addItem(new PlayerInventoryItem(DodoColors[colorIndex].name, InventoryCategory.Paint, this.game));
                    }
                }
                return 90;
            }),
            new NPCDialogTextLineNextIndex(90, "There, take it and add some colors to the world ! Come back if you need more.", 1000),
            new NPCDialogTextLineNextIndex(100, "Great ! You already have all the paint you need.", 1000),
            new NPCDialogTextLine(1000, "Have a nice day !",
                new NPCDialogResponse("Thanks, bye !", -1)
            )
        ]);
        
        await this.welcomeDodo.instantiate();
        this.welcomeDodo.unfold();
        this.welcomeDodo.setWorldPosition((this.welcomeDodo.brain.subBrains[BrainMode.Idle] as BrainIdle).positionZero);
        this.game.npcDodos.push(this.welcomeDodo);
        this.welcomeDodo.brain.npcDialog = new NPCDialog(this.welcomeDodo, [
            new NPCDialogTextLine(0, "Salut !"),
            new NPCDialogTextLine(1, "My name is " + this.welcomeDodo.name + ". Welcome to Dodopolis."),
            new NPCDialogTextLine(2, "If you have question about this place, I can try to answer it !",
                new NPCDialogResponse("What is Dodopolis ?", 10),
                new NPCDialogResponse("What can I do here ?", 20),
                new NPCDialogResponse("How does Dodopolis run ?", 30),
                new NPCDialogResponse("Who made Dodopolis ?", 40),
                new NPCDialogResponse("No thanks.", 1000),
            ),
            new NPCDialogTextLineNextIndex(10, "Dodopolis is a multiplayer construction game. It was made during the Revival Jam 2025, hosted by the Society of Play.", 2),
            new NPCDialogTextLineNextIndex(20, "You can enjoy other players construction, and borrow a piece of land to create your own things.", 2),
            new NPCDialogTextLineNextIndex(30, "Dodopolis is writen in Typescript and runs in your browser. BabylonJS is used for 3D rendering. PeerJS connects the Dodos together. A server hosts your constructions.", 2),
            new NPCDialogTextLineNextIndex(40, "Dodopolis is developped by me, SVEN, from Tiaratum Games.", 2),
            new NPCDialogTextLine(1000, "Thanks for hanging around, have a nice day !",
                new NPCDialogResponse("Thanks, bye !", -1)
            )
        ]);
        
        await this.notKingDodo.instantiate();
        this.notKingDodo.unfold();
        this.notKingDodo.setWorldPosition((this.notKingDodo.brain.subBrains[BrainMode.Idle] as BrainIdle).positionZero);
        this.game.npcDodos.push(this.notKingDodo);
        this.notKingDodo.brain.npcDialog = new NPCDialog(this.notKingDodo, [
            new NPCDialogTextLine(0, "Hello there !"),
            new NPCDialogTextLine(1, "Am I a king ? Of course not."),
            new NPCDialogTextLine(2, "Don't be ridiculous, a Dodo has no king !"),
            new NPCDialogTextLine(3, "I am " + this.notKingDodo.name + ", the crown maker. I make crowns for Dodos who like to wear crowns."),
            new NPCDialogTextLine(4, "Would you like to wear a crown ?",
                new NPCDialogResponse("I would love to !", 10),
                new NPCDialogResponse("Not really...", 20)
            ),
            new NPCDialogTextLine(10, "Great ! What kind of crown do you want ?",
                new NPCDialogResponse("A golden one please.", 50),
                new NPCDialogResponse("Surprise me !", 60)
            ),
            new NPCDialogTextLineNextIndex(20, "As you wish.", 1000),
            new NPCDialogCheckLine(50, async () => {
                this.game.playerDodo.setStyleValue(4, StyleValueTypes.HatIndex);
                this.game.playerDodo.setStyleValue(9, StyleValueTypes.HatColor);
                return 90;
            }),
            new NPCDialogCheckLine(60, async () => {
                this.game.playerDodo.setStyleValue(4, StyleValueTypes.HatIndex);
                this.game.playerDodo.setStyleValue(Math.floor(Math.random() * DodoColors.length), StyleValueTypes.HatColor);
                return 90;
            }),
            new NPCDialogTextLineNextIndex(90, "Ta-dam ! You look fantastic !", 1000),
            new NPCDialogTextLine(1000, "Have a nice day !",
                new NPCDialogResponse("Thanks, bye !", -1)
            )
        ]);
        
        await this.playgroundHost.instantiate();
        this.playgroundHost.unfold();
        this.playgroundHost.setWorldPosition((this.playgroundHost.brain.subBrains[BrainMode.Idle] as BrainIdle).positionZero);
        this.game.npcDodos.push(this.playgroundHost);
        this.playgroundHost.brain.npcDialog = new NPCDialog(this.playgroundHost, [
            new NPCDialogTextLine(0, "Hoy !"),
            new NPCDialogTextLine(1, "I bet you're wondering what this place is ?"),
            new NPCDialogTextLine(2, "I'll give you a hint... It's the Playground !"),
            new NPCDialogTextLine(3, "If you have Bricks and Paint, you can build things in this area."),
            new NPCDialogTextLine(4, "Please know that this area is offline. None of what you do here can be seen by other Dodos."),
            new NPCDialogTextLine(5, "And it will not be saved anywhere."),
            new NPCDialogTextLine(6, "Have a nice day !",
                new NPCDialogResponse("Thanks, bye !", -1)
            )
        ]);
    }
}