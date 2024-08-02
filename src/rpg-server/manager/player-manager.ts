import { Player } from "../data/player";
import { BaseManager } from "./base-manager";

export enum Location {
  TOWN, // main lobby
  DUNGEON,
}

export class PlayerManager extends BaseManager {
  map: Map<string, Player> = new Map();

  locations: Map<string, Location> = new Map();

  get(playerId: string) {
    return this.map.get(playerId);
  }

  set(playerId: string, player: Player) {
    this.locations.set(playerId, Location.TOWN);
    return this.map.set(playerId, player);
  }

  move(playerId: string, location: Location) {
    return this.locations.set(playerId, location);
  }

  remove(playerId: string) {
    return this.map.delete(playerId);
  }
}
