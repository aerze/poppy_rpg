import { getLevelRequirement } from "../../../shared/xp";
import { Roles } from "../../claire/auth-types";
import { Badge } from "./badges";
import { Skills } from "./skills";
import { Stats } from "./stats";
import { Title } from "./titles";

export const PlayerPresetToUrl = {
  0: "sprites/tay_test.png",
  1: "sprites/abby_test.png",
};

export type PresetId = keyof typeof PlayerPresetToUrl;

export type PlayerId = Player["id"];

export type Player = {
  id: string;
  name: string;
  roles: Roles[];

  color: string;
  presetId: PresetId;
  assetUrl: string;
  backstory: string;

  level: number;
  xp: number;
  nextLevel: number;

  stats: Stats;
  statPoints: number;

  skills: Skills;
  badges: Badge[];
  activeBadges?: Badge[];
  titles: Title[];
  activeTitle?: Title;
};

export const Player = {
  create(formData: PlayerFormData): Player {
    return {
      id: "",
      name: formData.name,
      roles: [Roles.PLAYER],

      color: formData.color,
      presetId: formData.presetId,
      assetUrl: Player.PresetToURL[formData.presetId],
      backstory: formData.backstory,

      level: 1,
      xp: 0,
      nextLevel: 0,

      stats: {
        health: 1,
        attack: 1,
        defense: 1,
        mana: 1,
        magic: 1,
        resist: 1,
        speed: 1,
        luck: 1,
      },
      statPoints: 8,

      skills: {},
      badges: [],
      titles: [],
    };
  },

  getLevelRequirement(level: number) {
    return Math.floor((level * level * level) / Math.log10(level + 1) + 100);
  },

  PresetToURL: {
    0: "sprites/tay_test.png",
    1: "sprites/abby_test.png",
  },
};

export interface PlayerFormData {
  name: string;
  color: string;
  presetId: PresetId;
  backstory: string;
}
