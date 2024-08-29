import { Player } from "../gameplay/global/player";
import { BaseManager } from "./base-manager";

export class PlayerManager extends BaseManager {
  list: Map<Player["id"], Player> = new Map();
}
