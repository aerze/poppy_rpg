import { Socket } from "socket.io";
import { DUNGEONS } from "./dungeon-data";
import { DungeonType, Floor, Room } from "./types/dungeon-types";
import { Player } from "./player";
import { BattleEndType, BattleInstance } from "./battle-instance";
import { Action } from "../types";
import { Combatant } from "./combatant";
import { Claire } from "../claire";

export type PlayerMap = Map<Player["id"], Player>;

export class DungeonInstance {
  log(...args: any) {
    console.log(`CLAIRE: ${this.name}:`, ...args);
  }

  claire: Claire;

  id: number;

  dungeonType: DungeonType;

  floors: Floor[];

  /** Map<Player.id, Socket> */
  sockets: Map<Player["id"], Socket>;

  players: PlayerMap;

  activePlayers: PlayerMap;

  assistPlayers: PlayerMap;

  disconnectedPlayers: PlayerMap;

  combatants: Map<Player["id"], Combatant>;

  floorIndex: number;

  roomIndex: number;

  room: Room;

  initialized: boolean = false;

  battle?: BattleInstance;

  constructor(claire: Claire, id: number, dungeonType: DungeonType) {
    this.claire = claire;
    this.id = id;
    this.sockets = new Map();
    this.players = new Map();
    this.activePlayers = new Map();
    this.assistPlayers = new Map();
    this.disconnectedPlayers = new Map();
    this.combatants = new Map();
    this.dungeonType = dungeonType;
    this.floorIndex = 0;
    this.roomIndex = 0;
    this.floors = DUNGEONS[dungeonType.id]();
    this.room = this.getEncounter(0, 0)!;
  }

  /**
   * I don't like this, move to dungeon manager - abby
   */
  init() {
    if (this.initialized) return;
    this.loadBattle();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
    };
  }

  get name() {
    return this.dungeonType.name;
  }

  get type() {
    return this.dungeonType.type;
  }

  get typeId() {
    return this.dungeonType.id;
  }

  /**
   * gets encounter data for specified room,
   * will attempt to jump floors when over indexing rooms
   */
  getEncounter(floorIndex = this.floorIndex, roomIndex = this.roomIndex + 1): Room | null {
    if (floorIndex >= this.floors.length) {
      // TODO: end dungeon
      return null;
    }

    // get first room of next floor
    const floor = this.floors[floorIndex];
    if (roomIndex >= floor.rooms.length) {
      return this.getEncounter(floorIndex + 1, 0);
    }

    this.floorIndex = floorIndex;
    this.roomIndex = roomIndex;
    return floor.rooms[roomIndex];
  }

  join(socket: Socket, player: Player) {
    this.log(`${player.id} joined`);
    this.players.set(player.id, player);
    this.activePlayers.set(player.id, player);
    this.sockets.set(player.id, socket);
    this.battle?.join(player);
    this.send(player.id, { battle: this.battle });
    socket.on("disconnect", this.leave.bind(this, player.id));
  }

  leave(playerId: Player["id"]) {
    this.log(`${playerId} left`);
    this.battle?.leave(playerId);
    this.players.delete(playerId);
    this.activePlayers.delete(playerId);
    this.sockets.delete(playerId);
  }

  send(playerId: Player["id"], ...args: any) {
    const socket = this.sockets.get(playerId);
    if (!socket) return;
    socket.emit("RPG:DUNGEON", ...args);
  }

  sendAll(...args: any) {
    for (const socket of this.sockets.values()) {
      socket.emit("RPG:DUNGEON", ...args);
    }
  }

  loadBattle(room: Room = this.room) {
    this.battle = new BattleInstance(this, room);
    for (const player of this.activePlayers.values()) {
      this.battle.join(player);
    }

    for (const player of this.assistPlayers.values()) {
      this.battle.join(player);
    }
  }

  endBattle(battleEndType: BattleEndType) {
    switch (battleEndType) {
      case BattleEndType.LOSS: {
        // reset the dungeon back to floor 1
        // move on to the next room/floor
        const nextRoom = this.getEncounter(0, 0);

        // if dungeon end is reached
        if (nextRoom === null) {
          this.log(`dungeon complete`);
          // do a flip (celebrate)
          return;
        }

        this.room = nextRoom;
        this.loadBattle();
        this.start();
        // re-initiate ready system
        return;
      }

      case BattleEndType.WIN: {
        const enemies = this.battle!.enemies;
        const rawr_xP = Array.from(enemies.values()).reduce((a, e) => a + e.xp, 0);

        const players = this.battle!.players;
        for (const combatant of players.values()) {
          const player = this.players.get(combatant.id);
          if (!player) {
            this.log(`player ${combatant.id} is missing for promotion`);
            continue;
          }
          this.promotePlayer(player, rawr_xP);
        }

        console.log(players);

        // move on to the next room/floor
        const nextRoom = this.getEncounter();

        // if dungeon end is reached
        if (nextRoom === null) {
          this.log(`dungeon complete`);
          // do a flip (celebrate)
          return;
        }

        this.room = nextRoom;
        this.loadBattle();
        this.start();
        return;
      }
    }
  }

  promotePlayer(player: Player, xp: number) {
    player.xp += xp;

    if (player.level < 10) {
      let levelRequirement = this.getLevelRequirement(player.level);

      while (player.xp >= levelRequirement) {
        player.level += 1;
        player.availableStatPoints += 8;
        levelRequirement = this.getLevelRequirement(player.level);
      }
    }

    this.claire.db.players.update(player.id, player);
    const socket = this.sockets.get(player.id);
    socket?.emit("RPG:PLAYER", { player });
  }

  getLevelRequirement(level: number) {
    return Math.floor((level * level * level) / Math.log10(level + 1) + 100);
  }

  setAction(playerId: Player["id"], action: Action) {
    if (!this.battle) return false;

    this.log(`${playerId} joined`);
    this.battle.actions.set(playerId, action);
    return true;
  }

  setAssist(playerId: Player["id"], assist: boolean) {
    const player = this.players.get(playerId);
    if (!player) return false;
    if (assist) {
      this.log(`${playerId} moved to assist`);
      this.activePlayers.delete(player.id);
      this.assistPlayers.set(player.id, player);
    } else {
      this.log(`${playerId} moved to active`);
      this.assistPlayers.delete(player.id);
      this.activePlayers.set(player.id, player);
    }
  }

  setTarget(playerId: Player["id"], targetId: Combatant["id"]) {
    if (!this.battle) return false;

    this.log(`${playerId} joined`);
    this.battle.targets.set(playerId, targetId);
    return true;
  }

  start() {
    this.battle?.start();
  }
}
