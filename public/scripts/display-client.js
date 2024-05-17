const SocketEvents = {
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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class CharacterSprite {
    constructor(type, data) {
        this.id = data.id;
        this.type = type;
        this.data = data;
        this.x = 0;
        this.y = 0;
        this.elements = this.createBaseElements();
        this.root = this.elements.base;
    }

    createBaseElements() {
        const base = document.createElement('div');
        base.classList.add("card-sprite");
        base.style.background = `${this.data.color}AA`;

        const hud = document.createElement('div');
        base.appendChild(hud);
        hud.classList.add("hud");

        const name = document.createElement('h5');
        hud.appendChild(name);
        name.classList.add("name");

        const job = document.createElement('p');
        hud.appendChild(job);
        job.classList.add("job");

        const hpLabel = document.createElement('label');
        hud.appendChild(hpLabel);
        hpLabel.classList.add("hpLabel");

        const hpBar = document.createElement('progress');
        hud.appendChild(hpBar);
        hpBar.classList.add("hpBar");

        const stance = document.createElement('p');
        hud.appendChild(stance);
        hpBar.classList.add("stance");

        document.body.appendChild(base);

        return {
            base,
            hud,
            name, 
            job,
            hpLabel,
            hpBar,
            stance
        }
    }

    updatePosition() {
        this.elements.base.style.top = `${this.y}px`;
        this.elements.base.style.left = `${this.x}px`;
    }

    update(data) {
        this.data = data;
        this.elements.name.innerText = this.data.name;
        this.elements.job.innerText =  `Lv:${this.data.level} ${this.data.job ?? ''}`;
        this.elements.hpLabel.innerText = `hp:${this.data.health}/${this.data.maxHealth}`;
        this.elements.hpBar.value = this.data.health;
        this.elements.hpBar.max = this.data.maxHealth;

        this.updatePosition();

        if (this.type === "player") {
            this.elements.stance.innerText = this.data.action.toUpperCase();
            if (this.data.active) {
                this.elements.base.style.opacity = "1";
            } else {
                this.elements.base.style.opacity = "0.33";
            }
        }
    }

    remove() {
        this.elements.name.remove();
        this.elements.job.remove();
        this.elements.hpLabel.remove();
        this.elements.hpBar.remove();
        this.elements.hud.remove();
        this.elements.base.remove();
    }
}

class Sprite {
    static PresetMap = {
        'a': '/sprites/tay_test.png',
        'b': '/sprites/abby_test.png',
        'c': '/sprites/tay_test.png',
        'd': '/sprites/abby_test.png',
    }

    constructor(type, data) {
        this.id = data.id;
        this.type = type;
        this.data = data;
        this.x = 0;
        this.y = 0;
        this.elements = this.createBaseElements();
        this.root = this.elements.base;
    }

    createBaseElements() {
        const base = document.createElement('div');
        base.classList.add("sprite");
        base.style.borderColor = `${this.data.color}AA`;

        const image = document.createElement('img');
        image.src = Sprite.PresetMap[this.data.preset];
        base.appendChild(image);

        // const hud = document.createElement('div');
        // base.appendChild(hud);
        // hud.classList.add("hud");

        // const name = document.createElement('h5');
        // hud.appendChild(name);
        // name.classList.add("name");

        // const job = document.createElement('p');
        // hud.appendChild(job);
        // job.classList.add("job");

        // const hpLabel = document.createElement('label');
        // hud.appendChild(hpLabel);
        // hpLabel.classList.add("hpLabel");

        // const hpBar = document.createElement('progress');
        // hud.appendChild(hpBar);
        // hpBar.classList.add("hpBar");

        // const stance = document.createElement('p');
        // hud.appendChild(stance);
        // hpBar.classList.add("stance");

        document.body.appendChild(base);

        return {
            base,
            // hud,
            // name, 
            // job,
            // hpLabel,
            // hpBar,
            // stance
        }
    }

    updatePosition() {
        this.elements.base.style.top = `${this.y}px`;
        this.elements.base.style.left = `${this.x}px`;
    }

    update(data) {
        this.data = data;
        // this.elements.name.innerText = this.data.name;
        // this.elements.job.innerText =  `Lv:${this.data.level} ${this.data.job ?? ''}`;
        // this.elements.hpLabel.innerText = `hp:${this.data.health}/${this.data.maxHealth}`;
        // this.elements.hpBar.value = this.data.health;
        // this.elements.hpBar.max = this.data.maxHealth;

        this.updatePosition();

        if (this.type === "player") {
            // this.elements.stance.innerText = this.data.action.toUpperCase();
            if (this.data.active) {
                this.elements.base.style.opacity = "1";
            } else {
                this.elements.base.style.opacity = "0.33";
            }
        }
    }

    remove() {
        // this.elements.name.remove();
        // this.elements.job.remove();
        // this.elements.hpLabel.remove();
        // this.elements.hpBar.remove();
        // this.elements.hud.remove();
        this.elements.base.remove();
    }
}

const scene = {
    TOP: 0,
    BOTTOM: 600,
    LEFT: 0,
    RIGHT: 800,

    /** @type {Map<string, CharacterSprite>} */
    spriteMap: new Map(),

    playerAnchor: [250, 250],
    healerAnchor: [150, 250],
    monsterAnchor: [450, 250],

    previousPlayerId: 0,
    previousPlayerPosition: [0, 0],
    
    previousHealerId: 0,
    previousHealerPosition: [0, 0],
    
    previousMonsterId: 0,
    previousMonsterPosition: [0, 0],

    setPlayer(id) {
        // move existing player back to previous position
        const playerChanged = id !== this.previousPlayerId;
        if (!playerChanged) return;

        const prevPlayer = this.spriteMap.get(this.previousPlayerId);
        if (prevPlayer) {
            const [prevX, prevY] = this.previousPlayerPosition;
            prevPlayer.x = prevX;
            prevPlayer.y = prevY;
            prevPlayer.updatePosition();
        }
        
        const player = this.spriteMap.get(id);
        if (!player) return;

        const [anchorX, anchorY] = this.playerAnchor;
        
        this.previousPlayerId = player.id;
        this.previousPlayerPosition = [player.x, player.y];
        player.x = anchorX
        player.y = anchorY

        player.updatePosition();
    },

    setHealer(id) {
        // move existing player back to previous position
        const playerChanged = id !== this.previousHealerId;
        if (!playerChanged) return;

        const prevHealer = this.spriteMap.get(this.previousHealerId);
        if (prevHealer) {
            const [prevX, prevY] = this.previousHealerPosition;
            prevHealer.x = prevX;
            prevHealer.y = prevY;
            prevHealer.updatePosition();
        }
        
        const player = this.spriteMap.get(id);
        if (!player) return;

        const [anchorX, anchorY] = this.healerAnchor;
        
        this.previousHealerId = player.id;
        this.previousHealerPosition = [player.x, player.y];
        player.x = anchorX
        player.y = anchorY

        player.updatePosition();
    },

    setMonster(id) {
        // move existing player back to previous position
        const monsterChanged = id !== this.previousMonsterId;
        if (!monsterChanged) return;
        
        const prevMonster = this.spriteMap.get(this.previousMonsterId);
        if (prevMonster) {
            const [prevX, prevY] = this.previousMonsterPosition;
            prevMonster.x = prevX;
            prevMonster.y = prevY;
            prevMonster.updatePosition();
        }
        
        const monster = this.spriteMap.get(id);
        if (!monster) return;
        
        const [anchorX, anchorY] = this.monsterAnchor;
        
        this.previousMonsterId = monster.id;
        this.previousMonsterPosition = [monster.x, monster.y];
        monster.x = anchorX
        monster.y = anchorY

        monster.updatePosition();
    },

    animateText(id, number, isDamage, isPlayer) {
        const sprite = this.spriteMap.get(id);
        if (!sprite) return;

        const damageElement = document.createElement('h1');
        const type = isDamage ? "damage" : "heal"
        let x = isPlayer
            ? sprite.x + 25
            : sprite.x + 50;
        let y = sprite.y - 50;


        damageElement.innerText = number
        damageElement.classList.add('flyaway', type);
        document.body.appendChild(damageElement);
        damageElement.style.top = `${y}px`;
        damageElement.style.left = `${x}px`;

        
        setTimeout(() => {
            x = isPlayer
                ? x - getRandomInt(0, 75)
                : x + getRandomInt(0, 75);
            y = y - getRandomInt(100, 150);
            damageElement.style.top = `${y}px`;
            damageElement.style.left = `${x}px`;
        }, 10);


        // damageElement.style.top = `${sprite.y - 20}px`;
        // damageElement.style.left = `${sprite.x}px`;
        
        setTimeout(() => {
            damageElement.remove();
        }, 1000);
    },

    add(id, data, type) {
        const sprite = data.preset
            ? new Sprite(type, data)
            : new CharacterSprite(type, data);
        this.spriteMap.set(id, sprite);

        switch (type) {
            case 'player':
                sprite.x = getRandomInt(this.LEFT + 10, (this.RIGHT / 2) - 100);
                sprite.y = getRandomInt(this.BOTTOM / 2 + 100, this.BOTTOM - 150);
                break;
        
            case 'monster':
                sprite.x = getRandomInt((this.RIGHT/2 + 10), this.RIGHT - 100);
                sprite.y = getRandomInt(this.BOTTOM / 2 + 100, this.BOTTOM - 150);
                break;
        }

        sprite.update(data);
    },

    remove(id) {
        if (this.spriteMap.has(id)) {
            const sprite = this.spriteMap.get(id);
            sprite.remove();
            this.spriteMap.delete(id);
        }
    },

    update(id, data) {
        if (this.spriteMap.has(id)) {
            const sprite = this.spriteMap.get(id);
            sprite.update(data);
        }
    },
}

const dungeonInfo = document.getElementById('dungeon-info');
const addButton = document.getElementById('add');
const addBossButton = document.getElementById('add-boss');
const deleteMonstersButton = document.getElementById('delete-monsters');
const revivePartyButton = document.getElementById('revive-party');
const playerMap = new Map();
const monsterMap = new Map();
const socket = io();

socket.on(SocketEvents.Connect, () => {
    console.log("Connected");
    socket.emit(SocketEvents.DisplayConnected);
});

dungeonInfo.addEventListener('click', () => {
    document.getElementById('buttons').classList.toggle('hidden');
});


addButton.addEventListener('click', (event) => {
    event.preventDefault();
    socket.emit(SocketEvents.AddMonsters)
});

addBossButton.addEventListener('click', (event) => {
    event.preventDefault();
    socket.emit(SocketEvents.AddBoss);
});

deleteMonstersButton.addEventListener('click', (event) => {
    event.preventDefault();
    socket.emit(SocketEvents.DeleteMonsters);
});

revivePartyButton.addEventListener('click', (event) => {
    event.preventDefault();
    socket.emit(SocketEvents.ReviveParty);
});

socket.on(SocketEvents.Disconnect, () => {
    console.log('>> disconnected');
});

socket.on(SocketEvents.Snapshot, ([type, snapshot]) => {
    console.groupCollapsed(">> snapshot");
    const { players, monsters, dungeon } = snapshot;
    dungeonInfo.innerText = `${dungeon.name} - Stage:${dungeon.currentRoom}/${dungeon.roomCount}`;

    const playerIds = new Set(playerMap.keys());

    for (const player of players) {
        playerIds.delete(player.id);

        const playerExists = playerMap.has(player.id);
        if (playerExists) {
            updatePlayer(player);
        } else {
            createPlayer(player);
        }
    }

    for (const playerId of playerIds) {
        const player = playerMap.get(playerId);
        if (player) removePlayer(player);
    }

    const monsterIds = new Set(monsterMap.keys());

    for (const monster of monsters) {
        monsterIds.delete(monster.id);

        const monsterExists = monsterMap.has(monster.id);
        if (monsterExists) {
            updateMonster(monster);
        } else {
            createMonster(monster);
        }
    }

    for (const monsterId of monsterIds) {
        const monster = monsterMap.get(monsterId);
        if (monster) removeMonster(monster);
    }
    console.groupEnd();
});

socket.on(SocketEvents.PlayerStanceChange, playerStanceChange);

socket.on(SocketEvents.PlayerRevived, playerRevived);

socket.on(SocketEvents.PlayerHealed, playerHealed);

socket.on(SocketEvents.PlayerAttacked, playerAttacked);

socket.on(SocketEvents.MonsterAttacked, monsterAttacked);

socket.on(SocketEvents.PlayerDied, playerDied);

socket.on(SocketEvents.MonsterDied, monsterDied);

function createPlayer(player) {
    console.log('>> createPlayer');

    playerMap.set(player.id, player);
    scene.add(player.id, player, 'player');
}

function updatePlayer(player) {
    console.log('>> updatePlayer');

    playerMap.set(player.id, player);
    scene.update(player.id, player);
}

function removePlayer(player) {
    console.log('>> removePlayer');

    scene.remove(player.id);
    playerMap.delete(player.id);
}


function createMonster(monster) {
    console.log('>> createMonster');
    
    monsterMap.set(monster.id, monster);
    scene.add(monster.id, monster, 'monster');
}

function updateMonster(monster) {
    console.log('>> updateMonster');

    monsterMap.set(monster.id, monster);
    scene.update(monster.id, monster);
}

function removeMonster(monster) {
    console.log('>> removeMonster');

    monsterMap.delete(monster.id);
    scene.remove(monster.id);
}

function playerStanceChange([playerId, playerAction]) {
    console.log('>> playerStanceChange');
    const player = playerMap.get(playerId);
    if (player) {
        player.action = playerAction;
        scene.update(player.id, player);
    }
}

function playerRevived(player) {
    console.log('>> playerRevived');
    playerMap.set(player.id, player);
    scene.update(player.id, player);
}

function playerHealed({ healer, target, heal }) {
    console.log('>> playerHealed');
    playerMap.set(target.id, target);
    scene.update(target.id, target);
    scene.setPlayer(target.id);
    scene.setMonster(0);
    scene.setHealer(healer.id);

    if (heal) {
        scene.animateText(target.id, heal, false, true);
    }
}

function playerAttacked({ attacker, target, damage }) {
    console.log('>> playerAttacked');
    monsterMap.set(target.id, target);
    scene.update(target.id, target);
    scene.setPlayer(attacker.id);
    scene.setMonster(target.id);
    scene.setHealer(0);
    if (damage) {
        scene.animateText(target.id, damage, true, false);
    }
}

function monsterAttacked({ monster, target, damage }) {
    console.log('>> monsterAttacked');
    playerMap.set(target.id, target);
    scene.update(target.id, target);
    scene.setPlayer(target.id);
    scene.setMonster(monster.id);
    scene.setHealer(0);
    if (damage) {
        scene.animateText(target.id, damage, true, true);
    }
}

function playerDied(playerId) {
    const player = playerMap.get(playerId);
    if (!player) return;
    player.active = false;
    scene.update(player.id, player);
    
}

function monsterDied(monsterId) {
    removeMonster(monsterId);
}
