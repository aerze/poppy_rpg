const Monster = require("../monster");
const { getRandomInt } = require("../helpers");
const { getLevelRequirement, scaleStat } = require("../xp");

class Slime extends Monster {
    static BLUE_SLIME = {
        name: "Blue Slime",
        health: [6, 16],
        attack: [3, 5],
        defense: [1, 2],
        heal: [1, 2],
        color: "#0000FF",
        xp: [8, 10]
    }

    static GREEN_SLIME = {
        name: "Green Slime",
        health: [2, 8],
        attack: [1, 4],
        defense: [1, 2],
        heal: [2, 4],
        color: "#00FF00",
        xp: [8, 10]
    }

    static RED_SLIME = {
        name: "Red Slime",
        health: [8, 20],
        attack: [1, 4],
        defense: [1, 2],
        heal: [1, 2],
        color: "#FF0000",
        xp: [8, 10]
    }

    static BOSS_SLIME = {
        name: "Super Bear Slime",
        health: [25, 40],
        attack: [2, 6],
        defense: [2, 4],
        heal: [1, 2],
        color: "#0000FF",
        xp: [8, 10]
    }

    static generate(level, baseStats) {
        const baseHealth = getRandomInt(...baseStats.health);
        const baseAttack = getRandomInt(...baseStats.attack);
        const baseDefense = getRandomInt(...baseStats.defense);
        const baseHeal = getRandomInt(...baseStats.heal);
        const xp = getRandomInt(...baseStats.xp);

        return {
            name: baseStats.name,
            level,
            maxHealth: scaleStat(level, baseHealth),
            health:scaleStat(level, baseHealth),
            attack: scaleStat(level, baseAttack),
            defense: scaleStat(level, baseDefense),
            heal: scaleStat(level, baseHeal),
            color: baseStats.color,
            xp: Math.ceil(getLevelRequirement(level) / xp)
        }
    }
}

module.exports = Slime;