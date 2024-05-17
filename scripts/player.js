

class Player {
    static ACTION = {
        ATTACK: 'attack',
        DEFEND: 'defend',
        HEAL: 'heal'
    }

    static JOBS = {
      "healer": {
        maxHealth: 50,
        health: 50,
        attack: 1,
        defense: 2,
        heal: 5,
      },
      "tank": {
        maxHealth: 120,
        health: 120,
        attack: 2,
        defense: 5,
        heal: 1,
      },
      "knight": {
        maxHealth: 80,
        health: 80,
        attack: 4,
        defense: 2,
        heal: 3,
      },
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
      this.name = data.name ?? "Stranger";
      this.action = data.action ?? "attack";
      this.color = data.color ?? '';
      this.active = data.active ?? true;
      this.job = data.job ?? '';
      const job = Player.JOBS[this.job];
      this.preset = data.preset ?? 'a';

      this.maxHealth = job.maxHealth;
      this.health = job.health;
      this.attack = job.attack;
      this.defense = job.defense;
      this.heal = job.heal;
      this.level = 1;
      this.xp = 0;
    }

    updatePlayerClient() {
        this.socket.emit("Update", this);
    }
  
    toJSON() {
      return {
        id: this.id,
        name: this.name,
        action: this.action,
        job: this.job,
        preset: this.preset,
        maxHealth: this.maxHealth,
        health: this.health,
        attack: this.attack,
        defense: this.defense,
        heal: this.heal,
        color: this.color,
        type: this.type,
        active: this.active,
        level: this.level,
        xp: this.xp,
      };
    }
  }
  
  module.exports = Player;
  