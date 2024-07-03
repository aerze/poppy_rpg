import { Abilities } from "./data/abilities";
import { Player } from "./player";

export enum SkillType {
  Core,
  Physical,
  Magical,
  Utility,
}

export interface Skill {
  name: string;
  type: SkillType;
  effect: (player: Player, t: Combatant) => void;
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

export interface Combatant {
  id: string;
  name: string;
  maxHealth: number;
  health: number;
  maxMana: number;
  mana: number;
  stats: Stats;
}

export interface Equipment {
  name: string;
  imageUrl: string;
  stats?: Partial<Stats>;
  abilities?: Abilities;
}

export interface Badge {
  id: string;
  date: Date;
}

export interface Title {
  name: string;
  date: Date;
  stats?: Partial<Stats>;
  abilities?: Partial<Abilities>;
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
  abilities?: Ranged<Abilities>;
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
