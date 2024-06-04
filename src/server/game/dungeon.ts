import { getRandomFromArray } from "../../shared/helpers";
import { Monster, MonsterBase, MonsterData } from "./monster";
import { Slime } from "./monsters/slime";

export interface DungeonData {
  name: string;
  scale: number;
  roomCount: number;
  monsterPool: MonsterBase[];
  bossPool: MonsterBase[];
  finalBoss: MonsterData;
  bossCondition: (x: number) => boolean;
}

export class Dungeon {
  static CONDITIONS = {
    multipleOf(x: number) {
      return (y: number) => y % x === 0;
    },
  };

  static SLIME_DUNGEON: DungeonData = {
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
      xp: [80, 100],
      asset: "slime5.png",
    }),
  };

  name: string;
  scale: number;
  currentRoom: number;
  roomCount: number;
  finalRoom: number;
  monsterPool: MonsterBase[];
  bossPool: MonsterBase[];
  finalBoss: MonsterData;
  bossCondition: (x: number) => boolean;

  constructor(data: DungeonData) {
    this.name = data.name;
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
      roomCount: this.roomCount,
    };
  }

  getMonster(level: number) {
    const monsterBase = getRandomFromArray(this.monsterPool)!;
    return Monster.generate(level, monsterBase);
  }

  getBoss(level: number) {
    const monsterBase = getRandomFromArray(this.bossPool)!;
    return Monster.generate(level, monsterBase);
  }

  getNextEncounter() {
    this.currentRoom++;
    return this.generateEncounter(this.currentRoom);
  }

  generateEncounter(room = this.currentRoom) {
    /** @type {MonsterData[]} */
    const encounter: MonsterData[] = [];
    const roomLevel = Math.ceil(room / this.scale);
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
