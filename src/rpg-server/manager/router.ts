import { Socket } from "socket.io";
import { BaseManager } from "./base-manager";
import { Player } from "../data/player";

export enum DataType {
  DUNGEON_LIST,
  DUNGEON_INSTANCE_LIST,
  DUNGEON_INSTANCE_INFO,
  JOIN_DUNGEON,
  BATTLE_SET_ACTION,
  BATTLE_SET_ASSIST,
  BATTLE_SET_TARGET,
  UPDATE_PLAYER,
}

export class Router extends BaseManager {
  async handleRequest(socket: Socket, playerId: string, type: DataType, options: any, callback: (v: any) => void) {
    this.log(`/${DataType[type]}`, options);
    const player = this.claire.players.get(playerId)!;
    const result = await this.getData(type, options, socket, player);
    this.debug(`\n>> `, result);

    if (callback) {
      callback(result);
    }
  }

  async getData(type: DataType, options: any, socket: Socket, player: Player) {
    switch (type) {
      case DataType.DUNGEON_LIST:
        return this.claire.dungeons.dungeonTypes;

      case DataType.DUNGEON_INSTANCE_LIST:
        return this.claire.dungeons.getInstances();

      case DataType.DUNGEON_INSTANCE_INFO:
        return this.claire.dungeons.getInstance(options.id);

      case DataType.JOIN_DUNGEON:
        return this.claire.dungeons.joinInstance(options.dungeonId, socket, player);

      case DataType.BATTLE_SET_ACTION:
        return this.claire.dungeons.setAction(player.id, options.action);

      case DataType.BATTLE_SET_ASSIST:
        return this.claire.dungeons.setAssist(player.id, options.assist);

      case DataType.BATTLE_SET_TARGET:
        return this.claire.dungeons.setTarget(player.id, options.targetId);

      case DataType.UPDATE_PLAYER:
        return await this.claire.socket.handlePlayerUpdate(socket, options.playerInfo);

      default:
        break;
    }
  }
}
