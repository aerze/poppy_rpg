const Monster = require("./monster");
const { getRandomInt } = require('./helpers');
const Slime = require("./monsters/slime");

class MonsterMap extends Map {
    static Filters = {}

    /**
     * @returns {Monster[]}
     */
    toArray() {
        return Array.from(this.values());
    }

    createBlueSlime(id, level) {
        const slime = new Slime(id, Slime.generate(level, Slime.BLUE_SLIME));
        this.set(id, slime);
    }
    
    createGreenSlime(id, level) {
        const slime = new Slime(id, Slime.generate(level, Slime.GREEN_SLIME));
        this.set(id, slime);
    }
    
    createRedSlime(id, level) {
        const slime = new Slime(id, Slime.generate(level, Slime.RED_SLIME));
        this.set(id, slime);
    }

    createBossSlime(id, level) {
        const slime = new Slime(id, Slime.generate(level, Slime.BOSS_SLIME));
        this.set(id, slime);
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