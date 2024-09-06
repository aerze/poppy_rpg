import { Socket } from "socket.io";
import { Player } from "../global/player";
import { System } from "../system";
import { CombatDefinition, Encounter } from "./combat-definition";
import { AbilityType, Action, Combatant, CombatPhase, EffectType, WeaponType } from "./combat-types";
import { MaterialRank, MaterialTags } from "../global/materials";
import { InstanceManager } from "../../claire/instance-manager";
import { Monster } from "./monsters";

export class CombatSystem extends System {
  name = "combat";

  encounters: Encounter[] = [];

  bossEncounters: Encounter[] = [];

  players = new Map<Player["id"], Combatant>();

  monsters = new Map<Monster["id"], Monster>();

  paused = false;

  frame = 0;

  phase: CombatPhase = CombatPhase.Loading;

  nextEncounter = 0;

  async load(): Promise<void> {
    this.encounters = combatDef.encounters;
    this.bossEncounters = combatDef.bossEncounter;

    this.phase = CombatPhase.Exploring;
    this.tick();
  }

  explore() {
    this.phase = CombatPhase.Exploring;
    const nextEncounterDate = new Date();
    // nextEncounterDate.setMinutes(nextEncounterDate.getMinutes() + 2);
    nextEncounterDate.setSeconds(nextEncounterDate.getSeconds() + 45);

    this.nextEncounter = nextEncounterDate.valueOf();
  }

  join(playerId: Player["id"]): void {
    const player = this.claire.players.list.get(playerId);
    if (!player) {
      this.log(`player was missing when joining`);
      this.claire.instances.move(playerId, InstanceManager.Town);
      return;
    }

    const playerCombatant: Combatant = {
      health: player.stats.health * 100,
      maxHealth: player.stats.health * 100,
      mana: player.stats.mana * 20,
      maxMana: player.stats.mana * 20,
      statuses: [],
      equipment: {
        weapon: {
          id: "weapon",
          name: "Dave",
          assetUrl: "",
          type: WeaponType.Sword,
          created: new Date(),
          creatorId: "npc",
          modifiers: [],
          abilities: [
            {
              name: "slash",
              type: AbilityType.Physical,
              effectDefinitions: [[EffectType.Damage, 10, 15]],
            },
          ],
        },
        armor1: null,
        armor2: null,
      },
    };

    this.players.set(playerId, playerCombatant);
  }

  leave(playerId: Player["id"]): void {
    this.players.delete(playerId);
  }

  tick = () => {
    const now = Date.now();
    if (this.paused) return;

    this.frame++;
    this.log(`frame: ${this.frame}`);

    let playerAlive = false;
    // check for players
    for (const [playerId, combatant] of this.players) {
      if (combatant.health > 0) playerAlive = true;
    }

    if (!playerAlive) {
      // reset party
    }

    // if we're exploring, roll for combat
    if (now > this.nextEncounter) {
      // initiate next encounter
    }

    // check for monsters in the current encounter

    // check for encounter cooldown

    // start new encounter

    setTimeout(this.tick, 1000);
  };
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

        {
          id: "YELLOW_SLIME",
          name: "Cheese",
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
