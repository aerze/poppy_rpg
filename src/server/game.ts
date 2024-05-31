import { MongoClient } from "mongodb";
import { SafeCounter } from "../shared/safe-counter";
import { Player, PlayerExistingData, PlayerUserData } from "./game/player";
import { MonsterMap } from "./game/monster-map";
import { PlayerMap } from "./game/player-map";
import { getRandomFromArray, getRandomInt, sleep } from "../shared/helpers";
import { Dungeon } from "./game/dungeon";
import { PlayerDB } from "./game/PlayerDB";
import { Server, Socket } from "socket.io";
import { getLevelRequirement } from "../shared/xp";

export class Game {
  static SocketEvents = {
    // Incoming
    DisplayConnected: "DisplayConnected",
    DisplayDisconnected: "DisplayDisconnected",
    PlayerConnected: "PlayerConnected",
    PlayerDisconnected: "PlayerDisconnected",
    AddMonsters: "AddMonsters",
    AddBoss: "AddBoss",
    PlayerAction: "PlayerAction",
    PlayerRevive: "PlayerRevive",
    DeleteMonsters: "DeleteMonsters",
    ReviveParty: "ReviveParty",

    // Outgoing
    Log: "Log",
    Snapshot: "Snapshot",
    Update: "Update",
    PlayerRegistered: "PlayerRegistered",

    // Built-In
    Connect: "connect",
    Disconnect: "disconnect",

    // Display Clients
    PlayerStanceChange: "PlayerStanceChange",
    PlayerRevived: "PlayerRevived",
    PlayerHealed: "PlayerHealed",
    PlayerAttacked: "PlayerAttacked",
    MonsterAttacked: "MonsterAttacked",
    PlayerDied: "PlayerDied",
    MonsterDied: "MonsterDied",
    Play: "Play",
    Pause: "Pause",
  };

  io?: Server;
  mongo: MongoClient;
  mongoConnected: Promise<boolean>;
  connectionCounter: SafeCounter;
  frameCounter: SafeCounter;
  players: PlayerMap;
  monsters: MonsterMap;
  dungeon: Dungeon;
  displays: Set<Socket>;
  active: boolean;
  nextLoop?: NodeJS.Timeout;

  /** @param {MongoClient} client */
  constructor(client: MongoClient) {
    /** @type {MongoClient} */
    this.mongo = client;
    this.mongoConnected = new Promise((resolve, reject) => {
      this.initMongo(resolve, reject);
    });
    this.connectionCounter = new SafeCounter();
    this.frameCounter = new SafeCounter();
    this.players = new PlayerMap();
    this.monsters = new MonsterMap();
    this.dungeon = new Dungeon(Dungeon.SLIME_DUNGEON);
    this.displays = new Set();
    this.active = true;
  }

  async initMongo(resolve: (value: any) => void, reject: () => void) {
    try {
      await this.mongo.connect();
      console.log(">> DB CONNECTED");
      resolve(null);
    } catch (e) {
      console.log(">> FAILED TO CONNECT DUMMY");
      console.error(e);
      reject();
    }

    this.main();
    const db = this.mongo.db("poppyrpg");
    PlayerDB.db = db.collection("players");
    // this.dungeonDB = db.collection('dungeons');
  }

  getSnapshot() {
    return {
      players: this.players.toArray(),
      monsters: this.monsters.toArray(),
      dungeon: this.dungeon.toJSON(),
    };
  }

  sendSnapshot(type = "unknown") {
    for (const socket of this.displays) {
      socket.emit(Game.SocketEvents.Snapshot, [type, this.getSnapshot()]);
    }
  }

  emitToDisplays(event: string, data: any) {
    for (const socket of this.displays) {
      socket.emit(event, data);
    }
  }

  /** @param {import('socket.io').Socket} socket */
  handleConnection = (socket: Socket) => {
    console.log(`>> New Connection c:${socket.id}`);
    socket.once(
      Game.SocketEvents.DisplayConnected,
      this.registerDisplayClient.bind(this, socket)
    );
    socket.once(
      Game.SocketEvents.PlayerConnected,
      this.registerPlayerClient.bind(this, socket)
    );
  };

