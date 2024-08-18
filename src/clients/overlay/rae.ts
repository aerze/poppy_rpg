import { BattleManager } from "./battle-manager";
import { SocketManager } from "./socket-manager";

export class Rae {
  socket: SocketManager;
  battle: BattleManager;

  constructor() {
    console.log("Rae: INITIALIZING 👩‍❤️‍💋‍👩");
    this.socket = new SocketManager(this);
    this.battle = new BattleManager(this);
  }
}
