const SafeCounter = require("./scripts/safe-counter");
const Monster = require("./scripts/monster");
const Player = require("./scripts/player");
const PlayerMap = require("./scripts/player-map");
const MonsterMap = require("./scripts/monster-map");
const { sleep, getRandomInt } = require('./scripts/helpers');
const { getLevelRequirement } = require("./scripts/xp");

class Game {
    static SocketEvents = {
        // Incoming
        DisplayConnected: 'DisplayConnected',
        DisplayDisconnected: 'DisplayDisconnected',
        PlayerConnected: 'PlayerConnected',
        PlayerDisconnected: 'PlayerDisconnected',
        AddMonsters: 'AddMonsters',
        AddBoss: 'AddBoss',
        PlayerAction: 'PlayerAction',
        PlayerRevive: 'PlayerRevive',
        DeleteMonsters: 'DeleteMonsters',
        ReviveParty: 'ReviveParty',
    
        // Outgoing
        Log: "Log",
        Snapshot: "Snapshot",
        Update: "Update",
        PlayerRegistered: "PlayerRegistered",
        
        // Built-In
        Connect: 'connect',
        Disconnect: 'disconnect',
        
        // Display Clients
        PlayerStanceChange: "PlayerStanceChange",
        PlayerRevived: "PlayerRevived",
        PlayerHealed: "PlayerHealed",
        PlayerAttacked: "PlayerAttacked",
        MonsterAttacked: "MonsterAttacked",
        PlayerDied: "PlayerDied",
        MonsterDied: "MonsterDied",
    }

    /** @param {import('socket.io').Server} io */
    constructor(io) {
        this.io = io;
        this.connectionCounter = new SafeCounter();
        this.frameCounter = new SafeCounter();
        this.players = new PlayerMap();
        this.monsters = new MonsterMap();
        this.displays = new Set();

        this.framesWithoutMonsters = new SafeCounter();
    }

    getSnapshot() {
        return {
            players: this.players.toArray(),
            monsters: this.monsters.toArray(),
        }
    }

    sendSnapshot(type = 'unknown') {
        for (const socket of this.displays) {
            socket.emit(Game.SocketEvents.Snapshot, [type, this.getSnapshot()]);
        }
    }

    emitToDisplays(event, data) {
        for (const socket of this.displays) {
            socket.emit(event, data);
        }
    }

    /** @param {import('socket.io').Socket} socket */
    handleConnection = (socket) => {
        console.log(`>> New Connection c:${socket.id}`);
        socket.once(Game.SocketEvents.DisplayConnected, this.registerDisplayClient.bind(this, socket));
        socket.once(Game.SocketEvents.PlayerConnected, this.registerPlayerClient.bind(this, socket));
    }

    /** @param {import('socket.io').Socket} socket */
    registerDisplayClient(socket) {
        console.log(`>> c:${socket.id} -> Display`);
        this.displays.add(socket);
        socket.once(Game.SocketEvents.Disconnect, this.unregisterDisplayClient.bind(this, socket));
        
        socket.emit(Game.SocketEvents.Snapshot, ['initial', this.getSnapshot()]);

        socket.on(Game.SocketEvents.AddMonsters, this.handleAddMonsters);
        socket.on(Game.SocketEvents.AddBoss, this.handleAddBoss);
        socket.on(Game.SocketEvents.DeleteMonsters, this.handleDeleteMonsters);
        socket.on(Game.SocketEvents.ReviveParty, this.handleReviveParty);
    }

    /** @param {import('socket.io').Socket} socket */
    unregisterDisplayClient(socket) {
        console.log(`>> c:${socket.id} Display Disconnected`);
        this.displays.delete(socket);
    }

    /** @param {import('socket.io').Socket} socket */
    registerPlayerClient(socket, data) {
        console.log(`>> c:${socket.id} -> Player`);
        const player = new Player(this.connectionCounter.next(), socket, data);
        this.players.set(player.id, player);
        socket.once(Game.SocketEvents.Disconnect, this.unregisterPlayerClient.bind(this, player, socket));
        socket.on(Game.SocketEvents.PlayerAction, this.handlePlayerAction.bind(this, player));
        socket.on(Game.SocketEvents.PlayerRevive, this.handlePlayerRevive.bind(this, player));
        socket.emit(Game.SocketEvents.PlayerRegistered);
        player.updatePlayerClient();
        // this.sendSnapshot();
    }

    /** @param {Player} player */
    unregisterPlayerClient(player, socket) {
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
    }

    handleAddBoss = () => {
        console.log(">> Spawning new boss");
        this.monsters.createBossSlime(this.connectionCounter.next(), getRandomInt(1, 3));
        this.sendSnapshot();
    }

    handleDeleteMonsters = () => {
        this.monsters.clear();
        this.sendSnapshot();
    }

