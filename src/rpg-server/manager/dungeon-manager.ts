import { Socket } from "socket.io";
import { BaseManager } from "./base-manager";
import { Action } from "../types";
import { DungeonType, DungeonInstanceType } from "../data/types/dungeon-types";

import { Player } from "../data/player";
import { DungeonTypes } from "../data/dungeon-data";
import { DungeonInstance } from "../data/dungeon-instance";

export class DungeonManager extends BaseManager {
  dungeonCounter = 1;

  playerToInstanceId: Map<string, number> = new Map();

  instances: Map<number, DungeonInstance> = new Map();

  singletons: Map<DungeonType["id"], DungeonInstance> = new Map();

  get dungeonTypes() {
    return DungeonTypes;
  }

  getOrCreateSingleton(dungeonType: DungeonType) {
    const dungeon = this.singletons.get(dungeonType.id);
    if (dungeon) return dungeon;

    this.log(`creating ${dungeonType.id} singleton dungeon`);
    const newDungeon = this.createInstance(dungeonType);
    this.singletons.set(dungeonType.id, newDungeon);
    return newDungeon;
  }

  getInstance(id: number) {
    return this.instances.get(id);
  }

  getInstances() {
    return Array.from(this.instances.values());
  }

  createInstance(dungeonType: DungeonType) {
    this.log(`Creating new ${dungeonType.name} dungeon.`);
    const instance = new DungeonInstance(this.claire, this.dungeonCounter++, dungeonType);
    this.instances.set(instance.id, instance);
    return instance;
  }

  joinInstance(instanceId: string, socket: Socket, player: Player) {
    const dungeonType = DungeonTypes.find((d) => d.id === instanceId);
    if (!dungeonType) {
      this.log(`failed to join instance with id ${instanceId}`);
      // TODO: respond to socket with invalid data error;
      return false;
    }

    switch (dungeonType.type) {
      case DungeonInstanceType.Live: {
        // find the singleton
        const dungeon = this.getOrCreateSingleton(dungeonType);

        dungeon.init();
        dungeon.join(socket, player);
        dungeon.start();
        this.log(`player ${player.id} joined ${dungeon.id}`);
        this.playerToInstanceId.set(player.id, dungeon.id);
        return true;
      }

      case DungeonInstanceType.Training: {
        // instantiate a new dungeon for this player/party
        const dungeon = this.createInstance(dungeonType);

        dungeon.init();
        dungeon.join(socket, player);
        dungeon.start();
        this.log(`player ${player.id} joined ${dungeon.id}`);
        this.playerToInstanceId.set(player.id, dungeon.id);
        return true;
      }
    }
  }

  setAction(playerId: string, action: Action) {
    const dungeonId = this.playerToInstanceId.get(playerId);
    if (!dungeonId) {
      this.log(`setAction() failed to find dungeon for ${playerId}`);
      return false;
    }

    const dungeon = this.instances.get(dungeonId);
    if (!dungeon) {
      this.log(`setAction() failed to find dungeon with id ${dungeonId}`);
      return false;
    }

    return dungeon.setAction(playerId, action);
  }

  setAssist(playerId: string, assist: boolean) {
    const dungeonId = this.playerToInstanceId.get(playerId);
    if (!dungeonId) {
      this.log(`setAssist() failed to find dungeon for ${playerId}`);
      return false;
    }

    const dungeon = this.instances.get(dungeonId);
    if (!dungeon) {
      this.log(`setAssist() failed to find dungeon with id ${dungeonId}`);
      return false;
    }

    return dungeon.setAssist(playerId, assist);
  }

  setTarget(playerId: string, targetId: string) {
    const dungeonId = this.playerToInstanceId.get(playerId);
    if (!dungeonId) {
      this.log(`setAssist() failed to find dungeon for ${playerId}`);
      return false;
    }

    const dungeon = this.instances.get(dungeonId);
    if (!dungeon) {
      this.log(`setAssist() failed to find dungeon with id ${dungeonId}`);
      return false;
    }

    return dungeon.setTarget(playerId, targetId);
  }
}
