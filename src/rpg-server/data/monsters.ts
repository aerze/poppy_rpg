import { attack, heal } from "../behavior/combat";
import { Monster, AbilityType } from "../types";

export const MONSTERS: Record<string, Monster> = {
  SLIME: {
    id: "",
    type: "SLIME",
    name: "Slime",
    imageUrl: "🍮",
    maxHealth: 100,
    health: 100,
    maxMana: 100,
    mana: 100,
    xp: 100,
    stats: {
      health: 1,
      attack: 10,
      defense: 1,
      mana: 1,
      magic: 1,
      resist: 1,
      speed: 1,
      luck: 2,
    },
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
  },
};