    handleReviveParty = () => {
        this.players.forEach((player) => {
            player.active = true;
            player.health = player.maxHealth;
            player.updatePlayerClient();
        });
        this.sendSnapshot();
    }

    /** @param {Player} player */
    handlePlayerAction = (player, data) => {
        console.log(`>> ${player.name} -> ${data.action}`);
        this.sendLog(`${player.name} gets ready to ${data.action}`);
        player.action = data.action;
        player.updatePlayerClient();
        this.emitToDisplays(Game.SocketEvents.PlayerStanceChange, [player.id, player.action])
    }

    /** @param {Player} player */
    handlePlayerRevive = (player) => {
        console.log(`>> ${player.name} revived`);
        player.active = true;
        player.health = player.maxHealth;
        player.updatePlayerClient();
        this.emitToDisplays(Game.SocketEvents.PlayerRevived, player);
    }
    

    sendLog(message) {
        this.io.emit(Game.SocketEvents.Log, message);
    }

    async main() {
        await this.loop();
        setTimeout(this.main.bind(this), 3000);
    }

    async loop() {
        this.frameCounter.next();
        console.log(`>> loop (${this.frameCounter.count})`);

        this.runPromotions();

        if (this.framesWithoutMonsters.count >= 15) {
            this.framesWithoutMonsters.reset();
            this.monsters.createBlueSlime(this.connectionCounter.next(), getRandomInt(1, 3));
            this.monsters.createGreenSlime(this.connectionCounter.next(), getRandomInt(1, 3));
            this.monsters.createRedSlime(this.connectionCounter.next(), getRandomInt(1, 3));
        }

        this.sendSnapshot("loop");
        await sleep(2000);

        const players = this.players.toArray();
        const monsters = this.monsters.toArray();
        const activePlayers = players.filter(PlayerMap.Filters.Active);
        
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
                const target = damaged[getRandomInt(0, damaged.length - 1)];
                const heal = healer.heal
                target.health = Math.min(target.health + heal, target.maxHealth);
                target.updatePlayerClient();
                this.sendLog(`${healer.name} heals ${target.name} for ${heal}hp`);
                this.emitToDisplays(Game.SocketEvents.PlayerHealed, { healer, target });
                await sleep();
            }
        }

        // monster check
        if (!monsters.length) {
            this.framesWithoutMonsters.next();
            this.sendLog(`There are no monsters nearby. (${this.framesWithoutMonsters.count})`);
            return;
        }
        
        // player attacks
        const attackers = activePlayers.filter(PlayerMap.Filters.Attack);
        for (const attacker of attackers) {
            const target = monsters[getRandomInt(0, monsters.length - 1)];
            const damage = attacker.attack;
            target.health -= damage
            attacker.updatePlayerClient();
            this.sendLog(`${attacker.name} attacks ${target.name} for ${damage}hp`);
            this.emitToDisplays(Game.SocketEvents.PlayerAttacked, { attacker, target })
            await sleep();
        }

        
        // monster actions
        const initialDefenders = activePlayers.filter(PlayerMap.Filters.Defend);
        const defenders = !initialDefenders.length 
            ? activePlayers
            : [...activePlayers, ...initialDefenders, ...initialDefenders]

        for (const monster of monsters) {
            if (Math.random() > 0.4) continue;
            const target = defenders[getRandomInt(0, defenders.length - 1)];
            const isDefending = target.action === 'defend';
            const damage = isDefending ? Math.max(0, monster.attack - target.defense) : monster.attack;
            target.health -= damage
            target.updatePlayerClient();
            this.sendLog(`${monster.name} attacks ${target.name} for ${damage}hp`);
            this.emitToDisplays(Game.SocketEvents.MonsterAttacked, { monster, target });
            await sleep();
        }
    
        // player deaths
        for (const player of activePlayers) {
            if (player.health <= 0) {
                player.active = false;
                player.updatePlayerClient();
                this.sendLog(`${player.name} is dead.`);
                this.emitToDisplays(Game.SocketEvents.PlayerDied, player.id);
            }
        }
        await sleep();

        // monster deaths
        for (const monster of monsters) {
            if (monster.health <= 0 ) {
                this.players.giveXP(monster.xp);
                this.monsters.delete(monster.id);
                this.sendLog(`${monster.name} has been defeated.`);
                this.emitToDisplays(Game.SocketEvents.MonsterDied, monster.id);
            }
        }
        await sleep();
    }

    runPromotions() {
        for (const [id, player] of this.players) {
            const levelRequirement = getLevelRequirement(player.level);

            if (player.xp >= levelRequirement) {
                player.level += 1;
                player.xp = levelRequirement - player.xp;
            }

            player.updatePlayerClient();
        }

        this.sendSnapshot();
    }
}

module.exports = Game;

