import { Socket } from "socket.io";
import { MONSTERS } from "../data/monsters";
import { Player } from "../player";
import { Action, Combatant } from "../types";
import { getRandomFromArray } from "../../shared/helpers";

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
    this.battle.addCombatant(TeamFlag.RED, monsterA);
    this.battle.addCombatant(TeamFlag.RED, monsterB);
    this.battle.addCombatant(TeamFlag.RED, monsterC);
    return this.battle;
  }

  join(socket: Socket, player: Player) {
    if (this.connectedPlayers.has(player)) return false;
    this.connectedPlayers.set(player, socket);
    this.battle.addCombatant(TeamFlag.BLUE, player, true);

    this.battle.start();

    // TODO remove if dungeon ends
    socket.once("disconnect", this.leave.bind(this, socket, player));

    return true;
  }

  leave(socket: Socket, player: Player) {
    this.connectedPlayers.delete(player);
    this.battle.removeCombatant(TeamFlag.BLUE, player);
  }

  emit(eventName: string, data?: any) {
    for (const socket of this.connectedPlayers.values()) {
      socket.emit(eventName, data);
    }
  }
}

enum TeamFlag {
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

  actions: Map<string, Action> = new Map();
  lockedActions: Map<string, Action> = new Map();

  targets: Map<string, string> = new Map();
  lockedTargets: Map<string, string> = new Map();

  turnOrder: string[] = [];

  teams: Record<TeamFlag, Set<string>> = {
    [TeamFlag.RED]: new Set(),
    [TeamFlag.BLUE]: new Set(),
  };

  teamMap: Map<string, TeamFlag> = new Map();

  dungeon: Dungeon;

  constructor(dungeon: Dungeon) {
    this.dungeon = dungeon;
  }

  teamArrays() {
    return {
      [TeamFlag.RED]: Array.from(this.teams[TeamFlag.RED].values()),
      [TeamFlag.BLUE]: Array.from(this.teams[TeamFlag.BLUE].values()),
    };
  }

  getCleanCombatants() {
    const cleanCombatants: Record<string, Combatant> = {};
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
      };
    }
    return cleanCombatants;
  }

  toJSON() {
    return {
      combatants: this.getCleanCombatants(),
      turnOrder: this.turnOrder,
      teams: this.teamArrays(),
    };
  }

  generateTurnOrder() {
    this.turnOrder = Array.from(this.combatants.values()).sort(Battle.DEFAULT_SPEED_SORT).map(Battle.MAP_TO_ID);
  }

  addCombatant(team: TeamFlag, combatant: Combatant, recalculateTurnOrder = false) {
    this.combatants.set(combatant.id, combatant);
    this.teams[team].add(combatant.id);
    this.teamMap.set(combatant.id, team);

    if (recalculateTurnOrder) {
      this.generateTurnOrder();
    }
  }

  removeCombatant(team: TeamFlag, combatant: Combatant, recalculateTurnOrder = true) {
    this.combatants.delete(combatant.id);
    this.teams[team].delete(combatant.id);
    this.teamMap.delete(combatant.id);

    if (recalculateTurnOrder) {
      this.generateTurnOrder();
    }
  }

  addAction(combatant: Combatant, action: Action) {
    this.actions.set(combatant.id, action);
  }

  turn: number = 0;

  start() {
    console.log(">>> battle.start");
    if (this.phase >= Phase.START) return;
    this.dungeon.spawnMonsters();

    this.phase = Phase.START;
    this.dungeon.emit("RPG:BATTLE", { battle: { phase: this.phase } });

    setTimeout(() => {
      this.phase = Phase.BATTLE;
      this.loop();
    }, Battle.START_DELAY);
  }

  loop = () => {
    if (this.phase !== Phase.BATTLE) return;
    this.turn += 1;

    setTimeout(this.loop, 5000);
    // lock actions
    this.lockedActions = this.actions;
    this.actions = new Map();

    // lock targets
    this.lockedTargets = this.targets;
    this.targets = new Map();

    // generate turn order
    this.generateTurnOrder();
    const teamArrays = this.teamArrays();

    const actions = [];
    // execute turns
    for (const combatantId of this.turnOrder) {
      const combatant = this.combatants.get(combatantId)!;
      const team = this.teamMap.get(combatantId)!;
      const action = this.lockedActions.get(combatantId) ?? combatant.defaultAction;
      const targetId =
        this.lockedTargets.get(combatantId) ?? team === TeamFlag.RED
          ? getRandomFromArray(teamArrays[TeamFlag.BLUE])!
          : getRandomFromArray(teamArrays[TeamFlag.RED])!;
      const target = this.combatants.get(targetId)!;

      const message = `${combatant.name} -> ${action} -> ${target.id}`;
      actions.push(message);
    }

    const turnInfo = {
      turn: this.turn,
      actions,
    };

    console.log(">>", turnInfo);
    this.dungeon.emit("RPG:DEV:TURN_DATA", turnInfo);
    // cleanup
  };
}