  /** @param {import('socket.io').Socket} socket */
  registerDisplayClient(socket: Socket) {
    console.log(`>> c:${socket.id} -> Display`);
    this.displays.add(socket);
    socket.once(
      Game.SocketEvents.Disconnect,
      this.unregisterDisplayClient.bind(this, socket)
    );

    socket.emit(Game.SocketEvents.Snapshot, ["initial", this.getSnapshot()]);

    socket.on(Game.SocketEvents.AddMonsters, this.handleAddMonsters);
    socket.on(Game.SocketEvents.AddBoss, this.handleAddBoss);
    socket.on(Game.SocketEvents.DeleteMonsters, this.handleDeleteMonsters);
    socket.on(Game.SocketEvents.ReviveParty, this.handleReviveParty);
    socket.on(Game.SocketEvents.Play, this.handlePlay);
    socket.on(Game.SocketEvents.Pause, this.handlePause);
  }

  /** @param {import('socket.io').Socket} socket */
  unregisterDisplayClient(socket: Socket) {
    console.log(`>> c:${socket.id} Display Disconnected`);
    this.displays.delete(socket);
  }

  /** @param {import('socket.io').Socket} socket */
  async registerPlayerClient(
    socket: Socket,
    data: PlayerUserData | PlayerExistingData
  ) {
    console.log(`>> c:${socket.id} -> Player`);
    let player = null;

    if ("playerId" in data) {
      player = await PlayerDB.get(data.playerId, socket);
    } else {
      player = await PlayerDB.create(data, socket);
    }

    if (!player) {
      console.log(`Failed to register player.`);
      return;
    }

    this.players.set(player.id, player);
    socket.once(
      Game.SocketEvents.Disconnect,
      this.unregisterPlayerClient.bind(this, player, socket)
    );
    socket.on(
      Game.SocketEvents.PlayerAction,
      this.handlePlayerAction.bind(this, player)
    );
    socket.on(
      Game.SocketEvents.PlayerRevive,
      this.handlePlayerRevive.bind(this, player)
    );
    socket.emit(Game.SocketEvents.PlayerRegistered, { playerId: player.id });
    player.updatePlayerClient();
    // this.sendSnapshot();
  }

  /** @param {Player} player */
  unregisterPlayerClient(player: Player, socket: Socket) {
    console.log(`>> c:${socket.id} Player (${player.name}) Disconnected`);
    this.players.delete(player.id);
    // this.sendSnapshot();
  }

  handleAddMonsters = () => {
    console.log(">> Spawning new monsters");
    // this.monsters.createBlueSlime(this.connectionCounter.next(), getRandomInt(1, 3));
    this.monsters.createGreenSlime(
      this.connectionCounter.next(),
      getRandomInt(1, 3)
    );
    // this.monsters.createRedSlime(this.connectionCounter.next(), getRandomInt(1, 3));
    this.sendSnapshot();
  };

  handleAddBoss = () => {
    console.log(">> Spawning new boss");
    this.monsters.createBossSlime(
      this.connectionCounter.next(),
      getRandomInt(1, 3)
    );
    this.sendSnapshot();
  };

  handleDeleteMonsters = () => {
    this.monsters.clear();
    this.sendSnapshot();
  };

  handleReviveParty = () => {
    this.players.forEach((player) => {
      player.active = true;
      player.health = player.maxHealth;
      player.updatePlayerClient();
    });
    this.sendSnapshot();
  };

  handlePlay = () => {
    if (this.active) return;
    console.log("resuming");
    this.active = true;
    this.main();
  };

  handlePause = () => {
    console.log("pausing");
    clearTimeout(this.nextLoop);
    this.active = false;
  };

  /** @param {Player} player */
  handlePlayerAction = (player: Player, data: { action: string }) => {
    console.log(`>> ${player.name} -> ${data.action}`);
    this.sendLog(`${player.name} gets ready to ${data.action}`);
    player.action = data.action;
    player.updatePlayerClient();
    this.emitToDisplays(Game.SocketEvents.PlayerStanceChange, [
      player.id,
      player.action,
    ]);
  };

  /** @param {Player} player */
  handlePlayerRevive = (player: Player) => {
    console.log(`>> ${player.name} revived`);
    player.active = true;
    player.health = player.maxHealth;
    player.updatePlayerClient();
    this.emitToDisplays(Game.SocketEvents.PlayerRevived, player);
  };

  sendLog(message: string) {
    this.io?.emit(Game.SocketEvents.Log, message);
  }

