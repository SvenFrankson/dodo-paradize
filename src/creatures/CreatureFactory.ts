var CreepNames = [
    "dodo"
];

var CreepHexColors = [
    "#334152",
    "red",
    "white"
];

class CreatureFactory {

    public static CreateCreep(name: string, game: Game): Creature {
        if (name === "dodo") {
            return new Dodo("dodo", game, {
                speed: 1,
                stepDuration: 0.8,
                color: new BABYLON.Color3(Math.random(), Math.random(), Math.random()),
                bounty: 10
            })
        }
    }
}