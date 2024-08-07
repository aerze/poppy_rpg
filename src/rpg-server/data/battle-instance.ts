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

export type TargetMap = Map<CombatantId, CombatantId>;

const monsterCounter = new SafeCounter();

export enum BattleEndType {
  LOSS,
  WIN,
}

export class BattleInstance {
  // static StartDuration = 30_000;
  static StartDuration = 10_000;

  static TurnDuration = 8_000;

  // static EndDuration = 30_000;
  static EndDuration = 10_000;

  static SORT_BY_SPEED = (a: Combatant, b: Combatant) => b.stats.speed - a.stats.speed;

  static MAP_TO_ID = (a: Combatant) => a.id;

  static LIVING_FILTER = (a: Combatant) => a.health > 0;

  static DEAD_FILTER = (a: Combatant) => a.health <= 0;

  static CRIT_MULTIPLIER = 1.25;

  static DEFLECT_MULTIPLIER = 0.8;

  static BLOCK_MULTIPLIER = 1.2;

  log(...args: any) {
    console.log(`CLAIRE: Battle:`, ...args);
  }

  dungeon: DungeonInstance;

  phase: BattlePhase = BattlePhase.INIT;

  turn: number = 0;

  actions: Map<CombatantId, Action> = new Map();

  targets: TargetMap = new Map();

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

  getRandomPlayer(filter?: (value: Combatant, index: number, array: Combatant[]) => boolean) {
    let list = Array.from(this.players.values());
    if (filter) list = list.filter(filter);
    return getRandomFromArray(list)!;
  }

  getRandomEnemy(filter?: (value: Combatant, index: number, array: Combatant[]) => boolean) {
    let list = Array.from(this.enemies.values());
    if (filter) list = list.filter(filter);
    return getRandomFromArray(list)!;
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

  getTarget(id: string, targets: TargetMap, defaultTarget: CombatantId) {
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

    // are any players alive
    let totalPartyKill = true;
    for (const player of this.players.values()) {
      if (player.health > 0) {
        totalPartyKill = false;
        break;
      }
    }
    if (totalPartyKill) {
      this.end(BattleEndType.LOSS);
      return;
    }

    // are there any monsters alive
    let totalEnemyKill = true;
    for (const enemy of this.enemies.values()) {
      if (enemy.health > 0) {
        totalEnemyKill = false;
        break;
      }
    }
    if (totalEnemyKill) {
      this.end(BattleEndType.WIN);
      return;
    }

    // prepare for next turn
    const now = Date.now();
    this.nextTurnTime = now + BattleInstance.TurnDuration;
    setTimeout(this.update, BattleInstance.TurnDuration);

    // do nothing if no players are connected
    if (this.players.size === 0) {
      this.pushUpdate();
      return;
    }

    // start battle logic
    this.generateTurnOrder();
    const actions = this.copyActions();
    const targets = this.copyTargets();
    const blocks = this.turnOrder.filter((id) => actions.get(id) === Action.DEFEND);

    const results = [];

    // main loop
    for (const id of this.turnOrder) {
      const isMonster = this.isMonsterId(id);

      // handle monster logic
      if (isMonster) {
        const monster = this.enemies.get(id);
        if (!monster) {
          this.log(`skipping turn for ${id}`);
          continue;
        }

        const action = this.getAction(id, actions, Action.ATTACK);

        // handle enemy actions
        if (action === Action.ATTACK) {
          const target = this.findPlayerTarget(targets, monster.id);
          const [damage, crit, dodge] = this.attack(monster, target, blocks.includes(target.id));
          results.push([monster.id, target.id, damage, crit, dodge]);
        }

        // handle player logic
      } else {
        const player = this.players.get(id);
        if (!player) {
          this.log(`skipping turn for ${id}`);
          continue;
        }

        const action = this.getAction(id, actions, Action.ATTACK);

        // handle player actions
        if (action === Action.ATTACK) {
          const target = this.findEnemyTarget(targets, player.id);
          const [damage, crit, dodge] = this.attack(player, target, blocks.includes(target.id));
          results.push([player.id, target.id, damage, crit, dodge]);
        }
      }
    }

    this.log(this.turnOrder.map((id) => `${id}: ${Action[actions.get(id)!]} > ${targets.get(id)}`).join("\n"));

    this.pushUpdate({ results });
  };

  findPlayerTarget(targets: TargetMap, sourceId: CombatantId) {
    const customTargetId = targets.get(sourceId);
    if (customTargetId) {
      const target = this.players.get(customTargetId);
      if (target) {
        if (target?.health > 0) return target;
      } else {
        this.log(`target for ${sourceId} was missing? ${customTargetId}`);
      }
    }

    const target = this.getRandomPlayer(BattleInstance.LIVING_FILTER);
    this.targets.set(sourceId, target.id);
    return target;
  }

  findEnemyTarget(targets: TargetMap, sourceId: CombatantId) {
    const customTargetId = targets.get(sourceId);
    if (customTargetId) {
      const target = this.enemies.get(customTargetId);
      if (target) {
        if (target?.health > 0) return target;
      } else {
        this.log(`target for ${sourceId} was missing? ${customTargetId}`);
      }
    }

    const target = this.getRandomEnemy(BattleInstance.LIVING_FILTER);
    this.targets.set(sourceId, target.id);
    return target;
  }

  attack(source: Combatant, target: Combatant, isBlocking: boolean): [number, boolean, boolean] {
    const roll = Math.random();
    const crit = roll <= source.stats.luck / 200;
    const dodge = roll <= target.stats.luck / 200; // should include speed

    const defense = isBlocking ? target.stats.defense * BattleInstance.BLOCK_MULTIPLIER : target.stats.defense;
    let attack = source.stats.attack;

    if (crit) {
      if (!dodge) attack *= BattleInstance.CRIT_MULTIPLIER;
      else attack *= BattleInstance.DEFLECT_MULTIPLIER;
    } else if (dodge) {
      attack = 0;
    }

    const damage = attack - defense;

    target.health = Math.max(0, target.health - damage);

    return [damage, crit, dodge];
  }

  end(battleEndType: BattleEndType) {
    // else send players to results ->
    this.phase = BattlePhase.END;
    this.pushUpdate({ battleEndType });

    setTimeout(() => {
      this.dungeon.endBattle(battleEndType);
    }, BattleInstance.EndDuration);
  }

  pushUpdate(extras?: any) {
    this.dungeon.sendAll({ battle: this, ...extras });
  }

  join(player: Player) {
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
