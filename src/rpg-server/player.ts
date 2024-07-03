import { Badge, Equipment, Item, Pet, Quest, Skill, Stats, Title } from "./types";

export interface BasePlayerInfo {
  name: string;
  color: string;
  presetId: number;
}

// connected: true,
// alive: true,

export interface Player {
  id: string;
  name: string;
  color: string;
  presetId: number;
  backstory: string;
  maxHealth: number;
  health: number;
  maxMana: number;
  mana: number;
  level: number;
  xp: number;
  stats: Stats;
  abilities: { [abilityName: string]: number };
  skills: Skill[];
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
  activeTitle: Title | null;
  quests: Quest[];
  activeQuests: Quest[];
  inventory: { [id: string]: Item };
  pets: { [id: string]: Pet };
}

export const DefaultPlayer: Player = {
  id: "",
  name: "Unknown",
  color: "#A80085",
  presetId: 0,
  backstory: "From another world.",
  maxHealth: 1000,
  health: 1000,
  maxMana: 1000,
  mana: 1000,
  level: 1,
  xp: 0,
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
  abilities: {
    Emoting: 1,
    Slapping: 1,
  },
  skills: [],
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
  activeTitle: null,
  quests: [],
  activeQuests: [],
  inventory: {},
  pets: {},
};
