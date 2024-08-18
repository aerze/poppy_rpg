import { io, Socket } from "socket.io-client";
import { BaseManager } from "./base-manager";
import { Rae } from "./rae";
import { SocketEvents } from "../../shared/events";

export class SocketManager extends BaseManager {
  socket: Socket;

  constructor(rae: Rae) {
    super(rae);
    this.socket = null!;
    //   this.socket = io("wss://poppyrpg.mythril.studio")
  }

  init() {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    } else {
      this.socket = io();
    }

    const socket = this.socket;
    socket.on(SocketEvents.Connect, this.handleConnect);
    socket.on(SocketEvents.Disconnect, this.handleDisconnect);
  }

  handleConnect = () => {
    this.socket.on("RPG:DUNGEON", this.rae.battle.update);
  };

  handleDisconnect = () => {
    this.socket.off("RPG:DUNGEON", this.rae.battle.update);
  };
}
