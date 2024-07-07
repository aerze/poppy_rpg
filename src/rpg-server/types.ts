import { Skills } from "./data/skills";

export enum AbilityType {
  Core,
  Physical,
  Magical,
  Utility,
}

export interface Ability {
  name: string;
  type: AbilityType;
  effect: (source: Combatant, target: Combatant) => void;
  weight?: number;
  condition?: (target: Combatant) => boolean;
}

export interface Stats {
  health: number;
  attack: number;
  defense: number;
  mana: number;
  magic: number;
  resist: number;
  speed: number;
  luck: number;
}

export interface Monster {
  id: string;
  type: string;
  name: string;
  imageUrl: string;
  maxHealth: number;
  health: number;
  maxMana: number;
  mana: number;
  xp: number;
  stats: Stats;
  defaultAction: Action;
  activeSkills: Ability[];
}

export interface Combatant {
  id: string;
  type: string;
  name: string;
  maxHealth: number;
  health: number;
  maxMana: number;
  mana: number;
  stats: Stats;
  xp: number;
  defaultAction: Action;
}

export interface Status {
  name: string;
  weight: number;
  statsMod: Partial<Stats>;
}

export interface Equipment {
  name: string;
  imageUrl: string;
  stats?: Partial<Stats>;
  abilities?: Skills;
}

export interface Badge {
  id: string;
  date: Date;
}

export interface Title {
  name: string;
  date: Date;
  stats?: Partial<Stats>;
  abilities?: Partial<Skills>;
}

export interface Quest {
  id: string;
  templateId: number;
}

type Ranged<T> = { [P in keyof T]?: [T[P], T[P]] | undefined };

export interface BaseItem {
  id: string;
  imageUrl: string;
  description: string;
  quantity?: number;
  stats?: Ranged<Stats>;
  abilities?: Ranged<Skills>;
  durationMs?: number;
  price?: number;
}

export interface Item extends BaseItem {
  id: string;
  templateId: string;
}

export interface Pet {
  id: string;
  name: string;
  type: string;
}

export enum Action {
  ATTACK,
  DEFEND,
  ITEM,
  ABILITY_1,
  ABILITY_2,
  ABILITY_3,
  ABILITY_4,
}
