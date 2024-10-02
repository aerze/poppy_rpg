import { getRandomFromRange } from "../../../shared/helpers";
import { Stats } from "../global/stats";
import { Range, Ranged } from "../types";
import { Ability, Action } from "./combat-types";
import { SafeCounter } from "../../../shared/safe-counter";

const monsterIdCounter = new SafeCounter();

export type MonsterDefinition = {
  id: string;
  name: string;
  assetUrl: string;
  maxHealth: Range<number>;
  maxMana: Range<number>;
  stats: Ranged<Stats>;
  level: number;
  xp: number;
  quantity: Range<number>;
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

export const MonsterFactory = (monDef: MonsterDefinition): Monster => {
  const health = getRandomFromRange(monDef.maxHealth);
  const mana = getRandomFromRange(monDef.maxMana);
  const stats: Stats = {
    health: getRandomFromRange(monDef.stats.health),
    attack: getRandomFromRange(monDef.stats.attack),
    defense: getRandomFromRange(monDef.stats.defense),
    mana: getRandomFromRange(monDef.stats.mana),
    magic: getRandomFromRange(monDef.stats.magic),
    resist: getRandomFromRange(monDef.stats.resist),
    speed: getRandomFromRange(monDef.stats.speed),
    luck: getRandomFromRange(monDef.stats.luck),
  };

  return {
    id: `${monDef.id}${monsterIdCounter.next()}`,
    name: monDef.name,
    assetUrl: monDef.assetUrl,
    maxHealth: health,
    health: health,
    maxMana: mana,
    mana: mana,
    level: monDef.level,
    xp: monDef.xp,
    stats: stats,
    defaultAction: Action.ABILITY_1,
    abilitySlots: monDef.abilitySlots,
  };
};
