import { Stats } from "../global/stats";
import { Range, Ranged } from "../types";
import { Ability, Action } from "./combat-types";

export type MonsterDefinition = {
  id: string;
  name: string;
  assetUrl: string;
  maxHealth: Range<number>;
  maxMana: Range<number>;
  stats: Ranged<Stats>;
  level: number;
  xp: number;
  action: Action;
  abilitySlots: {
    0?: Ability;
    1?: Ability;
    2?: Ability;
    3?: Ability;
  };
};

export type MonsterFactory = (monsterDefinition: MonsterDefinition) => Monster;

export type Monster = {
  id: string;
  name: string;
  assetUrl: string;
  maxHealth: number;
  health: number;
  maxMana: number;
  mana: number;
  level: number;
  xp: number;
  stats: Stats;
  defaultAction: Action;
  abilitySlots: {
    0?: Ability;
    1?: Ability;
    2?: Ability;
    3?: Ability;
  };
};
