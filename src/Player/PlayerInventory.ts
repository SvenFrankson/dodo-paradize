enum InventoryCategory {
    Brick,
    Paint,
    Ingredient,
    End
}

class PlayerInventoryItem {

    public name: string;
    public count: number = 1;
    public category: InventoryCategory;

    constructor(name: string, category: InventoryCategory, game: Game) {
        this.name = name;
        this.category = category;
        this.getIcon = async () => {
            console.log("getIcon " + name);
            return game.miniatureFactory.makeBrickIconString(name)
        };
    }

    public getIcon = async () => { return ""; };

    public async getPlayerAction(player: BrainPlayer): Promise<PlayerAction> {
        if (this.category === InventoryCategory.Brick) {
            return await PlayerActionTemplate.CreateBrickAction(player, this.name);
        }
        else if (this.category === InventoryCategory.Paint) {
            let colorIndex = BRICK_COLORS.findIndex(c => { return c.name === this.name; });
            if (colorIndex >= 0) {
                return PlayerActionTemplate.CreatePaintAction(player, colorIndex);
            }
        }
    }
}

class PlayerInventory {

    public items: PlayerInventoryItem[] = [];

    constructor(public player: BrainPlayer) {
        
    }

    public addItem(item: PlayerInventoryItem): void {
        let existingItem = this.items.find(it => { return it.name === item.name; });
        if (existingItem) {
            existingItem.count += item.count;
        }
        else {
            this.items.push(item);
        }
    }
}