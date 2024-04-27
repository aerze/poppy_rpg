const { Socket } = require("socket.io");

const gameClients = new Set();

function emitToGameClients(eventName, ...data) {
    for (const socket of gameClients) {
        socket.emit(eventName, ...data)
    }
}


const players = new Map();

var monsters = [
    createMonster("red slime", "#FF0000"),
    createMonster("green slime", "#00FF00"),
    createMonster("blue slime", "#0000FF"),
];

var gio;

function createMonster(name, color) {
    return {
        name,
        maxHealth: 8,
        health: 8,
        attack: 1,
        defense: 2,
        heal: 1,
        color
    }
}


function websocket (io) {
    gio = io;
    /** @param {Socket} socket */
    function handleNewClient(socket) {
        const player = {
            uid: '',
            name: '',
            action: 'attack',
            maxHealth: 40,
            health: 40,
            attack: 3,
            defense: 2,
            heal: 3,
            active: true,
            socket,
            toJSON() {
                return {
                    name: player.name,
                    action: player.action,
                    maxHealth: player.maxHealth,
                    health: player.health,
                    attack: player.attack,
                    defense: player.defense,
                    heal: player.heal,
                    active: player.active
                }
            },
            update() {
                this.socket.emit("update", { player: this.toJSON() });
            }
        }

        function log(...args) {
            console.log(`>> ${player.name}:${player.uid}:`, ...args);
        }

        socket.on("game-client", () => {
            gameClients.add(socket);
            socket.emit("snapshot", {
                activePlayers: Array.from(players.values()).filter(activeFilter),
                monsters
            });
        });

        socket.on('reset-monsters', () => {
            monsters = [
                createMonster("red slime", "#FF0000"),
                createMonster("green slime", "#00FF00"),
                createMonster("blue slime", "#0000FF"),
            ];
            emitToGameClients("snapshot", {
                activePlayers: Array.from(players.values()).filter(activeFilter),
                monsters
            });
        })

        socket.on("create-character", ({ uid, name }) => {
            player.uid = uid;
            player.name = name;
            players.set(uid, player);            
            log('created character');
            player.update();
            emitToGameClients("player-added", player)
        })
        
        socket.on('attack', () => {
            player.action = 'attack';
            player.update();
            log('attack');
            io.emit("log", `${player.name} prepares to attack!`);
        });

        socket.on('defend', () => {
            player.action = 'defend';
            player.update();
            log('defend');
            io.emit("log", `${player.name} prepares to defend!`);
        });

        socket.on('heal', () => {
            player.action = 'heal';
            player.update();
            log('heal');
            io.emit("log", `${player.name} prepares to heal!`);
        });

        socket.on('revive', () => {
            player.active = true;
            player.health = player.maxHealth;
            player.update();
            log('revive');
            io.emit("log", `${player.name} has been revived!`);
        })

        socket.on('disconnect', () => {
            players.delete(player.uid);
            log('disconnected');
            gameClients.delete(socket);
            emitToGameClients("player-disconnected", {
                activePlayers: Array.from(players.values()).filter(activeFilter)
            });
        });
      }
    io.on('connection', handleNewClient);

    loop()
}


function loop() {
    setTimeout(loop, 5000);

    const activePlayers = Array.from(players.values()).filter(activeFilter);

    if (activePlayers.length === 0) {
        gio.emit("log", `The heros have gone missing.`);
        emitToGameClients('no-players');
        return;
    }

    const healers = activePlayers.filter(healFilter);
    const damaged = activePlayers.filter(damagedFilter);
    for (const healer of healers) {
        const target = damaged[getRandomInt(0, damaged.length - 1)];
        const heal = healer.heal
        target.health += healer.heal;
        target.update();
        gio.emit("log", `${healer.name} heals ${target.name} for ${heal}hp`);
        emitToGameClients('player-heal', {
            activePlayers,
            monsters,
            healer,
            target
        });
    }

    if (monsters.length === 0) {
        gio.emit("log", `There are no monsters nearby.`);
        emitToGameClients('no-monsters');
        return;
    }

    // player actions
    const attackers = activePlayers.filter(attackFilter);
    for (const attacker of attackers) {
        const target = monsters[getRandomInt(0, monsters.length - 1)];
        const damage = attacker.attack;
        target.health -= damage
        attacker.update();
        gio.emit("log", `${attacker.name} attacks ${target.name} for ${damage}hp`);
        emitToGameClients('player-attack', {
            activePlayers,
            monsters,
            attacker,
            target
        });
    }

    // monster actions
    let defenders = activePlayers.filter(defendFilter);
    if (defenders.length === 0) {
        defenders = activePlayers;
    }

    for (const monster of monsters) {
        const target = defenders[getRandomInt(0, defenders.length - 1)];
        const isDefending = target.action === 'defend';
        const damage = isDefending ? Math.max(0, monster.attack - target.defense) : monster.attack;
        target.health -= damage
        target.update();
        gio.emit("log", `${monster.name} attacks ${target.name} for ${damage}hp`);
        emitToGameClients('monster-attack', {
            activePlayers,
            monsters,
            monster,
            target
        });
    }

    for (const player of activePlayers) {
        if (player.health <= 0) {
            player.active = false;
            player.update();
            gio.emit("log", `${player.name} is dead.`);
            emitToGameClients('player-died', {
                activePlayers,
                monsters,
                player,
            });
        }
    }

    for (const monster of monsters) {
        if (monster.health <= 0 ) {
            monsters.splice(monsters.indexOf(monster), 1);
            gio.emit("log", `${monster.name} has been defeated.`);
            emitToGameClients("monster-died", {
                activePlayers,
                monsters,
                monster
            })
        }
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const activeFilter = p => p.active;
const attackFilter = p => p.action === 'attack';
const defendFilter = p => p.action === 'defend';
const healFilter = p => p.action === 'heal';
const damagedFilter = p => p.health < p.maxHealth;

module.exports = websocket;