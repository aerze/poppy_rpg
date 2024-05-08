

class Dungeon {
    static CONDITIONS = {
        multipleOf(x) {
            return (y) => y % x === 0;
        }
    }

    constructor(data) {
        this.type = data.type
        this.roomCount = 100;
        this.finalRoom = 100;
        this.currentRoom = 1;
        this.monsterPool = [];
        this.miniBossPool = [];
        this.bossPool = [];
        this.finalBoss = null;

        this.bossCondition = Dungeon.CONDITIONS.multipleOf(10);
    }

    generateEncounter(room = this.currentRoom) {
        // determine if we're a boss
        if (this.bossCondition()) {
            // fight a boss
        } else {
            // generate monsters
        }
    }
}

module.exports = Dungeon;