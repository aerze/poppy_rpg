const { Socket } = require("socket.io");

const players = new Map();

const monsters = [
    createMonster("red slime"),
    createMonster("green slime"),
    createMonster("blue slime"),
];

var gio;

function createMonster(name) {
    return {
        name,
        maxHealth: 30,
        health: 30,
        attack: 3,
        defense: 2,
        heal: 1,
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

        socket.on("create-character", ({ uid, name }) => {
            player.uid = uid;
            player.name = name;
            players.set(uid, player);            
            log('created character');
            player.update();
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
        });
      }
    io.on('connection', handleNewClient);

    loop()
}


function loop() {
    setTimeout(loop, 5000);

    if (monsters.length === 0) {
        gio.emit("log", `There are no monsters nearby.`);
        return;
    }

    const activePlayers = Array.from(players.values()).filter(activeFilter);

    if (activePlayers.length === 0) {
        gio.emit("log", `The heros have gone missing.`);
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
    }

    const healers = activePlayers.filter(healFilter);
    const damaged = activePlayers.filter(damagedFilter);
    for (const healer of healers) {
        const target = damaged[getRandomInt(0, damaged.length - 1)];
        const heal = healer.heal
        target.health += healer.heal;
        target.update();
        gio.emit("log", `${healer.name} heals ${target.name} for ${heal}hp`);
    }

    for (const player of activePlayers) {
        if (player.health <= 0) {
            player.active = false;
            player.update();
            gio.emit("log", `${player.name} is dead.`);
        }
    }

    for (const monster of monsters) {
        if (monster.health <= 0 ) {
            monsters.splice(monsters.indexOf(monster), 1);
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