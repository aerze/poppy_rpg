import { Socket } from "socket.io";
import { BaseManager } from "./base-manager";
import { Player } from "../data/player";

export enum DataType {
  DUNGEON_LIST,
  DUNGEON_INSTANCE_LIST,
  DUNGEON_INSTANCE_INFO,
  JOIN_DUNGEON,
  LEAVE_DUNGEON,
  BATTLE_SET_ACTION,
  BATTLE_SET_ASSIST,
  BATTLE_SET_TARGET,
  GET_PLAYER,
  UPDATE_PLAYER,
  ASSIGN_STAT_POINTS,
}

export class Router extends BaseManager {
  async handleRequest(socket: Socket, playerId: string, type: DataType, options: any, callback: (v: any) => void) {
    this.log(`/${DataType[type]}`, options);
    // const player = this.claire.players.get(playerId)!;
    const result = await this.getData(type, options, socket, playerId);
    this.debug(`\n>> `, result);

    if (callback) {
      callback(result);
    }
  }

  async getData(type: DataType, options: any, socket: Socket, playerId: Player["id"]) {
    switch (type) {
      case DataType.DUNGEON_LIST:
        return this.claire.dungeons.dungeonTypes;

      case DataType.DUNGEON_INSTANCE_LIST:
        return this.claire.dungeons.getInstances();

      case DataType.DUNGEON_INSTANCE_INFO:
        return this.claire.dungeons.getInstance(options.id);

      case DataType.JOIN_DUNGEON:
        return this.claire.dungeons.joinInstance(options.dungeonId, socket, playerId);

      case DataType.LEAVE_DUNGEON:
        return this.claire.dungeons.leaveInstance(playerId);

      case DataType.BATTLE_SET_ACTION:
        return this.claire.dungeons.setAction(playerId, options.action);

      case DataType.BATTLE_SET_ASSIST:
        return this.claire.dungeons.setAssist(playerId, options.assist);

      case DataType.BATTLE_SET_TARGET:
        return this.claire.dungeons.setTarget(playerId, options.targetId);

      case DataType.GET_PLAYER:
        return this.claire.players.get(playerId);

      case DataType.UPDATE_PLAYER:
        return await this.claire.socket.handlePlayerUpdate(socket, options.playerInfo);

      case DataType.ASSIGN_STAT_POINTS:
        return await this.claire.players.assignStatPoints(playerId, options.stats);

      default:
        break;
    }
  }
}
