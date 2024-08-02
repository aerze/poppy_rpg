// import { Socket } from "socket.io";
// import { Action, CombatantOld, Monster } from "../types";
// import { getRandomFromArray, getRandomInt } from "../../shared/helpers";
// import { MonsterToCombatant, PlayerToCombatant } from "../data/combatant";
// import { DungeonData, DungeonType, DungeonInstanceType, Room } from "../data/types/dungeon-types";
// import { Player } from "../data/player";
// import { DUNGEONS } from "../data/dungeon-data";
// import { Claire } from "../claire";

// export enum TeamFlag {
//   RED,
//   BLUE,
// }

// export enum Phase {
//   INIT,
//   START,
//   BATTLE,
//   END,
// }

// export class Dungeon {
//   static START_DURATION = 30000;
//   static TURN_DURATION = 8000;
//   static DEFAULT_SPEED_SORT = (a: CombatantOld, b: CombatantOld) => b.stats.speed - a.stats.speed;
//   static MAP_TO_ID = (a: CombatantOld) => a.id;

//   claire: Claire;
//   id: number;
//   name: string;
//   type: DungeonInstanceType;
//   typeId: string;
//   dungeonData: DungeonData;
//   connectedPlayers: Map<Player, Socket> = new Map();

//   floorIndex: number = -1;
//   roomIndex: number = -1;

//   phase: Phase = Phase.INIT;
//   turn: number = 0;

//   combatants: Map<string, CombatantOld> = new Map();
//   lockedCombatants: Map<string, CombatantOld> = new Map();

//   actions: Map<string, Action> = new Map();
//   lockedActions: Map<string, Action> = new Map();

//   targets: Map<string, string> = new Map();
//   lockedTargets: Map<string, string> = new Map();

//   turnOrder: string[] = [];
//   lockedTurnOrder: string[] = [];

//   teams: Record<TeamFlag, string[]> = {
//     [TeamFlag.RED]: [],
//     [TeamFlag.BLUE]: [],
//   };

//   room: Room;

//   initTime = Date.now();
//   startTime = Date.now();

//   constructor(claire: Claire, id: number, dungeonType: DungeonType) {
//     this.claire = claire;
//     this.id = id;
//     this.name = dungeonType.name;
//     this.type = dungeonType.type;
//     this.typeId = dungeonType.id;
//     this.dungeonData = { floors: DUNGEONS[dungeonType.id]() };
//     this.room = this.getEncounter(0, 0)!;
//     this.loadRoom(this.room);
//   }

//   toJSON() {
//     return {
//       ...this,
//       claire: null,
//       loop: null,
//     };
//   }

//   join(socket: Socket, player: Player) {
//     if (this.connectedPlayers.has(player)) return false;
//     this.connectedPlayers.set(player, socket);

//     this.addPlayerCombatant(player, TeamFlag.BLUE);
//     socket.emit("RPG:BATTLE", { battle: this.getBattleInfo() });
//     // this.battle.addCombatant(TeamFlag.BLUE, player, true);

//     this.startBattle();

//     // TODO remove if dungeon ends
//     socket.once("disconnect", this.leave.bind(this, socket, player));
//     return true;
//   }

//   leave(socket: Socket, player: Player) {
//     this.connectedPlayers.delete(player);
//     this.removeCombatant(TeamFlag.BLUE, player.id);
//   }

//   emit(eventName: string, data?: any) {
//     for (const socket of this.connectedPlayers.values()) {
//       socket.emit(eventName, data);
//     }
//   }

//   sendUpdate(data: any) {
//     this.emit("RPG:BATTLE", data);
//   }

//   getEncounter(floorIndex = this.floorIndex, roomIndex = this.roomIndex + 1): Room | null {
//     const floors = this.dungeonData.floors;
//     if (floorIndex >= floors.length) {
//       // TODO: end dungeon
//       return null;
//     }

//     const floor = this.dungeonData.floors[floorIndex];
//     if (roomIndex >= floor.rooms.length) {
//       return this.getEncounter(floorIndex + 1, 0);
//     }

//     this.floorIndex = floorIndex;
//     this.roomIndex = roomIndex;
//     return floor.rooms[roomIndex];
//   }

//   loadRoom(room: Room) {
//     for (const {
//       combatant,
//       quantity,
//       levelRange: [levelMin, levelMax],
//     } of room.combatants!) {
//       const makeMonster = combatant[0];
//       for (let i = 0; i < quantity; i++) {
//         this.addMonsterCombatant(makeMonster(getRandomInt(levelMin, levelMax)), TeamFlag.RED);
//       }
//     }
//   }

//   getCleanCombatants() {
//     const cleanCombatants: Record<string, Partial<CombatantOld>> = {};
//     for (const combatant of this.combatants.values()) {
//       cleanCombatants[combatant.id] = {
//         id: combatant.id,
//         type: combatant.type,
//         name: combatant.name,
//         maxHealth: combatant.maxHealth,
//         health: combatant.health,
//         maxMana: combatant.maxMana,
//         mana: combatant.mana,
//         stats: combatant.stats,
//         xp: combatant.xp,
//         defaultAction: combatant.defaultAction,
//         teamFlag: combatant.teamFlag,
//       };
//     }
//     return cleanCombatants;
//   }