  async main() {
    if (!this.active) {
      return console.log("paused");
    }
    await this.loop();
    if (!this.active) {
      return console.log("paused");
    }
    this.nextLoop = setTimeout(this.main.bind(this), 3000);
  }

  async loop() {
    this.frameCounter.next();
    console.log(`>> loop (${this.frameCounter.count})`);

    const players = this.players.toArray();
    const activePlayers = players.filter(PlayerMap.Filters.Active);

    // promote players
    for (const player of players) {
      const levelRequirement = getLevelRequirement(player.level);

      if (player.xp >= levelRequirement) {
        player.level += 1;
        player.xp = levelRequirement - player.xp;
      }

      console.time("playersave");
      await PlayerDB.save(player);
      console.timeEnd("playersave");
      player.updatePlayerClient();
    }

    // dungeon iteration
    if (!this.monsters.size) {
      this.dungeon.currentRoom++;

      if (this.dungeon.currentRoom > this.dungeon.finalRoom) {
        this.dungeon = new Dungeon(Dungeon.SLIME_DUNGEON);
      }

      const encounter = this.dungeon.generateEncounter(
        this.dungeon.currentRoom
      );
      for (const monsterData of encounter) {
        this.monsters.create(this.connectionCounter.next(), monsterData);
      }
    }

    this.sendSnapshot();

    // players check
    if (!activePlayers.length) {
      this.sendLog(`The heros have gone missing.`);
      return;
    }

    // player heals
    const healers = activePlayers.filter(PlayerMap.Filters.Heal);
    const damaged = activePlayers.filter(PlayerMap.Filters.Damaged);
    if (damaged.length) {
      for (const healer of healers) {
        const target = getRandomFromArray(damaged);
        if (!target) continue;

        this.emitToDisplays(Game.SocketEvents.PlayerHealed, { healer, target });
        await sleep(500);

        const heal = healer.heal;
        target.health = Math.min(target.health + heal, target.maxHealth);
        target.updatePlayerClient();
        this.sendLog(`${healer.name} heals ${target.name} for ${heal}hp`);
        this.emitToDisplays(Game.SocketEvents.PlayerHealed, {
          healer,
          target,
          heal,
        });
        await sleep();
      }
    }

    // player attacks
    const attackers = activePlayers.filter(PlayerMap.Filters.Attack);
    for (const attacker of attackers) {
      const target = this.monsters.getRandom();
      if (!target) continue;

      this.emitToDisplays(Game.SocketEvents.PlayerAttacked, {
        attacker,
        target,
      });
      await sleep(500);

      const damage = attacker.attack;
      target.health = Math.max(target.health - damage, 0);
      this.sendLog(`${attacker.name} attacks ${target.name} for ${damage}hp`);
      this.emitToDisplays(Game.SocketEvents.PlayerAttacked, {
        attacker,
        target,
        damage,
      });
      await sleep();

      if (target.health <= 0) {
        this.players.giveXP(target.xp);
        this.monsters.delete(target.id);
        this.emitToDisplays(Game.SocketEvents.MonsterDied, target.id);
        await sleep();
      }
    }

    // monster actions
    const initialDefenders = activePlayers.filter(PlayerMap.Filters.Defend);
    const defenders = !initialDefenders.length
      ? activePlayers
      : [...activePlayers, ...initialDefenders, ...initialDefenders];

    for (const [id, monster] of this.monsters) {
      if (Math.random() < 0.4) continue;

      const target = getRandomFromArray(defenders);
      if (!target) continue;

      this.emitToDisplays(Game.SocketEvents.MonsterAttacked, {
        monster,
        target,
      });
      await sleep(500);

      const isDefending = target.action === "defend";
      const damage = isDefending
        ? Math.max(0, monster.attack - target.defense)
        : monster.attack;
      target.health = Math.max(target.health - damage, 0);
      target.updatePlayerClient();
      this.sendLog(`${monster.name} attacks ${target.name} for ${damage}hp`);
      this.emitToDisplays(Game.SocketEvents.MonsterAttacked, {
        monster,
        target,
        damage,
      });
      await sleep();

      if (target.health <= 0) {
        target.active = false;
        target.updatePlayerClient();
        this.sendLog(`${target.name} is dead.`);
        this.emitToDisplays(Game.SocketEvents.PlayerDied, target.id);
        await sleep();
      }
    }
  }
}
