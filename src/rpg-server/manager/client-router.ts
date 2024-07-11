import { Socket } from "socket.io";
import { BaseManager } from "./base-manager";
import { Player } from "../data/player";

export enum DataType {
  DUNGEON_LIST,
  DUNGEON_INFO,
  JOIN_DUNGEON,
  BATTLE_SET_ACTION,
}

export class ClientRouter extends BaseManager {
  handleRequest(socket: Socket, player: Player, type: DataType, options: any, callback: (v: any) => void) {
    console.log("Claire:", `/${DataType[type]}`, options);
    const result = this.getData(type, options, socket, player);
    console.log(`\t /${DataType[type]}`, result);
    if (callback) {
      callback(result);
    }
  }

  getData(type: DataType, options: any, socket: Socket, player: Player) {
    switch (type) {
      case DataType.DUNGEON_LIST:
        return this.claire.dungeons.getBasicList();

      case DataType.DUNGEON_INFO:
        return this.claire.dungeons.getInfo(options.dungeonId);

      case DataType.JOIN_DUNGEON:
        return this.claire.dungeons.join(options.dungeonId, socket, player);

      case DataType.BATTLE_SET_ACTION:
        return this.claire.dungeons.liveDungeon.battle.setAction(player.id, options.action);

      default:
        break;
    }
  }
}
