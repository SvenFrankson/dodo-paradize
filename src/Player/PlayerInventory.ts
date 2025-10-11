enum InventoryCategory {
    Block,
    Brick,
    Paint,
    Ingredient,
    End
}

class PlayerInventoryItem {

    public icon: string;
    public name: string;
    public count: number = 1;
    public category: InventoryCategory;

    constructor(name: string, category: InventoryCategory) {
        this.name = name;
        this.category = category;
        this.icon = "/datas/icons/empty.png";
        if (this.category === InventoryCategory.Brick) {
            this.icon = "/datas/icons/bricks/" + name + ".png";
        }
    }

    public getPlayerAction(player: BrainPlayer): PlayerAction {
        if (this.category === InventoryCategory.Brick) {
            return PlayerActionTemplate.CreateBrickAction(player, this.name);
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