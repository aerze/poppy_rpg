class Monster {
  /**
   * @param {number} id
   * @param {object} data
   * @param {string} data.name
   * @param {number} data.maxHealth
   * @param {number} data.health
   * @param {number} data.attack
   * @param {number} data.defense
   * @param {number} data.heal
   * @param {string} data.color
   * @param {string} data.type
   */
  constructor(id, data) {
    this.id = id;
    this.name = data.name;
    this.maxHealth = data.maxHealth;
    this.health = data.health;
    this.attack = data.attack;
    this.defense = data.defense;
    this.heal = data.heal;
    this.color = data.color;
    this.type = data.type;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      maxHealth: this.maxHealth,
      health: this.health,
      attack: this.attack,
      defense: this.defense,
      heal: this.heal,
      color: this.color,
      type: this.type,
    };
  }
}

module.exports = Monster;
