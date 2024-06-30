import { createContext, useState } from "react";

export const DefaultPlayer = {
  id: 123,
  name: "Aerze the Witch",
  color: "#A80085",
  connected: true,
  alive: true,
  presetCharacterSkin: "a",
  maxHealth: 1000,
  health: 900,
  maxMana: 1000,
  mana: 900,
  level: 5,
  xp: 100,
  skills: {
    health: 10,
    attack: 10,
    defense: 10,
    mana: 10,
    magic: 10,
    resist: 10,
    speed: 10,
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
  equipment: {
    head: {
      name: "Fishing Cap",
      image: "",
      skills: {
        defense: 2,
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