//   getBattleInfo() {
//     return {
//       phase: this.phase,
//       turn: this.turn,
//       combatants: this.getCleanCombatants(),
//       turnOrder: this.turnOrder,
//     };
//   }

//   generateTurnOrder(combatants: Map<string, CombatantOld>) {
//     this.turnOrder = Array.from(combatants.values()).sort(Dungeon.DEFAULT_SPEED_SORT).map(Dungeon.MAP_TO_ID);
//   }

//   generateTeams(combatants: Map<string, CombatantOld>) {
//     this.teams = {
//       [TeamFlag.RED]: [],
//       [TeamFlag.BLUE]: [],
//     };

//     for (const [id, combatant] of combatants) {
//       this.teams[combatant.teamFlag].push(id);
//     }
//   }

//   addPlayerCombatant(player: Player, team: TeamFlag) {
//     const playerCombatant = PlayerToCombatant(player, team);
//     this.combatants.set(playerCombatant.id, playerCombatant);
//   }

//   addMonsterCombatant(monster: Monster, team: TeamFlag) {
//     const monsterCombatant = MonsterToCombatant(monster, team);
//     this.combatants.set(monsterCombatant.id, monsterCombatant);
//   }

//   removeCombatant(team: TeamFlag, combatantId: string) {
//     this.combatants.delete(combatantId);
//     this.emit("RPG:BATTLE", { battle: this.getBattleInfo() });
//   }

//   removeAllCombatants() {
//     this.combatants.clear();
//   }

//   setAction(combatantId: string, action: Action) {
//     return this.actions.set(combatantId, action);
//   }

//   setTarget(combatantId: string, targetId: string) {
//     this.targets.set(combatantId, targetId);
//   }

//   startBattle() {
//     if (this.phase >= Phase.START) return;
//     this.initTime = Date.now();
//     this.startTime = this.initTime + 30000;

//     this.phase = Phase.START;

//     this.sendUpdate({ battle: this.getBattleInfo(), timer: this.startTime });

//     setTimeout(() => {
//       this.phase = Phase.BATTLE;
//       this.loop();
//     }, Dungeon.START_DURATION);
//   }

//   endBattle() {
//     console.log(">> CLOSING DUNGEON");
//     this.phase = Phase.END;
//     this.removeAllCombatants();
//   }

//   getTargetFromArray(combatantIds: string[]) {
//     return getRandomFromArray(combatantIds.map((id) => this.combatants.get(id)).filter((c) => (c?.health ?? 0) > 0))!
//       .id;
//   }

//   loop = () => {
//     if (this.phase !== Phase.BATTLE) return;
//     this.turn += 1;

//     const now = Date.now();
//     setTimeout(this.loop, Dungeon.TURN_DURATION);

//     // lock combatants
//     this.lockedCombatants = new Map(this.combatants.entries());

//     // generate turn order
//     this.generateTurnOrder(this.lockedCombatants);

//     // lock actions
//     this.lockedActions = this.actions;
//     this.actions = new Map();

//     // reset all actions
//     this.sendUpdate({ action: -1 });

//     // lock targets
//     this.lockedTargets = new Map(this.targets.entries());

//     this.generateTeams(this.lockedCombatants);

//     const actions = [];

//     if (!this.teams[TeamFlag.BLUE].length) {
//       // end dungeon early, team wipe (or disconnect)
//       // return this.dungeon.end;
//       this.phase = Phase.END;
//       this.removeAllCombatants();
//       return;
//     }

//     if (!this.teams[TeamFlag.RED].length) {
//       // end dungeon normally
//       this.phase = Phase.END;
//       return;
//     }

//     // execute turns
//     for (const combatantId of this.turnOrder) {
//       const combatant = this.lockedCombatants.get(combatantId)!;
//       const action = this.lockedActions.get(combatantId) ?? combatant.defaultAction;

//       // const targetId =
//       //   combatant.teamFlag === TeamFlag.RED ? this.handleMonsterTargeting(combatant) : this.handlePlayerTargeting(combatant);
//       const targetId =
//         this.lockedTargets.get(combatantId) ?? combatant.teamFlag === TeamFlag.RED
//           ? this.getTargetFromArray(this.teams[TeamFlag.BLUE])!
//           : this.getTargetFromArray(this.teams[TeamFlag.RED])!;

//       const target = this.lockedCombatants.get(targetId)!;
//       const result: any = {
//         combatantId,
//         targetId,
//         action,
//       };

//       switch (action) {
//         case Action.ATTACK: {
//           const damage = Math.max(combatant.stats.attack - target.stats.defense, 0);
//           target.health -= damage;

//           // if (target.health <= 0) {
//           //   this.removeCombatant(target.teamFlag, target.id);
//           // }

//           result.damage = damage;
//           break;
//         }

//         default:
//           break;
//       }

//       // const message = `${combatant.name} -> ${Action[action]} -> ${target.id}`;

//       actions.push(result);
//     }

//     const turnInfo = {
//       actions,
//       ...this.getBattleInfo(),
//     };

//     console.log(">>", turnInfo);
//     this.emit("RPG:BATTLE", { battle: turnInfo, timer: now + Dungeon.TURN_DURATION });
//     // cleanup
//   };
// }
