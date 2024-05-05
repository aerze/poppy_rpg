const Monster = require("./monster");

class MonsterMap extends Map {
    static Filters = {}

    /**
     * @returns {Monster[]}
     */
    toArray() {
        return Array.from(this.values());
    }

    
    createSimpleMonster(id, name, color) {
        this.set(id, new Monster(id, {
            name,
            maxHealth: 8,
            health: 8,
            attack: 1,
            defense: 2,
            heal: 1,
            color
        }));
    }
    
    // TODO
    // wrap set/delete/clear methods to recreate array then
}

module.exports = MonsterMap;