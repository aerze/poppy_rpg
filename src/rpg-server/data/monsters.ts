import { attack, heal } from "../behavior/combat";
import { Monster, AbilityType, Action } from "../types";

export const MONSTERS = {
  SLIME: (id: string): Monster => ({
    id,
    type: "SLIME",
    name: "Slime",
    imageUrl: "🍮",
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
    activeSkills: [
      {
        name: "Tackle",
        type: AbilityType.Physical,
        effect: (s, t) => attack(s, t),
      },
      {
        name: "Hug",
        type: AbilityType.Physical,
        effect: (s, t) => heal(s, t),
        condition: (t) => t.type === "SLIME",
      },
    ],
  }),
};
