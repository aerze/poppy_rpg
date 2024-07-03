import { Skill, SkillType } from "../types";

export const SKILLS: Record<string, Skill> = {
  CHOP: {
    name: "chop",
    type: SkillType.Physical,
    effect: (p) => p.stats.attack * 1.02,
  },
  FIRST_AID: {
    name: "First Aid",
    type: SkillType.Physical,
    effect: (p) => (p.health += 100),
  },
};
