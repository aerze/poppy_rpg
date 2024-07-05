import { getRandomInt } from "../../shared/helpers";
import { scaleStat, getLevelRequirement } from "../../shared/xp";

export class Monster {
  static generate(level: number, baseStats: MonsterBase): MonsterData {
    const baseHealth = getRandomInt(...baseStats.health);
    const baseAttack = getRandomInt(...baseStats.attack);
    const baseDefense = getRandomInt(...baseStats.defense);
    const baseHeal = getRandomInt(...baseStats.heal);
    const xp = getRandomInt(...baseStats.xp);

    return {
      name: baseStats.name,
      level,
      maxHealth: Math.floor(scaleStat(level, baseHealth) * (1 + level / 1000)),
      health: Math.floor(scaleStat(level, baseHealth) * (1 + level / 1000)),
      attack: Math.floor(scaleStat(level, baseAttack) * (1 + level / 1000)),
      defense: Math.floor(scaleStat(level, baseDefense) * (1 + level / 1000)),
      heal: Math.floor(scaleStat(level, baseHeal) * (1 + level / 1000)),
      color: baseStats.color,
      xp: Math.ceil(getLevelRequirement(level) / xp),
      asset: baseStats.asset,
    };
  }

  id: number;
  name: string;
  level: number;
  maxHealth: number;
  health: number;
  attack: number;
  defense: number;
  heal: number;
  color: string;
  xp: number;
  asset: string;

  /**
   * @param {number} id
   * @param {MonsterData} data
   */
  constructor(id: number, data: MonsterData) {
    this.id = id;
    this.name = data.name;
    this.level = data.level;
    this.maxHealth = data.maxHealth;
    this.health = data.health;
    this.attack = data.attack;
    this.defense = data.defense;
    this.heal = data.heal;
    this.color = data.color;
    this.xp = data.xp;
    this.asset = data.asset;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      level: this.level,
      maxHealth: this.maxHealth,
      health: this.health,
      attack: this.attack,
      defense: this.defense,
      heal: this.heal,
      color: this.color,
      xp: this.xp,
      asset: this.asset,
    };
  }
}

export interface MonsterBase {
  name: string;
  color: string;
  health: [number, number];
  attack: [number, number];
  defense: [number, number];
  heal: [number, number];
  xp: [number, number];
  asset: string;
}

export interface MonsterData {
  name: string;
  color: string;
  level: number;
  maxHealth: number;
  health: number;
  attack: number;
  defense: number;
  heal: number;
  xp: number;
  asset: string;
}
