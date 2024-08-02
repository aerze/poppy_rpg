import { Monster, Stats } from "../types";
import { Player } from "./player";

export interface CombatantOptions {
  id: string;
  type: string;
  name: string;
  maxHealth: number;
  health: number;
  maxMana: number;
  mana: number;
  stats: Stats;
  level: number;
  xp: number;
}

export class Combatant {
  static fromPlayer(player: Player) {
    return new Combatant(player);
  }

  static fromMonster(monster: Monster) {
    return new Combatant(monster);
  }

  id: string;

  type: string;

  name: string;

  maxHealth: number;

  health: number;

  maxMana: number;

  mana: number;

  stats: Stats;

  level: number;

  xp: number;

  constructor(options: CombatantOptions) {
    this.id = options.id;
    this.type = options.type;
    this.name = options.name;
    this.maxHealth = options.maxHealth;
    this.health = options.health;
    this.maxMana = options.maxMana;
    this.mana = options.mana;
    this.stats = options.stats;
    this.level = options.level;
    this.xp = options.xp;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      maxHealth: this.maxHealth,
      health: this.health,
      maxMana: this.maxMana,
      mana: this.mana,
      stats: this.stats,
      level: this.level,
      xp: this.xp,
    };
  }
}
