import { Item } from "../global/crafting";
import { Skills } from "../global/skills";
import { Stats } from "../global/stats";
import { Ranged } from "../types";

export enum StatusEffect {
  STUN,
  SILENCE,
}

export type status = [StatusEffect, number];

export type Combatant = {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;

  statuses: status[];

  equipment: {
    weapon: Weapon | null;
    armor1: Equipment | null;
    armor2: Equipment | null;
  };
};

export interface Equipment {
  name: string;
  assetUrl: string;
  stats?: Partial<Stats>;
  skills?: Skills;
}

export enum WeaponType {
  Sword,
  Scythe,
}

export interface Weapon {
  id: string;
  name: string;
  assetUrl: string;
  type: WeaponType;
  created: Date;
  creatorId: string;
  modifiers: Modifier[];
  abilities: Ability[];
}

export enum ModifierTarget {}
export enum ModifierFunction {}
export type Modifier = [ModifierTarget, ModifierFunction, number];

export enum AbilityType {
  Physical,
  Magical,
}

export enum EffectType {
  Damage,
  Heal,
  Stun,
  Silence,
}

export type Effect = [type: EffectType, value: number];
export type EffectDefinition = [type: EffectType, min: number, max: number];

export interface Ability {
  name: string;
  type: AbilityType;
  // source: Combatant;
  // target: Combatant;
  effectDefinitions: EffectDefinition[];
}

export enum Action {
  ITEM,
  ABILITY_1,
  ABILITY_2,
  ABILITY_3,
  ABILITY_4,
}

// battle data
// defaultAction: Action;

export type CombatItem = Item & {
  quantity?: number;
  stats?: Ranged<Stats>;
  abilities?: Ranged<Skills>;
  durationMs?: number;
  price?: number;
};

export enum CombatPhase {
  Loading,
  Exploring,
  BattleStart,
  PlayerTurn,
  EnemyTurn,
  BattleEnd,
}
