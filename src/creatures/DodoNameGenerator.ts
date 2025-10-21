var DodoNameGeneratorConsons = [
    "C",
    "F",
    "K",
    "KL",
    "L",
    "P",
    "R",
    "S",
    "T",
    "X"
];

var DodoNameGeneratorVowels = [
    "A",
    "I",
    "O",
    "U",
    "OU",
    "IOU"
]

function GenerateRandomDodoName(): string {
    let count = 2 + Math.round(2 * Math.random());
    let name = "";
    for (let n = 0; n < count; n++) {
        name += DodoNameGeneratorConsons[Math.floor(Math.random() * DodoNameGeneratorConsons.length)];
        name += DodoNameGeneratorVowels[Math.floor(Math.random() * DodoNameGeneratorVowels.length)];
    }
    return name;
}