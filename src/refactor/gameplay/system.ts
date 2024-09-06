import { Socket } from "socket.io";
import { Claire } from "../claire/claire";
import { Instance } from "../claire/instance-manager";
import { Player } from "./global/player";

export class System {
  static Join = Symbol("join");

  id: string;
  claire: Claire;
  instance: Instance;
  name: string;

  constructor(claire: Claire, instance: Instance) {
    this.id = crypto.randomUUID();
    this.claire = claire;
    this.instance = instance;
    this.log("✅");
    this.name = "missing_name";
  }

  delete() {
    this.log("deleted");
  }

  join(playerId: Player["id"], socket: Socket) {
    this.log(`player ${playerId} joined`);
  }

  leave(playerId: Player["id"]) {
    this.log(`player ${playerId} left`);
  }

  event(socket: Socket, playerId: Player["id"], options: any) {}

  get title() {
    return this?.constructor?.name ?? "🐸: ";
  }

  log(...args: any) {
    console.log(`CLAIRE: ${this.title}:`, ...args);
  }

  isLocalPlayer(playerId: Player["id"]) {
    return this.instance.sockets.has(playerId);
  }

  updatePlayer(playerId: Player["id"], data: any) {
    this.log(`update()`, JSON.stringify(data).length);
    const socket = this.instance.sockets.get(playerId);
    if (socket) {
      socket.emit("LOCAL", this.name, data);
    }
  }

  updatePlayers(data: any) {
    this.log(`updateAll()`, JSON.stringify(data).length);
    for (const [playerId, socket] of this.instance.sockets) {
      socket.emit("LOCAL", this.name, data);
    }
  }

  updatePlayerGlobal(playerId: Player["id"], data: any) {
    this.log(`globalUpdate()`, JSON.stringify(data).length);
    const socket = this.instance.sockets.get(playerId);
    if (socket) {
      socket.emit("RPG", data);
    }
  }
}
