enum ArcadeEngineColor {
    Black = 0,
    Purple,
    Red,
    Orange,
    Yellow,
    Lime,
    Green,
    Turquoise,
    Marine,
    DeepBlue,
    Blue,
    Cyan,
    White,
    LightGray,
    Gray,
    Anthracite
}

var ArcadeEngineColorsHex: string[] = [
    "#1a1c2c",
    "#5d275d",
    "#b13e53",
    "#ef7d57",
    "#ffcd75",
    "#a7f070",
    "#38b764",
    "#257179",
    "#29366f",
    "#3b5dc9",
    "#41a6f6",
    "#73eff7",
    "#f4f4f4",
    "#94b0c2",
    "#566c86",
    "#333c57"
]

ArcadeEngineColorsHex = ArcadeEngineColorsHex.map(hex => {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    let f = 1;
    r = Math.floor(Math.min(255, r * f));
    g = Math.floor(Math.min(255, g * f));
    b = Math.floor(Math.min(255, b * f));
    
    return "#" + r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
});

var ArcadeEngineColorsInt: IIntColor3[] = ArcadeEngineColorsHex.map(hex => {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    return { r: r, g: g, b: b };
});

function GetClosestColorIndex(r: number, g: number, b: number): number {
    let bestDist = Infinity;
    let index = 0;

    for (let c = 0; c < ArcadeEngineColorsInt.length; c++) {
        let dr = Math.abs(ArcadeEngineColorsInt[c].r - r);
        let dg = Math.abs(ArcadeEngineColorsInt[c].g - g);
        let db = Math.abs(ArcadeEngineColorsInt[c].b - b);
        let dist = dr * dr + dg * dg + db * db;
        if (dist < bestDist) {
            bestDist = dist;
            index = c;
        }
    }

    return index;
}