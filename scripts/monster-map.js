const Monster = require("./monster");

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class MonsterMap extends Map {
    static Filters = {}

    /**
     * @returns {Monster[]}
     */
    toArray() {
        return Array.from(this.values());
    }

    
    createSimpleMonster(id, name, color) {
        const maxHealth = getRandomInt(6, 16);
        this.set(id, new Monster(id, {
            name,
            maxHealth,
            health: maxHealth,
            attack: getRandomInt(1, 4),
            defense: getRandomInt(1, 2),
            heal: 1,
            color
        }));
    }

    createSimpleBoss(id, name, color) {
        const maxHealth = getRandomInt(40, 60);
        this.set(id, new Monster(id, {
            name,
            maxHealth,
            health: maxHealth,
            attack: getRandomInt(2, 6),
            defense: getRandomInt(2, 4),
            heal: 1,
            color
        }));
    }
    
    // TODO
    // wrap set/delete/clear methods to recreate array then
}

module.exports = MonsterMap;