const { getRandomFromArray } = require("./helpers");
const Monster = require("./monster");
const Slime = require("./monsters/slime");


class Dungeon {
    static CONDITIONS = {
        multipleOf(x) {
            return (y) => y % x === 0;
        }
    }

    static SLIME_DUNGEON = {
        name: "Slime Castle",
        scale: 5,
        roomCount: 25,
        bossCondition: Dungeon.CONDITIONS.multipleOf(5),
        monsterPool: [Slime.BLUE_SLIME, Slime.GREEN_SLIME, Slime.RED_SLIME],
        bossPool: [Slime.BOSS_SLIME],
        finalBoss: Monster.generate(10, {    
            name: "King Bear Slime",
            health: [50, 75],
            attack: [2, 6],
            defense: [2, 4],
            heal: [1, 2],
            color: "#AA66FF",
            xp: [80, 100]
        })
    }

    constructor(data) {
        this.name = data.name
        this.scale = data.scale;
        this.currentRoom = 0;
        this.roomCount = data.roomCount;
        this.finalRoom = data.roomCount;
        this.monsterPool = data.monsterPool;
        this.bossPool = data.bossPool;
        this.finalBoss = data.finalBoss;
        this.bossCondition = data.bossCondition;
    }

    toJSON() {
      return {
        name: this.name,
        currentRoom: this.currentRoom,
        roomCount: this.roomCount
      };
    }

    getMonster(level) {
        return Monster.generate(level, getRandomFromArray(this.monsterPool));
    }

    getBoss(level) {
        return Monster.generate(level, getRandomFromArray(this.bossPool));
    }

    getNextEncounter() {
        this.currentRoom++;
        return this.generateEncounter(this.currentRoom);
    }

    generateEncounter(room = this.currentRoom) {
        /** @type {MonsterData[]} */
        const encounter = [];
        const roomLevel = Math.ceil(room/this.scale);
        const isBossRoom = this.bossCondition(this.currentRoom);
        const isFinalRoom = this.finalRoom === this.currentRoom;
        if (room > this.finalRoom) return encounter;

        // determine if we're a boss
        if (isBossRoom) {
            // fight a boss
            if (isFinalRoom) {
                encounter.push(this.finalBoss, this.getMonster(roomLevel + 2), this.getMonster(roomLevel + 2));
            } else {
                encounter.push(this.getBoss(roomLevel + 1), this.getMonster(roomLevel + 1));
            }
        } else {
            // generate monsters
            encounter.push(this.getMonster(roomLevel), this.getMonster(roomLevel), this.getMonster(roomLevel));
        }

        return encounter;
    }
}

module.exports = Dungeon;