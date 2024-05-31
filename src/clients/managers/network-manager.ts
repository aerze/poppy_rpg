import { Socket, io } from "socket.io-client";
import { Mini } from "../mini";
import { SocketEvents } from "../../shared/events";
import { BaseManager } from "./base-manager";

export class NetworkManger extends BaseManager {
  socket: Socket;

  constructor(mini: Mini) {
    super(mini);
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
  }

  handleConnect = () => {
    const existingPlayerId = localStorage.getItem("playerId");
    if (existingPlayerId) {
      this.socket.once(SocketEvents.PlayerRegistered, ({ playerId }) => {
        localStorage.setItem("playerId", playerId);
        this.mini.scenes.open("game");
        // initializeGameScreen();
      });
      this.socket.emit(SocketEvents.PlayerConnected, { playerId: existingPlayerId });
    } else {
      this.mini.scenes.open("character");
    }
  };
}
