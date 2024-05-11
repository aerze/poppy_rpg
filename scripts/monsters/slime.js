const Monster = require("../monster");

class Slime extends Monster {
    /** @type {import("../monster").MonsterBase} */
    static BLUE_SLIME = {
        name: "Blue Slime",
        color: "#0000FF",
        health: [6, 16],
        attack: [3, 5],
        defense: [1, 2],
        heal: [1, 2],
        xp: [8, 10]
    }

    /** @type {import("../monster").MonsterBase} */
    static GREEN_SLIME = {
        name: "Green Slime",
        color: "#00FF00",
        health: [2, 8],
        attack: [1, 4],
        defense: [1, 2],
        heal: [2, 4],
        xp: [8, 10]
    }

    /** @type {import("../monster").MonsterBase} */
    static RED_SLIME = {
        name: "Red Slime",
        color: "#FF0000",
        health: [8, 20],
        attack: [1, 4],
        defense: [1, 2],
        heal: [1, 2],
        xp: [8, 10]
    }

    /** @type {import("../monster").MonsterBase} */
    static BOSS_SLIME = {
        name: "Super Bear Slime",
        color: "#0000FF",
        health: [25, 40],
        attack: [2, 6],
        defense: [2, 4],
        heal: [1, 2],
        xp: [8, 10]
    }
}

module.exports = Slime;