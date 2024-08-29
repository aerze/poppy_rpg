import { Player, PlayerId } from "../gameplay/global/player";
import { System } from "../gameplay/system";
import { BaseManager } from "./base-manager";
import { Claire } from "./claire";

export class InstanceManager extends BaseManager {
  instances = new Map<number, Instance>();

  create() {}

  findByType() {}

  delete() {}

  join(playerId: Player["id"], socket: Socket, key: string) {
    // getORCreateINstance
    // join instance
  }

  leave(playerId: Player["id"], key: string) {}

  leaveAll(playerId: Player["id"]) {}
}

export class Instance {
  static TOWN = "TOWN";

  claire: Claire;

  players = new Map<PlayerId, Player>();

  systems = new Set<System>();

  constructor(claire: Claire, systems: (typeof System)[]) {
    this.claire = claire;

    for (const System of systems) {
      const system = new System(claire);
      system.load();
      this.systems.add(system);
    }
  }

  join() {}

  leave() {}
}
