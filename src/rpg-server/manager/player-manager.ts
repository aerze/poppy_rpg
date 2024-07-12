import { Player } from "../data/player";
import { BaseManager } from "./base-manager";

export class PlayerManager extends BaseManager {
  map: Map<string, Player> = new Map();

  get(id: string) {
    return this.map.get(id);
  }

  set(id: string, player: Player) {
    return this.map.set(id, player);
  }
}
