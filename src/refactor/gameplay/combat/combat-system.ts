import { Socket } from "socket.io";
import { Player } from "../global/player";
import { System } from "../system";
import { CombatDefinition, Encounter } from "./combat-definition";
import { AbilityType, Action, Combatant, CombatPhase, EffectType, WeaponType } from "./combat-types";
import { MaterialRank, MaterialTags } from "../global/materials";
import { InstanceManager } from "../../claire/instance-manager";
import { Monster, MonsterFactory } from "./monsters";
import { getRandomFromArray, getRandomFromRange } from "../../../shared/helpers";

type PlayerTeam = Map<Player["id"], Combatant>;

type MonsterTeam = Map<Monster["id"], Monster>;

export class CombatSystem extends System {
  name = "combat";

  encounters: Encounter[] = [];

  bossEncounters: Encounter[] = [];

  players: PlayerTeam = new Map();

  monsters: MonsterTeam = new Map();

  paused = false;

  frame = 0;

  phase: CombatPhase = CombatPhase.Loading;

  // nextEncounter = 0;

  async load(): Promise<void> {
    this.encounters = combatDef.encounters;
    this.bossEncounters = combatDef.bossEncounter;
    this.log(`loaded en:${this.encounters.length} bs:${this.bossEncounters.length} phase:${CombatPhase[this.phase]}`);
    this.setPhase(CombatPhase.Exploring);
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

  setPhase(phase: CombatPhase, delay: number = 0) {
    this.log(`${CombatPhase[this.phase]} -> ${CombatPhase[phase]} in (${delay / 1000}s)`);

    if (!delay) {
      this.log(`${CombatPhase[this.phase]} -> ${CombatPhase[phase]}`);
      this.phase = phase;
      this.triggerPhase(this.phase);
      return;
    }

    setTimeout(() => {
      this.log(`${CombatPhase[this.phase]} -> ${CombatPhase[phase]}`);
      this.phase = phase;
      this.triggerPhase(this.phase);
    }, delay);
  }

  triggerPhase(phase = this.phase) {
    switch (phase) {
      case CombatPhase.Loading:
        return;
      case CombatPhase.Exploring:
        return this.onExplore();
      case CombatPhase.Encounter:
        return this.onEncounter();
      case CombatPhase.PlayerTurn:
        return this.onPlayerTurn();
      case CombatPhase.EnemyTurn:
        return this.onEnemyTurn();
      case CombatPhase.Victory:
        return this.onVictory();
      case CombatPhase.Defeat:
        return this.onDefeat();
    }
  }

  onExplore() {
    if (this.players.size === 0) {
      this.setPhase(CombatPhase.Exploring, 15_000);
      return;
    }
    this.setPhase(CombatPhase.Encounter, 45_000);
  }

  onEncounter() {
    const encounterData = getRandomFromArray(this.encounters)!;

    // load monsters into array
    for (const monsterDef of encounterData.monsters) {
      const amount = getRandomFromRange(monsterDef.quantity);
      for (let i = 0; i < amount; i++) {
        const monster = MonsterFactory(monsterDef);
        this.monsters.set(monster.id, monster);
      }
    }

    this.setPhase(CombatPhase.PlayerTurn, 3_000);
  }

  onPlayerTurn() {
    if (!this.isTeamAlive(this.players)) {
      this.setPhase(CombatPhase.Defeat);
      return;
    }

    if (!this.isTeamAlive(this.monsters)) {
      this.setPhase(CombatPhase.Victory);
      return;
    }

    this.setPhase(CombatPhase.EnemyTurn, 1_000);
  }

  onEnemyTurn() {
    if (!this.isTeamAlive(this.players)) {
      this.setPhase(CombatPhase.Defeat);
      return;
    }

    if (!this.isTeamAlive(this.monsters)) {
      this.setPhase(CombatPhase.Victory);
      return;
    }

    this.setPhase(CombatPhase.PlayerTurn, 1_000);
  }

  onVictory() {
    this.log(`Team has won the battle`);

    this.setPhase(CombatPhase.Exploring, 45_000);
  }

  onDefeat() {
    this.log(`Team has lost the battle`);

    this.setPhase(CombatPhase.Exploring, 45_000);
  }

  isTeamAlive(team: PlayerTeam | MonsterTeam) {
    for (const [id, member] of team) {
      if (member.health > 0) return true;
    }

    return false;
  }
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
          quantity: [1, 3],
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
          quantity: [1, 3],
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
          quantity: [1, 1],
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
