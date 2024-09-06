import { Item } from "../global/crafting";
import { Skills } from "../global/skills";
import { Stats } from "../global/stats";
import { Ranged } from "../types";

export enum StatusEffect {
  STUN,
  SILENCE,
}

export type status = [StatusEffect, number];

export interface Combatant {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;

  statuses: status[];

  equipment: {
    weapon: Equipment | null;
    armor1: Equipment | null;
    armor2: Equipment | null;
  };
}

export interface Equipment {
  name: string;
  imageUrl: string;
  stats?: Partial<Stats>;
  skills?: Skills;
}

export interface Weapon {
  id: string;
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
