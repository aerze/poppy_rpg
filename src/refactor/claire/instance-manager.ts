import { Socket } from "socket.io";
import { Claire } from "./claire";
import { BaseManager } from "./base-manager";
import { System } from "../gameplay/system";
import { Player } from "../gameplay/global/player";
import { TownSystem } from "../gameplay/town/town-system";
import { CharacterSystem } from "../gameplay/town/character-system";
import { CrossroadSystem } from "../gameplay/town/crossroad-system";
import { CombatSystem } from "../gameplay/combat/combat-system";

export class InstanceManager extends BaseManager {
  static Town: Instance["id"];
  static Forest: Instance["id"];

  instances = new Map<Instance["id"], Instance>();
  playerLocations = new Map<Player["id"], Instance["id"]>();

  async loadDefaultLocations() {
    InstanceManager.Town = (await this.create([TownSystem, CharacterSystem, CrossroadSystem])).id;
    InstanceManager.Forest = (await this.create([CombatSystem])).id;
  }

  async create(systems: (typeof System)[]) {
    const instance = new Instance(this.claire, systems, `🏙️`);
    this.instances.set(instance.id, instance);
    await instance.load();
    return instance;
  }

  findByType() {}

  delete() {}

  join(playerId: Player["id"], instanceId: Instance["id"]) {
    const socket = this.claire.players.sockets.get(playerId);
    if (!socket) return;

    const instance = this.instances.get(instanceId);
    if (!instance) return;

    instance.join(playerId, socket);
  }

  move(playerId: Player["id"], instanceId: Instance["id"]) {
    const socket = this.claire.players.sockets.get(playerId);
    if (!socket) {
      this.log(`move failed, missing socket`);
      return;
    }

    const currentInstanceId = this.playerLocations.get(playerId);
    if (!currentInstanceId) {
      this.log(`move failed, missing current instance id`);
      return; // TODO: potentially kick player
    }

    const currentInstance = this.instances.get(currentInstanceId);
    if (!currentInstance) {
      this.log(`move failed, missing current instance`);
      return;
    }

    const nextInstance = this.instances.get(instanceId);
    if (!nextInstance) {
      this.log(`move failed, missing next instance`);
      return;
    }

    socket.emit("RPG", { loading: true });
    currentInstance.leave(playerId, socket);

    nextInstance.join(playerId, socket);
    socket.emit("RPG", { loading: false });
  }

  disconnect(playerId: Player["id"]) {
    const instanceId = this.playerLocations.get(playerId);
    if (!instanceId) return;

    const instance = this.instances.get(instanceId);
    if (!instance) return;

    const socket = this.claire.players.sockets.get(playerId);
    if (!socket) return;

    instance.leave(playerId, socket);
  }
}

export class Instance {
  static TOWN = "TOWN";

  id: string;

  emoji: string;

  claire: Claire;

  players = new Set<Player["id"]>();

  sockets = new Map<Player["id"], Socket>();

  playerBindings = new Map<Player["id"], (...args: any[]) => void>();

  systems = new Map<System["name"], System>();

  constructor(claire: Claire, systems: (typeof System)[], emoji: string) {
    this.id = crypto.randomUUID();
    this.emoji = emoji;
    this.claire = claire;

    for (const System of systems) {
      const system = new System(claire, this);
      this.systems.set(system.name, system);
    }

    this.log(`✅`);
  }

  async load() {
    for (const system of this.systems.values()) {
      await system.load();
    }
  }

  delete() {
    for (const [name, system] of this.systems) {
      system.delete();
    }
  }

  join(playerId: Player["id"], socket: Socket) {
    this.claire.instances.playerLocations.set(playerId, this.id);
    this.players.add(playerId);
    this.sockets.set(playerId, socket);
    // loop through systems and load player
    for (const [name, system] of this.systems) {
      system.join(playerId, socket);
    }
    const boundFn = this.handleRequest.bind(this, socket, playerId);
    this.playerBindings.set(playerId, boundFn);

    // connect to instance router?
    socket.on("LOCAL", boundFn);

    this.claire.clients.updatePlayerGlobal(playerId, {
      instance: {
        id: this.id,
        isTown: this.id === InstanceManager.Town,
        systems: Array.from(this.systems.keys()),
      },
    });
  }

  leave(playerId: Player["id"], socket: Socket) {
    const boundFn = this.playerBindings.get(playerId);
    if (boundFn) socket.off("LOCAL", boundFn);

    for (const [name, system] of this.systems) {
      system.leave(playerId);
    }

    this.players.delete(playerId);
    this.sockets.delete(playerId);
    this.claire.instances.playerLocations.delete(playerId);
  }

  async handleRequest(
    socket: Socket,
    playerId: Player["id"],
    rawEvent: string,
    options: any,
    callback?: (v: any) => void
  ) {
    this.log(`${rawEvent} <-`, options);
    let result = null;

    if (!rawEvent.includes(":")) {
      let foundEvent = false;
      for (const [name, system] of this.systems) {
        const eventName = `_${rawEvent}`;

        const eventHandler = system[eventName as keyof typeof system];
        if (typeof eventHandler === "function") {
          if (result !== null) console.warn("Two event with matching name attempted to return a result to the client");
          result = await (system as any)[eventName](playerId, options);
          foundEvent = true;
        }
      }
      if (!foundEvent) {
        this.log(`${playerId} attempted to call non-existent event ${rawEvent}`);
      }
    }

    const [systemName, event] = rawEvent.split(":");
    const eventName = `_${event}`;
    const system = this.systems.get(systemName);
    if (system) {
      if (typeof (system as any)[eventName] !== "function") {
        this.log(`${playerId} attempted to call non-existent event ${rawEvent}`);
      }
      result = await (system as any)[eventName](playerId, options);
    } else {
      this.log(`${playerId} attempted to call non-existent event ${rawEvent}`);
    }

    if (callback) {
      this.log(`${rawEvent} ->`, JSON.stringify(result).length);
      callback(result);
    }
  }

  get title() {
    return `${this.emoji}  ${this.id.slice(0, 8)}`;
  }

  log(...args: any) {
    console.log(`CLAIRE: ${this.title}:`, ...args);
  }
}
