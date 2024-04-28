class Player {
    static ACTION = {
        ATTACK: 'attack',
        DEFEND: 'defend',
        HEAL: 'heal'
    }

    /**
     * @param {number} id
     * @param {object} data
     * @param {string} data.name
     * @param {string} data.action
     * @param {number} data.maxHealth
     * @param {number} data.health
     * @param {number} data.attack
     * @param {number} data.defense
     * @param {number} data.heal
     * @param {string} data.color
     * @param {string} data.type
     * @param {boolean} data.active
     */
    constructor(id, socket, data = {}, ) {
      this.id = id;
      this.socket = socket;
      this.name = data.name ?? "";
      this.action = data.action ?? "";
      this.maxHealth = data.maxHealth ?? -1;
      this.health = data.health ?? -1;
      this.attack = data.attack ?? -1;
      this.defense = data.defense ?? -1;
      this.heal = data.heal ?? -1;
      this.color = data.color ?? '';
      this.job = data.job ?? '';
      this.active = data.active ?? false;
    }

    updatePlayerClient() {
        this.socket.emit("update", this);
    }
  
    toJSON() {
      return {
        id: this.id,
        name: this.name,
        action: this.action,
        maxHealth: this.maxHealth,
        health: this.health,
        attack: this.attack,
        defense: this.defense,
        heal: this.heal,
        color: this.color,
        type: this.type,
        active: this.active
      };
    }
  }
  
  module.exports = Player;
  