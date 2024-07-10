import { Socket } from "socket.io";
import { BaseManager } from "./base-manager";
import { Player } from "../player";

export enum DataType {
  DUNGEON_LIST,
  DUNGEON_INFO,
  JOIN_DUNGEON,
}

export class ClientRouter extends BaseManager {
  handleGetRequest(socket: Socket, player: Player, type: DataType, options: any, callback: (v: any) => void) {
    console.log(">> GET", type, options);
    callback(this.getData(type, options, socket, player));
  }

  getData(type: DataType, options: any, socket: Socket, player: Player) {
    switch (type) {
      case DataType.DUNGEON_LIST:
        return this.claire.dungeons.getBasicList();

      case DataType.DUNGEON_INFO:
        return this.claire.dungeons.getInfo(options.dungeonId);

      case DataType.JOIN_DUNGEON:
        return this.claire.dungeons.join(options.dungeonId, socket, player);

      default:
        break;
    }
  }
}
