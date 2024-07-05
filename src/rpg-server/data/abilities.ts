import { Ability, AbilityType } from "../types";

export const SKILLS: Record<string, Ability> = {
  CHOP: {
    name: "chop",
    type: AbilityType.Physical,
    effect: (p) => p.stats.attack * 1.02,
  },
  FIRST_AID: {
    name: "First Aid",
    type: AbilityType.Physical,
    effect: (p) => (p.health += 100),
  },
};
