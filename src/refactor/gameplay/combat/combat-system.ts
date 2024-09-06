import { Socket } from "socket.io";
import { Player } from "../global/player";
import { System } from "../system";
import { CombatDefinition } from "./combat-definition";
import { AbilityType, Action, EffectType } from "./combat-types";
import { MaterialRank, MaterialTags } from "../global/materials";

export class CombatSystem extends System {
  encounters: Encounter[];

  bossEncounters: Encounter[];

  players = new Map<Player["id"], PlayerCombatant>();

  async load(): Promise<void> {
    this.encounters = combatDef.encounters;
    this.bossEncounters = combatDef.bossEncounter;
  }

  join(playerId: Player["id"], socket: Socket): void {}

  leave(playerId: Player["id"]): void {}
}

const combatDef: CombatDefinition = {
  encounters: [
    {
      roomType: "normal",
      monsters: [
        {
          id: "SLIME",
          name: "Red Slime",
          assetUrl: "",
          maxHealth: [20, 30],
          maxMana: [5, 10],
          stats: {
            health: [2, 5],
            attack: [4, 7],
            defense: [2, 5],
            mana: [2, 5],
            magic: [2, 5],
            resist: [2, 5],
            speed: [2, 5],
            luck: [2, 5], // max 100
          },
          level: 2,
          xp: 3,
          action: Action.ABILITY_1,
          abilitySlots: {
            0: {
              name: "Squish",
              type: AbilityType.Physical,
              effectDefinitions: [[EffectType.Damage, 10, 12]],
            },
          },
        },
      ],
      loot: [
        [
          {
            type: "MD",
            name: "Red Jello",
            tags: [MaterialTags.Slime, MaterialTags.Gel, MaterialTags.Red],
            rank: MaterialRank.C,
            quality: [60, 100],
            quantity: [3, 9],
            durability: [100, 100],
          },
          0.4,
        ],
      ],
    },
  ],
  bossEncounter: [
    {
      roomType: "boss",
      monsters: [
        {
          id: "SLIME_CUBE",
          name: "Wibbly the Slime Cube",
          assetUrl: "",
          maxHealth: [3000, 4000],
          maxMana: [500, 600],
          stats: {
            health: [20, 30],
            attack: [20, 30],
            defense: [20, 30],
            mana: [20, 30],
            magic: [20, 30],
            resist: [20, 30],
            speed: [20, 30],
            luck: [20, 30], // max 100
          },
          level: 30,
          xp: 1000,
          action: Action.ABILITY_1,
          abilitySlots: {
            0: {
              name: "Squish",
              type: AbilityType.Physical,
              effectDefinitions: [[EffectType.Damage, 200, 400]],
            },
          },
        },
      ],
      loot: [
        [
          {
            type: "MD",
            name: "Boss Jello",
            tags: [MaterialTags.Slime, MaterialTags.Gel, MaterialTags.Boss],
            rank: MaterialRank.S,
            quality: [80, 100],
            quantity: [4, 20],
            durability: [90, 100],
          },
          1,
        ],
      ],
    },
  ],
};
