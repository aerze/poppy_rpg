import { Socket } from "socket.io";
import { Action } from "../types";
import { Player } from "./player";
import { Room } from "./types/dungeon-types";
import { DungeonInstance } from "./dungeon-instance";
import { getRandomFromArray, getRandomInt } from "../../shared/helpers";
import { SafeCounter } from "../../shared/safe-counter";
import { Combatant } from "./combatant";

export enum Team {
  RED,
  BLUE,
}

export enum BattlePhase {
  INIT,
  START,
  BATTLE,
  END,
}

export type CombatantId = string;

const monsterCounter = new SafeCounter();

export class BattleInstance {
  // static StartDuration = 30_000;
  static StartDuration = 10_000;

  static TurnDuration = 8_000;

  // static EndDuration = 30_000;
  static EndDuration = 10_000;

  static SORT_BY_SPEED = (a: Combatant, b: Combatant) => b.stats.speed - a.stats.speed;

  static MAP_TO_ID = (a: Combatant) => a.id;

  log(...args: any) {
    console.log(`CLAIRE: Battle:`, ...args);
  }

  dungeon: DungeonInstance;

  phase: BattlePhase = BattlePhase.INIT;

  turn: number = 0;

  actions: Map<CombatantId, Action> = new Map();

  targets: Map<CombatantId, CombatantId> = new Map();

  turnOrder: Combatant["id"][] = [];

  initTime = Date.now();

  startTime = Date.now();

  nextTurnTime = Date.now();

  players: Map<Combatant["id"], Combatant> = new Map();

  enemies: Map<Combatant["id"], Combatant> = new Map();

  room: Room;

  get countdownDuration() {
    switch (this.phase) {
      case BattlePhase.INIT:
      case BattlePhase.START:
        return BattleInstance.StartDuration;

      case BattlePhase.BATTLE:
        return BattleInstance.TurnDuration;

      case BattlePhase.END:
        return BattleInstance.EndDuration;
    }
  }

  get countdownTarget() {
    switch (this.phase) {
      case BattlePhase.INIT:
      case BattlePhase.START:
        return this.startTime;

      case BattlePhase.BATTLE:
      case BattlePhase.END:
        return this.nextTurnTime;
    }
  }

  get combatants() {
    return [...Array.from(this.players.values()), ...Array.from(this.enemies.values())];
  }

  getRandomPlayerId() {
    return getRandomFromArray(Array.from(this.players.values()))!.id;
  }

  constructor(dungeon: DungeonInstance, room: Room) {
    this.dungeon = dungeon;
    this.room = room;
    this.generateEnemiesFromRoom(this.room);
    this.generateTurnOrder();
  }

  generateEnemiesFromRoom(room: Room) {
    if (!room.combatants) return;
    for (const combatantData of room.combatants) {
      const monsterFn = combatantData.combatant[0];
      const [min, max] = combatantData.levelRange;
      for (let i = 0; i < combatantData.quantity; i++) {
        const level = getRandomInt(min, max);
        const monster = monsterFn(level, `m${monsterCounter.next()}`);
        const combatant = Combatant.fromMonster(monster);
        this.enemies.set(combatant.id, combatant);
      }
    }
  }

  toJSON() {
    return {
      turn: this.turn,
      phase: this.phase,
      turnOrder: this.turnOrder,
      countdownTarget: this.countdownTarget,
      countdownDuration: this.countdownDuration,
      players: Object.fromEntries(this.players.entries()),
      enemies: Object.fromEntries(this.enemies.entries()),
    };
  }

  start() {
    this.log(`starting battle`);
    if (this.phase >= BattlePhase.START) return;
    this.initTime = Date.now();
    this.startTime = this.initTime + BattleInstance.StartDuration;
    this.nextTurnTime = this.startTime + BattleInstance.TurnDuration;
    this.phase = BattlePhase.START;

    this.pushUpdate();

    setTimeout(() => {
      this.phase = BattlePhase.BATTLE;
      this.pushUpdate();
      this.update();
    }, BattleInstance.StartDuration);
  }

  getAction(id: string, actions: Map<CombatantId, Action>, defaultAction: Action) {
    const action = actions.get(id);
    if (action !== undefined) return action;

    this.actions.set(id, defaultAction);
    return defaultAction;
  }

  getTarget(id: string, targets: Map<CombatantId, CombatantId>, defaultTarget: CombatantId) {
    const target = targets.get(id);
    if (target !== undefined) return target;

    this.targets.set(id, defaultTarget);
    return defaultTarget;
  }

  isMonsterId(s: string) {
    return s[0] === "m";
  }

  update = () => {
    if (this.phase !== BattlePhase.BATTLE) return;
    this.turn += 1;
    this.log(`${BattlePhase[this.phase]}:${this.turn}`);

    // prepare for next turn
    const now = Date.now();
    this.nextTurnTime = now + BattleInstance.TurnDuration;
    setTimeout(this.update, BattleInstance.TurnDuration);

    if (this.players.size === 0) {
      this.pushUpdate();
      return;
    }

    // start battle logic
    this.generateTurnOrder();
    const actions = this.copyActions();
    const targets = this.copyTargets();
    this.log(this.turnOrder.map((id) => `${id}: ${Action[actions.get(id)!]} > ${targets.get(id)}`).join("\n"));

    for (const id of this.turnOrder) {
      const isMonster = this.isMonsterId(id);
      if (isMonster) {
        const monster = this.enemies.get(id);
        if (!monster) {
          this.log(`skipping turn for ${id}`);
          continue;
        }

        const action = this.getAction(id, actions, Action.ATTACK);

        if (action === Action.ATTACK) {
          let targetId = targets.get(id);
          if (targetId === undefined) {
            targetId = this.getRandomPlayerId();
            this.targets.set(id, targetId);
          }
          const target = this.players.get(targetId);
          if (!target) {
            targetId = this.getRandomPlayerId();
            this.targets.set(id, targetId);
          }
        }
      } else {
        const player = this.players.get(id);
        if (!player) {
          this.log(`skipping turn for ${id}`);
          continue;
        }
      }
    }

    this.pushUpdate();
  };

  pickTarget() {}

  end() {}

  pushUpdate() {
    this.dungeon.sendAll({ battle: this });
  }

  join(socket: Socket, player: Player) {
    this.log(`player ${player.id} joined`);
    const combatant = Combatant.fromPlayer(player);
    this.players.set(combatant.id, combatant);
  }

  leave(playerId: Player["id"]) {
    this.log(`player ${playerId} left`);
    this.players.delete(playerId);
  }

  copyActions() {
    return new Map(this.actions);
  }

  copyTargets() {
    return new Map(this.targets);
  }

  generateTurnOrder() {
    this.turnOrder = this.combatants.sort(BattleInstance.SORT_BY_SPEED).map(BattleInstance.MAP_TO_ID);
  }

  executeTurns() {}
}
