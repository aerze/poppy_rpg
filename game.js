const SafeCounter = require("./scripts/safe-counter");
const Monster = require("./scripts/monster");
const Player = require("./scripts/player");
const PlayerMap = require("./scripts/player-map");
const MonsterMap = require("./scripts/monster-map");

function sleep(time = 1000) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), time);
    });
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Game {
    static SocketEvents = {
        // Incoming
        DisplayConnected: 'DisplayConnected',
        DisplayDisconnected: 'DisplayDisconnected',
        PlayerConnected: 'PlayerConnected',
        PlayerDisconnected: 'PlayerDisconnected',
        AddMonsters: 'AddMonsters',
        PlayerAction: 'PlayerAction',
        PlayerRevive: 'PlayerRevive',

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

        socket.on(Game.SocketEvents.AddMonsters, this.handleAddMonsters.bind(this));
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
        this.monsters.createSimpleMonster(this.connectionCounter.next(), "red slime", "#FF0000");
        this.monsters.createSimpleMonster(this.connectionCounter.next(), "green slime", "#00FF00");
        this.monsters.createSimpleMonster(this.connectionCounter.next(), "blue slime", "#0000FF");
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

        if (this.framesWithoutMonsters.count >= 15) {
            this.framesWithoutMonsters.reset();
            this.monsters.createSimpleMonster(this.connectionCounter.next(), "red slime", "#FF0000");
            this.monsters.createSimpleMonster(this.connectionCounter.next(), "green slime", "#00FF00");
            this.monsters.createSimpleMonster(this.connectionCounter.next(), "blue slime", "#0000FF");
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
                target.health += healer.heal;
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
        let defenders = activePlayers.filter(PlayerMap.Filters.Defend);
        if (!defenders.length) defenders = activePlayers;
        for (const monster of monsters) {
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
                this.monsters.delete(monster.id);
                this.sendLog(`${monster.name} has been defeated.`);
                this.emitToDisplays(Game.SocketEvents.MonsterDied, monster.id);
            }
        }
        await sleep();
    }
}

module.exports = Game;

