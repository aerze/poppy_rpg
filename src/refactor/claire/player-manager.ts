import { Socket } from "socket.io";
import { Player } from "../gameplay/global/player";
import { BaseManager } from "./base-manager";

export class PlayerManager extends BaseManager {
  list: Map<Player["id"], Player> = new Map();
  sockets: Map<Player["id"], Socket> = new Map();
}
