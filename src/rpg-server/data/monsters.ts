import { SafeCounter } from "../../shared/safe-counter";
import { attack, heal } from "../behavior/combat";
import { Monster, AbilityType, Action, Stats } from "../types";

export function cap(value: number, max: number, min: number = 0) {
  return Math.max(Math.min(max, value), min);
}

const counter = new SafeCounter();

export const MONSTERS = {
  CHIKEM: (level: number, id: string = `m${counter.next()}`): Monster => {
    const stats: Stats = {
      health: Math.ceil(level / 10),
      attack: Math.ceil(level / 1.5),
      defense: Math.ceil(level / 1.5),
      mana: Math.ceil(level / 10),
      magic: Math.ceil(level / 1.5),
      resist: Math.ceil(level / 1.5),
      speed: Math.ceil(level / 10),
      luck: cap(Math.ceil(level / 10), 10, 0),
    };

    const maxHealth = 10 + level * stats.health;
    const maxMana = 10 + level * stats.mana;

    return {
      id,
      level,
      type: "MONSTER",
      name: "Chikem",
      assetUrl: "creatures/chikem.png",
      maxHealth,
      health: maxHealth,
      maxMana,
      mana: maxMana,
      xp: 10 + level * 2,
      defaultAction: Action.ATTACK,
      stats,
      abilitySlots: {},
    };
  },
  HORNED_RABBIT: (level: number, id: string = `m${counter.next()}`): Monster => {
    const stats: Stats = {
      health: Math.ceil(level / 10),
      attack: Math.ceil(level / 1.5),
      defense: Math.ceil(level / 1.5),
      mana: Math.ceil(level / 10),
      magic: Math.ceil(level / 1.5),
      resist: Math.ceil(level / 1.5),
      speed: Math.ceil(level / 10),
      luck: cap(Math.ceil(level / 10), 10, 0),
    };

    const maxHealth = 10 + level * stats.health;
    const maxMana = 10 + level * stats.mana;

    return {
      id,
      level,
      type: "MONSTER",
      name: "Horned Rabbit",
      assetUrl: "creatures/horned_rabbit.png",
      maxHealth,
      health: maxHealth,
      maxMana,
      mana: maxMana,
      xp: 10 + level * 2,
      defaultAction: Action.ATTACK,
      stats,
      abilitySlots: {},
    };
  },
  SLIME: (level: number, id: string = `m${counter.next()}`): Monster => ({
    id,
    level: 2,
    type: "SLIME",
    name: "Slime",
    assetUrl: "🍮",
    maxHealth: 50,
    health: 50,
    maxMana: 100,
    mana: 100,
    xp: 50,
    stats: {
      health: 2,
      attack: 3,
      defense: 1,
      mana: 2,
      magic: 2,
      resist: 1,
      speed: 2,
      luck: 2,
    },
    defaultAction: Action.ATTACK,
    abilitySlots: {
      0: {
        name: "Tackle",
        type: AbilityType.Physical,
        effect: (s, t) => attack(s, t),
      },
      1: {
        name: "Hug",
        type: AbilityType.Physical,
        effect: (s, t) => heal(s, t),
        condition: (t) => t.type === "SLIME",
      },
    },
  }),
};
