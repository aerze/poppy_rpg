import { PlayerUserData } from "../../server/game/player";
import { Mini } from "../mini";
import { BaseManager } from "./base-manager";

export class PlayerManager extends BaseManager {
  localPlayerId?: string;
  localPlayer?: Required<PlayerUserData>;

  constructor(mini: Mini) {
    super(mini);
  }

  setPlayerId(playerId: string) {
    localStorage.setItem("playerId", playerId);
  }

  set playerId(playerId: string) {
    localStorage.setItem("playerId", playerId);
  }

  get playerId() {
    return localStorage.getItem("playerId") ?? "";
  }
}
