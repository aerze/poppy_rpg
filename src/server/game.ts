import { MongoClient } from "mongodb";
import { SafeCounter } from "../shared/safe-counter";
import { Player, PlayerExistingData, PlayerFormData, PlayerUserData } from "./game/player";
import { MonsterMap } from "./game/monster-map";
import { PlayerMap } from "./game/player-map";
import { getRandomFromArray, getRandomInt, sleep } from "../shared/helpers";
import { Dungeon } from "./game/dungeon";
import { PlayerDB } from "./game/PlayerDB";
import { Server, Socket } from "socket.io";
import { getLevelRequirement, scaleStat } from "../shared/xp";
import { BadgeType } from "./game/badge";
import { SocketEvents } from "../shared/events";
import sanitize from "mongo-sanitize";

const SHORT_WAIT = 300;
const LONG_WAIT = 700;

export class Game {
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
    this.dungeon = Dungeon.createRandomDungeon();
    this.displays = new Set();
    this.active = true;
  }

  async initMongo(resolve: (value: any) => void, reject: () => void) {
    try {
      await this.mongo.connect();
      console.log(">> DB CONNECTED");
      resolve(null);
    } catch (e) {
      console.log(">> FAILED TO CONNECT IDIOT");
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
      socket.emit(SocketEvents.Snapshot, [type, this.getSnapshot()]);
    }
  }

  emitToDisplays(event: string, data?: any) {
    for (const socket of this.displays) {
      socket.emit(event, data);
    }
  }

  /** @param {import('socket.io').Socket} socket */
  handleConnection = (socket: Socket) => {
    console.log(`>> New Connection c:${socket.id}`);
    socket.once(SocketEvents.DisplayConnected, this.registerDisplayClient.bind(this, socket));
    socket.once(SocketEvents.PlayerConnected, this.registerPlayerClient.bind(this, socket));
    socket.on(SocketEvents.PlayerUpdate, this.handlePlayerUpdate.bind(this, socket));
  };

  /** @param {import('socket.io').Socket} socket */
  registerDisplayClient(socket: Socket) {
    console.log(`>> c:${socket.id} -> Display`);
    this.displays.add(socket);
    socket.once(SocketEvents.Disconnect, this.unregisterDisplayClient.bind(this, socket));

    socket.emit(SocketEvents.Snapshot, ["initial", this.getSnapshot()]);

    socket.on(SocketEvents.AddMonsters, this.handleAddMonsters);
    socket.on(SocketEvents.AddBoss, this.handleAddBoss);
    socket.on(SocketEvents.DeleteMonsters, this.handleDeleteMonsters);
    socket.on(SocketEvents.ReviveParty, this.handleReviveParty);

    socket.on(SocketEvents.Play, this.handlePlay);
    socket.on(SocketEvents.Pause, this.handlePause);
  }

  /** @param {import('socket.io').Socket} socket */
  unregisterDisplayClient(socket: Socket) {
    console.log(`>> c:${socket.id} Display Disconnected`);
    this.displays.delete(socket);
  }

  async handlePlayerUpdate(socket: Socket, data: PlayerFormData) {
    const cleanPlayerId = sanitize(data.playerId);
    const player = this.players.get(cleanPlayerId);
    if (!player) return;
    player.name = sanitize(data.name);
    player.color = sanitize(data.color);
    player.job = sanitize(data.job);
    player.preset = sanitize(data.preset);
    await PlayerDB.save(player);
    socket.emit(SocketEvents.PlayerUpdated, { playerId: player.id });
    player.updatePlayerClient();
  }

  /** @param {import('socket.io').Socket} socket */
  async registerPlayerClient(socket: Socket, data: PlayerUserData | PlayerExistingData) {
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
    socket.once(SocketEvents.Disconnect, this.unregisterPlayerClient.bind(this, player, socket));
    socket.on(SocketEvents.PlayerAction, this.handlePlayerAction.bind(this, player));
    socket.on(SocketEvents.PlayerRevive, this.handlePlayerRevive.bind(this, player));
    socket.emit(SocketEvents.PlayerRegistered, { playerId: player.id });
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
    this.monsters.createGreenSlime(this.connectionCounter.next(), getRandomInt(1, 3));
    // this.monsters.createRedSlime(this.connectionCounter.next(), getRandomInt(1, 3));
    this.sendSnapshot();
  };

  handleAddBoss = () => {
    console.log(">> Spawning new boss");
    this.monsters.createBossSlime(this.connectionCounter.next(), getRandomInt(1, 3));
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

    this.awardBadge(BadgeType.InsideJoke, this.players.toArray());
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
    player.nextAction = data.action;
    // player.action = data.action;
    player.updatePlayerClient();
    this.emitToDisplays(SocketEvents.PlayerStanceChange, [player.id, player.action]);
  };

  /** @param {Player} player */
  handlePlayerRevive = (player: Player) => {
    console.log(`>> ${player.name} revived`);
    player.active = true;
    player.health = player.maxHealth;
    player.updatePlayerClient();
    this.emitToDisplays(SocketEvents.PlayerRevived, player);
  };

  sendLog(message: string) {
    this.io?.emit(SocketEvents.Log, message);
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

  awardBadge(badgeType: BadgeType, players: Player[]) {
    for (const player of players) {
      if (player.addBadge(badgeType)) {
        PlayerDB.save(player);
      }
    }
  }

  async determinePlayerActions(players: Player[]) {
    for (const player of players) {
      if (player.nextAction) {
        player.action = player.nextAction;
        player.nextAction = null;
        player.updatePlayerClient();
      }
    }
  }

  async promotePlayers(players: Player[]) {
    // promote players
    for (const player of players) {
      const levelRequirement = getLevelRequirement(player.level);

      if (player.xp >= levelRequirement) {
        this.awardBadge(BadgeType.FirstLevelUp, [player]);
        player.level += 1;
        player.xp = player.xp - levelRequirement;
      }

      PlayerDB.save(player);
      player.updatePlayerClient();
    }
  }

  skipCurrentDungeon = false;

  async skipDungeon() {
    this.skipCurrentDungeon = true;
  }

  async stepDungeon(players: Player[]) {
    if (this.skipCurrentDungeon) {
      this.skipCurrentDungeon = false;
      this.dungeon = Dungeon.createRandomDungeon();
      this.dungeon.currentRoom++;

      const encounter = this.dungeon.generateEncounter(this.dungeon.currentRoom);
      for (const monsterData of encounter) {
        this.monsters.create(this.connectionCounter.next(), monsterData);
      }
      return;
    }

    // dungeon iteration
    if (!this.monsters.size) {
      this.dungeon.currentRoom++;

      if (this.dungeon.currentRoom > this.dungeon.finalRoom) {
        this.awardBadge(this.dungeon.completionBadge, players);
        this.dungeon = Dungeon.createRandomDungeon();
        this.dungeon.currentRoom++;
      }

      const encounter = this.dungeon.generateEncounter(this.dungeon.currentRoom);
      for (const monsterData of encounter) {
        this.monsters.create(this.connectionCounter.next(), monsterData);
      }
    }
  }

  async playerHeals(activePlayers: Player[]) {
    // player heals
    const healers = activePlayers.filter(PlayerMap.Filters.Heal);
    const damaged = activePlayers.filter(PlayerMap.Filters.Damaged);

    if (damaged.length) {
      for (const healer of healers) {
        const target = getRandomFromArray(damaged);
        if (!target) continue;

        this.emitToDisplays(SocketEvents.ReadyPlayerHeal, { healer, target });
        await sleep(SHORT_WAIT);

        const heal = scaleStat(healer.level, healer.heal);

        target.health = Math.min(target.health + heal, target.maxHealth);
        target.updatePlayerClient();
        this.sendLog(`${healer.name} heals ${target.name} for ${heal}hp`);
        this.emitToDisplays(SocketEvents.PlayerHealed, { healer, target, heal });
        await sleep(LONG_WAIT);
      }
    }
  }

  async playerAttacks(activePlayers: Player[]) {
    // player attacks
    const attackers = activePlayers.filter(PlayerMap.Filters.Attack);
    for (const attacker of attackers) {
      const target = this.monsters.getRandom();
      if (!target) continue;

      this.emitToDisplays(SocketEvents.ReadyPlayerAttack, { attacker, target });
      await sleep(SHORT_WAIT);

      const damage = scaleStat(attacker.level, attacker.attack);

      target.health = Math.max(target.health - damage, 0);
      this.sendLog(`${attacker.name} attacks ${target.name} for ${damage}hp`);
      this.emitToDisplays(SocketEvents.PlayerAttacked, { attacker, target, damage });
      await sleep(LONG_WAIT);

      if (target.health <= 0) {
        this.players.giveXP(target.xp);
        this.monsters.delete(target.id);
        this.emitToDisplays(SocketEvents.MonsterDied, target.id);
        await sleep(LONG_WAIT);
      }
    }
  }

  async enemyAttacks(activePlayers: Player[]) {
    // monster actions
    const initialDefenders = activePlayers.filter(PlayerMap.Filters.Defend);
    const defenders = !initialDefenders.length
      ? activePlayers
      : [...activePlayers, ...initialDefenders, ...initialDefenders];

    for (const [id, monster] of this.monsters) {
      if (Math.random() < 0.4) continue;

      const target = getRandomFromArray(defenders);
      if (!target) continue;

      this.emitToDisplays(SocketEvents.ReadyEnemyAttack, { monster, target });
      await sleep(SHORT_WAIT);

      const isDefending = target.action === "defend";

      const damage = isDefending
        ? Math.max(0, monster.attack - scaleStat(target.level, target.defense))
        : monster.attack;

      target.health = Math.max(target.health - damage, 0);
      target.updatePlayerClient();
      this.sendLog(`${monster.name} attacks ${target.name} for ${damage}hp`);
      this.emitToDisplays(SocketEvents.MonsterAttacked, { monster, target, damage });

      await sleep(LONG_WAIT);

      if (target.health <= 0) {
        target.active = false;
        target.updatePlayerClient();
        this.awardBadge(BadgeType.FirstDeath, [target]);
        this.sendLog(`${target.name} is dead.`);
        this.emitToDisplays(SocketEvents.PlayerDied, target.id);
        await sleep(LONG_WAIT);
      }
    }
  }

  async loop() {
    this.emitToDisplays(SocketEvents.RoundStart);
    this.frameCounter.next();
    console.log(`>> loop (${this.frameCounter.count})`);

    const players = this.players.toArray();
    const activePlayers = players.filter(PlayerMap.Filters.Active);

    // prep phase
    await this.determinePlayerActions(players);
    await this.stepDungeon(players);
    this.sendSnapshot();

    // players check
    if (!activePlayers.length) return;

    // damage phase
    this.emitToDisplays(SocketEvents.PlayerTurn);
    await this.playerHeals(activePlayers);
    await this.playerAttacks(activePlayers);

    this.emitToDisplays(SocketEvents.EnemyTurn);
    await this.enemyAttacks(activePlayers);

    // results phase
    this.emitToDisplays(SocketEvents.RoundEnd);
    await this.promotePlayers(players);
  }
}
