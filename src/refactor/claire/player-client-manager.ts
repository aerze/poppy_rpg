import { Socket } from "socket.io";
import { Player, PlayerFormData } from "../gameplay/global/player";
import { BaseManager } from "./base-manager";
import { InstanceManager } from "./instance-manager";
import { FilterStartsWith } from "../gameplay/types";

type PlayerClientManagerEvents = FilterStartsWith<keyof PlayerClientManager, "_">;

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
    this.handleConnect(socket, player);
  }

  signIn(socket: Socket, player: Player) {
    socket.emit("RPG:SIGN_IN", { player });
    this.handleConnect(socket, player);
  }

  handleConnect(socket: Socket, player: Player) {
    this.log(`${player.name} has connected.`);
    this.claire.players.list.set(player.id, player);
    this.claire.players.sockets.set(player.id, socket);
    this.claire.instances.join(player.id, InstanceManager.Town);
    socket.on("RPG", this.handleRequest.bind(this, player.id));
    socket.on("disconnect", this.handleDisconnect.bind(this, player.id));
  }

  handleDisconnect(playerId: Player["id"]) {
    const player = this.claire.players.list.get(playerId);

    this.claire.instances.disconnect(playerId);
    this.claire.players.list.delete(playerId);
    this.claire.players.sockets.delete(playerId);

    if (player) {
      this.log(`${player.name} has disconnected.`);
    }
  }

  async handleRequest(playerId: Player["id"], rawEvent: string, options: any, callback?: (v: any) => void) {
    this.log(`${rawEvent} <-`, options);
    let result = null;

    const eventName = `_${rawEvent}` as PlayerClientManagerEvents;

    if (typeof this[eventName] === "function") {
      result = await this[eventName](playerId, options);
      // this.debug(`\n>> `, result);
    }

    if (callback) {
      callback(result);
    }
  }

  _warpToTown(playerId: Player["id"], options?: any) {
    this.claire.instances.move(playerId, InstanceManager.Town);
  }

  _getSystems(playerId: Player["id"], options?: any) {
    const instanceId = this.claire.instances.playerLocations.get(playerId);
    if (!instanceId) return;

    const instance = this.claire.instances.instances.get(instanceId);
    if (!instance) return;

    const systems = Array.from(instance.systems.keys());

    return systems;
  }
}
