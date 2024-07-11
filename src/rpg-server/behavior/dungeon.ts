import { Socket } from "socket.io";
import { MONSTERS } from "../data/monsters";
import { Player } from "../data/player";
import { Action, Combatant, Monster } from "../types";
import { getRandomFromArray } from "../../shared/helpers";
import { MonsterToCombatant, PlayerToCombatant } from "../data/combatant";

export enum DungeonType {
  Normal,
  LimitedTimeEvent,
  SpecialEvent,
}

export class Dungeon {
  id: number;
  name: string;
  type: DungeonType;

  constructor(id: number, name: string, type = DungeonType.Normal) {
    this.id = id;
    this.name = name;
    this.type = type;
  }

  battle: Battle = new Battle(this);

  connectedPlayers: Map<Player, Socket> = new Map();

  spawnMonsters() {
    const monsterA = MONSTERS.SLIME("monsterA");
    const monsterB = MONSTERS.SLIME("monsterB");
    const monsterC = MONSTERS.SLIME("monsterC");
    this.battle.addMonsterCombatant(monsterA, TeamFlag.RED);
    this.battle.addMonsterCombatant(monsterB, TeamFlag.RED);
    this.battle.addMonsterCombatant(monsterC, TeamFlag.RED);
    return this.battle;
  }

  join(socket: Socket, player: Player) {
    if (this.connectedPlayers.has(player)) return false;
    this.connectedPlayers.set(player, socket);

    this.battle.addPlayerCombatant(player, TeamFlag.BLUE);
    socket.emit("RPG:BATTLE", { battle: this.battle });
    // this.battle.addCombatant(TeamFlag.BLUE, player, true);

    this.battle.start();

    // TODO remove if dungeon ends
    socket.once("disconnect", this.leave.bind(this, socket, player));

    return true;
  }

  leave(socket: Socket, player: Player) {
    this.connectedPlayers.delete(player);
    this.battle.removeCombatant(TeamFlag.BLUE, player.id);
  }

  emit(eventName: string, data?: any) {
    for (const socket of this.connectedPlayers.values()) {
      socket.emit(eventName, data);
    }
  }
}

export enum TeamFlag {
  RED,
  BLUE,
}

enum Phase {
  INIT,
  START,
  BATTLE,
  END,
}

class Battle {
  static START_DELAY = 3000;
  static DEFAULT_SPEED_SORT = (a: Combatant, b: Combatant) => b.stats.speed - a.stats.speed;
  static MAP_TO_ID = (a: Combatant) => a.id;

  phase: Phase = Phase.INIT;

  combatants: Map<string, Combatant> = new Map();
  lockedCombatants: Map<string, Combatant> = new Map();

  actions: Map<string, Action> = new Map();
  lockedActions: Map<string, Action> = new Map();

  targets: Map<string, string> = new Map();
  lockedTargets: Map<string, string> = new Map();

  turnOrder: string[] = [];
  lockedTurnOrder: string[] = [];

  teams: Record<TeamFlag, string[]> = {
    [TeamFlag.RED]: [],
    [TeamFlag.BLUE]: [],
  };

  dungeon: Dungeon;

  constructor(dungeon: Dungeon) {
    this.dungeon = dungeon;
  }

  // TODO remove partial
  getCleanCombatants() {
    const cleanCombatants: Record<string, Partial<Combatant>> = {};
    for (const combatant of this.combatants.values()) {
      cleanCombatants[combatant.id] = {
        id: combatant.id,
        type: combatant.type,
        name: combatant.name,
        maxHealth: combatant.maxHealth,
        health: combatant.health,
        maxMana: combatant.maxMana,
        mana: combatant.mana,
        stats: combatant.stats,
        xp: combatant.xp,
        defaultAction: combatant.defaultAction,
        teamFlag: combatant.teamFlag,
      };
    }
    return cleanCombatants;
  }

  toJSON() {
    return {
      phase: this.phase,
      turn: this.turn,
      combatants: this.getCleanCombatants(),
      turnOrder: this.turnOrder,
    };
  }

  generateTurnOrder(combatants: Map<string, Combatant>) {
    this.turnOrder = Array.from(combatants.values()).sort(Battle.DEFAULT_SPEED_SORT).map(Battle.MAP_TO_ID);
  }

  generateTeams(combatants: Map<string, Combatant>) {
    this.teams = {
      [TeamFlag.RED]: [],
      [TeamFlag.BLUE]: [],
    };

    for (const [id, combatant] of combatants) {
      this.teams[combatant.teamFlag].push(id);
    }
  }

  addPlayerCombatant(player: Player, team: TeamFlag) {
    const playerCombatant = PlayerToCombatant(player, team);
    this.combatants.set(playerCombatant.id, playerCombatant);
  }

  addMonsterCombatant(monster: Monster, team: TeamFlag) {
    const monsterCombatant = MonsterToCombatant(monster, team);
    this.combatants.set(monsterCombatant.id, monsterCombatant);
  }

  removeCombatant(team: TeamFlag, combatantId: string, recalculateTurnOrder = true) {
    this.combatants.delete(combatantId);
    this.dungeon.emit("RPG:BATTLE", { battle: this });
    // this.teams[team].delete(combatant.id);
    // this.teamMap.delete(combatant.id);

    if (recalculateTurnOrder) {
      // this.generateTurnOrder();
    }
  }

  setAction(combatantId: string, action: Action) {
    this.actions.set(combatantId, action);
  }

  turn: number = 0;

  start() {
    console.log(">>> battle.start");
    if (this.phase >= Phase.START) return;
    this.dungeon.spawnMonsters();

    this.phase = Phase.START;
    this.dungeon.emit("RPG:BATTLE", { battle: this });

    setTimeout(() => {
      this.phase = Phase.BATTLE;
      this.loop();
    }, Battle.START_DELAY);
  }

  loop = () => {
    if (this.phase !== Phase.BATTLE) return;
    this.turn += 1;

    setTimeout(this.loop, 5000);

    // lock combatants
    this.lockedCombatants = new Map(this.combatants.entries());

    // generate turn order
    this.generateTurnOrder(this.lockedCombatants);

    // lock actions
    this.lockedActions = this.actions;
    this.actions = new Map();

    // lock targets
    this.lockedTargets = new Map(this.targets.entries());

    this.generateTeams(this.lockedCombatants);

    const actions = [];
    // execute turns
    for (const combatantId of this.turnOrder) {
      const combatant = this.lockedCombatants.get(combatantId)!;
      const action = this.lockedActions.get(combatantId) ?? combatant.defaultAction;
      const targetId =
        this.lockedTargets.get(combatantId) ?? combatant.teamFlag === TeamFlag.RED
          ? getRandomFromArray(this.teams[TeamFlag.BLUE])!
          : getRandomFromArray(this.teams[TeamFlag.RED])!;
      const target = this.lockedCombatants.get(targetId)!;
      const result: any = {
        combatantId,
        targetId,
        action,
      };

      switch (action) {
        case Action.ATTACK: {
          const damage = Math.max(combatant.stats.attack - target.stats.defense, 0);
          target.health -= damage;

          if (target.health <= 0) {
            this.removeCombatant(target.teamFlag, target.id);
          }

          result.damage = damage;
          break;
        }

        default:
          break;
      }

      // const message = `${combatant.name} -> ${Action[action]} -> ${target.id}`;

      actions.push(result);
    }

    const turnInfo = {
      actions,
      ...this.toJSON(),
    };

    console.log(">>", turnInfo);
    this.dungeon.emit("RPG:BATTLE", { battle: turnInfo });
    // cleanup
  };
}
