import { Socket } from "socket.io";
import { Player, PlayerFormData } from "../gameplay/global/player";
import { BaseManager } from "./base-manager";
import { Instance } from "./instance-manager";

export enum PlayerClientRequestType {
  GET_PLAYER,
}

export class PlayerClientManager extends BaseManager {
  signUp(socket: Socket) {
    socket.emit("RPG:SIGN_UP", { name: socket.data.session.username });
    socket.once("RPG:HANDLE_SIGN_UP", this.handleSignUp.bind(this, socket));
  }

  async handleSignUp(socket: Socket, formData: PlayerFormData) {
    const player = await this.claire.db.players.create(socket, formData);

    if (!player) {
      this.error("Failed to create player with", formData);
      return null;
    }

    socket.emit("RPG:COMPLETED_SIGN_UP", { player });
    this.connect(socket, player);
  }

  signIn(socket: Socket, player: Player) {
    socket.emit("RPG:SIGN_IN", { player });
    this.connect(socket, player);
  }

  connect(socket: Socket, player: Player) {
    this.log(`${player.name} has connected.`);
    this.claire.players.list.set(player.id, player);
    this.claire.instances.join(player.id, Instance.TOWN);
    socket.on("RPG:REQUEST", this.handleRequest.bind(this, socket, player.id));
    socket.on("disconnect", this.disconnect.bind(this, player.id));
  }

  disconnect(playerId: Player["id"]) {
    const player = this.claire.players.list.get(playerId);
    if (player) {
      this.claire.players.list.delete(playerId);
      this.claire.instances.leaveAll(playerId);
      this.log(`${player.name} has disconnected.`);
    }
  }

  async handleRequest(
    socket: Socket,
    playerId: Player["id"],
    type: PlayerClientRequestType,
    options: any,
    callback?: (v: any) => void
  ) {
    const player = this.claire.players.list.get(playerId);
    if (!player) return;

    this.log(`/${PlayerClientRequestType[type]}`, options);
    const result = await this.router(type, options, socket, player);
    // this.debug(`\n>> `, result);

    if (callback) {
      callback(result);
    }
  }

  router(type: PlayerClientRequestType, options: any, socket: Socket, player: Player) {
    switch (type) {
      case PlayerClientRequestType.GET_PLAYER:
        return this.claire.players.list.get(options.playerId);
    }
  }
}
