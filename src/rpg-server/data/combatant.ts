import { Monster, Stats } from "../types";
import { Player, PlayerPresetToUrl } from "./player";

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
  assetUrl: string;
}

export type CombatantData = ReturnType<Combatant["toJSON"]>;

export class Combatant {
  static fromPlayer(player: Player) {
    return new Combatant({
      id: player.id,
      type: player.type,
      name: player.name,
      maxHealth: player.maxHealth,
      health: player.health,
      maxMana: player.maxMana,
      mana: player.mana,
      stats: player.stats,
      level: player.level,
      xp: player.xp,
      assetUrl: PlayerPresetToUrl[player.presetId],
    });
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

  assetUrl: string;

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
    this.assetUrl = options.assetUrl;
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
      assetUrl: this.assetUrl,
    };
  }
}
