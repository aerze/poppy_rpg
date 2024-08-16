import { SkillType, Skills } from "./skills";
import { Badge, Equipment, Item, Pet, Quest, Ability, Stats, Title, Status, Action } from "../types";

export interface BasePlayerInfo {
  name: string;
  color: string;
  presetId: PresetId;
}

export const PlayerPresetToUrl = {
  0: "sprites/tay_test.png",
  1: "sprites/abby_test.png",
};

export type PresetId = keyof typeof PlayerPresetToUrl;

export type PlayerId = Player["id"];

export enum Roles {
  PLAYER = "Player",
  ADMIN = "Admin",
}

export interface Player {
  id: string;
  type: "PLAYER";
  roles: Roles[];
  name: string;
  color: string;
  presetId: PresetId;
  backstory: string;
  maxHealth: number;
  health: number;
  maxMana: number;
  mana: number;
  level: number;
  xp: number;
  nextLevel: number;
  stats: Stats;
  availableStatPoints: number;
  skills: Skills;
  abilities: Ability[];
  abilitySlots: {
    0?: Ability;
    1?: Ability;
    2?: Ability;
    3?: Ability;
  };
  statuses: Status[];
  defaultAction: Action;
  equipment: {
    head: Equipment | null;
    face: Equipment | null;
    leftHand: Equipment | null;
    rightHand: Equipment | null;
    torso: Equipment | null;
    legs: Equipment | null;
    extra1: Equipment | null;
    extra2: Equipment | null;
  };
  badges: Badge[];
  titles: Title[];
  activeTitle?: Title;
  quests: Quest[];
  activeQuests: Quest[];
  inventory: { [id: string]: Item };
  pets: { [id: string]: Pet };
}

export const DefaultPlayer: Player = {
  id: "",
  type: "PLAYER",
  roles: [Roles.PLAYER],
  name: "Unknown",
  color: "#A80085",
  presetId: 0,
  backstory: "From another world.",
  maxHealth: 400,
  health: 400,
  maxMana: 400,
  mana: 400,
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
    // add global modifier for tuning
    // add dungeon modifier for tuning
    luck: 1,
  },
  availableStatPoints: 0,
  skills: {
    [SkillType.Emoting]: 1,
    [SkillType.Slapping]: 1,
  },
  abilities: [],
  abilitySlots: {},
  statuses: [],
  defaultAction: Action.ATTACK,
  equipment: {
    head: null,
    face: null,
    leftHand: null,
    rightHand: null,
    torso: null,
    legs: null,
    extra1: null,
    extra2: null,
  },
  badges: [],
  titles: [],
  activeTitle: undefined,
  quests: [],
  activeQuests: [],
  inventory: {},
  pets: {},
};
