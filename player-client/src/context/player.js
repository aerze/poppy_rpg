import { createContext, useState } from "react";

export const DefaultPlayer = {
  id: 123,
  name: "Aerze the Witch",
  color: "#A80085",
  presetCharacterSkin: "a",
  connected: true,
  alive: true,
  maxHealth: 1000,
  health: 900,
  maxMana: 1000,
  mana: 900,
  level: 5,
  xp: 100,
  stats: {
    health: 10,
    attack: 10,
    defense: 10,
    mana: 10,
    magic: 10,
    resist: 10,
    speed: 10,
    // add global modifier for tuning
    // add dungeon modifier for tuning
    luck: 10,
  },
  abilities: {
    fishing: 1,
    logging: 2,
    crafting: 9,
    cooking: 5,
    ranching: 2,
    petcare: 7,
    slapping: 2,
    emoting: 9,
    alchemy: 8,
    smithing: 7,
  },
  skills: {
    0: {
      name: "chop",
      type: "physical",
      damage: (p) => p.stats.attack * 1.02,
    },
  },
  equipment: {
    head: {
      name: "Fishing Cap",
      image: "",
      stats: {
        defense: 1,
        speed: -1,
      },
      abilities: {
        fishing: 1,
      },
    },
    face: "",
    leftHand: "",
    rightHand: "",
    torso: "",
    legs: "",
    extra1: "",
    extra2: "",
  },
  badges: [{ badgeId: 0, date: new Date() }],
  titles: [{ titleId: 0, date: new Date() }],
  activeTitle: 0,
  quests: [{ templateId: 10, questId: 57 }],
  activeQuests: [],
  inventory: {},
  pets: {},
};

export const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [player, setPlayer] = useState(DefaultPlayer);

  return <PlayerContext.Provider value={{ player, setPlayer }}>{children}</PlayerContext.Provider>;
}
