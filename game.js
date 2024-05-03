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
        ResetMonsters: 'ResetMonsters',
        PlayerAction: 'PlayerAction',
        PlayerRevive: 'PlayerRevive',

        // Outgoing
        Log: "Log",
        Snapshot: "Snapshot",
        PlayerRegistered: "PlayerRegistered",

        // Built-In
        Disconnect: 'disconnect'
    }

    /** @param {import('socket.io').Server} io */
    constructor(io) {
        this.io = io;
        this.connectionCounter = new SafeCounter();
        this.frameCounter = new SafeCounter();
        this.players = new PlayerMap();
        this.monsters = new MonsterMap();
        this.displays = new Set();
    }

    getSnapshot() {
        return {
            players: this.players.toArray(),
            monsters: this.monsters.toArray(),
        }
    }

    sendSnapshot() {
        for (const socket of this.displays) {
            socket.emit(Game.SocketEvents.Snapshot, this.getSnapshot());
        }
    }

    /** @param {import('socket.io').Socket} socket */
    handleConnection = (socket) => {
        console.log(">> handleConnection");
        socket.once(Game.SocketEvents.DisplayConnected, this.registerDisplayClient.bind(this, socket));
        socket.once(Game.SocketEvents.PlayerConnected, this.registerPlayerClient.bind(this, socket));
    }

    /** @param {import('socket.io').Socket} socket */
    registerDisplayClient(socket) {
        console.log(">> registerDisplayClient");
        this.displays.add(socket);
        socket.once(Game.SocketEvents.Disconnect, this.unregisterDisplayClient.bind(this, socket));
        socket.emit(Game.SocketEvents.Snapshot, this.getSnapshot());
        socket.on(Game.SocketEvents.ResetMonsters, this.handleResetMonsters.bind(this));
    }

    /** @param {import('socket.io').Socket} socket */
    unregisterDisplayClient(socket) {
        console.log(">> unregisterDisplayClient");
        this.displays.delete(socket);
    }

    /** @param {import('socket.io').Socket} socket */
    registerPlayerClient(socket, data) {
        console.log(">> registerPlayerClient");
        const player = new Player(this.connectionCounter.next(), socket, data);
        this.players.set(player.id, player);
        socket.once(Game.SocketEvents.Disconnect, this.unregisterPlayerClient.bind(this, player));
        socket.on(Game.SocketEvents.PlayerAction, this.handlePlayerAction.bind(this, player));
        socket.on(Game.SocketEvents.PlayerRevive, this.handlePlayerRevive.bind(this, player));
        socket.emit(Game.SocketEvents.PlayerRegistered);
        console.log('>> player', player)
        player.updatePlayerClient();
        this.sendSnapshot();
    }

    /** @param {Player} player */
    unregisterPlayerClient(player) {
        console.log(">> unregisterPlayerClient");
        this.players.delete(player.id);
        this.sendSnapshot();
    }

    handleResetMonsters = () => {
        console.log(">> handleResetMonsters");
        this.monsters.createSimpleMonster(this.connectionCounter.next(), "red slime", "#FF0000");
        this.monsters.createSimpleMonster(this.connectionCounter.next(), "green slime", "#00FF00");
        this.monsters.createSimpleMonster(this.connectionCounter.next(), "blue slime", "#0000FF");
        this.sendSnapshot();
    }

    /** @param {Player} player */
    handlePlayerAction = (player, data) => {
        console.log(">> handlePlayerAction");
        this.sendLog(`${player.name} gets ready to ${data.action}`);
        player.action = data.action;
        player.updatePlayerClient();
    }

    /** @param {Player} player */
    handlePlayerRevive = (player) => {
        console.log(">> handlePlayerRevive");
        player.active = true;
        player.health = player.maxHealth;
        player.updatePlayerClient();
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
        const players = this.players.toArray();
        const monsters = this.monsters.toArray();
        const activePlayers = players.filter(PlayerMap.Filters.Active);
        
        // players check
        if (!activePlayers.length) {
            this.sendLog(`The heros have gone missing.`)
            this.sendSnapshot();
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
                // this.sendPlayerHealed
                this.sendSnapshot();
                await sleep();
            }
        }

        // monster check
        if (!monsters.length) {
            this.sendLog(`There are no monsters nearby.`);
            // this.sendNoMonsters
            this.sendSnapshot();
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
            // this.sendPlayerAttack
            this.sendSnapshot();
            await sleep();
        }

        
        // monster actions
        let defenders = activePlayers.filter(defendFilter);
        if (!defenders.length) defenders = activePlayers;
        for (const monster of monsters) {
            const target = defenders[getRandomInt(0, defenders.length - 1)];
            const isDefending = target.action === 'defend';
            const damage = isDefending ? Math.max(0, monster.attack - target.defense) : monster.attack;
            target.health -= damage
            target.updatePlayerClient();
            this.sendLog(`${monster.name} attacks ${target.name} for ${damage}hp`);
            // this.sendMonsterAttack
            this.sendSnapshot();
            await sleep();
        }
    
        // player deaths
        for (const player of activePlayers) {
            if (player.health <= 0) {
                player.active = false;
                player.updatePlayerClient();
                this.sendLog(`${player.name} is dead.`);
            }
        }
        // this.sendPlayerDied
        this.sendSnapshot();
        await sleep();
    

        // monster deaths
        for (const monster of monsters) {
            if (monster.health <= 0 ) {
                this.monsters.delete(monster.id);
                this.sendLog(`${monster.name} has been defeated.`);
            }
        }
        // this.sendMonsterDied
        this.sendSnapshot();
        await sleep();
    }
}

module.exports = Game;

