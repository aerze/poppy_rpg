const { getRandomInt } = require("./helpers");
const { scaleStat, getLevelRequirement } = require("./xp");

class Monster {
  /**
   * @param {num} level 
   * @param {MonsterBase} baseStats 
   * @returns {MonsterData}
   */
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
      health: scaleStat(level, baseHealth),
      attack: scaleStat(level, baseAttack),
      defense: scaleStat(level, baseDefense),
      heal: scaleStat(level, baseHeal),
      color: baseStats.color,
      xp: Math.ceil(getLevelRequirement(level) / xp),
    };
  }

  /**
   * @param {number} id
   * @param {MonsterData} data
   */
  constructor(id, data) {
    this.id = id;
    this.name = data.name;
    this.level = data.level;
    this.maxHealth = data.maxHealth;
    this.health = data.health;
    this.attack = data.attack;
    this.defense = data.defense;
    this.heal = data.heal;
    this.color = data.color;
    this.type = data.type;
    this.xp = data.xp;
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
      type: this.type,
      xp: this.xp,
    };
  }
}

module.exports = Monster;

/**
 * @typedef {Object} MonsterBase
 * @property {string} name
 * @property {string} color
 * @property {[number, number]} health
 * @property {[number, number]} attack
 * @property {[number, number]} defense
 * @property {[number, number]} heal
 * @property {[number, number]} xp
 */

/**
 * @typedef {Object} MonsterData
 * @property {string} name
 * @property {string} color
 * @property {number} level
 * @property {number} maxHealth
 * @property {number} health
 * @property {number} attack
 * @property {number} defense
 * @property {number} heal
 * @property {number} xp
 */